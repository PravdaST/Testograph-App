'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LABS, CITIES } from '@/lib/data/labs-database'
import type { Lab } from '@/lib/data/labs-database'
import type { LabResult, InterpretationInput, InterpretationResult } from '@/lib/types/lab-testing'
import {
  filterLabsByCity,
  searchLabs,
  interpretResults,
  getStatusColor,
  calculateImprovement,
  formatDate,
  exportToCSV
} from '@/lib/utils/lab-testing'

type Tab = 'directory' | 'instructions' | 'interpreter' | 'tracker'

interface LabTestingClientProps {
  userId: string
}

interface Toast {
  message: string
  type: 'success' | 'error'
}

export default function LabTestingClient({ userId }: LabTestingClientProps) {
  const router = useRouter()

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('directory')

  // Directory state
  const [selectedCity, setSelectedCity] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Interpreter state
  const [age, setAge] = useState<number>(30)
  const [totalT, setTotalT] = useState<number | ''>('')
  const [freeT, setFreeT] = useState<number | ''>('')
  const [shbg, setShbg] = useState<number | ''>('')
  const [estradiol, setEstradiol] = useState<number | ''>('')
  const [interpretation, setInterpretation] = useState<InterpretationResult | null>(null)

  // Tracker state
  const [results, setResults] = useState<LabResult[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newResult, setNewResult] = useState<LabResult>({
    test_date: new Date().toISOString().split('T')[0],
    total_t: 0,
    free_t: undefined,
    shbg: undefined,
    estradiol: undefined,
    lh: undefined,
    notes: ''
  })

  // Loading & Race condition protection
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Toast notification
  const [toast, setToast] = useState<Toast | null>(null)

  // Show toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }, [])

  // Auto-hide toast after 3 seconds (with cleanup to prevent memory leaks)
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer) // Cleanup prevents memory leak
  }, [toast])

  // Load results from Supabase on mount
  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('lab_results_app')
          .select('*')
          .eq('user_id', userId)
          .order('test_date', { ascending: false })

        if (error) {
          showToast('Грешка при зареждане на резултати', 'error')
          return
        }

        if (data) {
          // Transform Supabase data to app format
          const transformed: LabResult[] = data.map(row => ({
            id: row.id,
            test_date: row.test_date,
            total_t: row.total_testosterone,
            free_t: row.free_testosterone || undefined,
            shbg: row.shbg || undefined,
            estradiol: row.estradiol || undefined,
            lh: row.lh || undefined,
            notes: row.notes || ''
          }))
          setResults(transformed)
        }
      } catch (error) {
        console.error('Load error:', error)
        showToast('Грешка при зареждане', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    loadResults()
  }, [userId, showToast])

  // Filter labs (memoized for performance)
  const filteredLabs = useMemo(() => {
    return searchLabs(
      filterLabsByCity(LABS, selectedCity),
      searchQuery
    )
  }, [selectedCity, searchQuery])

  // Calculate improvement (memoized for performance)
  const improvement = useMemo(() => {
    return calculateImprovement(results)
  }, [results])

  // Handle interpretation
  const handleInterpret = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!totalT) return

    const input: InterpretationInput = {
      age,
      total_t: totalT as number,
      free_t: freeT || undefined,
      shbg: shbg || undefined,
      estradiol: estradiol || undefined
    }

    const result = interpretResults(input)
    setInterpretation(result)
  }, [age, totalT, freeT, shbg, estradiol])

  // Handle add result
  const handleAddResult = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent multiple simultaneous saves (race condition protection)
    if (isSaving) return

    setIsSaving(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('lab_results_app')
        .insert({
          user_id: userId,
          test_date: newResult.test_date,
          total_testosterone: newResult.total_t,
          free_testosterone: newResult.free_t,
          shbg: newResult.shbg,
          estradiol: newResult.estradiol,
          lh: newResult.lh,
          notes: newResult.notes
        })
        .select()
        .single()

      if (error) {
        showToast('Грешка при запазване', 'error')
        return
      }

      if (data) {
        // Add to local state
        const transformed: LabResult = {
          id: data.id,
          test_date: data.test_date,
          total_t: data.total_testosterone,
          free_t: data.free_testosterone || undefined,
          shbg: data.shbg || undefined,
          estradiol: data.estradiol || undefined,
          lh: data.lh || undefined,
          notes: data.notes || ''
        }

        const updatedResults = [...results, transformed].sort((a, b) =>
          new Date(b.test_date).getTime() - new Date(a.test_date).getTime()
        )
        setResults(updatedResults)
        setShowAddForm(false)
        setNewResult({
          test_date: new Date().toISOString().split('T')[0],
          total_t: 0,
          free_t: undefined,
          shbg: undefined,
          estradiol: undefined,
          lh: undefined,
          notes: ''
        })
        showToast('Резултатът е запазен успешно!')
      }
    } catch (error) {
      console.error('Save error:', error)
      showToast('Грешка при запазване', 'error')
    } finally {
      setIsSaving(false)
    }
  }, [userId, newResult, results, isSaving, showToast])

  // Handle delete result
  const handleDeleteResult = useCallback(async (id: string) => {
    // Prevent multiple simultaneous deletes (race condition protection)
    if (isDeleting) return

    setIsDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('lab_results_app')
        .delete()
        .eq('id', id)

      if (error) {
        showToast('Грешка при изтриване', 'error')
        return
      }

      // Remove from local state
      const updatedResults = results.filter(r => r.id !== id)
      setResults(updatedResults)
      showToast('Резултатът е изтрит')
    } catch (error) {
      console.error('Delete error:', error)
      showToast('Грешка при изтриване', 'error')
    } finally {
      setIsDeleting(false)
    }
  }, [results, isDeleting, showToast])

  // Handle export CSV
  const handleExportCSV = useCallback(() => {
    try {
      const csv = exportToCSV(results)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lab-results-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Файлът е изтеглен успешно!')
    } catch (error) {
      console.error('Export error:', error)
      showToast('Грешка при експорт', 'error')
    }
  }, [results, showToast])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        )}

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lab Testing Guide</h1>
              <p className="text-gray-600">Справочник, интерпретатор и проследяване на резултати</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'directory'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Справочник лаборатории
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'instructions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Инструкции
            </button>
            <button
              onClick={() => setActiveTab('interpreter')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'interpreter'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Интерпретатор
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'tracker'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Проследяване
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Directory Tab */}
            {activeTab === 'directory' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Филтър по град
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">Всички градове ({LABS.length})</option>
                      {CITIES.map(city => (
                        <option key={city} value={city}>
                          {city} ({LABS.filter(l => l.city === city).length})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Търсене по име или адрес
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Търси..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Results count */}
                <div className="text-sm text-gray-600">
                  Показани: <span className="font-semibold text-gray-900">{filteredLabs.length}</span> лаборатории
                </div>

                {/* Labs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLabs.map((lab, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-500 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">{lab.name}</h3>
                          <p className="text-sm text-gray-600">{lab.city}</p>
                        </div>
                        {lab.no_appointment && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                            Без час
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-700">{lab.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-gray-700">{lab.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-700">{lab.hours}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-gray-600">Total T</div>
                            <div className="font-semibold text-gray-900">{lab.price_total_t}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Free T</div>
                            <div className="font-semibold text-gray-900">{lab.price_free_t}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Пакет</div>
                            <div className="font-semibold text-blue-600">{lab.price_package}</div>
                          </div>
                        </div>
                        {lab.website && (
                          <a
                            href={lab.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Посети сайт →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions Tab */}
            {activeTab === 'instructions' && (
              <div className="space-y-6 max-w-3xl">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-4">Какво да поръчам?</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Total Testosterone</strong> (общ тестостерон) - ЗАДЪЛЖИТЕЛНО</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Free Testosterone</strong> (свободен тестостерон) - Препоръчително</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>SHBG</strong> (глобулин свързващ половите хормони) - Препоръчително</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Estradiol</strong> (естрадиол) - Опционално</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>LH</strong> (лутеинизиращ хормон) - Опционално</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-emerald-900 mb-4">Кога да отида?</h3>
                  <ul className="space-y-2 text-emerald-800">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Сутрин между 7:00-9:00</strong> - Пиковите нива са сутрин</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>На гладно</strong> - 8-12 часа без храна (вода е позволена)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>След добър сън</strong> - Минимум 7 часа сън предната нощ</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-yellow-900 mb-4">Как да се подготвя?</h3>
                  <ul className="space-y-2 text-yellow-800">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Без тежка тренировка 48 часа преди теста</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Без алкохол 72 часа преди теста</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Без стрес и сериозен физически товар предния ден</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Спри всички добавки 24 часа преди (освен ако лекарят не каже друго)</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Interpreter Tab */}
            {activeTab === 'interpreter' && (
              <div className="space-y-6 max-w-3xl">
                <form onSubmit={handleInterpret} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Възраст *
                      </label>
                      <input
                        type="number"
                        required
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        min={18}
                        max={100}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Total Testosterone (ng/dL) *
                      </label>
                      <input
                        type="number"
                        required
                        value={totalT}
                        onChange={(e) => setTotalT(e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        step={0.1}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Free Testosterone (pg/mL)
                      </label>
                      <input
                        type="number"
                        value={freeT}
                        onChange={(e) => setFreeT(e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        step={0.1}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        SHBG (nmol/L)
                      </label>
                      <input
                        type="number"
                        value={shbg}
                        onChange={(e) => setShbg(e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        step={0.1}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Estradiol (pg/mL)
                      </label>
                      <input
                        type="number"
                        value={estradiol}
                        onChange={(e) => setEstradiol(e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        step={0.1}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Анализирай резултати
                  </button>
                </form>

                {interpretation && (
                  <div className={`border-2 rounded-xl p-6 ${getStatusColor(interpretation.status)}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-4xl">
                        {interpretation.status === 'optimal' ? '🟢' : interpretation.status === 'suboptimal' ? '🟡' : '🔴'}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{interpretation.statusLabel}</h3>
                        <p className="text-sm opacity-75">Възрастова група: {interpretation.ageRange} години</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="font-semibold">Total Testosterone:</div>
                        <div>{interpretation.totalTStatus}</div>
                        <div className="text-sm opacity-75">Оптимално: {interpretation.optimalRange[0]}-{interpretation.optimalRange[1]} ng/dL</div>
                      </div>
                      {interpretation.freeTStatus && (
                        <div>
                          <div className="font-semibold">Free Testosterone:</div>
                          <div>{interpretation.freeTStatus}</div>
                        </div>
                      )}
                      {interpretation.shbgStatus && (
                        <div>
                          <div className="font-semibold">SHBG:</div>
                          <div>{interpretation.shbgStatus}</div>
                        </div>
                      )}
                      {interpretation.estradiolStatus && (
                        <div>
                          <div className="font-semibold">Estradiol:</div>
                          <div>{interpretation.estradiolStatus}</div>
                        </div>
                      )}
                    </div>

                    <div className="border-t-2 pt-4 mt-4">
                      <h4 className="font-bold mb-2">Препоръки:</h4>
                      <ul className="space-y-2">
                        {interpretation.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="flex-shrink-0 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tracker Tab */}
            {activeTab === 'tracker' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Твоите резултати ({results.length})
                  </h3>
                  <div className="flex gap-2">
                    {results.length > 0 && (
                      <button
                        onClick={handleExportCSV}
                        className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Експорт CSV
                      </button>
                    )}
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      {showAddForm ? 'Откажи' : '+ Добави резултат'}
                    </button>
                  </div>
                </div>

                {/* Add Form */}
                {showAddForm && (
                  <form onSubmit={handleAddResult} className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-4">Нов резултат</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">Дата *</label>
                        <input
                          type="date"
                          required
                          value={newResult.test_date}
                          onChange={(e) => setNewResult({ ...newResult, test_date: e.target.value })}
                          className="w-full px-4 py-2 border border-blue-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">Total T (ng/dL) *</label>
                        <input
                          type="number"
                          required
                          value={newResult.total_t}
                          onChange={(e) => setNewResult({ ...newResult, total_t: Number(e.target.value) })}
                          min={0}
                          step={0.1}
                          className="w-full px-4 py-2 border border-blue-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">Free T (pg/mL)</label>
                        <input
                          type="number"
                          value={newResult.free_t || ''}
                          onChange={(e) => setNewResult({ ...newResult, free_t: e.target.value ? Number(e.target.value) : undefined })}
                          min={0}
                          step={0.1}
                          className="w-full px-4 py-2 border border-blue-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">SHBG (nmol/L)</label>
                        <input
                          type="number"
                          value={newResult.shbg || ''}
                          onChange={(e) => setNewResult({ ...newResult, shbg: e.target.value ? Number(e.target.value) : undefined })}
                          min={0}
                          step={0.1}
                          className="w-full px-4 py-2 border border-blue-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">Estradiol (pg/mL)</label>
                        <input
                          type="number"
                          value={newResult.estradiol || ''}
                          onChange={(e) => setNewResult({ ...newResult, estradiol: e.target.value ? Number(e.target.value) : undefined })}
                          min={0}
                          step={0.1}
                          className="w-full px-4 py-2 border border-blue-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">LH (mIU/mL)</label>
                        <input
                          type="number"
                          value={newResult.lh || ''}
                          onChange={(e) => setNewResult({ ...newResult, lh: e.target.value ? Number(e.target.value) : undefined })}
                          min={0}
                          step={0.1}
                          className="w-full px-4 py-2 border border-blue-300 rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-blue-900 mb-2">Бележки</label>
                        <textarea
                          value={newResult.notes}
                          onChange={(e) => setNewResult({ ...newResult, notes: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-2 border border-blue-300 rounded-lg"
                          placeholder="Напр.: След 3 месеца програма, добавих Витамин D3..."
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`w-full text-white font-semibold py-2 rounded-lg transition-colors ${
                        isSaving
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isSaving ? 'Запазване...' : 'Запази'}
                    </button>
                  </form>
                )}

                {/* Improvement Stats */}
                {improvement && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                    <h4 className="font-semibold text-emerald-900 mb-3">Твоят прогрес</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-emerald-700">Първи тест</div>
                        <div className="text-2xl font-bold text-emerald-900">{improvement.first}</div>
                        <div className="text-xs text-emerald-700">ng/dL</div>
                      </div>
                      <div>
                        <div className="text-sm text-emerald-700">Последен тест</div>
                        <div className="text-2xl font-bold text-emerald-900">{improvement.last}</div>
                        <div className="text-xs text-emerald-700">ng/dL</div>
                      </div>
                      <div>
                        <div className="text-sm text-emerald-700">Промяна</div>
                        <div className={`text-2xl font-bold ${improvement.change >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                          {improvement.change >= 0 ? '+' : ''}{improvement.change.toFixed(1)}
                        </div>
                        <div className="text-xs text-emerald-700">ng/dL</div>
                      </div>
                      <div>
                        <div className="text-sm text-emerald-700">Процент</div>
                        <div className={`text-2xl font-bold ${improvement.changePercent >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                          {improvement.changePercent >= 0 ? '+' : ''}{improvement.changePercent.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results List */}
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                      <p className="mt-4 text-gray-600">Зареждане на резултати...</p>
                    </div>
                  ) : results.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p>Все още няма записани резултати.</p>
                      <p className="text-sm">Добави първия си тест, за да проследяваш напредъка.</p>
                    </div>
                  ) : (
                    results.map((result) => (
                      <div key={result.id} className="border-2 border-gray-200 rounded-lg p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-bold text-gray-900">{formatDate(result.test_date)}</div>
                            <div className="text-2xl font-bold text-blue-600 mt-1">{result.total_t} ng/dL</div>
                          </div>
                          <button
                            onClick={() => handleDeleteResult(result.id!)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {result.free_t && (
                            <div>
                              <div className="text-gray-600">Free T</div>
                              <div className="font-semibold text-gray-900">{result.free_t} pg/mL</div>
                            </div>
                          )}
                          {result.shbg && (
                            <div>
                              <div className="text-gray-600">SHBG</div>
                              <div className="font-semibold text-gray-900">{result.shbg} nmol/L</div>
                            </div>
                          )}
                          {result.estradiol && (
                            <div>
                              <div className="text-gray-600">Estradiol</div>
                              <div className="font-semibold text-gray-900">{result.estradiol} pg/mL</div>
                            </div>
                          )}
                          {result.lh && (
                            <div>
                              <div className="text-gray-600">LH</div>
                              <div className="font-semibold text-gray-900">{result.lh} mIU/mL</div>
                            </div>
                          )}
                        </div>
                        {result.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-700">
                            <strong>Бележки:</strong> {result.notes}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
