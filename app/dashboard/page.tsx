import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

// Mini apps configuration with professional SVG icons
const MINI_APPS = [
  {
    slug: 'meal-planner',
    name: 'Meal Planner',
    nameBg: 'Планиране на Храна',
    description: 'Персонализирани 30-дневни хранителни планове, оптимизирани за вашите цели',
    icon: 'meal',
    color: 'emerald',
  },
  {
    slug: 'sleep-protocol',
    name: 'Sleep Protocol',
    nameBg: 'Протокол за Сън',
    description: 'Научно базирани стратегии за оптимизация на съня и възстановяването',
    icon: 'sleep',
    color: 'blue',
  },
  {
    slug: 'supplement-timing',
    name: 'Supplement Timing',
    nameBg: 'Timing на Добавки',
    description: 'Прецизен график за максимална ефективност на хранителните добавки',
    icon: 'supplement',
    color: 'purple',
  },
  {
    slug: 'exercise-guide',
    name: 'Exercise Guide',
    nameBg: 'Тренировъчен План',
    description: 'Персонализирани тренировъчни програми за постигане на целите ви',
    icon: 'exercise',
    color: 'orange',
  },
  {
    slug: 'lab-testing',
    name: 'Lab Testing',
    nameBg: 'Лабораторни Анализи',
    description: 'Проследяване и анализ на ключови здравни биомаркери',
    icon: 'lab',
    color: 'cyan',
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's purchases to determine which apps they have access to
  const { data: purchases } = await supabase
    .from('purchases')
    .select('apps_included')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .single()

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Determine which apps the user has access to
  const userApps = purchases?.apps_included || []

  // Create apps data with access status
  const appsWithAccess = MINI_APPS.map((app) => ({
    ...app,
    hasAccess: userApps.includes(app.slug),
  }))

  return (
    <DashboardClient
      user={{
        email: user.email!,
        fullName: profile?.full_name || 'Потребител',
        avatarUrl: profile?.avatar_url,
      }}
      apps={appsWithAccess}
    />
  )
}
