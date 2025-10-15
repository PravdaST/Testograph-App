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

  // Fetch user's selected supplements
  const { data: userSupplements } = await supabase
    .from('user_supplements_app')
    .select('*')
    .eq('user_id', user.id)
    .eq('enabled', true)
    .order('supplement_id', { ascending: true })

  // Fetch user's settings
  const { data: settings } = await supabase
    .from('supplement_settings_app')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch today's logs
  const today = new Date().toISOString().split('T')[0]
  const { data: todayLogs } = await supabase
    .from('supplement_logs_app')
    .select('*')
    .eq('user_id', user.id)
    .eq('log_date', today)

  return (
    <SupplementTimingClient
      userId={user.id}
      initialSupplements={userSupplements || []}
      initialSettings={settings}
      initialTodayLogs={todayLogs || []}
    />
  )
}
