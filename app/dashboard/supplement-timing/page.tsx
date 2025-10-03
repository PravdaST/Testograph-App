import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SupplementTimingClient from './SupplementTimingClient'

export default async function SupplementTimingPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <SupplementTimingClient userId={user.id} />
}
