'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { EXERCISES } from '@/lib/data/exercises-database'
import type { Exercise } from '@/lib/types/exercise-guide'
import {
  generateWorkoutProgram,
  type UserAssessment,
  type FitnessLevel,
  type FitnessGoal,
  type Equipment,
  type WorkoutDay,
  type Week
} from '@/lib/utils/exercise-program-generator'
import {
  saveWorkoutProgram,
  getActiveWorkoutProgram,
  getFavoriteExercises,
  addFavoriteExercise,
  removeFavoriteExercise,
  logExercise,
  getWorkoutStats,
  getExerciseProgress,
  getProgramCompliance,
  getProgressiveOverload,
  getPersonalRecords,
  getTrainingVolume,
  type ProgramCompliance,
  type ProgressiveOverloadData,
  type PersonalRecord,
  type TrainingVolume
} from '@/lib/supabase/exercise-guide'
import type { ExerciseProgress } from '@/lib/types/exercise-guide'
import { Heart, Dumbbell, TrendingUp, ChevronLeft, X, Check, Star, Calendar, Plus, Target, Zap, Activity } from 'lucide-react'
import Image from 'next/image'

type Tab = 'program' | 'log' | 'stats'

export default function ExerciseGuideClient() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('program')
  const [isLoading, setIsLoading] = useState(true)

  // Setup form state
  const [showSetup, setShowSetup] = useState(false)
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('intermediate')
  const [goal, setGoal] = useState<FitnessGoal>('muscle')
  const [daysPerWeek, setDaysPerWeek] = useState(3)
  const [equipment, setEquipment] = useState<Equipment>('full-gym')

  // Program state
  const [weeks, setWeeks] = useState<Week[]>([])
  const [selectedWeek, setSelectedWeek] = useState(0) // Index of active week (0-3)
  const [selectedDay, setSelectedDay] = useState(0) // Index of active day (0-6)
  const [programName, setProgramName] = useState('')
  const [programDescription, setProgramDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Favorites state
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  // Selected exercise for details
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([])
  const [loadingProgress, setLoadingProgress] = useState(false)

  // Logging state
  const [showLogModal, setShowLogModal] = useState(false)
  const [exerciseToLog, setExerciseToLog] = useState<Exercise | null>(null)
  const [logData, setLogData] = useState({
    sets: '',
    reps: '',
    weight: '',
    notes: ''
  })

  // Stats
  const [workoutStats, setWorkoutStats] = useState<any>(null)
  const [compliance, setCompliance] = useState<ProgramCompliance | null>(null)
  const [overloadData, setOverloadData] = useState<ProgressiveOverloadData[]>([])
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  const [trainingVolume, setTrainingVolume] = useState<TrainingVolume | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }, [])

  // Auto-hide toast after 3 seconds (with cleanup to prevent memory leaks)
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  // Memoized calculations for performance (prevents re-calculation on every render)
  const totalExercises = useMemo(() => {
    return weeks.flatMap(w => w.days.filter(d => !d.isRestDay)).flatMap(d => d.exercises).length
  }, [weeks])

  const allExerciseIds = useMemo(() => {
    return weeks.flatMap(week =>
      week.days
        .filter(day => !day.isRestDay)
        .flatMap(day => day.exercises.map(ex => ex.id.toString()))
    )
  }, [weeks])

  const currentDayExercises = useMemo(() => {
    return weeks[selectedWeek]?.days[selectedDay]?.exercises || []
  }, [weeks, selectedWeek, selectedDay])

  const isRestDay = useMemo(() => {
    return weeks[selectedWeek]?.days[selectedDay]?.isRestDay || false
  }, [weeks, selectedWeek, selectedDay])

  // Get current user
  useEffect(() => {
    const initUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        await loadUserData(user.id)
      }
      setIsLoading(false)
    }
    initUser()
  }, [])

  // Load analytics when stats tab is activated
  useEffect(() => {
    if (activeTab === 'stats' && userId && weeks.length > 0) {
      loadAnalytics()
    }
  }, [activeTab, userId, weeks])

  // Load user data
  const loadUserData = async (uid: string) => {
    // Load active program
    const program = await getActiveWorkoutProgram(uid)
    if (program && program.exercises_data) {
      const data = program.exercises_data as any

      // Check if it's new format (weeks with weekNumber)
      if (Array.isArray(data) && data[0]?.weekNumber !== undefined) {
        // New format - Week[]
        setWeeks(data as Week[])
      } else if (Array.isArray(data) && data[0]?.dayNumber !== undefined) {
        // Old WorkoutDay[] format - convert to Week
        const oldSchedule = data as WorkoutDay[]
        setWeeks([{
          weekNumber: 1,
          days: oldSchedule
        }])
      } else {
        // Very old flat exercises format - convert to single week, single day
        setWeeks([{
          weekNumber: 1,
          days: [{
            dayNumber: 1,
            dayName: 'Понеделник',
            isRestDay: false,
            focus: 'Цяло тяло',
            exercises: data as Exercise[]
          }]
        }])
      }

      setProgramName(program.program_name)
      setProgramDescription(program.description || '')
      setShowSetup(false)
    } else {
      // Няма програма - покажи setup формата
      setShowSetup(true)
    }

    // Load favorites
    const favs = await getFavoriteExercises(uid)
    setFavorites(new Set(favs.map(f => parseInt(f.exercise_id))))

    // Load stats
    const stats = await getWorkoutStats(uid)
    setWorkoutStats(stats)
  }

  // Load analytics data (wrapped in useCallback for performance)
  const loadAnalytics = useCallback(async () => {
    if (!userId || allExerciseIds.length === 0) return

    setLoadingAnalytics(true)

    // Load all analytics in parallel
    const [complianceData, overload, prs, volume] = await Promise.all([
      getProgramCompliance(userId, allExerciseIds),
      getProgressiveOverload(userId),
      getPersonalRecords(userId),
      getTrainingVolume(userId)
    ])

    setCompliance(complianceData)
    setOverloadData(overload)
    setPersonalRecords(prs)
    setTrainingVolume(volume)
    setLoadingAnalytics(false)
  }, [userId, allExerciseIds])

  // Generate program from assessment
  const handleGenerateProgram = async () => {
    if (!userId) return

    const assessment: UserAssessment = {
      fitnessLevel,
      goal,
      daysPerWeek,
      equipment
    }

    const generatedProgram = generateWorkoutProgram(assessment)

    setWeeks(generatedProgram.weeks)
    setSelectedWeek(0) // Reset to first week
    setSelectedDay(0) // Reset to first day
    setProgramName(generatedProgram.programName)
    setProgramDescription(generatedProgram.description)
    setShowSetup(false)

    // Get all exercise IDs from all weeks (excluding REST days)
    const allExerciseIds = generatedProgram.weeks.flatMap(week =>
      week.days
        .filter(day => !day.isRestDay)
        .flatMap(day => day.exercises.map(ex => ex.id.toString()))
    )

    // Автоматично запазване на програмата
    const result = await saveWorkoutProgram({
      user_id: userId,
      program_name: generatedProgram.programName,
      description: generatedProgram.description,
      selected_exercises: allExerciseIds,
      exercises_data: generatedProgram.weeks, // Save the 4-week structure
      is_active: true
    })

    if (result) {
      showToast('Програмата е създадена и запазена!')
    } else {
      showToast('Грешка при запазване на програмата', 'error')
    }
  }

  // Save workout program (wrapped in useCallback for performance, with race condition protection)
  const handleSaveProgram = useCallback(async () => {
    if (!userId) return
    if (weeks.length === 0) {
      showToast('Няма избрани упражнения', 'error')
      return
    }

    // Prevent multiple simultaneous saves (race condition protection)
    if (isSaving) return

    setIsSaving(true)

    try {
      const result = await saveWorkoutProgram({
        user_id: userId,
        program_name: programName,
        description: programDescription,
        selected_exercises: allExerciseIds,
        exercises_data: weeks,
        is_active: true
      })

      if (result) {
        showToast('Програмата е запазена успешно!')
      } else {
        showToast('Грешка при запазване', 'error')
      }
    } catch (error) {
      console.error('Save error:', error)
      showToast('Грешка при запазване', 'error')
    } finally {
      setIsSaving(false)
    }
  }, [userId, weeks, programName, programDescription, allExerciseIds, isSaving, showToast])

  // Toggle favorite
  const toggleFavorite = async (exercise: Exercise) => {
    if (!userId) return

    const isFav = favorites.has(exercise.id)

    if (isFav) {
      const success = await removeFavoriteExercise(userId, exercise.id.toString())
      if (success) {
        setFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(exercise.id)
          return newSet
        })
        showToast('Премахнато от любими')
      }
    } else {
      const result = await addFavoriteExercise(userId, exercise.id.toString(), exercise.name)
      if (result) {
        setFavorites(prev => new Set([...prev, exercise.id]))
        showToast('Добавено в любими')
      }
    }
  }

  // Load exercise progress
  const loadExerciseProgress = async (exercise: Exercise) => {
    if (!userId) return

    setLoadingProgress(true)
    const progress = await getExerciseProgress(userId, exercise.id.toString(), 5)
    setExerciseProgress(progress)
    setLoadingProgress(false)
  }

  // Open exercise details and load progress
  const handleOpenExerciseDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    loadExerciseProgress(exercise)
  }

  // Log exercise
  const handleLogExercise = async () => {
    if (!userId || !exerciseToLog) return

    const result = await logExercise({
      user_id: userId,
      workout_date: new Date().toISOString().split('T')[0],
      exercise_id: exerciseToLog.id.toString(),
      exercise_name: exerciseToLog.name,
      sets_completed: logData.sets ? parseInt(logData.sets) : undefined,
      reps_completed: logData.reps ? parseInt(logData.reps) : undefined,
      weight_used: logData.weight ? parseFloat(logData.weight) : undefined,
      notes: logData.notes || undefined
    })

    if (result) {
      showToast('Тренировката е записана!')
      setShowLogModal(false)
      setExerciseToLog(null)
      setLogData({ sets: '', reps: '', weight: '', notes: '' })

      // Reload stats
      if (userId) {
        const stats = await getWorkoutStats(userId)
        setWorkoutStats(stats)

        // Reload analytics if on stats tab
        if (activeTab === 'stats') {
          loadAnalytics()
        }

        // Reload progress if same exercise is open in details
        if (selectedExercise && selectedExercise.id === exerciseToLog.id) {
          loadExerciseProgress(selectedExercise)
        }
      }
    } else {
      showToast('Грешка при записване', 'error')
    }
  }

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Зареждане...</p>
        </div>
      </div>
    )
  }

  // SETUP FORM
  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-700 hover:text-gray-900 flex items-center gap-2 mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Назад към Dashboard</span>
          </button>

          <div className="bg-white rounded-2xl shadow-xl border border-orange-200 overflow-hidden">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Dumbbell className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Твоят Личен Треньор</h1>
                  <p className="text-orange-100 mt-1">Създаваме персонализирана програма за теб</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-8 space-y-8">
              {/* Fitness Level */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  Какво е твоето ниво на подготовка?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'beginner' as FitnessLevel, label: 'Начинаещ', desc: 'Първи стъпки във фитнеса', icon: Target },
                    { value: 'intermediate' as FitnessLevel, label: 'Среден', desc: '6-12 месеца опит', icon: Activity },
                    { value: 'advanced' as FitnessLevel, label: 'Напреднал', desc: 'Над 1 година опит', icon: Zap }
                  ].map(level => (
                    <button
                      key={level.value}
                      onClick={() => setFitnessLevel(level.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        fitnessLevel === level.value
                          ? 'border-orange-500 bg-orange-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <level.icon className={`w-8 h-8 mb-3 ${fitnessLevel === level.value ? 'text-orange-600' : 'text-gray-400'}`} />
                      <div className="font-semibold text-gray-900">{level.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  Каква е твоята цел?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { value: 'strength' as FitnessGoal, label: 'Сила', desc: 'Максимална мощ' },
                    { value: 'muscle' as FitnessGoal, label: 'Мускулна маса', desc: 'Растеж и обем' },
                    { value: 'fat-loss' as FitnessGoal, label: 'Отслабване', desc: 'Горене на мазнини' },
                    { value: 'athletic' as FitnessGoal, label: 'Атлетизъм', desc: 'Експлозивност' },
                    { value: 'general' as FitnessGoal, label: 'Обща форма', desc: 'Здраве и фитнес' }
                  ].map(g => (
                    <button
                      key={g.value}
                      onClick={() => setGoal(g.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        goal === g.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{g.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Days per week */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  Колко пъти седмично ще тренираш?
                </label>
                <div className="flex gap-3">
                  {[2, 3, 4, 5, 6].map(days => (
                    <button
                      key={days}
                      onClick={() => setDaysPerWeek(days)}
                      className={`flex-1 py-4 rounded-lg border-2 font-semibold transition-all ${
                        daysPerWeek === days
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {days}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  Какво оборудване имаш?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'full-gym' as Equipment, label: 'Пълна зала', desc: 'Щанги, дъмбели, машини' },
                    { value: 'barbell-only' as Equipment, label: 'Само щанги', desc: 'Основни щанги и тегла' },
                    { value: 'minimal' as Equipment, label: 'Минимално', desc: 'Дъмбели, гири' },
                    { value: 'bodyweight' as Equipment, label: 'Без тежести', desc: 'Собствено тегло' }
                  ].map(eq => (
                    <button
                      key={eq.value}
                      onClick={() => setEquipment(eq.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        equipment === eq.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{eq.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{eq.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateProgram}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
              >
                Генерирай Моята Програма
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // MAIN DASHBOARD
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-700 hover:text-gray-900 flex items-center gap-2 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{programName}</h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  {weeks.length} {weeks.length === 1 ? 'седмица' : 'седмици'} • {totalExercises} упражнения
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSetup(true)}
              className="text-gray-600 hover:text-orange-600 text-sm font-medium"
            >
              Нова програма
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 sm:gap-2">
            {[
              { id: 'program' as Tab, label: 'Моята програма', icon: Star },
              { id: 'log' as Tab, label: 'Дневник', icon: Calendar },
              { id: 'stats' as Tab, label: 'Статистики', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 transition-colors text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* PROGRAM TAB */}
        {activeTab === 'program' && (
          <div className="space-y-4">
            {/* Program Info - Compact */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-900">{programName}</h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  {weeks.length} {weeks.length === 1 ? 'седмица' : 'седмици'} • {totalExercises} упражнения
                </p>
              </div>
              <button
                onClick={handleSaveProgram}
                disabled={isSaving}
                className="ml-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Запазване...' : 'Запази'}
              </button>
            </div>

            {/* Week Selector - Compact */}
            {weeks.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 mr-2">Седмица:</span>
                  {weeks.map((week, index) => (
                    <button
                      key={week.weekNumber}
                      onClick={() => {
                        setSelectedWeek(index)
                        setSelectedDay(0)
                      }}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all ${
                        selectedWeek === index
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {week.weekNumber}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Day Selector - Clean */}
            {weeks[selectedWeek] && (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="grid grid-cols-7 gap-1.5">
                  {weeks[selectedWeek].days.map((day, dayIndex) => (
                    <button
                      key={dayIndex}
                      onClick={() => setSelectedDay(dayIndex)}
                      className={`py-2 px-2 rounded-md text-xs font-semibold transition-all ${
                        day.isRestDay
                          ? selectedDay === dayIndex
                            ? 'bg-gray-400 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          : selectedDay === dayIndex
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      <div>{day.dayName.slice(0, 3)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Day Info - Minimal */}
            {weeks[selectedWeek]?.days[selectedDay] && (() => {
              const currentDay = weeks[selectedWeek].days[selectedDay]
              return (
                <div className={`rounded-lg p-3 border ${
                  isRestDay
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        {currentDay.dayName} - {currentDay.focus}
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {isRestDay ? (
                          'Почивен ден - регенерация'
                        ) : (
                          `${currentDayExercises.length} упражнения`
                        )}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-md text-xs font-semibold ${
                      isRestDay
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {isRestDay ? 'Почивка' : 'Тренировка'}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Exercise Grid for Selected Day */}
            {weeks[selectedWeek]?.days[selectedDay] && !isRestDay && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentDayExercises.map((exercise, index) => {
                  const isFavorite = favorites.has(exercise.id)

                  return (
                    <div
                      key={exercise.id}
                      onClick={() => handleOpenExerciseDetails(exercise)}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer group"
                    >
                      {/* Exercise Image */}
                      <div className="relative h-48 bg-gray-100">
                        <Image
                          src={exercise.image}
                          alt={exercise.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute top-3 left-3 bg-orange-500 text-white font-bold px-3 py-1 rounded-full text-sm">
                          #{index + 1}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(exercise)
                          }}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform z-10"
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${
                              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Exercise Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">{exercise.name}</h3>
                        <div className="flex gap-2 mb-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                            {exercise.category}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            exercise.testosterone_benefit === 'Висок'
                              ? 'bg-green-100 text-green-700'
                              : exercise.testosterone_benefit === 'Среден'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {exercise.testosterone_benefit} тестостерон ефект
                          </span>
                        </div>

                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Серии:</span>
                            <span className="font-semibold">{exercise.sets}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Повторения:</span>
                            <span className="font-semibold">{exercise.reps}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Почивка:</span>
                            <span className="font-semibold">{exercise.rest}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenExerciseDetails(exercise)
                            }}
                            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Детайли
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExerciseToLog(exercise)
                              setShowLogModal(true)
                            }}
                            className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 flex items-center justify-center gap-1 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Запиши
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* LOG TAB */}
        {activeTab === 'log' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Запиши тренировка</h2>
            <p className="text-gray-600">Избери упражнение от "Моята програма" и натисни "Запиши"</p>
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {loadingAnalytics ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Зареждане на статистики...</p>
              </div>
            ) : (
              <>
                {/* Basic Stats */}
                {workoutStats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="text-xs text-gray-600 mb-1">Тренировки</div>
                      <div className="text-2xl font-bold text-gray-900">{workoutStats.total_workouts || 0}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="text-xs text-gray-600 mb-1">Упражнения</div>
                      <div className="text-2xl font-bold text-gray-900">{workoutStats.total_exercises || 0}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="text-xs text-gray-600 mb-1">Streak</div>
                      <div className="text-2xl font-bold text-orange-600">{workoutStats.current_streak || 0} дни</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="text-xs text-gray-600 mb-1">Любимо</div>
                      <div className="text-sm font-semibold text-gray-900 truncate">{workoutStats.favorite_exercise || '-'}</div>
                    </div>
                  </div>
                )}

                {/* Program Compliance */}
                {compliance && (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">Изпълнение на програмата</h3>
                          <p className="text-xs text-gray-600">Последните 7 дни</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-orange-600">{compliance.compliance_percentage}%</div>
                        <div className="text-xs text-gray-600">{compliance.trained_this_week}/{compliance.total_exercises}</div>
                      </div>
                    </div>
                    <div className="relative h-2 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-700"
                        style={{ width: `${compliance.compliance_percentage}%` }}
                      />
                    </div>
                    {compliance.missing_exercises.length > 0 && (
                      <div className="mt-3 p-3 bg-white/60 rounded-lg">
                        <p className="text-xs text-orange-700 font-medium mb-1">Остават да се тренират:</p>
                        <p className="text-xs text-gray-700">{compliance.missing_exercises.length} упражнения</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Progressive Overload */}
                {overloadData.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">Progressive Overload</h3>
                        <p className="text-xs text-gray-600">Напредък в теглата</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {overloadData.slice(0, 5).map((item, index) => (
                        <div key={item.exercise_id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{item.exercise_name}</div>
                              <div className="text-xs text-gray-600">
                                {item.first_weight}кг → {item.latest_weight}кг
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-green-600 font-bold text-sm">+{item.improvement}кг</div>
                              <div className="text-xs text-green-600">+{item.improvement_percentage}%</div>
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personal Records & Training Volume */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Records */}
                  {personalRecords.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                          <Star className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">Лични Рекорди</h3>
                          <p className="text-xs text-gray-600">Най-тежки тегла</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {personalRecords.slice(0, 5).map((pr, index) => (
                          <div key={pr.exercise_id} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100">
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{pr.exercise_name}</div>
                              <div className="text-xs text-gray-600">
                                {pr.sets}×{pr.reps} • {new Date(pr.achieved_date).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-2xl font-bold text-orange-600">{pr.max_weight}</div>
                              <span className="text-sm text-gray-600">кг</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Training Volume */}
                  {trainingVolume && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">Обем Тренировки</h3>
                          <p className="text-xs text-gray-600">Серии × Повторения × Тегло</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                          <div className="text-xs text-gray-600 mb-1">Седмица</div>
                          <div className="text-lg font-bold text-purple-600">{(trainingVolume.weekly_volume / 1000).toFixed(1)}к</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                          <div className="text-xs text-gray-600 mb-1">Месец</div>
                          <div className="text-lg font-bold text-purple-600">{(trainingVolume.monthly_volume / 1000).toFixed(1)}к</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                          <div className="text-xs text-gray-600 mb-1">Общо</div>
                          <div className="text-lg font-bold text-purple-600">{(trainingVolume.total_volume / 1000).toFixed(1)}к</div>
                        </div>
                      </div>
                      {trainingVolume.top_exercises.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 font-medium mb-2">Топ упражнения:</p>
                          <div className="space-y-1.5">
                            {trainingVolume.top_exercises.slice(0, 3).map((ex, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <span className="text-gray-700">{ex.exercise_name}</span>
                                <span className="font-bold text-purple-600">{(ex.volume / 1000).toFixed(1)}к</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Empty State */}
                {!workoutStats && !compliance && overloadData.length === 0 && personalRecords.length === 0 && !trainingVolume && (
                  <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Все още няма статистики</h3>
                    <p className="text-gray-600 mb-6">Започни да записваш тренировки, за да видиш прогреса си!</p>
                    <button
                      onClick={() => setActiveTab('program')}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all"
                    >
                      Виж Програмата
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Exercise Detail Modal - Modern Full Screen */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fadeIn">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => {
              setSelectedExercise(null)
              setExerciseProgress([])
            }}
          />

          {/* Modal Content */}
          <div className="relative bg-white w-full sm:max-w-4xl sm:max-h-[95vh] sm:rounded-3xl overflow-hidden shadow-2xl animate-slideUp">
            {/* Hero Section with Image */}
            <div className="relative h-40 sm:h-56">
              <Image
                src={selectedExercise.image}
                alt={selectedExercise.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedExercise(null)
                  setExerciseProgress([])
                }}
                className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white/30 transition-all group"
              >
                <X className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* Title & Tags */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-xl text-white text-[10px] font-bold rounded-full border border-white/30">
                    {selectedExercise.category}
                  </span>
                  <span className={`px-2.5 py-1 backdrop-blur-xl text-[10px] font-bold rounded-full border ${
                    selectedExercise.testosterone_benefit === 'Висок'
                      ? 'bg-green-500/20 text-green-100 border-green-400/30'
                      : selectedExercise.testosterone_benefit === 'Среден'
                      ? 'bg-yellow-500/20 text-yellow-100 border-yellow-400/30'
                      : 'bg-gray-500/20 text-gray-100 border-gray-400/30'
                  }`}>
                    {selectedExercise.testosterone_benefit} тестостерон ефект
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedExercise.name}</h2>
              </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(100vh-10rem)] sm:max-h-[calc(95vh-14rem)] p-4 sm:p-5 space-y-4">

              {/* Quick Stats Cards */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-3 text-white">
                  <div className="text-[10px] font-semibold mb-0.5 opacity-90">Серии</div>
                  <div className="text-2xl font-bold">{selectedExercise.sets}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3 text-white">
                  <div className="text-[10px] font-semibold mb-0.5 opacity-90">Повторения</div>
                  <div className="text-2xl font-bold">{selectedExercise.reps}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-3 text-white">
                  <div className="text-[10px] font-semibold mb-0.5 opacity-90">Почивка</div>
                  <div className="text-lg font-bold">{selectedExercise.rest}</div>
                </div>
              </div>

              {/* Progress Chart */}
              {exerciseProgress.length > 0 && (
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Твоят Прогрес</h3>
                        <p className="text-[10px] text-gray-600">Последни {exerciseProgress.length} тренировки</p>
                      </div>
                    </div>
                    {exerciseProgress.length >= 2 && (
                      <div className="text-right">
                        {(exerciseProgress[0].weight_used || 0) > (exerciseProgress[exerciseProgress.length - 1].weight_used || 0) ? (
                          <div className="flex items-center gap-1 px-2.5 py-1 bg-green-500 rounded-full">
                            <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                            <span className="text-xs font-bold text-white">
                              +{((exerciseProgress[0].weight_used || 0) - (exerciseProgress[exerciseProgress.length - 1].weight_used || 0)).toFixed(1)}кг
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-500">Напред! 💪</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {exerciseProgress.map((entry, index) => {
                      const isLatest = index === 0
                      const maxWeight = Math.max(...exerciseProgress.map(e => e.weight_used || 0))
                      const progressPercent = maxWeight > 0 ? ((entry.weight_used || 0) / maxWeight) * 100 : 0

                      return (
                        <div key={index} className={`${isLatest ? 'bg-white border-2 border-blue-400 shadow-sm' : 'bg-white/60 border border-gray-200'} rounded-lg p-2.5 transition-all hover:scale-[1.01]`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              {isLatest && (
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                              )}
                              <span className={`text-[10px] font-bold ${isLatest ? 'text-blue-700' : 'text-gray-600'}`}>
                                {new Date(entry.workout_date).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold ${isLatest ? 'text-blue-900' : 'text-gray-700'}`}>
                                {entry.sets_completed} × {entry.reps_completed}
                              </span>
                              <span className={`text-sm font-bold ${isLatest ? 'text-blue-600' : 'text-gray-900'}`}>
                                {entry.weight_used}<span className="text-[10px] ml-0.5">кг</span>
                              </span>
                            </div>
                          </div>

                          {/* Modern Progress Bar */}
                          <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`absolute inset-y-0 left-0 ${isLatest ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-blue-400'} rounded-full transition-all duration-700 ease-out`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>

                          {entry.notes && (
                            <div className="mt-1.5 pt-1.5 border-t border-gray-200">
                              <p className="text-[10px] text-gray-600 italic">💬 {entry.notes}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {loadingProgress && (
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 text-center border border-blue-100">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-blue-600 font-medium">Зареждане на прогрес...</p>
                </div>
              )}

              {/* Why T-Boost Section */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Защо повишава тестостерона?</h3>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{selectedExercise.testosterone_why}</p>
              </div>

              {/* Technique Grid */}
              <div className="grid sm:grid-cols-2 gap-3">
                {/* Correct Form */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Правилна техника</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {selectedExercise.form.map((cue, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-gray-700">{cue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common Mistakes */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Чести грешки</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {selectedExercise.mistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs">
                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-gray-700">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Log Button */}
              <button
                onClick={() => {
                  setExerciseToLog(selectedExercise)
                  setShowLogModal(true)
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Запиши Тренировка
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Exercise Modal */}
      {showLogModal && exerciseToLog && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setShowLogModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with image */}
            <div className="relative h-32 bg-gradient-to-br from-orange-500 to-red-500">
              <Image
                src={exerciseToLog.image}
                alt={exerciseToLog.name}
                fill
                className="object-cover opacity-30"
              />
              <div className="absolute inset-0 flex items-center justify-between px-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Запиши тренировка</h2>
                  <p className="text-orange-100 text-sm">{exerciseToLog.name}</p>
                </div>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Quick reference */}
              <div className="bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-400 rounded-xl p-4 shadow-sm">
                <div className="text-xs text-orange-900 font-bold mb-2 uppercase tracking-wide">Препоръчано за днес</div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-red-600 text-lg">{exerciseToLog.sets}</span>
                    <span className="text-orange-800 font-medium">серии</span>
                  </div>
                  <div className="w-px h-5 bg-orange-400"></div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-red-600 text-lg">{exerciseToLog.reps}</span>
                    <span className="text-orange-800 font-medium">повторения</span>
                  </div>
                  <div className="w-px h-5 bg-orange-400"></div>
                  <div className="flex items-center gap-1">
                    <span className="text-orange-800 font-medium">Почивка:</span>
                    <span className="font-bold text-red-600 text-base">{exerciseToLog.rest}</span>
                  </div>
                </div>
              </div>

              {/* Input grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">
                    Серии
                  </label>
                  <input
                    type="number"
                    value={logData.sets}
                    onChange={(e) => setLogData({ ...logData, sets: e.target.value })}
                    placeholder={exerciseToLog.sets}
                    className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg text-center text-lg font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">
                    Повторения
                  </label>
                  <input
                    type="number"
                    value={logData.reps}
                    onChange={(e) => setLogData({ ...logData, reps: e.target.value })}
                    placeholder={exerciseToLog.reps}
                    className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg text-center text-lg font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">
                    Тегло (кг)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={logData.weight}
                    onChange={(e) => setLogData({ ...logData, weight: e.target.value })}
                    placeholder="60"
                    className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg text-center text-lg font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">
                  Бележки (опционално)
                </label>
                <textarea
                  value={logData.notes}
                  onChange={(e) => setLogData({ ...logData, notes: e.target.value })}
                  placeholder="Как се почувствах, какво забелязах..."
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all bg-white shadow-sm"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 border-t-2 border-gray-300 p-4 flex gap-3">
              <button
                onClick={() => setShowLogModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-400 rounded-lg text-gray-800 font-bold hover:bg-white hover:border-gray-500 transition-all shadow-sm"
              >
                Отказ
              </button>
              <button
                onClick={handleLogExercise}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" strokeWidth={2.5} />
                Запази
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`rounded-lg px-4 py-3 shadow-lg border-2 ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-500 text-green-900'
              : 'bg-red-50 border-red-500 text-red-900'
          }`}>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
