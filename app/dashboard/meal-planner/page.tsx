import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MealPlannerClient from './MealPlannerClient'
import type { MealPlan } from '@/lib/types/meal-planner'

export default async function MealPlannerPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Load existing meal plan if available
  const { data: savedPlan } = await supabase
    .from('meal_plans_app')
    .select('plan_data')
    .eq('user_id', user.id)
    .single()

  const initialPlan: MealPlan | null = savedPlan?.plan_data || null

  return <MealPlannerClient initialPlan={initialPlan} userId={user.id} />
}
