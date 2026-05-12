import { cache } from 'react'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Cached per-request fetch of the current admin user + profile.
 * React cache() deduplicates calls within the same server render tree,
 * so layout.tsx and page.tsx both calling this only hits the DB once.
 */
export const getAdminUser = cache(async () => {
  const supabase = createServerClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  return { user, profile }
})
