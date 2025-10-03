import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LabTestingClient from './LabTestingClient'

export default async function LabTestingPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <LabTestingClient userId={user.id} />
}
