'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/user'

/**
 * Custom hook for managing user authentication state.
 *
 * This hook:
 * - Uses the singleton Supabase client (prevents multiple instances)
 * - Stores client in a ref to avoid dependency instability / re-render loops
 * - Subscribes to auth state changes exactly once (empty deps)
 * - Uses a `mounted` flag to prevent state updates after unmount
 *
 * @returns {{ user: User | null, loading: boolean }}
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Store client in ref so it never triggers useEffect re-runs
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const supabase = supabaseRef.current
    let mounted = true

    const fetchAndSetUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!mounted) return

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        if (mounted && profile) setUser(profile as User)
      }

      if (mounted) setLoading(false)
    }

    fetchAndSetUser()

    // Subscribe to auth changes — runs once, cleaned up on unmount
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (mounted && profile) setUser(profile as User)
      } else {
        if (mounted) setUser(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Empty deps — subscribe exactly once on mount

  return { user, loading }
}
