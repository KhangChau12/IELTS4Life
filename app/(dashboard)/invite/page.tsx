import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { formatInviteCode } from '@/lib/invite/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InviteCard } from '@/components/invite/InviteCard'
import { InviteStats } from '@/components/invite/InviteStats'

export const metadata: Metadata = {
  title: 'Invite Friends & Earn Free Essays | IELTS4Life',
  description:
    'Share your invite code. Both you and your friend earn 2 bonus IELTS essays when they join.',
  robots: { index: false, follow: false },
}

async function getInviteData(userId: string) {
  const supabase = createServerClient()

  // Get user's invite code and stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('invite_code, invite_bonus_essays')
    .eq('id', userId)
    .single()

  // Get list of people user has invited
  const { data: invites } = await supabase
    .from('invites')
    .select(`
      id,
      created_at,
      invited_profile:invited_id (
        email,
        created_at
      )
    `)
    .eq('inviter_id', userId)
    .order('created_at', { ascending: false })

  return {
    inviteCode: profile?.invite_code || '',
    bonusEssays: profile?.invite_bonus_essays || 0,
    invites: invites || [],
    totalInvited: invites?.length || 0
  }
}

export default async function InvitePage() {
  const supabase = createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const inviteData = await getInviteData(user.id)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-ocean-800 mb-2">Invite Friends</h1>
        <p className="text-ocean-600">
          Share your invite code and earn bonus essays when friends sign up
        </p>
      </div>

      <div className="grid gap-6 ipad-lg:grid-cols-2">
        {/* Invite Code Card */}
        <InviteCard inviteCode={inviteData.inviteCode} />

        {/* Stats Card */}
        <InviteStats
          totalInvited={inviteData.totalInvited}
          bonusEssays={inviteData.bonusEssays}
        />
      </div>

      {/* Invites History */}
      <Card className="border-ocean-200">
        <CardHeader>
          <CardTitle className="text-ocean-800">Invitation History</CardTitle>
          <CardDescription>
            People who joined using your invite code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inviteData.invites.length > 0 ? (
            <div className="space-y-3">
              {inviteData.invites.map((invite: any) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 bg-ocean-50 rounded-lg border border-ocean-200"
                >
                  <div>
                    <p className="text-sm font-medium text-ocean-800">
                      {invite.invited_profile?.email || 'User'}
                    </p>
                    <p className="text-xs text-ocean-600">
                      Joined {new Date(invite.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">+2 essays</p>
                    <p className="text-xs text-ocean-600">earned</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-ocean-600 mb-2">No invitations yet</p>
              <p className="text-sm text-ocean-500">
                Share your code to start earning bonus essays
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}