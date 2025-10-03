import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mrpsaqtmucxpawajfxfn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ycHNhcXRtdWN4cGF3YWpmeGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5MTM3OCwiZXhwIjoyMDc0NjY3Mzc4fQ.8wvWlc4rVRyHemfg5_MzogiIVhwKO1g7ui8xAwjW2gQ'
)

async function checkData() {
  console.log('🔍 Проверка на Supabase данни...\n')

  // Check profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')

  console.log('👤 PROFILES:')
  console.log('  Брой:', profiles?.length || 0)
  if (profiles && profiles.length > 0) {
    console.log('  Пример:', JSON.stringify(profiles[0], null, 2))
  }
  console.log()

  // Check purchases
  const { data: purchases, error: purchasesError } = await supabase
    .from('purchases')
    .select('*')

  console.log('🛒 PURCHASES:')
  console.log('  Брой:', purchases?.length || 0)
  if (purchases && purchases.length > 0) {
    console.log('  Пример:', JSON.stringify(purchases[0], null, 2))
  }
  console.log()

  // Check meal_plans_app
  const { data: mealPlans, error: mealPlansError } = await supabase
    .from('meal_plans_app')
    .select('*')

  console.log('🍽️  MEAL PLANS:')
  console.log('  Брой:', mealPlans?.length || 0)
  if (mealPlans && mealPlans.length > 0) {
    console.log('  Пример:', JSON.stringify(mealPlans[0], null, 2))
  }
  console.log()

  // Check sleep_logs_app
  const { data: sleepLogs, error: sleepLogsError } = await supabase
    .from('sleep_logs_app')
    .select('*')
    .order('log_date', { ascending: false })
    .limit(5)

  console.log('😴 SLEEP LOGS:')
  console.log('  Брой (последни 5):', sleepLogs?.length || 0)
  if (sleepLogs && sleepLogs.length > 0) {
    console.log('  Примери:')
    sleepLogs.forEach((log, i) => {
      console.log(`    ${i+1}. ${log.log_date}: ${log.bedtime}-${log.waketime}, качество: ${log.quality}/10`)
    })
  }
  console.log()

  // Check lab_results_app
  const { data: labResults, error: labResultsError } = await supabase
    .from('lab_results_app')
    .select('*')
    .order('test_date', { ascending: false })
    .limit(5)

  console.log('🔬 LAB RESULTS:')
  console.log('  Брой (последни 5):', labResults?.length || 0)
  if (labResults && labResults.length > 0) {
    console.log('  Примери:')
    labResults.forEach((result, i) => {
      console.log(`    ${i+1}. ${result.test_date}: Total T=${result.total_testosterone}, Free T=${result.free_testosterone}`)
    })
  }
  console.log()

  // Check analytics_events_app
  const { data: analytics, error: analyticsError } = await supabase
    .from('analytics_events_app')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  console.log('📊 ANALYTICS EVENTS:')
  console.log('  Брой (последни 10):', analytics?.length || 0)
  if (analytics && analytics.length > 0) {
    console.log('  Примери:')
    analytics.forEach((event, i) => {
      console.log(`    ${i+1}. ${event.event_type} - ${new Date(event.created_at).toLocaleString('bg-BG')}`)
    })
  }
  console.log()

  // Summary
  console.log('📈 ОБОБЩЕНИЕ:')
  console.log('─────────────────────────────────────')
  console.log(`  Потребители:        ${profiles?.length || 0}`)
  console.log(`  Покупки:            ${purchases?.length || 0}`)
  console.log(`  Meal Plans:         ${mealPlans?.length || 0}`)
  console.log(`  Sleep Logs:         ${sleepLogs?.length || 0}`)
  console.log(`  Lab Results:        ${labResults?.length || 0}`)
  console.log(`  Analytics Events:   ${analytics?.length || 0}`)
  console.log('─────────────────────────────────────')
}

checkData().catch(console.error)
