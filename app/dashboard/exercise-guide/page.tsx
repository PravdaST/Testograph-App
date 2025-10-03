import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExerciseGuideClient from './ExerciseGuideClient'

export default async function ExerciseGuidePage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <ExerciseGuideClient />
}
