'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SUPPLEMENTS, INTERACTIONS } from '@/lib/data/supplements-database'
import type { Supplement } from '@/lib/data/supplements-database'
import type {
  UserSupplement,
  SupplementLog,
  SupplementSettings,
  WorkoutTime
} from '@/lib/types/supplement-timing'
import {
  getUserSupplements,
  addUserSupplement,
  removeUserSupplement,
  upsertSupplementSettings,
  getLogsByDate,
  batchUpsertLogs,
  calculateDailyAdherence,
  calculateCurrentStreak
} from '@/lib/supabase/supplements'
import {
  generateSchedule,
  getSeverityColor,
  type ScheduleEntry
} from '@/lib/utils/supplement-timing'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  ListChecks,
  BarChart3,
  ShoppingCart,
  X,
  Trophy,
  Target,
  TrendingUp,
  Calendar
} from 'lucide-react'

interface SupplementTimingClientProps {
  userId: string
  initialSupplements: UserSupplement[]
  initialSettings: SupplementSettings | null
  initialTodayLogs: SupplementLog[]
}

type Tab = 'selection' | 'timeline' | 'tracking' | 'history'

export default function SupplementTimingClient({
  userId,
  initialSupplements,
  initialSettings,
  initialTodayLogs
}: SupplementTimingClientProps) {
  const router = useRouter()

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('selection')

  // User supplements state
  const [userSupplements, setUserSupplements] = useState<UserSupplement[]>(initialSupplements)
  const [selectedSupplementIds, setSelectedSupplementIds] = useState<number[]>(
    initialSupplements.map(s => s.supplement_id)
  )

  // Settings state
  const [wakeTime, setWakeTime] = useState(initialSettings?.wake_time || '07:00')
  const [workoutTime, setWorkoutTime] = useState<WorkoutTime>(
    (initialSettings?.workout_time as WorkoutTime) || 'evening'
  )

  // Timeline state
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])

  // Tracking state
  const [todayLogs, setTodayLogs] = useState<SupplementLog[]>(initialTodayLogs)
  const [todayDate] = useState(new Date().toISOString().split('T')[0])

  // History state
  const [adherence7Day, setAdherence7Day] = useState(0)
  const [adherence30Day, setAdherence30Day] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [dailyAdherence, setDailyAdherence] = useState<any[]>([])

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Loading states
  const [isSaving, setIsSaving] = useState(false)

  // Show toast helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Get selected supplements data
  const selectedSupplements = SUPPLEMENTS.filter(s =>
    selectedSupplementIds.includes(s.id)
  )

  // Generate timeline when settings or supplements change
  useEffect(() => {
    if (selectedSupplements.length > 0) {
      const timeline = generateSchedule(selectedSupplements, { wakeTime, workoutTime })
      setSchedule(timeline)
    }
  }, [wakeTime, workoutTime, selectedSupplementIds])

  // Load history data
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistoryData()
    }
  }, [activeTab])

  const loadHistoryData = async () => {
    // Calculate adherence
    const today = new Date()
    const date7DaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    const date30DaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const adherence = await calculateDailyAdherence(
      userId,
      date30DaysAgo,
      today.toISOString().split('T')[0]
    )

    setDailyAdherence(adherence)

    // Calculate averages
    const last7Days = adherence.slice(-7)
    const avg7 = last7Days.length > 0
      ? Math.round(last7Days.reduce((sum, day) => sum + day.percentage, 0) / last7Days.length)
      : 0

    const avg30 = adherence.length > 0
      ? Math.round(adherence.reduce((sum, day) => sum + day.percentage, 0) / adherence.length)
      : 0

    setAdherence7Day(avg7)
    setAdherence30Day(avg30)

    // Calculate streak
    const streak = await calculateCurrentStreak(userId)
    setCurrentStreak(streak)
  }

  // Handle supplement selection toggle
  const handleSupplementToggle = async (supplementId: number) => {
    const supplement = SUPPLEMENTS.find(s => s.id === supplementId)
    if (!supplement) return

    const isSelected = selectedSupplementIds.includes(supplementId)

    if (isSelected) {
      // Remove
      const success = await removeUserSupplement(userId, supplementId)
      if (success) {
        setSelectedSupplementIds(prev => prev.filter(id => id !== supplementId))
        setUserSupplements(prev => prev.filter(s => s.supplement_id !== supplementId))
        showToast(`${supplement.name} премахнат`)
      }
    } else {
      // Add
      const result = await addUserSupplement(userId, supplementId, supplement.name)
      if (result) {
        setSelectedSupplementIds(prev => [...prev, supplementId])
        setUserSupplements(prev => [...prev, result])
        showToast(`${supplement.name} добавен`)
      }
    }
  }

  // Handle settings save
  const handleSettingsSave = async () => {
    setIsSaving(true)
    const result = await upsertSupplementSettings(userId, wakeTime, workoutTime)
    setIsSaving(false)

    if (result) {
      showToast('Настройките са запазени')
      setActiveTab('timeline')
    } else {
      showToast('Грешка при запазване', 'error')
    }
  }

  // Handle today's log save
  const handleSaveTodayLogs = async () => {
    setIsSaving(true)

    const logsToSave = selectedSupplements.map(supplement => {
      const existingLog = todayLogs.find(log => log.supplement_id === supplement.id)
      return {
        supplementId: supplement.id,
        supplementName: supplement.name,
        taken: existingLog?.taken || false,
        takenTime: existingLog?.taken_time || null,
        notes: existingLog?.notes || null
      }
    })

    const success = await batchUpsertLogs(userId, todayDate, logsToSave)
    setIsSaving(false)

    if (success) {
      showToast('Денят е запазен успешно!')
    } else {
      showToast('Грешка при запазване', 'error')
    }
  }

  // Toggle log taken status
  const handleToggleLogTaken = (supplementId: number) => {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    setTodayLogs(prev => {
      const existing = prev.find(log => log.supplement_id === supplementId)
      if (existing) {
        return prev.map(log =>
          log.supplement_id === supplementId
            ? {
                ...log,
                taken: !log.taken,
                taken_time: !log.taken ? currentTime : null
              }
            : log
        )
      } else {
        const supplement = SUPPLEMENTS.find(s => s.id === supplementId)
        if (!supplement) return prev

        return [
          ...prev,
          {
            id: '',
            user_id: userId,
            log_date: todayDate,
            supplement_id: supplementId,
            supplement_name: supplement.name,
            taken: true,
            taken_time: currentTime,
            notes: null,
            created_at: new Date().toISOString()
          }
        ]
      }
    })
  }

  const tabs = [
    { id: 'selection', label: 'Моите добавки', icon: ListChecks },
    { id: 'timeline', label: 'График', icon: Clock },
    { id: 'tracking', label: 'Днес', icon: CheckCircle },
    { id: 'history', label: 'История', icon: BarChart3 }
  ]

  const takenToday = todayLogs.filter(log => log.taken).length
  const totalToday = selectedSupplements.length
  const adherenceToday = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Назад към Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="8" y="8" width="8" height="8" rx="2" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V4m0 16v-4" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Supplement Timing</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                Персонализиран график за оптимални резултати
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="grid grid-cols-4 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2.5 sm:py-3 font-medium text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all min-h-[44px] ${
                    isActive
                      ? 'border-purple-600 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.substring(0, 4)}.</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB 1: SELECTION */}
        {activeTab === 'selection' && (
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <ListChecks className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-1">Избери твоите добавки</h2>
                  <p className="text-sm text-gray-700">
                    Маркирай кои добавки приемаш редовно. След това ще генерираме персонализиран график за теб.
                  </p>
                </div>
              </div>
            </div>

            {/* Supplements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUPPLEMENTS.map((supplement) => {
                const isSelected = selectedSupplementIds.includes(supplement.id)
                const isTestoUp = supplement.isTestoUp

                return (
                  <div
                    key={supplement.id}
                    onClick={() => handleSupplementToggle(supplement.id)}
                    className={`relative border-2 rounded-xl p-4 transition-all cursor-pointer ${
                      isTestoUp
                        ? isSelected
                          ? 'border-orange-500 bg-orange-50 shadow-lg'
                          : 'border-orange-300 bg-orange-50/50 hover:border-orange-400'
                        : isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    {/* TestoUP Badge */}
                    {isTestoUp && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <Trophy className="w-3 h-3" />
                          Our Product
                        </div>
                      </div>
                    )}

                    {/* Checkbox */}
                    <div className="absolute top-4 left-4">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? isTestoUp
                              ? 'bg-orange-600 border-orange-600'
                              : 'bg-purple-600 border-purple-600'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="pl-8">
                      <h3 className={`font-bold mb-1 ${isTestoUp ? 'text-orange-900' : 'text-gray-900'}`}>
                        {supplement.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">{supplement.dosage}</p>

                      {/* Category Badge */}
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
                          supplement.category === 'testosterone'
                            ? 'bg-blue-100 text-blue-700'
                            : supplement.category === 'sleep'
                            ? 'bg-indigo-100 text-indigo-700'
                            : supplement.category === 'workout'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {supplement.category === 'testosterone' ? '💪 Testosterone' :
                         supplement.category === 'sleep' ? '😴 Sleep' :
                         supplement.category === 'workout' ? '🏋️ Workout' : '📋 General'}
                      </span>

                      <p className="text-xs text-gray-600 leading-relaxed">{supplement.why}</p>

                      {/* TestoUP Benefits */}
                      {isTestoUp && supplement.benefits && (
                        <div className="mt-3 pt-3 border-t border-orange-200">
                          <p className="text-xs font-semibold text-orange-900 mb-1">Ключови ползи:</p>
                          <ul className="text-xs text-gray-700 space-y-0.5">
                            {supplement.benefits.slice(0, 3).map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-orange-600">•</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* TestoUP CTA */}
                    {isTestoUp && supplement.shopUrl && (
                      <a
                        href={supplement.shopUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 block w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-center py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Купи TestoUP
                      </a>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Summary & CTA */}
            {selectedSupplementIds.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Избрани: {selectedSupplementIds.length} добавки
                    </h3>
                    <p className="text-sm text-gray-600">
                      Продължи към "График" за да видиш персонализирания си график
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Генерирай график →
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {selectedSupplementIds.length === 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <ListChecks className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Избери добавки за да започнеш</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Маркирай добавките които приемаш редовно от списъка по-горе, за да създадем персонализиран график за теб.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {/* Empty State */}
            {selectedSupplementIds.length === 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Графикът не е генериран</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                  Трябва първо да избереш добавки в раздел "Моите добавки", за да се генерира персонализиран график.
                </p>
                <button
                  onClick={() => setActiveTab('selection')}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Към избор на добавки
                </button>
              </div>
            )}

            {/* Timeline Content */}
            {selectedSupplementIds.length > 0 && (
              <>
                {/* Settings */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Настрой графика</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Wake Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Време на събуждане
                      </label>
                      <input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    {/* Workout Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Време на тренировка
                      </label>
                      <select
                        value={workoutTime}
                        onChange={(e) => setWorkoutTime(e.target.value as WorkoutTime)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="morning">Сутрин (7-10)</option>
                        <option value="lunch">Обяд (12-14)</option>
                        <option value="evening">Вечер (17-20)</option>
                        <option value="none">Не тренирам</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleSettingsSave}
                    disabled={isSaving}
                    className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Запазване...' : 'Запази настройки'}
                  </button>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Твоят ежедневен график</h2>
                  <div className="space-y-6">
                    {schedule.map((entry, index) => (
                      <div key={index} className="relative">
                        {/* Time Badge */}
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-20">
                            <div className="bg-purple-100 text-purple-900 font-bold text-lg px-4 py-2 rounded-lg text-center">
                              {entry.time}
                            </div>
                            <div className="text-xs text-gray-600 text-center mt-1">{entry.label}</div>
                          </div>

                          {/* Supplements */}
                          <div className="flex-1 space-y-3">
                            {entry.supplements.map((supp) => {
                              const isTestoUp = supp.isTestoUp

                              return (
                                <div
                                  key={supp.id}
                                  className={`border-2 rounded-lg p-4 transition-all ${
                                    isTestoUp
                                      ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg'
                                      : 'border-gray-200 hover:border-purple-500'
                                  }`}
                                  style={
                                    !isTestoUp
                                      ? { borderLeftColor: supp.color, borderLeftWidth: '4px' }
                                      : {}
                                  }
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      {isTestoUp && (
                                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                                          <Trophy className="w-3 h-3" />
                                          TestoUP
                                        </div>
                                      )}
                                      <h3 className={`font-semibold ${isTestoUp ? 'text-orange-900' : 'text-gray-900'}`}>
                                        {supp.name}
                                      </h3>
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                          supp.category === 'testosterone'
                                            ? 'bg-blue-100 text-blue-700'
                                            : supp.category === 'sleep'
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'bg-orange-100 text-orange-700'
                                        }`}
                                      >
                                        {supp.category === 'testosterone'
                                          ? 'Testosterone'
                                          : supp.category === 'sleep'
                                          ? 'Sleep'
                                          : 'Workout'}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <div className={`font-semibold ${isTestoUp ? 'text-orange-600' : 'text-purple-600'}`}>
                                        {supp.dosage}
                                      </div>
                                      <div className="text-xs text-gray-600">{supp.withFood}</div>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600">{supp.why}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Connector Line */}
                        {index < schedule.length - 1 && (
                          <div className="absolute left-10 top-full h-6 w-0.5 bg-gray-200" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactions Warning */}
                {INTERACTIONS.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      НИКОГА не комбинирай
                    </h2>
                    <div className="space-y-3">
                      {INTERACTIONS.map((interaction, index) => (
                        <div
                          key={index}
                          className={`border-2 rounded-lg p-4 ${getSeverityColor(interaction.severity)}`}
                        >
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div className="flex-1">
                              <div className="font-semibold mb-1">{interaction.supplements.join(' + ')}</div>
                              <p className="text-sm">{interaction.warning}</p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                                interaction.severity === 'high'
                                  ? 'bg-red-200 text-red-900'
                                  : interaction.severity === 'medium'
                                  ? 'bg-orange-200 text-orange-900'
                                  : 'bg-yellow-200 text-yellow-900'
                              }`}
                            >
                              {interaction.severity === 'high'
                                ? 'Високо'
                                : interaction.severity === 'medium'
                                ? 'Средно'
                                : 'Ниско'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 3: TRACKING */}
        {activeTab === 'tracking' && (
          <div className="space-y-6">
            {/* Empty State */}
            {selectedSupplementIds.length === 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Няма добавки за проследяване</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                  Избери добавки в раздел "Моите добавки" за да започнеш проследяването им.
                </p>
                <button
                  onClick={() => setActiveTab('selection')}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Към избор на добавки
                </button>
              </div>
            )}

            {/* Tracking Content */}
            {selectedSupplementIds.length > 0 && (
              <>
                {/* Progress Header */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Днешен прогрес</h2>
                      <p className="text-sm text-gray-700">
                        {todayDate} - {takenToday}/{totalToday} приети ({adherenceToday}%)
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">{adherenceToday}%</div>
                      <div className="text-xs text-gray-600">Adherence</div>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        adherenceToday === 100
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}
                      style={{ width: `${adherenceToday}%` }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Маркирай приетите добавки</h2>
                  <div className="space-y-3">
                    {selectedSupplements.map((supplement) => {
                      const log = todayLogs.find((l) => l.supplement_id === supplement.id)
                      const isTaken = log?.taken || false
                      const isTestoUp = supplement.isTestoUp

                      return (
                        <div
                          key={supplement.id}
                          onClick={() => handleToggleLogTaken(supplement.id)}
                          className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                            isTestoUp
                              ? isTaken
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-orange-300 bg-orange-50/30 hover:border-orange-400'
                              : isTaken
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkbox */}
                            <div
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                isTaken
                                  ? isTestoUp
                                    ? 'bg-orange-600 border-orange-600'
                                    : 'bg-green-600 border-green-600'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isTaken && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {isTestoUp && (
                                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Trophy className="w-3 h-3" />
                                    TestoUP
                                  </div>
                                )}
                                <h3 className={`font-semibold ${isTestoUp ? 'text-orange-900' : 'text-gray-900'}`}>
                                  {supplement.name}
                                </h3>
                                {isTaken && log?.taken_time && (
                                  <span className="text-xs text-gray-600 ml-auto">Взет в {log.taken_time}</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{supplement.dosage}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveTodayLogs}
                    disabled={isSaving}
                    className="mt-6 w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      'Запазване...'
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Запази деня
                      </>
                    )}
                  </button>
                </div>

                {/* Motivational Message */}
                {adherenceToday === 100 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">Перфектен ден! 🎉</h3>
                    <p className="text-sm text-green-800">
                      Взе всички добавки! Продължавай така и ще видиш резултати!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 4: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 7-Day Adherence */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <h3 className="text-sm font-semibold text-purple-900">7-дневна</h3>
                </div>
                <div className="text-3xl font-bold text-purple-600">{adherence7Day}%</div>
                <p className="text-xs text-purple-700 mt-1">Последната седмица</p>
              </div>

              {/* 30-Day Adherence */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-blue-900">30-дневна</h3>
                </div>
                <div className="text-3xl font-bold text-blue-600">{adherence30Day}%</div>
                <p className="text-xs text-blue-700 mt-1">Месечна тенденция</p>
              </div>

              {/* Current Streak */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-orange-600" />
                  <h3 className="text-sm font-semibold text-orange-900">Streak</h3>
                </div>
                <div className="text-3xl font-bold text-orange-600">{currentStreak}</div>
                <p className="text-xs text-orange-700 mt-1">Consecutive days</p>
              </div>

              {/* Total Days */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <h3 className="text-sm font-semibold text-green-900">Дни</h3>
                </div>
                <div className="text-3xl font-bold text-green-600">{dailyAdherence.length}</div>
                <p className="text-xs text-green-700 mt-1">Записани дни</p>
              </div>
            </div>

            {/* Empty State */}
            {dailyAdherence.length === 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Няма история все още</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                  Започни да проследяваш добавките си в раздел "Днес", за да видиш статистика и прогрес.
                </p>
                <button
                  onClick={() => setActiveTab('tracking')}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Към проследяване
                </button>
              </div>
            )}

            {/* History Table */}
            {dailyAdherence.length > 0 && (
              <>
                {/* Heatmap Calendar */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">30-дневна хронология</h2>
                  <div className="grid grid-cols-7 gap-2">
                    {dailyAdherence.slice(-30).map((day, idx) => {
                      const date = new Date(day.date)
                      const dayName = date.toLocaleDateString('bg-BG', { weekday: 'short' })
                      const dayNum = date.getDate()

                      return (
                        <div
                          key={idx}
                          className="relative group"
                          title={`${day.date}: ${day.percentage}% (${day.taken}/${day.total})`}
                        >
                          <div
                            className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                              day.percentage === 100
                                ? 'bg-green-500 border-green-600 text-white'
                                : day.percentage >= 80
                                ? 'bg-green-200 border-green-300 text-green-900'
                                : day.percentage >= 50
                                ? 'bg-yellow-200 border-yellow-300 text-yellow-900'
                                : day.percentage > 0
                                ? 'bg-orange-200 border-orange-300 text-orange-900'
                                : 'bg-gray-100 border-gray-200 text-gray-400'
                            }`}
                          >
                            <div className="text-xs font-bold">{dayNum}</div>
                            <div className="text-xs">{day.percentage}%</div>
                          </div>
                          <div className="text-xs text-center text-gray-600 mt-1">{dayName}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500 border-2 border-green-600" />
                      <span>100%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-200 border-2 border-green-300" />
                      <span>80-99%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-200 border-2 border-yellow-300" />
                      <span>50-79%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-orange-200 border-2 border-orange-300" />
                      <span>1-49%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-200" />
                      <span>0%</span>
                    </div>
                  </div>
                </div>

                {/* Recent Days List */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Последни 10 дни</h2>
                  <div className="space-y-2">
                    {dailyAdherence.slice(-10).reverse().map((day, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">
                            {new Date(day.date).toLocaleDateString('bg-BG', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {day.taken}/{day.total} добавки
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div
                              className={`text-2xl font-bold ${
                                day.percentage === 100
                                  ? 'text-green-600'
                                  : day.percentage >= 80
                                  ? 'text-green-500'
                                  : day.percentage >= 50
                                  ? 'text-yellow-600'
                                  : 'text-orange-600'
                              }`}
                            >
                              {day.percentage}%
                            </div>
                          </div>
                          {day.percentage === 100 && (
                            <Trophy className="w-6 h-6 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slideUp">
          <div
            className={`rounded-lg px-4 py-3 shadow-lg border-2 flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-500 text-green-900'
                : 'bg-red-50 border-red-500 text-red-900'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
