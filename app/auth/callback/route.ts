import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cleanInviteCode, INVITE_BONUSES, isPromoCode, getPromoCodeBonus } from '@/lib/invite/utils'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')

  logger.auth('Received callback request')
  logger.auth('- code:', code?.substring(0, 10) + '...')
  logger.auth('- type:', type)
  logger.auth('- full URL:', requestUrl.toString())

  // Exchange code for session (middleware handles PKCE automatically)
  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // This will handle PKCE verification automatically via cookies
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      logger.error('Exchange error:', error.message)
      logger.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.redirect(new URL('/login?error=verification_failed', request.url))
    }

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logger.error('User error:', userError)
      return NextResponse.redirect(new URL('/login?error=verification_failed', request.url))
    }

    logger.auth('✅ User authenticated:', user.id)
    logger.auth('User metadata:', user.user_metadata)

    // Check if this is a password recovery flow by checking the URL type parameter
    // Note: Supabase passes 'type=recovery' when redirecting from password reset email
    const type = requestUrl.searchParams.get('type')

    // If this is recovery, redirect to reset password page immediately
    if (type === 'recovery') {
      logger.auth('→ Password recovery detected - redirecting to reset-password')
      return NextResponse.redirect(new URL('/reset-password', request.url))
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, created_at, invited_by')
      .eq('id', user.id)
      .single()

    // Allow invite code application if:
    // 1. Profile doesn't exist (new signup) OR
    // 2. Profile was created less than 1 hour ago AND doesn't have invite applied yet
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const isNewProfile = !existingProfile
    const isRecentProfile = existingProfile && new Date(existingProfile.created_at) > oneHourAgo
    const hasNoInvite = existingProfile && !existingProfile.invited_by
    const canApplyInvite = isNewProfile || (isRecentProfile && hasNoInvite)

    logger.auth('Profile status:', {
      exists: !!existingProfile,
      createdAt: existingProfile?.created_at,
      isRecent: isRecentProfile,
      hasInvite: !hasNoInvite,
      canApplyInvite
    })

    if (!existingProfile) {
      logger.auth('🆕 Creating new profile')

      // Use upsert (not insert) to be idempotent with the DB trigger handle_new_user().
      // The trigger fires on auth.users insert — if it runs before this callback,
      // a plain INSERT would fail silently on conflict. upsert + ignoreDuplicates handles both cases.
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata.full_name || null,
          role: 'student',
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )

      if (profileError) {
        logger.error('❌ Profile creation error:', profileError)
      } else {
        logger.auth('✅ Profile created')
      }

      // Apply invite code or promo code if provided
      const inviteCode = user.user_metadata.invite_code
      logger.auth('Code from metadata:', inviteCode)

      if (inviteCode) {
        try {
          const cleanCode = cleanInviteCode(inviteCode)

          // Check if it's a promo code first
          if (isPromoCode(cleanCode)) {
            const promoBonus = getPromoCodeBonus(cleanCode)
            logger.auth(`🎁 Processing promo code: ${cleanCode} (+${promoBonus} essays)`)

            // Apply promo code bonus
            const { error: promoUpdateError } = await supabase
              .from('profiles')
              .update({
                invite_bonus_essays: promoBonus
              })
              .eq('id', user.id)

            if (promoUpdateError) {
              logger.error('❌ Failed to apply promo code:', promoUpdateError)
            } else {
              logger.auth(`🎉 PROMO CODE SUCCESS! User got +${promoBonus} essays`)
            }
          } else {
            // It's an invite code - find inviter
            logger.auth('🎁 Processing invite code:', cleanCode)

            const { data: inviter, error: inviterError } = await supabase
              .from('profiles')
              .select('id, email, invite_bonus_essays')
              .eq('invite_code', cleanCode)
              .single()

            if (inviterError) {
              logger.auth('❌ Inviter not found:', inviterError.message)
            } else if (inviter.id === user.id) {
              logger.auth('❌ Self-invite blocked')
            } else {
              logger.auth('✅ Inviter found:', inviter.email)

              // Update invited user (new user gets +3 essays)
              const { error: invitedUpdateError } = await supabase
                .from('profiles')
                .update({
                  invited_by: inviter.id,
                  invite_bonus_essays: INVITE_BONUSES.INVITED  // +3 essays
                })
                .eq('id', user.id)

              if (invitedUpdateError) {
                logger.error('❌ Failed to update invited user:', invitedUpdateError)
              } else {
                logger.auth('✅ Invited user got +${INVITE_BONUSES.INVITED} essays')

                // Update inviter (inviter gets +6 essays) using SECURITY DEFINER function
                const { error: inviterUpdateError } = await supabase.rpc('increment_inviter_bonus', {
                  inviter_user_id: inviter.id,
                  bonus_amount: INVITE_BONUSES.INVITER
                })

                if (inviterUpdateError) {
                  logger.error('❌ Failed to update inviter:', inviterUpdateError)
                } else {
                  const newInviterBonus = (inviter.invite_bonus_essays || 0) + INVITE_BONUSES.INVITER
                  logger.auth('✅ Inviter got +${INVITE_BONUSES.INVITER} essays (total: ${newInviterBonus})')

                  // Record invite
                  const { error: recordError } = await supabase
                    .from('invites')
                    .insert({
                      inviter_id: inviter.id,
                      invited_id: user.id,
                      bonus_applied: true
                    })

                  if (recordError) {
                    logger.error('❌ Failed to record invite:', recordError)
                  } else {
                    logger.auth('🎉 INVITE BONUS SUCCESS!')
                    logger.auth('📊 ${inviter.email} → ${user.email}')
                  }
                }
              }
            }
          }
        } catch (error) {
          logger.error('❌ Code processing error:', error)
        }
      } else {
        logger.auth('ℹ️  No code provided')
      }
    } else if (canApplyInvite) {
      // Profile exists but was created recently and has no invite yet
      logger.auth('🆕 Recent profile - can still apply code')

      const inviteCode = user.user_metadata.invite_code
      logger.auth('Code from metadata:', inviteCode)

      if (inviteCode) {
        try {
          const cleanCode = cleanInviteCode(inviteCode)

          // Check if it's a promo code first
          if (isPromoCode(cleanCode)) {
            const promoBonus = getPromoCodeBonus(cleanCode)
            logger.auth(`🎁 Processing promo code: ${cleanCode} (+${promoBonus} essays)`)

            // Apply promo code bonus
            const { error: promoUpdateError } = await supabase
              .from('profiles')
              .update({
                invite_bonus_essays: promoBonus
              })
              .eq('id', user.id)

            if (promoUpdateError) {
              logger.error('❌ Failed to apply promo code:', promoUpdateError)
            } else {
              logger.auth(`🎉 PROMO CODE SUCCESS! User got +${promoBonus} essays`)
            }
          } else {
            // It's an invite code - find inviter
            logger.auth('🎁 Processing invite code:', cleanCode)

            const { data: inviter, error: inviterError } = await supabase
              .from('profiles')
              .select('id, email, invite_bonus_essays')
              .eq('invite_code', cleanCode)
              .single()

            if (inviterError) {
              logger.auth('❌ Inviter not found:', inviterError.message)
            } else if (inviter.id === user.id) {
              logger.auth('❌ Self-invite blocked')
            } else {
              logger.auth('✅ Inviter found:', inviter.email)

              // Update invited user (gets +3 essays)
              const { error: invitedUpdateError } = await supabase
                .from('profiles')
                .update({
                  invited_by: inviter.id,
                  invite_bonus_essays: INVITE_BONUSES.INVITED
                })
                .eq('id', user.id)

              if (invitedUpdateError) {
                logger.error('❌ Failed to update invited user:', invitedUpdateError)
              } else {
                logger.auth('✅ Invited user got +${INVITE_BONUSES.INVITED} essays')

                // Update inviter (gets +6 essays) using SECURITY DEFINER function
                const { error: inviterUpdateError } = await supabase.rpc('increment_inviter_bonus', {
                  inviter_user_id: inviter.id,
                  bonus_amount: INVITE_BONUSES.INVITER
                })

                if (inviterUpdateError) {
                  logger.error('❌ Failed to update inviter:', inviterUpdateError)
                } else {
                  const newInviterBonus = (inviter.invite_bonus_essays || 0) + INVITE_BONUSES.INVITER
                  logger.auth('✅ Inviter got +${INVITE_BONUSES.INVITER} essays (total: ${newInviterBonus})')

                  // Record invite
                  const { error: recordError } = await supabase
                    .from('invites')
                    .insert({
                      inviter_id: inviter.id,
                      invited_id: user.id,
                      bonus_applied: true
                    })

                  if (recordError) {
                    logger.error('❌ Failed to record invite:', recordError)
                  } else {
                    logger.auth('🎉 INVITE BONUS SUCCESS!')
                    logger.auth('📊 ${inviter.email} → ${user.email}')
                  }
                }
              }
            }
          }
        } catch (error) {
          logger.error('❌ Code processing error:', error)
        }
      } else {
        logger.auth('ℹ️  No code in metadata')
      }
    } else {
      logger.auth('ℹ️  Profile exists - cannot apply invite (too old or already has invite)')
    }

    // Normal signup/login - redirect to dashboard
    logger.auth('→ Redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // No code provided
  logger.auth('❌ No code provided')
  return NextResponse.redirect(new URL('/login?error=verification_failed', request.url))
}
