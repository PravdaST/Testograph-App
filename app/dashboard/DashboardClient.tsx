'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut, Menu, X, Settings } from 'lucide-react'

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
  imageUrl: string
  color: string
  hasAccess: boolean
}

interface DashboardClientProps {
  user: User
  apps: App[]
}

export default function DashboardClient({ user, apps }: DashboardClientProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

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
      {/* Mobile-First Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                Testograph Apps
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                {unlockedApps} от {totalApps} достъпни
              </p>
            </div>

            {/* Desktop: User Info + Settings + Logout */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Настройки
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                {isLoggingOut ? 'Излизане...' : 'Изход'}
              </button>
            </div>

            {/* Mobile: Menu Button */}
            <div className="md:hidden relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                {showUserMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Mobile Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-fadeIn">
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        router.push('/dashboard/settings')
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      Настройки
                    </button>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoggingOut ? 'Излизане...' : 'Изход'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {apps.map((app) => (
            <div
              key={app.slug}
              onClick={() => handleAppClick(app)}
              className={`group relative bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                app.hasAccess
                  ? 'border-gray-200 hover:border-gray-300 hover:shadow-lg cursor-pointer'
                  : 'border-gray-200 cursor-not-allowed opacity-60'
              }`}
            >
              {/* Status Badge - Absolute positioned */}
              <div className="absolute top-3 right-3 z-10">
                {app.hasAccess ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Активен
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 shadow-sm">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Заключен
                  </span>
                )}
              </div>

              {/* Image - Top Half */}
              <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden bg-gray-100">
                <img
                  src={app.imageUrl}
                  alt={app.nameBg}
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    app.hasAccess
                      ? 'group-hover:scale-105'
                      : 'grayscale opacity-60'
                  }`}
                />
              </div>

              {/* Content - Bottom Half */}
              <div className="p-4 sm:p-5 lg:p-6">
                {/* Title & Description */}
                <div className="mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
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
          <div className="mt-8 sm:mt-12 bg-white border border-gray-200 rounded-xl p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Отключете пълния достъп
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Имате достъп до {unlockedApps} от {totalApps} налични приложения. Разгледайте нашите пакети за пълен достъп до всички функции и инструменти.
                </p>
                <a
                  href="https://shop.testograph.eu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all"
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
