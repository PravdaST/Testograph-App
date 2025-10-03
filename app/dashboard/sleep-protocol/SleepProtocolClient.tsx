'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)
import type {
  SleepProtocolData,
  SleepAssessment,
  BedroomChecklistItem,
  SleepLog,
  RoutineStep
} from '@/lib/types/sleep-protocol'
import {
  generateEveningRoutine,
  calculateSleepHours,
  calculateSleepStats,
  getChartData
} from '@/lib/utils/sleep-protocol'
import { Moon, Clock, CheckCircle, BarChart3, ChevronDown, ArrowLeft } from 'lucide-react'

interface SleepProtocolClientProps {
  initialData: SleepProtocolData
  userId: string
}

type Tab = 'assessment' | 'routine' | 'checklist' | 'tracker'

export default function SleepProtocolClient({ initialData, userId }: SleepProtocolClientProps) {
  const router = useRouter()
  const supabase = createClient()

  // State
  const [activeTab, setActiveTab] = useState<Tab>('assessment')
  const [assessment, setAssessment] = useState<SleepAssessment | null>(null)
  const [routine, setRoutine] = useState<RoutineStep[]>([])
  const [checklistItems, setChecklistItems] = useState<BedroomChecklistItem[]>(initialData.checklistItems)
  const [logs, setLogs] = useState<SleepLog[]>(initialData.logs)

  // Form state
  const [sleepHours, setSleepHours] = useState(7)
  const [bedtime, setBedtime] = useState('22:00')
  const [fallAsleep, setFallAsleep] = useState(15)
  const [wakeups, setWakeups] = useState(1)

  // Log form state
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])
  const [logBedtime, setLogBedtime] = useState('22:00')
  const [logWaketime, setLogWaketime] = useState('06:00')
  const [logQuality, setLogQuality] = useState(7)

  // Load from localStorage on mount
  useEffect(() => {
    const savedAssessment = localStorage.getItem(`sleep_assessment_${userId}`)
    const savedChecklist = localStorage.getItem(`sleep_checklist_${userId}`)

    if (savedAssessment) {
      const parsed = JSON.parse(savedAssessment)
      setAssessment(parsed)
      setRoutine(generateEveningRoutine(parsed))
      setActiveTab('routine')
    }

    if (savedChecklist) {
      setChecklistItems(JSON.parse(savedChecklist))
    }
  }, [userId])

  // Handle assessment submit
  const handleAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newAssessment: SleepAssessment = {
      currentSleepHours: sleepHours,
      bedtime,
      fallAsleepMinutes: fallAsleep,
      nightWakeups: wakeups
    }

    setAssessment(newAssessment)
    const generatedRoutine = generateEveningRoutine(newAssessment)
    setRoutine(generatedRoutine)

    // Save to localStorage
    localStorage.setItem(`sleep_assessment_${userId}`, JSON.stringify(newAssessment))

    // Move to routine tab
    setActiveTab('routine')
  }

  // Handle checklist toggle
  const handleChecklistToggle = (id: string) => {
    const updated = checklistItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    )
    setChecklistItems(updated)
    localStorage.setItem(`sleep_checklist_${userId}`, JSON.stringify(updated))
  }

  // Handle add sleep log
  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault()

    const hours = calculateSleepHours(logBedtime, logWaketime)

    // Save to Supabase
    const { data, error } = await supabase
      .from('sleep_logs_app')
      .insert({
        user_id: userId,
        log_date: logDate,
        bedtime: logBedtime,
        waketime: logWaketime,
        quality: logQuality
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding sleep log:', error)
      alert('Грешка при запазване на лог: ' + error.message)
      return
    }

    if (data) {
      const newLog: SleepLog = {
        id: data.id,
        date: logDate,
        bedtime: logBedtime,
        waketime: logWaketime,
        quality: logQuality,
        hours
      }
      setLogs([newLog, ...logs])

      // Reset form
      setLogDate(new Date().toISOString().split('T')[0])
      setLogBedtime('22:00')
      setLogWaketime('06:00')
      setLogQuality(7)
    }
  }

  const stats = calculateSleepStats(logs)
  const completedItems = checklistItems.filter(item => item.completed).length

  const tabs = [
    { id: 'assessment', label: 'Оценка', icon: Moon, step: 1 },
    { id: 'routine', label: 'Рутина', icon: Clock, step: 2, disabled: !assessment },
    { id: 'checklist', label: 'Checklist', icon: CheckCircle, step: 3 },
    { id: 'tracker', label: 'Tracker', icon: BarChart3, step: 4 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first Header */}
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Sleep Protocol</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Оптимизирай съня си</p>
            </div>
          </div>
        </div>

        {/* Mobile Tabs - Horizontal Scroll */}
        <div className="overflow-x-auto hide-scrollbar border-t border-gray-200">
          <div className="flex min-w-max px-4 sm:px-6 lg:px-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isDisabled = tab.disabled

              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id as Tab)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : isDisabled
                      ? 'border-transparent text-gray-400 cursor-not-allowed'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {tab.id === 'checklist' && completedItems > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      {completedItems}/10
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Assessment Tab */}
        {activeTab === 'assessment' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Оцени текущия си сън</h2>
                <p className="text-sm text-gray-600">
                  Отговори на въпросите за да генерираме персонализирана вечерна рутина
                </p>
              </div>

              <form onSubmit={handleAssessmentSubmit} className="space-y-6">
                {/* Sleep Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Колко часа спиш в момента?
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="12"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Bedtime */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Целево време за сън
                  </label>
                  <input
                    type="time"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Fall Asleep */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Колко време ти трябва да заспиш? (минути)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={fallAsleep}
                    onChange={(e) => setFallAsleep(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Wakeups */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Колко пъти се събуждаш през нощта?
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={wakeups}
                    onChange={(e) => setWakeups(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-sm"
                >
                  Генерирай рутина
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Routine Tab */}
        {activeTab === 'routine' && routine.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Твоята вечерна рутина</h2>
                <p className="text-sm text-gray-600">
                  Започни рутината {routine[0]?.time} за оптимални резултати
                </p>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden sm:block" />

                <div className="space-y-6">
                  {routine.map((step, index) => (
                    <div key={index} className="relative flex gap-4">
                      {/* Time badge - Mobile & Desktop */}
                      <div className="flex-shrink-0 w-16 sm:w-16">
                        <div className="bg-indigo-100 text-indigo-900 rounded-lg px-2 py-1 text-center">
                          <div className="text-xs font-bold">{step.time}</div>
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-all">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{step.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Bedroom Optimization</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Завърши всички точки за оптимална среда за сън
                </p>
                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-full transition-all duration-500"
                      style={{ width: `${(completedItems / checklistItems.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    {completedItems}/{checklistItems.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                      item.completed
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => handleChecklistToggle(item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            item.completed
                              ? 'bg-green-600 border-green-600'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {item.completed && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold mb-1 text-sm sm:text-base ${item.completed ? 'text-green-900' : 'text-gray-900'}`}>
                          {item.title}
                        </h3>
                        <p className={`text-xs sm:text-sm ${item.completed ? 'text-green-700' : 'text-gray-600'}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tracker Tab */}
        {activeTab === 'tracker' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Add Log Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
              <h3 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">Добави запис за сън</h3>
              <form onSubmit={handleAddLog}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Лягане</label>
                    <input
                      type="time"
                      value={logBedtime}
                      onChange={(e) => setLogBedtime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Събуждане</label>
                    <input
                      type="time"
                      value={logWaketime}
                      onChange={(e) => setLogWaketime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Качество (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={logQuality}
                      onChange={(e) => setLogQuality(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-6 rounded-lg transition-all shadow-sm"
                >
                  Добави запис
                </button>
              </form>
            </div>

            {/* Stats Cards */}
            {logs.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1 font-medium">7-дневно качество</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.avg7DayQuality}<span className="text-base text-gray-500">/10</span></div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1 font-medium">7-дневни часове</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.avg7DayHours}<span className="text-base text-gray-500">h</span></div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1 font-medium">30-дневно качество</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.avg30DayQuality}<span className="text-base text-gray-500">/10</span></div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1 font-medium">30-дневни часове</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.avg30DayHours}<span className="text-base text-gray-500">h</span></div>
                </div>
              </div>
            )}

            {/* Chart */}
            {logs.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
                <h3 className="font-semibold text-gray-900 mb-6 text-base sm:text-lg">7-дневна тенденция</h3>
                <div className="h-64 sm:h-80">
                  <Line
                    data={{
                      labels: logs.slice(0, 7).reverse().map(log =>
                        new Date(log.date).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })
                      ),
                      datasets: [{
                        label: 'Качество на съня',
                        data: logs.slice(0, 7).reverse().map(log => log.quality),
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 5,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 7
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: 12,
                          titleFont: {
                            size: 14
                          },
                          bodyFont: {
                            size: 13
                          },
                          callbacks: {
                            label: function(context) {
                              return `Качество: ${context.parsed.y}/10`
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 10,
                          ticks: {
                            stepSize: 2
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Logs History */}
            {logs.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
                <h3 className="font-semibold text-gray-900 mb-4 text-base sm:text-lg">
                  История <span className="text-gray-500 font-normal">({logs.length} записа)</span>
                </h3>
                <div className="space-y-2">
                  {logs.slice(0, 10).map((log, index) => (
                    <div
                      key={log.id || index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="font-medium text-gray-900">
                            {new Date(log.date).toLocaleDateString('bg-BG', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                          <div className="text-gray-600">
                            {log.bedtime} → {log.waketime}
                          </div>
                          <div className="text-gray-600 font-medium">{log.hours}h</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-600">Качество:</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            log.quality >= 8
                              ? 'bg-green-100 text-green-700'
                              : log.quality >= 6
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {log.quality}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hide scrollbar for mobile tabs */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
