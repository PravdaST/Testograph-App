import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SleepProtocolClient from './SleepProtocolClient'
import type { SleepProtocolData } from '@/lib/types/sleep-protocol'
import { getDefaultChecklistItems } from '@/lib/utils/sleep-protocol'

export default async function SleepProtocolPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Load sleep logs from database
  const { data: logs } = await supabase
    .from('sleep_logs_app')
    .select('*')
    .eq('user_id', user.id)
    .order('log_date', { ascending: false })
    .limit(30)

  // Transform database logs to app format and calculate hours
  const sleepLogs = logs?.map(log => {
    const bedtime = log.bedtime || '22:00'
    const waketime = log.waketime || '06:00'

    // Calculate sleep hours from bedtime and waketime
    const [bedHour, bedMin] = bedtime.split(':').map(Number)
    const [wakeHour, wakeMin] = waketime.split(':').map(Number)
    let totalMinutes = (wakeHour * 60 + wakeMin) - (bedHour * 60 + bedMin)
    if (totalMinutes < 0) totalMinutes += 24 * 60 // Handle overnight sleep
    const hours = totalMinutes / 60

    return {
      id: log.id,
      date: log.log_date,
      bedtime,
      waketime,
      quality: log.quality || 5,
      hours: Math.round(hours * 10) / 10, // Round to 1 decimal
      notes: log.notes || ''
    }
  }) || []

  // Get assessment and checklist from localStorage (handled client-side)
  // Server just provides the logs
  const initialData: SleepProtocolData = {
    assessment: null,
    checklistItems: getDefaultChecklistItems(),
    logs: sleepLogs
  }

  return <SleepProtocolClient initialData={initialData} userId={user.id} />
}
