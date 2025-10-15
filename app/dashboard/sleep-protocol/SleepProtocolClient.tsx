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

export default function SleepProtocolClient({ initialData, userId }: SleepProtocolClientProps) {
  const router = useRouter()
  const supabase = createClient()

  // State
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
  }

  const stats = calculateSleepStats(logs)
  const completedItems = checklistItems.filter(item => item.completed).length

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-700 hover:text-gray-900 mb-6 flex items-center gap-2 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад към Dashboard
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
              <Moon className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sleep Protocol</h1>
              <p className="text-gray-600">Оптимизирай съня си за максимално възстановяване</p>
            </div>
          </div>
        </div>

        {/* Assessment Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Оцени текущия си сън</h2>
            <p className="text-sm text-gray-600">
              Отговори на 4-те въпроса за да създадем твоята персонализирана вечерна рутина
            </p>
          </div>

          <form onSubmit={handleAssessmentSubmit} className="space-y-5">
            {/* Sleep Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Колко часа спиш средно на нощ?
              </label>
              <p className="text-xs text-gray-600 mb-2">Оптималното е 7-9 часа за възстановяване</p>
              <input
                type="number"
                min="4"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            {/* Bedtime */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Целево време за сън
              </label>
              <p className="text-xs text-gray-600 mb-2">Най-добре е 22:00-23:00 за максимална продукция на мелатонин</p>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            {/* Fall Asleep */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Време за заспиване (минути)
              </label>
              <p className="text-xs text-gray-600 mb-2">Нормалното е 10-20 минути</p>
              <input
                type="number"
                min="5"
                max="120"
                value={fallAsleep}
                onChange={(e) => setFallAsleep(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            {/* Wakeups */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Събуждания през нощта
              </label>
              <p className="text-xs text-gray-600 mb-2">Целта е 0-1 събуждания за дълбок непрекъснат сън</p>
              <input
                type="number"
                min="0"
                max="10"
                value={wakeups}
                onChange={(e) => setWakeups(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Генерирай рутина
              </button>
              {assessment && (
                <button
                  type="button"
                  onClick={handleResetAssessment}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Рестарт
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Routine */}
        {assessment && routine.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Твоята персонализирана рутина</h2>
              <p className="text-sm text-gray-600">
                Следвай тази рутина всяка вечер за дълбок възстановителен сън. Започни от {routine[0]?.time} часа.
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {routine.map((step, index) => (
                <div key={index} className="relative flex gap-4">
                  {/* Time badge */}
                  <div className="flex-shrink-0 w-20">
                    <div className="bg-blue-100 text-blue-900 font-bold px-3 py-2 rounded-lg text-center">
                      {step.time}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all">
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bedroom Checklist */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Оптимизация на спалнята</h2>
            <p className="text-sm text-gray-600 mb-3">
              Качеството на съня зависи на 70% от средата в спалнята - температура, светлина, шум и чистота.
            </p>
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
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
                    <h3 className={`font-semibold mb-1 ${item.completed ? 'text-green-900' : 'text-gray-900'}`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm ${item.completed ? 'text-green-700' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Проследяване на съня</h2>
            <p className="text-sm text-gray-600">
              Дневното проследяване показва тенденции в качеството на съня и помага да измериш напредъка
            </p>
          </div>

          {/* Add/Edit Log Form */}
          <form onSubmit={handleAddLog} className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {editingLogId ? 'Редактирай запис' : 'Добави днешен сън'}
              </h3>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Дата</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Лягане</label>
                <input
                  type="time"
                  value={logBedtime}
                  onChange={(e) => setLogBedtime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Събуждане</label>
                <input
                  type="time"
                  value={logWaketime}
                  onChange={(e) => setLogWaketime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Quality Slider */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Качество на съня: <span className="text-blue-600 font-bold">{logQuality}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={logQuality}
                onChange={(e) => setLogQuality(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 - Ужасно</span>
                <span>5 - Средно</span>
                <span>10 - Перфектно</span>
              </div>
            </div>

            {/* Notes Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Бележки <span className="text-xs text-gray-500">(незадължително)</span>
              </label>
              <textarea
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                rows={2}
                placeholder="Напр: Пих кафе късно, стресиран от работа..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {editingLogId ? 'Запази промените' : 'Добави запис'}
            </button>
          </form>

          {/* Stats Cards */}
          {logs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Твоята статистика</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="text-xs text-green-700 mb-1 font-medium">7-дневно качество</div>
                  <div className="text-2xl font-bold text-green-900">{stats.avg7DayQuality}<span className="text-sm text-green-600">/10</span></div>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="text-xs text-blue-700 mb-1 font-medium">7-дневни часове</div>
                  <div className="text-2xl font-bold text-blue-900">{stats.avg7DayHours}<span className="text-sm text-blue-600">h</span></div>
                </div>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <div className="text-xs text-purple-700 mb-1 font-medium">30-дневно качество</div>
                  <div className="text-2xl font-bold text-purple-900">{stats.avg30DayQuality}<span className="text-sm text-purple-600">/10</span></div>
                </div>
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                  <div className="text-xs text-indigo-700 mb-1 font-medium">30-дневни часове</div>
                  <div className="text-2xl font-bold text-indigo-900">{stats.avg30DayHours}<span className="text-sm text-indigo-600">h</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          {logs.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">7-дневна тенденция</h3>
              <div className="h-64">
                <Line
                  data={{
                    labels: logs.slice(0, 7).reverse().map(log =>
                      new Date(log.date).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })
                    ),
                    datasets: [{
                      label: 'Качество на съня',
                      data: logs.slice(0, 7).reverse().map(log => log.quality),
                      borderColor: '#2563eb',
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      borderWidth: 3,
                      tension: 0.4,
                      fill: true,
                      pointRadius: 5,
                      pointBackgroundColor: '#2563eb',
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
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                История <span className="text-gray-500 font-normal">({logs.length} записа)</span>
              </h3>
              <div className="space-y-2">
                {logs.slice(0, 10).map((log, index) => (
                  <div
                    key={log.id || index}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
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
                          <div className="text-blue-600 font-semibold">{log.hours}h</div>
                        </div>
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

                      {log.notes && (
                        <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 border border-gray-200">
                          <span className="font-medium text-gray-900">Бележки: </span>
                          {log.notes}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => handleEditLog(log)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Редактирай
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id!)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
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

          {/* Empty State */}
          {logs.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <Moon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Започни да проследяваш съня си</h3>
              <p className="text-sm text-gray-600">
                Добави първия си запис в горната форма, за да видиш статистика и графики.
              </p>
            </div>
          )}
        </div>
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
    </div>
  )
}
