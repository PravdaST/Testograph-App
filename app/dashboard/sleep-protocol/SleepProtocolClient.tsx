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
import { Moon, Clock, CheckCircle, BarChart3, ChevronDown, ArrowLeft, Trash2, Edit2, RotateCcw } from 'lucide-react'

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
  const [logNotes, setLogNotes] = useState('')
  const [editingLogId, setEditingLogId] = useState<string | null>(null)

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Show toast helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

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

    // Show success toast
    showToast('Персонализираната рутина е готова!')

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

  // Handle add or update sleep log
  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault()

    const hours = calculateSleepHours(logBedtime, logWaketime)

    if (editingLogId) {
      // Update existing log
      const { error } = await supabase
        .from('sleep_logs_app')
        .update({
          log_date: logDate,
          bedtime: logBedtime,
          waketime: logWaketime,
          quality: logQuality,
          notes: logNotes || null
        })
        .eq('id', editingLogId)

      if (error) {
        console.error('Error updating sleep log:', error)
        showToast('Грешка при актуализация: ' + error.message, 'error')
        return
      }

      // Update local state
      setLogs(logs.map(log =>
        log.id === editingLogId
          ? { ...log, date: logDate, bedtime: logBedtime, waketime: logWaketime, quality: logQuality, hours, notes: logNotes }
          : log
      ))
      setEditingLogId(null)
      showToast('Записът е актуализиран успешно!')
    } else {
      // Add new log
      const { data, error } = await supabase
        .from('sleep_logs_app')
        .insert({
          user_id: userId,
          log_date: logDate,
          bedtime: logBedtime,
          waketime: logWaketime,
          quality: logQuality,
          notes: logNotes || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding sleep log:', error)
        showToast('Грешка при запазване: ' + error.message, 'error')
        return
      }

      if (data) {
        const newLog: SleepLog = {
          id: data.id,
          date: logDate,
          bedtime: logBedtime,
          waketime: logWaketime,
          quality: logQuality,
          hours,
          notes: logNotes
        }
        setLogs([newLog, ...logs])
        showToast('Записът е добавен успешно!')
      }
    }

    // Reset form
    setLogDate(new Date().toISOString().split('T')[0])
    setLogBedtime('22:00')
    setLogWaketime('06:00')
    setLogQuality(7)
    setLogNotes('')
  }

  // Handle edit log
  const handleEditLog = (log: SleepLog) => {
    setEditingLogId(log.id || null)
    setLogDate(log.date)
    setLogBedtime(log.bedtime)
    setLogWaketime(log.waketime)
    setLogQuality(log.quality)
    setLogNotes(log.notes || '')
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingLogId(null)
    setLogDate(new Date().toISOString().split('T')[0])
    setLogBedtime('22:00')
    setLogWaketime('06:00')
    setLogQuality(7)
    setLogNotes('')
  }

  // Handle delete log
  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Сигурен ли си, че искаш да изтриеш този запис?')) {
      return
    }

    const { error } = await supabase
      .from('sleep_logs_app')
      .delete()
      .eq('id', logId)

    if (error) {
      console.error('Error deleting sleep log:', error)
      showToast('Грешка при изтриване: ' + error.message, 'error')
      return
    }

    setLogs(logs.filter(log => log.id !== logId))
    showToast('Записът е изтрит успешно!')
  }

  // Handle reset assessment
  const handleResetAssessment = () => {
    if (!confirm('Сигурен ли си, че искаш да рестартираш оценката?')) {
      return
    }
    setAssessment(null)
    setRoutine([])
    localStorage.removeItem(`sleep_assessment_${userId}`)
    setActiveTab('assessment')
  }

  const stats = calculateSleepStats(logs)
  const completedItems = checklistItems.filter(item => item.completed).length

  const tabs = [
    { id: 'assessment', label: 'Оценка', icon: Moon, step: 1 },
    { id: 'routine', label: 'Рутина', icon: Clock, step: 2 },
    { id: 'checklist', label: 'Чеклист', icon: CheckCircle, step: 3 },
    { id: 'tracker', label: 'Проследяване', icon: BarChart3, step: 4 }
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Протокол за сън</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Оптимизирай съня си за максимално възстановяване</p>
            </div>
          </div>
        </div>

        {/* Mobile Tabs - Horizontal Scroll */}
        <div className="overflow-x-auto hide-scrollbar border-t border-gray-200">
          <div className="flex min-w-max px-4 sm:px-6 lg:px-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
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
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-1">Защо Sleep Protocol?</h2>
                  <p className="text-sm text-gray-700">
                    Качественият сън увеличава тестостерона с до <span className="font-bold text-indigo-600">+15%</span>, подобрява възстановяването и енергията.
                    Създай си персонализирана вечерна рутина базирана на науката за сън.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Оцени текущия си сън</h2>
                <p className="text-sm text-gray-600">
                  Отговори на 4-те въпроса за да създадем твоята персонализирана вечерна рутина
                </p>
              </div>

              <form onSubmit={handleAssessmentSubmit} className="space-y-4">
                {/* Sleep Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Колко часа спиш средно на нощ?
                  </label>
                  <p className="text-xs text-gray-600 mb-2">Оптималното е 7-9 часа за възстановяване и тестостерон</p>
                  <input
                    type="number"
                    min="4"
                    max="12"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-gray-900"
                  />
                </div>

                {/* Bedtime */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Целево време за сън
                  </label>
                  <p className="text-xs text-gray-600 mb-2">Най-добре е 22:00-23:00 за максимална продукция на мелатонин</p>
                  <input
                    type="time"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-gray-900"
                  />
                </div>

                {/* Fall Asleep */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Време за заспиване (минути)
                  </label>
                  <p className="text-xs text-gray-600 mb-2">Нормалното е 10-20 минути. Над 30 мин = проблем</p>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={fallAsleep}
                    onChange={(e) => setFallAsleep(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-gray-900"
                  />
                </div>

                {/* Wakeups */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Събуждания през нощта
                  </label>
                  <p className="text-xs text-gray-600 mb-2">Целта е 0-1 събуждания за дълбок непрекъснат сън</p>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={wakeups}
                    onChange={(e) => setWakeups(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-gray-900"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all"
                  >
                    Генерирай рутина
                  </button>
                  {assessment && (
                    <button
                      type="button"
                      onClick={handleResetAssessment}
                      className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="hidden sm:inline">Рестарт</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Routine Tab - Empty State */}
        {activeTab === 'routine' && !assessment && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Рутината не е генерирана</h3>
              <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                Трябва първо да завършиш оценката в раздел <span className="font-semibold">"Оценка"</span>, за да се генерира твоята персонализирана вечерна рутина.
              </p>
              <button
                onClick={() => setActiveTab('assessment')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-all"
              >
                Към оценката
              </button>
            </div>
          </div>
        )}

        {/* Routine Tab */}
        {activeTab === 'routine' && assessment && routine.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-1">Твоята персонализирана рутина</h2>
                  <p className="text-sm text-gray-700">
                    Следвай тази рутина всяка вечер за <span className="font-bold text-indigo-600">дълбок възстановителен сън</span>. Започни от {routine[0]?.time} часа.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Стъпка по стъпка</h2>
                <p className="text-sm text-gray-600">
                  Всяка стъпка е важна - следвай реда за най-добри резултати
                </p>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden sm:block" />

                <div className="space-y-3">
                  {routine.map((step, index) => (
                    <div key={index} className="relative flex gap-3">
                      {/* Time badge - Mobile & Desktop */}
                      <div className="flex-shrink-0 w-14">
                        <div className="bg-indigo-100 text-indigo-900 rounded-lg px-2 py-1 text-center">
                          <div className="text-xs font-bold">{step.time}</div>
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-all">
                        <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">{step.title}</h3>
                        <p className="text-xs text-gray-600">{step.description}</p>
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
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Оптимизация на спалнята</h2>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold text-gray-900">Защо е важно:</span> Качеството на съня зависи на 70% от средата в спалнята - температура, светлина, шум и чистота.
                </p>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 mb-3">
                  <p className="text-xs text-indigo-900">
                    Завърши всички точки за дълбок възстановителен сън и максимална продукция на тестостерон
                  </p>
                </div>
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

              <div className="space-y-2">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-3 transition-all cursor-pointer ${
                      item.completed
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => handleChecklistToggle(item.id)}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 mt-0.5">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            item.completed
                              ? 'bg-green-600 border-green-600'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {item.completed && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold mb-0.5 text-sm ${item.completed ? 'text-green-900' : 'text-gray-900'}`}>
                          {item.title}
                        </h3>
                        <p className={`text-xs ${item.completed ? 'text-green-700' : 'text-gray-600'}`}>
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
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Header Info */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-1">Защо проследяваме съня?</h2>
                  <p className="text-sm text-gray-700">
                    Дневното проследяване показва тенденции в качеството на съня, помага да идентифицираш проблеми и да измериш напредъка.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-white rounded p-2 border border-indigo-100">
                  <div className="font-semibold text-indigo-600 mb-0.5">Цел</div>
                  <div className="text-gray-700">7-9h качествен сън</div>
                </div>
                <div className="bg-white rounded p-2 border border-indigo-100">
                  <div className="font-semibold text-green-600 mb-0.5">Качество</div>
                  <div className="text-gray-700">8-10/10 оптимално</div>
                </div>
                <div className="bg-white rounded p-2 border border-indigo-100">
                  <div className="font-semibold text-purple-600 mb-0.5">Следи</div>
                  <div className="text-gray-700">30-дневни тенденции</div>
                </div>
              </div>
            </div>

            {/* Add/Edit Log Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">
                    {editingLogId ? 'Редактирай запис' : 'Добави днешен сън'}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">Попълни данните за съня си от тази нощ</p>
                </div>
                {editingLogId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Откажи
                  </button>
                )}
              </div>
              <form onSubmit={handleAddLog}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Дата
                    </label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Лягане <span className="text-xs text-gray-500">(кога легнал)</span>
                    </label>
                    <input
                      type="time"
                      value={logBedtime}
                      onChange={(e) => setLogBedtime(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Събуждане <span className="text-xs text-gray-500">(кога станал)</span>
                    </label>
                    <input
                      type="time"
                      value={logWaketime}
                      onChange={(e) => setLogWaketime(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-gray-900"
                      required
                    />
                  </div>
                </div>

                {/* Quality Slider */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Качество на съня: <span className="text-indigo-600 font-bold">{logQuality}/10</span>
                  </label>
                  <p className="text-xs text-gray-600 mb-2">Как се чувстваш след съня? Заспа ли бързо? Събужда ли се през нощта?</p>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={logQuality}
                    onChange={(e) => setLogQuality(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 - Ужасно</span>
                    <span className="text-yellow-600">5 - Средно</span>
                    <span className="text-green-600">10 - Перфектно</span>
                  </div>
                </div>

                {/* Notes Field */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Бележки <span className="text-xs text-gray-500">(незадължително)</span>
                  </label>
                  <textarea
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    rows={2}
                    placeholder="Напр: Пих кафе късно, стресиран от работа, студено в стаята..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all text-gray-900 text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-lg transition-all"
                >
                  {editingLogId ? 'Запази промените' : 'Добави запис'}
                </button>
              </form>
            </div>

            {/* Stats Cards */}
            {logs.length > 0 && (
              <>
                <div className="bg-white border border-indigo-200 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Твоята статистика</h3>
                  <p className="text-xs text-gray-600 mb-3">Проследяваме средното качество и часове на сън за да видиш прогреса си</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                      <div className="text-xs text-green-700 mb-1 font-medium">7-дневно качество</div>
                      <div className="text-xl font-bold text-green-900">{stats.avg7DayQuality}<span className="text-sm text-green-600">/10</span></div>
                      <div className="text-xs text-green-600 mt-1">Последната седмица</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-xs text-blue-700 mb-1 font-medium">7-дневни часове</div>
                      <div className="text-xl font-bold text-blue-900">{stats.avg7DayHours}<span className="text-sm text-blue-600">h</span></div>
                      <div className="text-xs text-blue-600 mt-1">Средно на нощ</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-3">
                      <div className="text-xs text-purple-700 mb-1 font-medium">30-дневно качество</div>
                      <div className="text-xl font-bold text-purple-900">{stats.avg30DayQuality}<span className="text-sm text-purple-600">/10</span></div>
                      <div className="text-xs text-purple-600 mt-1">Месечна тенденция</div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-3">
                      <div className="text-xs text-indigo-700 mb-1 font-medium">30-дневни часове</div>
                      <div className="text-xl font-bold text-indigo-900">{stats.avg30DayHours}<span className="text-sm text-indigo-600">h</span></div>
                      <div className="text-xs text-indigo-600 mt-1">Средно за месеца</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Empty State */}
            {logs.length === 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <Moon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Започни да проследяваш съня си</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                  Добави първия си запис в горната форма, за да видиш статистика, графики и да проследиш прогреса си.
                </p>
                <div className="bg-white border border-gray-300 rounded-lg p-3 text-xs text-gray-600 max-w-sm mx-auto">
                  <span className="font-semibold text-gray-900">Съвет:</span> Попълвай всяка сутрин след събуждане за най-точни данни
                </div>
              </div>
            )}

            {/* Chart */}
            {logs.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 text-base mb-1">7-дневна тенденция на качеството</h3>
                  <p className="text-xs text-gray-600">Виж как се променя качеството на съня ти през последната седмица. Цел: стабилност над 8/10</p>
                </div>
                <div className="h-60 sm:h-72">
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
              <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 text-base mb-1">
                    Твоята история <span className="text-gray-500 font-normal">({logs.length} записа)</span>
                  </h3>
                  <p className="text-xs text-gray-600">Преглед на всички записи за сън. Може да редактираш или изтриеш стари записи.</p>
                </div>
                <div className="space-y-2">
                  {logs.slice(0, 10).map((log, index) => (
                    <div
                      key={log.id || index}
                      className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <div className="font-semibold text-gray-900">
                              {new Date(log.date).toLocaleDateString('bg-BG', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                              })}
                            </div>
                            <div className="text-gray-700">
                              {log.bedtime} → {log.waketime}
                            </div>
                            <div className="text-indigo-600 font-semibold">{log.hours}h</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
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

                        {log.notes && (
                          <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 border border-gray-200">
                            <span className="font-medium text-gray-900">Бележки: </span>
                            {log.notes}
                          </div>
                        )}

                        <div className="flex gap-2 pt-1 border-t border-gray-200">
                          <button
                            onClick={() => handleEditLog(log)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            Редактирай
                          </button>
                          <button
                            onClick={() => handleDeleteLog(log.id!)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Изтрий
                          </button>
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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slideUp">
          <div className={`rounded-lg px-4 py-3 shadow-lg border-2 flex items-center gap-3 ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-500 text-green-900'
              : 'bg-red-50 border-red-500 text-red-900'
          }`}>
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
