'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LABS, CITIES, LAST_UPDATED } from '@/lib/data/labs-database'
import type { Lab } from '@/lib/data/labs-database'
import { fetchVerifiedLabs, fetchCitiesWithCount } from '@/lib/supabase/lab-locations'
import { DataDisclaimer } from './components/DataDisclaimer'
import {
  MapPin, Phone, Clock, Star, Users, ExternalLink,
  CheckCircle2, AlertCircle, Search, X, Filter, ChevronDown, TrendingUp
} from 'lucide-react'
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

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function LabTestingClient({ userId }: LabTestingClientProps) {
  const router = useRouter()

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('directory')

  // Directory state - Labs from Supabase (fallback to hardcoded LABS only on error)
  const [labs, setLabs] = useState<Lab[]>([]) // Start with empty array - show skeleton
  const [cities, setCities] = useState<{ city: string; count: number }[]>([])
  const [isLoadingLabs, setIsLoadingLabs] = useState(true)
  const [selectedCity, setSelectedCity] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'reviews' | 'distance'>('rating')
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // Interpreter state
  const [age, setAge] = useState<number>(30)
  const [totalT, setTotalT] = useState<number | ''>('')
  const [freeT, setFreeT] = useState<number | ''>('')
  const [shbg, setShbg] = useState<number | ''>('')
  const [estradiol, setEstradiol] = useState<number | ''>('')
  const [lh, setLh] = useState<number | ''>('')
  const [prolactin, setProlactin] = useState<number | ''>('')
  const [fsh, setFsh] = useState<number | ''>('')
  const [dht, setDht] = useState<number | ''>('')
  const [cortisol, setCortisol] = useState<number | ''>('')
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
    prolactin: undefined,
    fsh: undefined,
    dht: undefined,
    cortisol: undefined,
    notes: ''
  })

  // Loading & Race condition protection
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Delete confirmation modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Toast notification
  const [toast, setToast] = useState<Toast | null>(null)

  // Input validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Banner dismissal
  const [bannerDismissed, setBannerDismissed] = useState(false)

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

  // Keyboard navigation for delete modal (Escape key)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteConfirmId) {
        setDeleteConfirmId(null)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [deleteConfirmId])

  // Load labs from Supabase on mount
  useEffect(() => {
    const loadLabsFromDB = async () => {
      setIsLoadingLabs(true)
      try {
        const [dbLabs, citiesData] = await Promise.all([
          fetchVerifiedLabs(),
          fetchCitiesWithCount()
        ])

        if (dbLabs && dbLabs.length > 0) {
          setLabs(dbLabs)
          console.log(`✅ Loaded ${dbLabs.length} labs from Supabase`)
        } else {
          // No labs in DB - use hardcoded fallback
          console.warn('⚠️  No labs in DB, using fallback hardcoded LABS')
          setLabs(LABS)
        }

        if (citiesData && citiesData.length > 0) {
          setCities(citiesData)
        }
      } catch (error) {
        // Error loading from DB - use hardcoded fallback
        console.error('❌ Error loading labs from DB:', error)
        console.warn('Using fallback hardcoded LABS')
        setLabs(LABS)
      } finally {
        setIsLoadingLabs(false)
      }
    }

    loadLabsFromDB()
  }, [])

  // Debounce search for performance (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

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

  // Request user location when distance sorting is selected
  useEffect(() => {
    if (sortBy === 'distance' && !userLocation && !isGettingLocation) {
      setIsGettingLocation(true)

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            })
            setIsGettingLocation(false)
          },
          (error) => {
            console.error('Geolocation error:', error)
            showToast('Не можахме да определим локацията ти', 'error')
            setSortBy('rating') // Fallback to rating
            setIsGettingLocation(false)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes cache
          }
        )
      } else {
        showToast('Твоят браузър не поддържа геолокация', 'error')
        setSortBy('rating')
        setIsGettingLocation(false)
      }
    }
  }, [sortBy, userLocation, isGettingLocation, showToast])

  // Filter and sort labs (memoized for performance)
  const filteredLabs = useMemo(() => {
    let filtered = searchLabs(
      filterLabsByCity(labs, selectedCity),
      debouncedSearch
    )

    // Sort based on selected option
    if (sortBy === 'rating') {
      filtered = filtered.sort((a, b) => {
        const ratingA = a.google_rating || 0
        const ratingB = b.google_rating || 0
        return ratingB - ratingA // Highest first
      })
    } else if (sortBy === 'name') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name, 'bg'))
    } else if (sortBy === 'reviews') {
      filtered = filtered.sort((a, b) => {
        const reviewsA = a.total_reviews || 0
        const reviewsB = b.total_reviews || 0
        return reviewsB - reviewsA // Most reviews first
      })
    } else if (sortBy === 'distance' && userLocation) {
      filtered = filtered.sort((a, b) => {
        // Only sort labs with valid coordinates
        if (!a.latitude || !a.longitude) return 1
        if (!b.latitude || !b.longitude) return -1

        const distA = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          a.latitude,
          a.longitude
        )
        const distB = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          b.latitude,
          b.longitude
        )
        return distA - distB // Closest first
      })
    }

    return filtered
  }, [labs, selectedCity, debouncedSearch, sortBy, userLocation])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedCity('all')
    setSearchQuery('')
    setDebouncedSearch('')
  }, [])

  // Check if any filter is active
  const hasActiveFilters = selectedCity !== 'all' || debouncedSearch !== ''

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
      estradiol: estradiol || undefined,
      lh: lh || undefined,
      prolactin: prolactin || undefined,
      fsh: fsh || undefined,
      dht: dht || undefined,
      cortisol: cortisol || undefined
    }

    const result = interpretResults(input)
    setInterpretation(result)
  }, [age, totalT, freeT, shbg, estradiol, lh, prolactin, fsh, dht, cortisol])

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

  // Handle delete click - show confirmation
  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirmId(id)
  }, [])

  // Handle confirmed delete
  const handleConfirmedDelete = useCallback(async () => {
    if (!deleteConfirmId) return

    // Prevent multiple simultaneous deletes (race condition protection)
    if (isDeleting) return

    setIsDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('lab_results_app')
        .delete()
        .eq('id', deleteConfirmId)

      if (error) {
        showToast('Грешка при изтриване', 'error')
        return
      }

      // Remove from local state
      const updatedResults = results.filter(r => r.id !== deleteConfirmId)
      setResults(updatedResults)
      showToast('Резултатът е изтрит')
      setDeleteConfirmId(null) // Close modal
    } catch (error) {
      console.error('Delete error:', error)
      showToast('Грешка при изтриване', 'error')
    } finally {
      setIsDeleting(false)
    }
  }, [deleteConfirmId, results, isDeleting, showToast])

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-4 right-4 left-4 sm:left-auto z-50">
            <div className={`px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="font-medium text-sm">{toast.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-700 hover:text-gray-900 mb-3 flex items-center gap-1.5 transition-all font-medium hover:gap-2 min-h-[40px] -ml-2 pl-2 pr-3 rounded-lg hover:bg-gray-100"
            aria-label="Назад към Dashboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Назад към Dashboard</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Lab Testing Guide</h1>
              <p className="text-xs text-gray-600">Справочник, интерпретатор и проследяване</p>
            </div>
          </div>
        </div>

        {/* Tabs - Compact */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
          <div className="grid grid-cols-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-2 sm:px-4 py-2.5 sm:py-3 font-medium text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all min-h-[44px] ${
                activeTab === 'directory'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
              aria-label="Справочник"
              aria-current={activeTab === 'directory' ? 'page' : undefined}
            >
              <span className="hidden sm:inline">Справочник</span>
              <span className="sm:hidden">Справ.</span>
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-2 sm:px-4 py-2.5 sm:py-3 font-medium text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all min-h-[44px] ${
                activeTab === 'instructions'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
              aria-label="Инструкции"
              aria-current={activeTab === 'instructions' ? 'page' : undefined}
            >
              <span className="hidden sm:inline">Инструкции</span>
              <span className="sm:hidden">Инстр.</span>
            </button>
            <button
              onClick={() => setActiveTab('interpreter')}
              className={`px-2 sm:px-4 py-2.5 sm:py-3 font-medium text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all min-h-[44px] ${
                activeTab === 'interpreter'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
              aria-label="Интерпретатор"
              aria-current={activeTab === 'interpreter' ? 'page' : undefined}
            >
              <span className="hidden sm:inline">Интерпретатор</span>
              <span className="sm:hidden">Интерпр.</span>
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-2 sm:px-4 py-2.5 sm:py-3 font-medium text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all min-h-[44px] ${
                activeTab === 'tracker'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
              aria-label="Проследяване"
              aria-current={activeTab === 'tracker' ? 'page' : undefined}
            >
              <span className="hidden sm:inline">Проследяване</span>
              <span className="sm:hidden">Просл.</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-4">
            {/* Directory Tab */}
            {activeTab === 'directory' && (
              <div className="space-y-3">
                {/* Data Disclaimer */}
                <DataDisclaimer />

                {/* Compact Info Banner */}
                {!bannerDismissed && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center justify-between text-blue-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <p className="text-xs font-medium">217+ лаборатории • 4.3⭐ рейтинг</p>
                    </div>
                    <button
                      onClick={() => setBannerDismissed(true)}
                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                      aria-label="Затвори"
                    >
                      <X className="w-3 h-3 text-blue-600" />
                    </button>
                  </div>
                )}

                {/* Compact Filters */}
                <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                  {/* Search */}
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <input
                      id="search-input"
                      type="search"
                      inputMode="search"
                      enterKeyHint="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Търси..."
                      className="w-full pl-8 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all focus-visible:outline-none text-black font-medium placeholder:text-gray-400"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded transition-colors"
                        aria-label="Изчисти"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    )}
                  </div>

                  {/* Filters Row */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* City Filter */}
                    <div className="relative">
                      <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                      <select
                        id="city-filter"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full pl-7 pr-6 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:border-gray-300 appearance-none cursor-pointer text-black"
                        disabled={isLoadingLabs}
                      >
                        <option value="all">
                          {isLoadingLabs ? 'Зареждане...' : `Всички (${labs.length})`}
                        </option>
                        {(cities.length > 0 ? cities : CITIES.map(c => ({ city: c, count: labs.filter(l => l.city === c).length }))).map(({ city, count }) => (
                          <option key={city} value={city}>
                            {city} ({count})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Sort Filter */}
                    <div className="relative">
                      <Star className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'rating' | 'name' | 'reviews' | 'distance')}
                        className="w-full pl-7 pr-6 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:border-gray-300 appearance-none cursor-pointer text-black"
                      >
                        <option value="rating">Рейтинг</option>
                        <option value="name">Име</option>
                        <option value="reviews">Отзиви</option>
                        <option value="distance">Разстояние</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Active Filters + Results Count */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Results count */}
                    {filteredLabs.length === 0 ? (
                      <span className="text-sm text-red-600 font-medium">
                        Няма намерени лаборатории
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600">
                        Показани: <span className="font-bold text-blue-600">{filteredLabs.length}</span> {filteredLabs.length !== labs.length && <span className="text-gray-400">от {labs.length}</span>}
                      </span>
                    )}

                    {/* Last updated badge */}
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Обновено: {new Date(LAST_UPDATED).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>

                    {/* Active filter chips */}
                    {selectedCity !== 'all' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedCity}
                      </span>
                    )}
                    {debouncedSearch && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                        <Search className="w-3.5 h-3.5" />
                        "{debouncedSearch}"
                      </span>
                    )}
                  </div>

                  {/* Clear all filters button */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                    >
                      Изчисти филтри
                    </button>
                  )}
                </div>

                {/* Labs Grid */}
                {isLoadingLabs ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                          </div>
                          <div className="h-6 w-16 bg-gray-100 rounded"></div>
                        </div>
                        <div className="h-8 bg-gray-100 rounded mb-3"></div>
                        <div className="space-y-2 mb-3">
                          <div className="h-4 bg-gray-100 rounded w-full"></div>
                          <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                          <div className="h-10 bg-gray-200 rounded mb-2"></div>
                          <div className="flex gap-2">
                            <div className="h-9 bg-gray-100 rounded flex-1"></div>
                            <div className="h-9 bg-gray-100 rounded flex-1"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredLabs.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 px-4">
                    <div className="max-w-sm mx-auto">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <Search className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Няма намерени лаборатории
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Опитайте с други критерии за търсене или изчистете филтрите
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                        >
                          <X className="w-4 h-4" />
                          Изчисти всички филтри
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                    {filteredLabs.map((lab, index) => (
                    <div
                      key={index}
                      className="group bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-gray-900 leading-tight mb-0.5">
                            {lab.name}
                          </h3>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs text-gray-500">{lab.city}</span>
                            {sortBy === 'distance' && userLocation && lab.latitude && lab.longitude && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs font-semibold text-blue-600">
                                  {calculateDistance(
                                    userLocation.lat,
                                    userLocation.lon,
                                    lab.latitude,
                                    lab.longitude
                                  ).toFixed(1)} км
                                </span>
                              </>
                            )}
                            {lab.chain && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                {lab.chain}
                              </span>
                            )}
                          </div>
                        </div>
                        {lab.no_appointment && (
                          <span className="ml-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            Без час
                          </span>
                        )}
                      </div>

                      {/* Google Rating */}
                      {lab.google_rating && (
                        <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100">
                          <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-gray-900 text-xs">{lab.google_rating.toFixed(1)}</span>
                          </div>
                          {lab.total_reviews && (
                            <span className="text-xs text-gray-500">
                              ({lab.total_reviews})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-1.5 mb-2 text-xs">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 leading-relaxed">{lab.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <a href={`tel:${lab.phone}`} className="text-blue-600 hover:text-blue-700 font-medium">
                            {lab.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">{lab.hours}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-2 pt-2 border-t border-gray-100 flex gap-1.5">
                        {/* Primary Action - Google Maps */}
                        {lab.google_maps_url && (
                          <a
                            href={lab.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Карта</span>
                          </a>
                        )}

                        {/* Secondary Actions */}
                        <a
                          href={`tel:${lab.phone}`}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Обади се</span>
                        </a>
                        {lab.website && (
                          <a
                            href={lab.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Сайт</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            )}

            {/* Instructions Tab */}
            {activeTab === 'instructions' && (
              <div className="space-y-5 max-w-4xl">
                {/* What to Order */}
                <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-900 leading-tight mt-1">Какво да поръчам?</h3>
                  </div>
                  <div className="grid gap-2.5">
                    <div className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-900"><strong>Total Testosterone</strong> (общ тестостерон) - ЗАДЪЛЖИТЕЛНО</span>
                    </div>
                    <div className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-900"><strong>Free Testosterone</strong> (свободен тестостерон) - Препоръчително</span>
                    </div>
                    <div className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-900"><strong>SHBG</strong> (глобулин свързващ половите хормони) - Препоръчително</span>
                    </div>
                    <div className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-900"><strong>Estradiol</strong> (естрадиол) - Опционално</span>
                    </div>
                    <div className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-900"><strong>LH</strong> (лутеинизиращ хормон) - Опционално</span>
                    </div>
                  </div>
                </div>

                {/* When to Go */}
                <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-900 leading-tight mt-1">Кога да отида?</h3>
                  </div>
                  <div className="grid gap-2.5">
                    <div className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                      <Clock className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-emerald-900"><strong>Сутрин между 7:00-9:00</strong> - Пиковите нива са сутрин</span>
                    </div>
                    <div className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                      <Clock className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-emerald-900"><strong>На гладно</strong> - 8-12 часа без храна (вода е позволена)</span>
                    </div>
                    <div className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                      <Clock className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-emerald-900"><strong>След добър сън</strong> - Минимум 7 часа сън предната нощ</span>
                    </div>
                  </div>
                </div>

                {/* How to Prepare */}
                <div className="group bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-amber-900 leading-tight mt-1">Как да се подготвя?</h3>
                  </div>
                  <div className="grid gap-2.5">
                    <div className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                      <X className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-amber-900">Без тежка тренировка 48 часа преди теста</span>
                    </div>
                    <div className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                      <X className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-amber-900">Без алкохол 72 часа преди теста</span>
                    </div>
                    <div className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                      <X className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-amber-900">Без стрес и сериозен физически товар предния ден</span>
                    </div>
                    <div className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                      <X className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-amber-900">Спри всички добавки 24 часа преди (освен ако лекарят не каже друго)</span>
                    </div>
                  </div>
                </div>

                {/* Smart Navigation - Ready to find lab */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">
                        Готов си за теста?
                      </h3>
                      <p className="text-blue-100 mb-4">
                        Сега можеш да намериш най-близката лаборатория и да запишеш час
                      </p>
                      <button
                        onClick={() => setActiveTab('directory')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-blue-700 font-semibold rounded-xl transition-all shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        <MapPin className="w-5 h-5" />
                        Намери лаборатория близо до мен
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Interpreter Tab */}
            {activeTab === 'interpreter' && (
              <div className="space-y-3 max-w-4xl">
                {/* Info Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-sm text-blue-900 mb-1">За какво служи интерпретаторът?</h3>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        Въведи резултатите от лабораторията и получи незабавна оценка дали нивата ти са оптимални, субоптимални или ниски. Инструментът отчита възрастта и дава персонализирани препоръки за действие.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleInterpret} className="bg-white rounded-lg p-3 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-blue-600" />
                    Въведи резултатите си
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Възраст *
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        required
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        min={18}
                        max={100}
                        className="w-full px-3 py-2 text-sm min-h-[40px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Total Testosterone (ng/dL) *
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        required
                        value={totalT}
                        onChange={(e) => setTotalT(e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        step={0.1}
                        className={`w-full px-3 py-2 text-sm min-h-[40px] border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium ${
                          totalT && (totalT < 100 || totalT > 2000)
                            ? 'border-amber-300 focus:border-amber-500'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                      />
                      {totalT && totalT > 0 && (
                        <p className={`text-xs mt-1.5 flex items-center gap-1 ${
                          totalT < 100 || totalT > 2000
                            ? 'text-amber-600'
                            : totalT >= 300 && totalT <= 1000
                            ? 'text-emerald-600'
                            : 'text-gray-500'
                        }`}>
                          {totalT < 100 ? (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              Нетипично ниска стойност - провери отново
                            </>
                          ) : totalT > 2000 ? (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              Нетипично висока стойност - провери отново
                            </>
                          ) : totalT >= 300 && totalT <= 1000 ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              В типичния range (300-1000 ng/dL)
                            </>
                          ) : (
                            'Типичен range: 300-1000 ng/dL'
                          )}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Free Testosterone (pg/mL)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={freeT}
                        onChange={(e) => setFreeT(e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        step={0.1}
                        className="w-full px-3 py-2 text-sm min-h-[40px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        SHBG (nmol/L)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={shbg}
                        onChange={(e) => setShbg(e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        step={0.1}
                        className="w-full px-3 py-2 text-sm min-h-[40px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Estradiol (pg/mL)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={estradiol}
                        onChange={(e) => setEstradiol(e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        step={0.1}
                        className="w-full px-3 py-2 text-sm min-h-[40px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        LH (mIU/mL)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={lh}
                        onChange={(e) => setLh(e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        step={0.1}
                        className="w-full px-3 py-2 text-sm min-h-[40px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Prolactin (ng/mL)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={prolactin}
                        onChange={(e) => setProlactin(e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        step={0.1}
                        className="w-full px-3 py-2 text-sm min-h-[40px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        FSH (mIU/mL)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={fsh}
                        onChange={(e) => setFsh(e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        step={0.1}
                        className="w-full px-3 py-2 text-sm min-h-[40px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        DHT (pg/mL)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={dht}
                        onChange={(e) => setDht(e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        step={0.1}
                        className="w-full px-3 py-2 text-sm min-h-[40px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Cortisol (µg/dL)
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={cortisol}
                        onChange={(e) => setCortisol(e.target.value ? Number(e.target.value) : '')}
                        min={0}
                        step={0.1}
                        className="w-full px-3 py-2 text-sm min-h-[40px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Анализирай резултати
                  </button>
                </form>

                {interpretation && (
                  <div className={`border-2 rounded-xl p-5 shadow-lg ${getStatusColor(interpretation.status)}`}>
                    {/* Status Header with Lucide Icons */}
                    <div className="flex items-start gap-3 mb-5 pb-4 border-b-2">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                        interpretation.status === 'optimal'
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                          : interpretation.status === 'suboptimal'
                          ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                          : 'bg-gradient-to-br from-red-500 to-red-600'
                      }`}>
                        {interpretation.status === 'optimal' ? (
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        ) : interpretation.status === 'suboptimal' ? (
                          <AlertCircle className="w-8 h-8 text-white" />
                        ) : (
                          <X className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{interpretation.statusLabel}</h3>
                        <p className="text-sm opacity-75 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          Възрастова група: {interpretation.ageRange} години
                        </p>
                      </div>
                    </div>

                    {/* Results with Visual Indicators */}
                    <div className="space-y-4 mb-5">
                      <div className="bg-white/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">Total Testosterone</span>
                          <span className="text-sm text-gray-600">{interpretation.totalTStatus}</span>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          Оптимално: {interpretation.optimalRange[0]}-{interpretation.optimalRange[1]} ng/dL
                        </div>
                        {/* Progress bar showing position in range */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              interpretation.status === 'optimal' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                              interpretation.status === 'suboptimal' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                              'bg-gradient-to-r from-red-500 to-red-600'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(0, ((totalT as number) / interpretation.optimalRange[1]) * 100))}%`
                            }}
                          />
                        </div>
                      </div>

                      {interpretation.freeTStatus && (
                        <div className="bg-white/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">Free Testosterone</span>
                            <span className="text-sm text-gray-600">{interpretation.freeTStatus}</span>
                          </div>
                        </div>
                      )}
                      {interpretation.shbgStatus && (
                        <div className="bg-white/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">SHBG</span>
                            <span className="text-sm text-gray-600">{interpretation.shbgStatus}</span>
                          </div>
                        </div>
                      )}
                      {interpretation.estradiolStatus && (
                        <div className="bg-white/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">Estradiol</span>
                            <span className="text-sm text-gray-600">{interpretation.estradiolStatus}</span>
                          </div>
                        </div>
                      )}
                      {interpretation.lhStatus && (
                        <div className="bg-white/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">LH</span>
                            <span className="text-sm text-gray-600">{interpretation.lhStatus}</span>
                          </div>
                        </div>
                      )}
                      {interpretation.prolactinStatus && (
                        <div className="bg-white/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">Prolactin</span>
                            <span className="text-sm text-gray-600">{interpretation.prolactinStatus}</span>
                          </div>
                        </div>
                      )}
                      {interpretation.fshStatus && (
                        <div className="bg-white/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">FSH</span>
                            <span className="text-sm text-gray-600">{interpretation.fshStatus}</span>
                          </div>
                        </div>
                      )}
                      {interpretation.dhtStatus && (
                        <div className="bg-white/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">DHT</span>
                            <span className="text-sm text-gray-600">{interpretation.dhtStatus}</span>
                          </div>
                        </div>
                      )}
                      {interpretation.cortisolStatus && (
                        <div className="bg-white/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">Cortisol</span>
                            <span className="text-sm text-gray-600">{interpretation.cortisolStatus}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white/50 rounded-lg p-4 mb-4">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        Препоръки
                      </h4>
                      <ul className="space-y-2">
                        {interpretation.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Smart Navigation - Save to Tracker */}
                    <button
                      onClick={() => {
                        setNewResult({
                          test_date: new Date().toISOString().split('T')[0],
                          total_t: totalT as number,
                          free_t: freeT || undefined,
                          shbg: shbg || undefined,
                          estradiol: estradiol || undefined,
                          lh: lh || undefined,
                          prolactin: prolactin || undefined,
                          fsh: fsh || undefined,
                          dht: dht || undefined,
                          cortisol: cortisol || undefined,
                          notes: ''
                        })
                        setActiveTab('tracker')
                        setShowAddForm(true)
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Запази резултата в Проследяване
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tracker Tab */}
            {activeTab === 'tracker' && (
              <div className="space-y-5 max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    Твоите резултати ({results.length})
                  </h3>
                  <div className="flex gap-2">
                    {results.length > 0 && (
                      <button
                        onClick={handleExportCSV}
                        className="px-4 py-3 min-h-[48px] border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                      >
                        Експорт CSV
                      </button>
                    )}
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="px-4 py-3 min-h-[48px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      {showAddForm ? 'Откажи' : '+ Добави резултат'}
                    </button>
                  </div>
                </div>

                {/* Add Form - Modernized */}
                {showAddForm && (
                  <form onSubmit={handleAddResult} className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-5 border-2 border-gray-200 hover:border-blue-300 transition-all">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      Нов резултат
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Дата *</label>
                        <input
                          type="date"
                          required
                          value={newResult.test_date}
                          onChange={(e) => setNewResult({ ...newResult, test_date: e.target.value })}
                          className="w-full px-4 py-3.5 text-base min-h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Total T (ng/dL) *</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          required
                          value={newResult.total_t}
                          onChange={(e) => setNewResult({ ...newResult, total_t: Number(e.target.value) })}
                          min={0}
                          step={0.1}
                          className="w-full px-4 py-3.5 text-base min-h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Free T (pg/mL)</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={newResult.free_t || ''}
                          onChange={(e) => setNewResult({ ...newResult, free_t: e.target.value ? Number(e.target.value) : undefined })}
                          min={0}
                          step={0.1}
                          className="w-full px-4 py-3.5 text-base min-h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">SHBG (nmol/L)</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={newResult.shbg || ''}
                          onChange={(e) => setNewResult({ ...newResult, shbg: e.target.value ? Number(e.target.value) : undefined })}
                          min={0}
                          step={0.1}
                          className="w-full px-4 py-3.5 text-base min-h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Estradiol (pg/mL)</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={newResult.estradiol || ''}
                          onChange={(e) => setNewResult({ ...newResult, estradiol: e.target.value ? Number(e.target.value) : undefined })}
                          min={0}
                          step={0.1}
                          className="w-full px-4 py-3.5 text-base min-h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">LH (mIU/mL)</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={newResult.lh || ''}
                          onChange={(e) => setNewResult({ ...newResult, lh: e.target.value ? Number(e.target.value) : undefined })}
                          min={0}
                          step={0.1}
                          className="w-full px-4 py-3.5 text-base min-h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Prolactin (ng/mL)</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={newResult.prolactin || ''}
                          onChange={(e) => setNewResult({ ...newResult, prolactin: e.target.value ? Number(e.target.value) : undefined })}
                          min={0}
                          step={0.1}
                          className="w-full px-4 py-3.5 text-base min-h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">FSH (mIU/mL)</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={newResult.fsh || ''}
                          onChange={(e) => setNewResult({ ...newResult, fsh: e.target.value ? Number(e.target.value) : undefined })}
                          min={0}
                          step={0.1}
                          className="w-full px-4 py-3.5 text-base min-h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">DHT (pg/mL)</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={newResult.dht || ''}
                          onChange={(e) => setNewResult({ ...newResult, dht: e.target.value ? Number(e.target.value) : undefined })}
                          min={0}
                          step={0.1}
                          className="w-full px-4 py-3.5 text-base min-h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cortisol (µg/dL)</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={newResult.cortisol || ''}
                          onChange={(e) => setNewResult({ ...newResult, cortisol: e.target.value ? Number(e.target.value) : undefined })}
                          min={0}
                          step={0.1}
                          className="w-full px-4 py-3.5 text-base min-h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all focus-visible:outline-none text-black font-medium"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Бележки</label>
                        <textarea
                          value={newResult.notes}
                          onChange={(e) => setNewResult({ ...newResult, notes: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all resize-none focus-visible:outline-none text-black font-medium placeholder:text-gray-400"
                          placeholder="Напр.: След 3 месеца програма, добавих Витамин D3..."
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`w-full font-semibold py-3.5 min-h-[48px] rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
                        isSaving
                          ? 'bg-blue-400 cursor-not-allowed text-white'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      {isSaving ? 'Запазване...' : 'Запази'}
                    </button>
                  </form>
                )}

                {/* Improvement Stats - Modernized */}
                {improvement && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all">
                    <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Твоят прогрес
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                        <div className="text-xs font-semibold text-emerald-700 mb-1">Първи тест</div>
                        <div className="text-2xl font-bold text-emerald-900">{improvement.first}</div>
                        <div className="text-xs text-emerald-600">ng/dL</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                        <div className="text-xs font-semibold text-emerald-700 mb-1">Последен тест</div>
                        <div className="text-2xl font-bold text-emerald-900">{improvement.last}</div>
                        <div className="text-xs text-emerald-600">ng/dL</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                        <div className="text-xs font-semibold text-emerald-700 mb-1">Промяна</div>
                        <div className={`text-2xl font-bold ${improvement.change >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                          {improvement.change >= 0 ? '+' : ''}{improvement.change.toFixed(1)}
                        </div>
                        <div className="text-xs text-emerald-600">ng/dL</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-3 hover:bg-white transition-colors">
                        <div className="text-xs font-semibold text-emerald-700 mb-1">Процент</div>
                        <div className={`text-2xl font-bold ${improvement.changePercent >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                          {improvement.changePercent >= 0 ? '+' : ''}{improvement.changePercent.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Visualization - NEW */}
                {results.length > 0 && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-blue-600" />
                      Прогрес на нивата
                    </h4>
                    <div className="space-y-3">
                      {results.slice(0, 5).reverse().map((result, index) => {
                        const maxValue = Math.max(...results.map(r => r.total_t))
                        const widthPercent = (result.total_t / maxValue) * 100
                        return (
                          <div key={result.id} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-gray-700">
                                {formatDate(result.test_date)}
                              </span>
                              <span className="font-bold text-blue-600">
                                {result.total_t} ng/dL
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                style={{ width: `${widthPercent}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {results.length > 5 && (
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Показани са последните 5 теста
                      </p>
                    )}
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
                    <div className="text-center py-8 px-4">
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-blue-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-blue-600" />
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Няма записани резултати
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Започни да проследяваш резултатите си за по-добър прогрес
                        </p>

                        {/* Smart Navigation Buttons */}
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setActiveTab('directory')}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                          >
                            <MapPin className="w-4 h-4" />
                            Намери лаборатория
                          </button>
                          <button
                            onClick={() => setActiveTab('interpreter')}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:outline-none"
                          >
                            Интерпретатор
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    results.map((result) => (
                      <div key={result.id} className="group bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                              <Clock className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-sm">{formatDate(result.test_date)}</div>
                              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{result.total_t} ng/dL</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteClick(result.id!)}
                            className="text-gray-400 hover:text-red-600 p-2 transition-colors rounded-lg hover:bg-red-50"
                            aria-label="Изтрий резултат"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          {result.free_t && (
                            <div className="bg-gray-50 rounded-lg p-2 hover:bg-blue-50 transition-colors">
                              <div className="text-xs text-gray-600 font-medium mb-0.5">Free T</div>
                              <div className="font-bold text-gray-900">{result.free_t} pg/mL</div>
                            </div>
                          )}
                          {result.shbg && (
                            <div className="bg-gray-50 rounded-lg p-2 hover:bg-blue-50 transition-colors">
                              <div className="text-xs text-gray-600 font-medium mb-0.5">SHBG</div>
                              <div className="font-bold text-gray-900">{result.shbg} nmol/L</div>
                            </div>
                          )}
                          {result.estradiol && (
                            <div className="bg-gray-50 rounded-lg p-2 hover:bg-blue-50 transition-colors">
                              <div className="text-xs text-gray-600 font-medium mb-0.5">Estradiol</div>
                              <div className="font-bold text-gray-900">{result.estradiol} pg/mL</div>
                            </div>
                          )}
                          {result.lh && (
                            <div className="bg-gray-50 rounded-lg p-2 hover:bg-blue-50 transition-colors">
                              <div className="text-xs text-gray-600 font-medium mb-0.5">LH</div>
                              <div className="font-bold text-gray-900">{result.lh} mIU/mL</div>
                            </div>
                          )}
                        </div>
                        {result.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-700 bg-blue-50/50 -mx-5 -mb-5 px-5 pb-5 mt-3 rounded-b-xl">
                            <strong className="text-blue-900">Бележки:</strong> {result.notes}
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

        {/* Delete Confirmation Modal - Glassmorphism */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-200 animate-in fade-in">
            <div
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-200 scale-100 animate-in zoom-in-95"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-orange-50/50 rounded-3xl pointer-events-none" />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-red-500/40">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                {/* Title */}
                <h3 id="delete-modal-title" className="text-2xl font-bold text-gray-900 text-center mb-3">
                  Сигурен ли си?
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-center mb-8 text-base">
                  Това действие е необратимо. Резултатът ще бъде изтрит завинаги.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all active:scale-95 shadow-sm"
                    disabled={isDeleting}
                  >
                    Откажи
                  </button>
                  <button
                    onClick={handleConfirmedDelete}
                    disabled={isDeleting}
                    className={`flex-1 px-5 py-3.5 font-bold rounded-xl transition-all active:scale-95 shadow-lg ${
                      isDeleting
                        ? 'bg-red-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-500/40'
                    }`}
                  >
                    {isDeleting ? 'Изтриване...' : 'Изтрий'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
