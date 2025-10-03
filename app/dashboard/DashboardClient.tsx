'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface User {
  email: string
  fullName: string
  avatarUrl?: string
}

interface App {
  slug: string
  name: string
  nameBg: string
  description: string
  icon: string
  color: string
  hasAccess: boolean
}

interface DashboardClientProps {
  user: User
  apps: App[]
}

// Modern Simple Icons
const AppIcon = ({ type, color, hasAccess }: { type: string; color: string; hasAccess: boolean }) => {
  const colorClasses = {
    emerald: hasAccess ? 'text-emerald-600' : 'text-gray-400',
    blue: hasAccess ? 'text-blue-600' : 'text-gray-400',
    purple: hasAccess ? 'text-purple-600' : 'text-gray-400',
    orange: hasAccess ? 'text-orange-600' : 'text-gray-400',
    cyan: hasAccess ? 'text-cyan-600' : 'text-gray-400',
  }

  const className = `w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]}`

  const icons: Record<string, React.ReactElement> = {
    meal: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    ),
    sleep: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
    supplement: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="8" y="8" width="8" height="8" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V4m0 16v-4" />
      </svg>
    ),
    exercise: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12h15M7 9l-3 3 3 3M17 9l3 3-3 3" />
      </svg>
    ),
    lab: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
      </svg>
    ),
  }

  return icons[type] || icons.meal
}

export default function DashboardClient({ user, apps }: DashboardClientProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleAppClick = (app: App) => {
    if (app.hasAccess) {
      router.push(`/dashboard/${app.slug}`)
    } else {
      window.open('https://shop.testograph.eu', '_blank')
    }
  }

  const unlockedApps = apps.filter((app) => app.hasAccess).length
  const totalApps = apps.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Testograph Apps
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {unlockedApps} от {totalApps} приложения достъпни
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-all"
              >
                {isLoggingOut ? 'Излизане...' : 'Изход'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div
              key={app.slug}
              onClick={() => handleAppClick(app)}
              className={`group relative bg-white rounded-xl border-2 transition-all duration-200 ${
                app.hasAccess
                  ? 'border-gray-200 hover:border-gray-300 hover:shadow-lg cursor-pointer'
                  : 'border-gray-200 cursor-not-allowed opacity-60'
              }`}
            >
              {/* Card Content */}
              <div className="p-8">
                {/* Icon & Status */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-xl transition-all ${
                    app.hasAccess
                      ? 'bg-gray-50 group-hover:bg-gray-100'
                      : 'bg-gray-50'
                  }`}>
                    <AppIcon type={app.icon} color={app.color} hasAccess={app.hasAccess} />
                  </div>
                  {app.hasAccess ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Активен
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Заключен
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {app.nameBg}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                {/* Action */}
                {app.hasAccess ? (
                  <div className="flex items-center text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    Отвори приложение
                    <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex items-center text-sm font-medium text-gray-500">
                    Отключи в магазина
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Locked Apps Notice */}
        {unlockedApps < totalApps && (
          <div className="mt-12 bg-white border border-gray-200 rounded-xl p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Отключете пълния достъп
                </h3>
                <p className="text-gray-600 mb-4">
                  Имате достъп до {unlockedApps} от {totalApps} налични приложения. Разгледайте нашите пакети за пълен достъп до всички функции и инструменти.
                </p>
                <a
                  href="https://shop.testograph.eu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Виж пакетите
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
