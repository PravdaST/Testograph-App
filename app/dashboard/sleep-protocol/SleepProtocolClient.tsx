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

    // Save to Supabase (no 'hours' column in DB, we calculate it client-side)
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-700 hover:text-gray-900 mb-6 flex items-center gap-2 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад към Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sleep Protocol</h1>
              <p className="text-gray-600">Оптимизирай съня си за по-добро здраве</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('assessment')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'assessment'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              1. Оценка
            </button>
            <button
              onClick={() => setActiveTab('routine')}
              disabled={!assessment}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'routine'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : assessment
                  ? 'text-gray-600 hover:text-gray-900'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              2. Рутина
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex-1 px-6 py-4 font-medium transition-colors relative ${
                activeTab === 'checklist'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              3. Checklist
              {completedItems > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                  {completedItems}/10
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'tracker'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              4. Tracker
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Assessment Tab */}
            {activeTab === 'assessment' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Оцени текущия си сън</h2>
                <p className="text-gray-600 mb-8">
                  Отговори на въпросите за да генерираме персонализирана вечерна рутина
                </p>

                <form onSubmit={handleAssessmentSubmit} className="space-y-6 max-w-2xl">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all"
                  >
                    Генерирай рутина
                  </button>
                </form>
              </div>
            )}

            {/* Routine Tab */}
            {activeTab === 'routine' && routine.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Твоята вечерна рутина</h2>
                <p className="text-gray-600 mb-8">
                  Започни рутината {routine[0]?.time} за оптимални резултати
                </p>

                <div className="space-y-4">
                  {routine.map((step, index) => (
                    <div
                      key={index}
                      className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 text-2xl font-bold text-blue-600">{step.time}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                          <p className="text-gray-600 text-sm">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist Tab */}
            {activeTab === 'checklist' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Bedroom Optimization</h2>
                <p className="text-gray-600 mb-8">
                  Завърши всички точки за оптимална среда за сън ({completedItems}/10 готови)
                </p>

                <div className="space-y-3">
                  {checklistItems.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white border-2 rounded-lg p-4 transition-all cursor-pointer ${
                        item.completed
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleChecklistToggle(item.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                              item.completed
                                ? 'bg-emerald-600 border-emerald-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {item.completed && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-1 ${item.completed ? 'text-emerald-900' : 'text-gray-900'}`}>
                            {item.title}
                          </h3>
                          <p className={`text-sm ${item.completed ? 'text-emerald-700' : 'text-gray-600'}`}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tracker Tab */}
            {activeTab === 'tracker' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Sleep Tracker</h2>
                <p className="text-gray-600 mb-8">Записвай съня си всяка вечер</p>

                {/* Add Log Form */}
                <form onSubmit={handleAddLog} className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Добави запис за сън</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
                      <input
                        type="date"
                        value={logDate}
                        onChange={(e) => setLogDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Лягане</label>
                      <input
                        type="time"
                        value={logBedtime}
                        onChange={(e) => setLogBedtime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Събуждане</label>
                      <input
                        type="time"
                        value={logWaketime}
                        onChange={(e) => setLogWaketime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Качество (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={logQuality}
                        onChange={(e) => setLogQuality(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-all"
                  >
                    Добави запис
                  </button>
                </form>

                {/* Stats */}
                {logs.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">7-дневно качество</div>
                      <div className="text-2xl font-bold text-gray-900">{stats.avg7DayQuality}/10</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">7-дневни часове</div>
                      <div className="text-2xl font-bold text-gray-900">{stats.avg7DayHours}h</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">30-дневно качество</div>
                      <div className="text-2xl font-bold text-gray-900">{stats.avg30DayQuality}/10</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">30-дневни часове</div>
                      <div className="text-2xl font-bold text-gray-900">{stats.avg30DayHours}h</div>
                    </div>
                  </div>
                )}

                {/* Chart */}
                {logs.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                    <h3 className="font-semibold text-gray-900 mb-4">7-дневна тенденция на качеството на съня</h3>
                    <div className="h-64">
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
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 4,
                            pointBackgroundColor: '#6366f1',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
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
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">История ({logs.length} записа)</h3>
                  <div className="space-y-2">
                    {logs.slice(0, 10).map((log, index) => (
                      <div
                        key={log.id || index}
                        className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(log.date).toLocaleDateString('bg-BG', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {log.bedtime} → {log.waketime}
                          </div>
                          <div className="text-sm text-gray-600">{log.hours}h</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">Качество:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            log.quality >= 8
                              ? 'bg-emerald-100 text-emerald-700'
                              : log.quality >= 6
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {log.quality}/10
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
