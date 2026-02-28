import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { NotificationsClient } from './NotificationsClient'

export const metadata = {
  title: 'Notifications - IELTS4Life',
}

export default async function NotificationsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <NotificationsClient />
}
