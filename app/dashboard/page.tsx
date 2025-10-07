import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

// Mini apps configuration with real images
const MINI_APPS = [
  {
    slug: 'meal-planner',
    name: 'Meal Planner',
    nameBg: 'Планиране на Храна',
    description: 'Персонализирани 30-дневни хранителни планове, оптимизирани за вашите цели',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
    color: 'emerald',
  },
  {
    slug: 'sleep-protocol',
    name: 'Sleep Protocol',
    nameBg: 'Протокол за Сън',
    description: 'Научно базирани стратегии за оптимизация на съня и възстановяването',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop',
    color: 'blue',
  },
  {
    slug: 'supplement-timing',
    name: 'Supplement Timing',
    nameBg: 'Timing на Добавки',
    description: 'Прецизен график за максимална ефективност на хранителните добавки',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
    color: 'purple',
  },
  {
    slug: 'exercise-guide',
    name: 'Exercise Guide',
    nameBg: 'Тренировъчен План',
    description: 'Персонализирани тренировъчни програми за постигане на целите ви',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
    color: 'orange',
  },
  {
    slug: 'lab-testing',
    name: 'Lab Testing',
    nameBg: 'Лабораторни Анализи',
    description: 'Проследяване и анализ на ключови здравни биомаркери',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop',
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

  // Get ALL user's purchases to determine which apps they have access to
  const { data: purchases } = await supabase
    .from('purchases')
    .select('apps_included')
    .eq('user_id', user.id)
    .eq('status', 'completed')

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Combine all apps from all purchases into a single unique array
  const allApps = purchases?.flatMap((p) => p.apps_included) || []
  const userApps = [...new Set(allApps)] // Remove duplicates

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
