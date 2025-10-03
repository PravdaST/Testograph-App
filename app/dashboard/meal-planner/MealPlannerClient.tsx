'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { MealPlan, UserParams, DayPlan, CheckboxState, PriceTier } from '@/lib/types/meal-planner'
import {
  calculateMacros,
  generate30DayPlan,
  calculateAverageMacros,
  collectWeekIngredients,
  categorizeIngredients,
  getNormalizedIngredientKey,
  findSimilarMeals,
  parseIngredient,
} from '@/lib/utils/meal-planner'
import type { Meal } from '@/lib/types/meal-planner'
import { Fish, Egg, Apple, Wheat, ShoppingCart, Target, TrendingUp, Beef, Croissant, Droplet, Coffee, UtensilsCrossed, Utensils, Cookie, ArrowLeft, RefreshCw, Calendar, Star, Search, X, Check, ChevronDown, Printer, ClipboardList, TrendingDown } from 'lucide-react'
import { InputField, ActivityButton, SelectionButton, StatCard, WeekTab, MealButton, BackButton, ActionButton, LoadingSpinner } from './components'

interface MealPlannerClientProps {
  initialPlan: MealPlan | null
  userId: string
}

export default function MealPlannerClient({ initialPlan, userId }: MealPlannerClientProps) {
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [age, setAge] = useState<number>(30)
  const [weight, setWeight] = useState<number>(80)
  const [height, setHeight] = useState<number>(175)
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'very' | 'extreme'>('moderate')
  const [goal, setGoal] = useState<'bulk' | 'maintain' | 'cut'>('maintain')
  const [budget, setBudget] = useState<'budget' | 'standard' | 'premium'>('standard')

  // Plan state
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(initialPlan)
  const [showResults, setShowResults] = useState(!!initialPlan)
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null)
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | null>(null)
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [checkboxState, setCheckboxState] = useState<CheckboxState>({})
  const [cookedMeals, setCookedMeals] = useState<Record<string, boolean>>({}) // "day-mealType" -> boolean
  const [isSaving, setIsSaving] = useState(false)
  const [swapMealData, setSwapMealData] = useState<{ day: number; mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'; currentMeal: Meal } | null>(null)
  const [isShoppingListCollapsed, setIsShoppingListCollapsed] = useState(false)
  const [isWeightTrackingCollapsed, setIsWeightTrackingCollapsed] = useState(false)
  const [weightEntries, setWeightEntries] = useState<Array<{ date: string; weight: number }>>([])
  const [newWeight, setNewWeight] = useState('')

  // Load initial plan on mount
  useEffect(() => {
    if (initialPlan) {
      setCurrentPlan(initialPlan)
      setShowResults(true)
      // Restore form values from saved plan
      setAge(initialPlan.userParams.age)
      setWeight(initialPlan.userParams.weight)
      setHeight(initialPlan.userParams.height || 175)
      setActivityLevel(initialPlan.userParams.activityLevel || 'moderate')
      setGoal(initialPlan.userParams.goal)
      setBudget(initialPlan.userParams.budget)
    }
  }, [initialPlan])

  // Load localStorage data on mount
  useEffect(() => {
    try {
      // Load checkboxes
      const savedCheckboxes = localStorage.getItem(`meal_planner_checkboxes_${userId}`)
      if (savedCheckboxes) {
        setCheckboxState(JSON.parse(savedCheckboxes))
      }

      // Load cooked meals
      const savedCooked = localStorage.getItem(`meal_planner_cooked_${userId}`)
      if (savedCooked) {
        setCookedMeals(JSON.parse(savedCooked))
      }
    } catch (error) {
      console.error('Failed to load localStorage data:', error)
    }
  }, [userId])

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault()

    // Calculate macros
    const macros = calculateMacros(age, weight, height, activityLevel, goal)

    // Generate 30-day plan
    const plan = generate30DayPlan(macros, budget)

    // Create meal plan object
    const userParams: UserParams = {
      age,
      weight,
      height,
      activityLevel,
      goal,
      budget,
      macros,
    }

    const mealPlan: MealPlan = {
      userParams,
      plan,
      generatedAt: new Date().toISOString(),
      weightEntries: currentPlan?.weightEntries || [], // Preserve existing weight entries
    }

    // Clear localStorage FIRST to avoid inconsistency window
    localStorage.removeItem(`meal_planner_checkboxes_${userId}`)
    localStorage.removeItem(`meal_planner_cooked_${userId}`)

    // THEN reset state
    setCheckboxState({}) // Reset checkboxes for new plan
    setCookedMeals({}) // Reset cooked meals for new plan
    setCurrentPlan(mealPlan)
    setShowResults(true)

    // Save to Supabase (upsert - replace existing plan)
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('meal_plans_app')
        .upsert(
          {
            user_id: userId,
            plan_data: mealPlan,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        )

      if (error) {
        console.error('Error saving meal plan:', error)
        // Still show the plan even if save fails
      }
    } catch (err) {
      console.error('Failed to save plan:', err)
    } finally {
      setIsSaving(false)
    }

    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleNewPlan = async () => {
    // Delete current plan from Supabase
    try {
      await supabase.from('meal_plans_app').delete().eq('user_id', userId)
    } catch (err) {
      console.error('Failed to delete plan:', err)
    }

    // Reset state
    setShowResults(false)
    setCurrentPlan(null)
    setCheckboxState({})
    setCookedMeals({})

    // Clear localStorage
    localStorage.removeItem(`meal_planner_checkboxes_${userId}`)
    localStorage.removeItem(`meal_planner_cooked_${userId}`)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCheckboxChange = (week: number, day: number, mealType: string, ingredient: string, checked: boolean) => {
    // Create unique key: ingredient__day__mealType
    const normalizedIngredient = getNormalizedIngredientKey(ingredient)
    const uniqueKey = `${normalizedIngredient}__${day}__${mealType}`

    setCheckboxState((prev) => {
      const updated = {
        ...prev,
        [week]: {
          ...prev[week],
          [uniqueKey]: checked,
        },
      }
      // Save to localStorage with error handling
      try {
        localStorage.setItem(`meal_planner_checkboxes_${userId}`, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to save checkboxes to localStorage:', error)
      }
      return updated
    })
  }

  // Mark meal as cooked with ingredient validation
  const handleMarkAsCooked = (day: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', meal: Meal) => {
    const mealKey = `${day}-${mealType}`
    const isCooked = cookedMeals[mealKey]

    // If unmarking as cooked, just toggle
    if (isCooked) {
      setCookedMeals(prev => {
        const updated = { ...prev, [mealKey]: false }
        // Save to localStorage with error handling
        try {
          localStorage.setItem(`meal_planner_cooked_${userId}`, JSON.stringify(updated))
        } catch (error) {
          console.error('Failed to save cooked meals to localStorage:', error)
        }
        return updated
      })
      return
    }

    // Check if all ingredients are available
    const hasAllIngredients = areIngredientsAvailable(day, meal.ingredients)

    if (!hasAllIngredients) {
      // Show warning - missing ingredients
      const confirmed = window.confirm(
        `⚠️ ВНИМАНИЕ!\n\n` +
        `Липсват продукти за това ястие!\n\n` +
        `Сигурен ли си че искаш да го маркираш като приготвено?\n\n` +
        `💡 Съвет: Провери списъка за пазаруване и отметни закупените продукти.`
      )

      if (!confirmed) return // User cancelled
    }

    // Auto-check all ingredients as purchased FIRST (before marking as cooked)
    const week = Math.ceil(day / 7)
    meal.ingredients.forEach((ingredient: string) => {
      handleCheckboxChange(week, day, mealType, ingredient, true)
    })

    // Mark as cooked
    setCookedMeals(prev => {
      const updated = { ...prev, [mealKey]: true }
      // Save to localStorage with error handling
      try {
        localStorage.setItem(`meal_planner_cooked_${userId}`, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to save cooked meals to localStorage:', error)
      }
      return updated
    })
  }

  // Check if all ingredients are purchased
  const areIngredientsAvailable = (day: number, ingredients: string[]): boolean => {
    const week = Math.ceil(day / 7)
    return ingredients.every(ingredient => {
      const normalizedKey = getNormalizedIngredientKey(ingredient)
      return checkboxState[week]?.[normalizedKey] === true
    })
  }

  // Open swap meal modal
  const handleSwapRequest = (day: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', currentMeal: Meal) => {
    setSwapMealData({ day, mealType, currentMeal })
  }

  // Handle meal swap
  const handleSwapMeal = async (day: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', newMeal: Meal) => {
    if (!currentPlan) return

    // Update plan with new meal
    const updatedPlan = currentPlan.plan.map(dayPlan => {
      if (dayPlan.day === day) {
        const updatedMeals = { ...dayPlan.meals, [mealType]: newMeal }

        // Recalculate totals
        const totalProtein = Object.values(updatedMeals).reduce((sum, meal) => sum + meal.protein, 0)
        const totalCarbs = Object.values(updatedMeals).reduce((sum, meal) => sum + meal.carbs, 0)
        const totalFat = Object.values(updatedMeals).reduce((sum, meal) => sum + meal.fat, 0)
        const totalCalories = Math.round(totalProtein * 4 + totalCarbs * 4 + totalFat * 9)

        return {
          ...dayPlan,
          meals: updatedMeals,
          totals: {
            protein: Math.round(totalProtein),
            carbs: Math.round(totalCarbs),
            fat: Math.round(totalFat),
            calories: totalCalories
          }
        }
      }
      return dayPlan
    })

    const newPlan = { ...currentPlan, plan: updatedPlan }
    setCurrentPlan(newPlan)

    // Update selectedDay if it's open
    if (selectedDay && selectedDay.day === day) {
      const updatedDay = updatedPlan.find(d => d.day === day)
      if (updatedDay) {
        setSelectedDay(updatedDay)
      }
    }

    // Save to Supabase
    try {
      const { error } = await supabase
        .from('meal_plans_app')
        .update({ plan_data: newPlan })
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Failed to save updated plan:', error)
    }

    // Close swap modal
    setSwapMealData(null)
  }

  // Load weight entries from meal plan
  useEffect(() => {
    if (currentPlan?.weightEntries) {
      setWeightEntries(currentPlan.weightEntries)
    }
  }, [currentPlan])

  // Add weight entry
  const handleAddWeight = async () => {
    const weight = parseFloat(newWeight)
    if (!weight || weight <= 0) return

    const today = new Date().toISOString().split('T')[0]
    const newEntry = { date: today, weight }

    try {
      // Update meal plan with new weight entry
      const updatedWeightEntries = [...(currentPlan?.weightEntries || []), newEntry]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      const updatedPlan = {
        ...currentPlan!,
        weightEntries: updatedWeightEntries
      }

      // Save to Supabase
      const { error } = await supabase
        .from('meal_plans_app')
        .update({ plan_data: updatedPlan })
        .eq('user_id', userId)

      if (error) throw error

      // Update local state
      setCurrentPlan(updatedPlan)
      setWeightEntries(updatedWeightEntries)
      setNewWeight('')
    } catch (error) {
      console.error('Failed to add weight entry:', error)
    }
  }

  if (!showResults || !currentPlan) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <BackButton onClick={() => router.push('/dashboard')} />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Meal Planner
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Персонализиран 30-дневен хранителен план
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleGeneratePlan} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Персонална Информация</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Въведете вашите данни за да генерираме оптимален хранителен план
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Age, Weight & Height - Mobile-first: stack, then 3 columns */}
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <InputField
                  id="age"
                  label="Възраст"
                  value={age}
                  onChange={setAge}
                  min={18}
                  max={100}
                  unit="год."
                  helper="Между 18 и 100"
                />
                <InputField
                  id="weight"
                  label="Тегло"
                  value={weight}
                  onChange={setWeight}
                  min={40}
                  max={200}
                  step={0.1}
                  unit="кг"
                  helper="Текущо тегло"
                />
                <InputField
                  id="height"
                  label="Височина"
                  value={height}
                  onChange={setHeight}
                  min={140}
                  max={220}
                  unit="см"
                  helper="В сантиметри"
                />
              </div>

              {/* Activity Level - Mobile-first */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 sm:mb-3">
                  Ниво на активност
                </label>
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                  {[
                    { value: 'sedentary', label: 'Седящ', sublabel: 'Офис работа' },
                    { value: 'light', label: 'Лека', sublabel: '1-2 трен./седм.' },
                    { value: 'moderate', label: 'Умерена', sublabel: '3-5 трен./седм.' },
                    { value: 'very', label: 'Висока', sublabel: '6-7 трен./седм.' },
                    { value: 'extreme', label: 'Екстремна', sublabel: '2x дневно' },
                  ].map(({ value, label, sublabel }) => (
                    <ActivityButton
                      key={value}
                      label={label}
                      sublabel={sublabel}
                      selected={activityLevel === value}
                      onClick={() => setActivityLevel(value as typeof activityLevel)}
                    />
                  ))}
                </div>
              </div>

              {/* Goal - Mobile-first */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 sm:mb-3">
                  Вашата Цел
                </label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <SelectionButton
                    label="Увеличаване"
                    sublabel="Повече мускулна маса"
                    selected={goal === 'bulk'}
                    onClick={() => setGoal('bulk')}
                    Icon={TrendingUp}
                  />
                  <SelectionButton
                    label="Поддържане"
                    sublabel="Същото тегло"
                    selected={goal === 'maintain'}
                    onClick={() => setGoal('maintain')}
                  />
                  <SelectionButton
                    label="Отслабване"
                    sublabel="По-малко мазнини"
                    selected={goal === 'cut'}
                    onClick={() => setGoal('cut')}
                    Icon={TrendingDown}
                  />
                </div>
              </div>

              {/* Budget - Mobile-first */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2 sm:mb-3">
                  Ценови Диапазон
                </label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <SelectionButton
                    label="Бюджетен"
                    sublabel="Икономични продукти"
                    selected={budget === 'budget'}
                    onClick={() => setBudget('budget')}
                  />
                  <SelectionButton
                    label="Стандартен"
                    sublabel="Балансиран избор"
                    selected={budget === 'standard'}
                    onClick={() => setBudget('standard')}
                  />
                  <SelectionButton
                    label="Премиум"
                    sublabel="Качествени продукти"
                    selected={budget === 'premium'}
                    onClick={() => setBudget('premium')}
                    Icon={Star}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                {/* Info Box - Mobile-first */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm font-medium text-blue-900 mb-2">Какво ще получите:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• 30-дневен персонализиран план</li>
                    <li>• 52 разнообразни рецепти</li>
                    <li>• Списъци за пазаруване</li>
                    <li>• Оптимален макронутриентен баланс</li>
                  </ul>
                </div>

                {/* Submit - Mobile-first */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner />
                      Запазване...
                    </>
                  ) : (
                    'Генерирай Моя План'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const avgMacros = calculateAverageMacros(currentPlan.plan)
  const { macros } = currentPlan.userParams

  // Calculate shopping list progress for current week
  const weekIngredients = collectWeekIngredients(currentPlan.plan, selectedWeek)
  const weekItems = Object.values(categorizeIngredients(weekIngredients)).flat()
  const weekChecked = weekItems.filter((item) => checkboxState[selectedWeek]?.[item.name] || false).length
  const weekTotal = weekItems.length
  const weekProgress = weekTotal > 0 ? Math.round((weekChecked * 100) / weekTotal) : 0

  // Calculate meal readiness for current week
  const startDay = (selectedWeek - 1) * 7 + 1
  const endDay = Math.min(selectedWeek * 7, 30)
  const weekDays = currentPlan.plan.filter(d => d.day >= startDay && d.day <= endDay)
  const weekMeals = weekDays.flatMap(day => [
    { day: day.day, type: 'breakfast' as const, meal: day.meals.breakfast },
    { day: day.day, type: 'lunch' as const, meal: day.meals.lunch },
    { day: day.day, type: 'dinner' as const, meal: day.meals.dinner },
    { day: day.day, type: 'snack' as const, meal: day.meals.snack },
  ])
  const readyMeals = weekMeals.filter(m => areIngredientsAvailable(m.day, m.meal.ingredients)).length
  const totalWeekMeals = weekMeals.length
  const mealReadinessProgress = totalWeekMeals > 0 ? Math.round((readyMeals * 100) / totalWeekMeals) : 0

  // Calculate overall goal progress (30 days)
  const totalMeals = 30 * 4 // 120 meals total
  const allMeals = currentPlan.plan.flatMap(day => [
    { day: day.day, type: 'breakfast' as const },
    { day: day.day, type: 'lunch' as const },
    { day: day.day, type: 'dinner' as const },
    { day: day.day, type: 'snack' as const },
  ])
  const cookedCount = allMeals.filter(m => cookedMeals[`${m.day}-${m.type}`]).length
  const mealCompliancePercent = Math.round((cookedCount / totalMeals) * 100)

  // Calculate macro accuracy (how close average is to target)
  const proteinAccuracy = 100 - Math.min(100, Math.abs(avgMacros.protein - macros.protein) / macros.protein * 100)
  const carbsAccuracy = 100 - Math.min(100, Math.abs(avgMacros.carbs - macros.carbs) / macros.carbs * 100)
  const fatAccuracy = 100 - Math.min(100, Math.abs(avgMacros.fat - macros.fat) / macros.fat * 100)
  const caloriesAccuracy = 100 - Math.min(100, Math.abs(avgMacros.calories - macros.calories) / macros.calories * 100)
  const macroAccuracyPercent = Math.round((proteinAccuracy + carbsAccuracy + fatAccuracy + caloriesAccuracy) / 4)

  // Calculate days followed (days with at least 3/4 meals cooked)
  const daysFollowed = currentPlan.plan.filter(day => {
    const dayMeals = [
      cookedMeals[`${day.day}-breakfast`],
      cookedMeals[`${day.day}-lunch`],
      cookedMeals[`${day.day}-dinner`],
      cookedMeals[`${day.day}-snack`],
    ]
    const cookedMealsCount = dayMeals.filter(Boolean).length
    return cookedMealsCount >= 3 // At least 3 out of 4 meals
  }).length

  // Calculate streaks
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  currentPlan.plan.forEach((day, index) => {
    const dayMeals = [
      cookedMeals[`${day.day}-breakfast`],
      cookedMeals[`${day.day}-lunch`],
      cookedMeals[`${day.day}-dinner`],
      cookedMeals[`${day.day}-snack`],
    ]
    const cookedMealsCount = dayMeals.filter(Boolean).length
    const isDayFollowed = cookedMealsCount >= 3

    if (isDayFollowed) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
      // If this is the most recent consecutive streak, update current
      if (index === currentPlan.plan.length - 1 ||
          (index < currentPlan.plan.length - 1 && tempStreak > 0)) {
        currentStreak = tempStreak
      }
    } else {
      tempStreak = 0
      // Reset current streak if we hit a non-followed day
      currentStreak = 0
    }
  })

  // Expected progress based on goal
  const daysFollowedPercent = Math.round((daysFollowed / 30) * 100)
  const expectedProgress = {
    bulk: `+${(daysFollowedPercent * 0.015).toFixed(1)}кг мускули`, // ~1.5kg at 100%
    maintain: `Запазено тегло`,
    cut: `-${(daysFollowedPercent * 0.02).toFixed(1)}кг мазнини`, // ~2kg at 100%
  }

  // Overall goal progress (weighted: 60% compliance + 40% accuracy)
  const overallProgress = Math.round(mealCompliancePercent * 0.6 + macroAccuracyPercent * 0.4)

  // Goal name mapping
  const goalNames = {
    bulk: 'Muscle Gain',
    maintain: 'Maintain Weight',
    cut: 'Fat Loss'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-5">
      <div className="max-w-7xl mx-auto" id="results">
        {/* Header - Mobile-first */}
        <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <BackButton onClick={() => router.push('/dashboard')} />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Вашият 30-Дневен План
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
              Преглед на персонализирания ви хранителен режим
            </p>
          </div>
          <ActionButton
            onClick={handleNewPlan}
            icon={RefreshCw}
            label="Нов План"
          />
        </div>

        {/* Unified Goal Dashboard - Minimalist */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-4 sm:mb-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                goal === 'bulk' ? 'bg-blue-50' : goal === 'cut' ? 'bg-orange-50' : 'bg-purple-50'
              }`}>
                {goal === 'bulk' ? (
                  <TrendingUp className={`w-5 h-5 ${goal === 'bulk' ? 'text-blue-600' : 'text-blue-600'}`} strokeWidth={2.5} />
                ) : goal === 'cut' ? (
                  <TrendingDown className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
                ) : (
                  <Target className="w-5 h-5 text-purple-600" strokeWidth={2.5} />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{goalNames[goal]}</h3>
                <p className="text-xs text-gray-500">30-дневен план</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Готвени</div>
              <div className="text-xl font-bold text-gray-900">
                {cookedCount}<span className="text-sm text-gray-400">/{totalMeals}</span>
              </div>
            </div>
          </div>

          {/* Real Goal Progress Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Days Followed */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 sm:p-4 border border-emerald-200">
              <div className="text-xs text-emerald-700 font-medium mb-1">Дни следвани</div>
              <div className="text-2xl font-bold text-emerald-900">
                {daysFollowed}<span className="text-sm text-emerald-600">/30</span>
              </div>
              <div className="text-[10px] text-emerald-600 mt-1">{daysFollowedPercent}% завършени</div>
            </div>

            {/* Current Streak */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 sm:p-4 border border-orange-200">
              <div className="text-xs text-orange-700 font-medium mb-1">Текуща серия</div>
              <div className="text-2xl font-bold text-orange-900">
                {currentStreak}<span className="text-sm text-orange-600"> дни</span>
              </div>
              <div className="text-[10px] text-orange-600 mt-1">Поредни дни</div>
            </div>

            {/* Longest Streak */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 border border-purple-200">
              <div className="text-xs text-purple-700 font-medium mb-1">Най-дълга серия</div>
              <div className="text-2xl font-bold text-purple-900">
                {longestStreak}<span className="text-sm text-purple-600"> дни</span>
              </div>
              <div className="text-[10px] text-purple-600 mt-1">Личен рекорд</div>
            </div>

            {/* Expected Progress */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 sm:p-4 border border-blue-200">
              <div className="text-xs text-blue-700 font-medium mb-1">Очакван резултат</div>
              <div className="text-lg sm:text-xl font-bold text-blue-900">
                {expectedProgress[goal]}
              </div>
              <div className="text-[10px] text-blue-600 mt-1">След 30 дни</div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700">Общ прогрес към целта</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {daysFollowedPercent}%
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${daysFollowedPercent}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {daysFollowed > 0 ? `Браво! Следваш плана ${daysFollowed} дни` : 'Започни да готвиш за да видиш прогреса'}
            </div>
          </div>
        </div>

        {/* Week Tabs - Mobile-first: scrollable на mobile */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-5 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((week) => {
            const weekIngredients = collectWeekIngredients(currentPlan.plan, week)
            const weekItems = Object.values(categorizeIngredients(weekIngredients)).flat()
            const weekChecked = weekItems.filter(item => checkboxState[week]?.[item.name] || false).length
            const weekTotal = weekItems.length
            const weekProgress = weekTotal > 0 ? Math.round((weekChecked / weekTotal) * 100) : 0

            return (
              <WeekTab
                key={week}
                week={week}
                selected={selectedWeek === week}
                progress={weekProgress}
                onClick={() => setSelectedWeek(week)}
              />
            )
          })}
        </div>

        {/* Vertical Stack: Calendar + Shopping List */}

        {/* Weekly Calendar - Mobile-first */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-5 mb-4 sm:mb-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" strokeWidth={2.5} />
              Седмица {selectedWeek} - Календар
            </h2>

            {/* Meal Readiness Indicator */}
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                <span className="text-xs sm:text-sm font-bold text-emerald-700">
                  {readyMeals}/{totalWeekMeals}
                </span>
              </div>
              <div className="h-4 w-px bg-emerald-300" />
              <span className="text-xs text-emerald-600 font-medium hidden sm:inline">Готови</span>
            </div>
          </div>

            {/* Days of Week Header - Hide on very small screens */}
            <div className="hidden sm:grid sm:grid-cols-7 gap-2 mb-3">
              {['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'].map((day, i) => (
                <div key={i} className="text-center text-xs font-bold text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Week Days Grid - Mobile-first: 2-3 columns on mobile, 7 on desktop */}
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-7">
              {currentPlan.plan
                .filter((dayData) => {
                  const weekStart = (selectedWeek - 1) * 7 + 1
                  const weekEnd = selectedWeek * 7
                  return dayData.day >= weekStart && dayData.day <= weekEnd
                })
                .map((dayData) => (
              <button
                key={dayData.day}
                onClick={() => {
                  setSelectedDay(dayData)
                  setSelectedMealType(null)
                }}
                className="group relative bg-white border-2 border-gray-200 rounded-lg hover:border-emerald-500 transition-all duration-200 hover:shadow-md cursor-pointer text-left w-full"
              >
                <div className="p-3">
                  {/* Day Number */}
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {dayData.day}
                    </div>
                  </div>

                  {/* Calories */}
                  <div className="text-xs font-bold text-emerald-700 text-center mb-2">
                    {dayData.totals.calories} kcal
                  </div>

                  {/* Macros Grid - Minimalistic */}
                  <div className="grid grid-cols-3 gap-1 mb-3">
                    <div className="bg-blue-50 rounded px-1.5 py-1 text-center">
                      <div className="text-[9px] text-blue-600 font-semibold">P</div>
                      <div className="text-[10px] font-bold text-blue-700">{dayData.totals.protein}г</div>
                    </div>
                    <div className="bg-orange-50 rounded px-1.5 py-1 text-center">
                      <div className="text-[9px] text-orange-600 font-semibold">C</div>
                      <div className="text-[10px] font-bold text-orange-700">{dayData.totals.carbs}г</div>
                    </div>
                    <div className="bg-amber-50 rounded px-1.5 py-1 text-center">
                      <div className="text-[9px] text-amber-600 font-semibold">F</div>
                      <div className="text-[10px] font-bold text-amber-700">{dayData.totals.fat}г</div>
                    </div>
                  </div>

                  {/* Meal Indicators - Visual with readiness status */}
                  <div className="space-y-1.5">
                    {/* Breakfast */}
                    {(() => {
                      const isCooked = cookedMeals[`${dayData.day}-breakfast`]
                      const hasIngredients = areIngredientsAvailable(dayData.day, dayData.meals.breakfast.ingredients)
                      return (
                        <div
                          className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded border transition-colors ${
                            isCooked
                              ? 'bg-green-100 border-green-300'
                              : hasIngredients
                              ? 'bg-emerald-50 border-emerald-300'
                              : 'bg-orange-50 border-orange-200'
                          }`}
                        >
                          <Coffee className={`w-3 h-3 flex-shrink-0 ${isCooked ? 'text-green-700' : hasIngredients ? 'text-emerald-600' : 'text-orange-600'}`} strokeWidth={2.5} />
                          <span className={`text-xs font-medium truncate ${isCooked ? 'text-green-800' : hasIngredients ? 'text-emerald-700' : 'text-orange-700'}`}>Закуска</span>
                          {isCooked ? (
                            <Check className="w-3 h-3 text-green-700 ml-auto" strokeWidth={2.5} />
                          ) : hasIngredients ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto" title="Има продуктите" />
                          ) : (
                            <div title="Липсват продукти">
                              <X className="w-3 h-3 text-orange-500 ml-auto" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                      )
                    })()}

                    {/* Lunch */}
                    {(() => {
                      const isCooked = cookedMeals[`${dayData.day}-lunch`]
                      const hasIngredients = areIngredientsAvailable(dayData.day, dayData.meals.lunch.ingredients)
                      return (
                        <div
                          className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded border transition-colors ${
                            isCooked
                              ? 'bg-green-100 border-green-300'
                              : hasIngredients
                              ? 'bg-emerald-50 border-emerald-300'
                              : 'bg-yellow-50 border-yellow-200'
                          }`}
                        >
                          <UtensilsCrossed className={`w-3 h-3 flex-shrink-0 ${isCooked ? 'text-green-700' : hasIngredients ? 'text-emerald-600' : 'text-yellow-600'}`} strokeWidth={2.5} />
                          <span className={`text-xs font-medium truncate ${isCooked ? 'text-green-800' : hasIngredients ? 'text-emerald-700' : 'text-yellow-700'}`}>Обяд</span>
                          {isCooked ? (
                            <Check className="w-3 h-3 text-green-700 ml-auto" strokeWidth={2.5} />
                          ) : hasIngredients ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto" title="Има продуктите" />
                          ) : (
                            <div title="Липсват продукти">
                              <X className="w-3 h-3 text-yellow-500 ml-auto" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                      )
                    })()}

                    {/* Dinner */}
                    {(() => {
                      const isCooked = cookedMeals[`${dayData.day}-dinner`]
                      const hasIngredients = areIngredientsAvailable(dayData.day, dayData.meals.dinner.ingredients)
                      return (
                        <div
                          className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded border transition-colors ${
                            isCooked
                              ? 'bg-green-100 border-green-300'
                              : hasIngredients
                              ? 'bg-emerald-50 border-emerald-300'
                              : 'bg-indigo-50 border-indigo-200'
                          }`}
                        >
                          <Utensils className={`w-3 h-3 flex-shrink-0 ${isCooked ? 'text-green-700' : hasIngredients ? 'text-emerald-600' : 'text-indigo-600'}`} strokeWidth={2.5} />
                          <span className={`text-xs font-medium truncate ${isCooked ? 'text-green-800' : hasIngredients ? 'text-emerald-700' : 'text-indigo-700'}`}>Вечеря</span>
                          {isCooked ? (
                            <Check className="w-3 h-3 text-green-700 ml-auto" strokeWidth={2.5} />
                          ) : hasIngredients ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto" title="Има продуктите" />
                          ) : (
                            <div title="Липсват продукти">
                              <X className="w-3 h-3 text-indigo-500 ml-auto" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                      )
                    })()}

                    {/* Snack */}
                    {(() => {
                      const isCooked = cookedMeals[`${dayData.day}-snack`]
                      const hasIngredients = areIngredientsAvailable(dayData.day, dayData.meals.snack.ingredients)
                      return (
                        <div
                          className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded border transition-colors ${
                            isCooked
                              ? 'bg-green-100 border-green-300'
                              : hasIngredients
                              ? 'bg-emerald-50 border-emerald-300'
                              : 'bg-rose-50 border-rose-200'
                          }`}
                        >
                          <Cookie className={`w-3 h-3 flex-shrink-0 ${isCooked ? 'text-green-700' : hasIngredients ? 'text-emerald-600' : 'text-rose-600'}`} strokeWidth={2.5} />
                          <span className={`text-xs font-medium truncate ${isCooked ? 'text-green-800' : hasIngredients ? 'text-emerald-700' : 'text-rose-700'}`}>Снакс</span>
                          {isCooked ? (
                            <Check className="w-3 h-3 text-green-700 ml-auto" strokeWidth={2.5} />
                          ) : hasIngredients ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto" title="Има продуктите" />
                          ) : (
                            <div title="Липсват продукти">
                              <X className="w-3 h-3 text-rose-500 ml-auto" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Shopping List - Full Width Below Calendar */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          {/* Collapsible Header */}
          <div className="flex items-center justify-between -m-5 p-5 mb-4">
            {/* Title (Clickable for collapse) */}
            <button
              onClick={() => setIsShoppingListCollapsed(!isShoppingListCollapsed)}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
              <h2 className="text-lg font-bold text-gray-900">
                Седмица {selectedWeek} - Списък за Пазаруване
              </h2>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 print:hidden ${isShoppingListCollapsed ? '' : 'rotate-180'}`}
                strokeWidth={2.5}
              />
            </button>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Print Button */}
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm font-medium print:hidden"
              >
                <Printer className="w-4 h-4" strokeWidth={2.5} />
                <span className="hidden sm:inline">Принтирай</span>
              </button>

              {/* Progress Indicator */}
              <div className="flex items-center gap-2 print:hidden">
                <span className={`text-sm font-bold ${weekProgress === 100 ? 'text-emerald-600' : 'text-gray-600'}`}>
                  {`${weekChecked} / ${weekTotal}`}
                </span>
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${weekProgress === 100 ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                    style={{ width: `${weekProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Content */}
          {!isShoppingListCollapsed && (
            <ShoppingListView
              plan={currentPlan.plan}
              week={selectedWeek}
              checkboxState={checkboxState}
              onCheckboxChange={handleCheckboxChange}
            />
          )}
        </div>

        {/* Weight Tracking - Full Width Below Shopping List */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mt-4 sm:mt-5">
          {/* Collapsible Header */}
          <button
            onClick={() => setIsWeightTrackingCollapsed(!isWeightTrackingCollapsed)}
            className="w-full flex items-center justify-between group hover:bg-gray-50 -m-5 p-5 rounded-lg transition-colors mb-4"
          >
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
              <h2 className="text-lg font-bold text-gray-900">
                Прогрес - Тегло
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {weightEntries.length > 0 && (
                <div className="text-sm font-bold text-gray-600">
                  {weightEntries[weightEntries.length - 1].weight} кг
                </div>
              )}

              {/* Collapse Icon */}
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isWeightTrackingCollapsed ? '' : 'rotate-180'}`}
                strokeWidth={2.5}
              />
            </div>
          </button>

          {/* Collapsible Content */}
          {!isWeightTrackingCollapsed && (
            <WeightTrackingView
              weightEntries={weightEntries}
              newWeight={newWeight}
              onWeightChange={setNewWeight}
              onAddWeight={handleAddWeight}
            />
          )}
        </div>

        {/* Day Details Modal */}
        {selectedDay && (
          <DayDetailsModal
            day={selectedDay}
            selectedMealType={selectedMealType}
            cookedMeals={cookedMeals}
            checkboxState={checkboxState}
            selectedWeek={selectedWeek}
            onMarkAsCooked={handleMarkAsCooked}
            onCheckboxChange={handleCheckboxChange}
            areIngredientsAvailable={areIngredientsAvailable}
            onSwapRequest={handleSwapRequest}
            onClose={() => {
              setSelectedDay(null)
              setSelectedMealType(null)
            }}
          />
        )}

        {/* Swap Meal Modal */}
        {swapMealData && (
          <SwapMealModal
            day={swapMealData.day}
            mealType={swapMealData.mealType}
            currentMeal={swapMealData.currentMeal}
            budget={currentPlan.userParams.budget}
            onSwap={handleSwapMeal}
            onClose={() => setSwapMealData(null)}
          />
        )}
      </div>
    </div>
  )
}

// Shopping List Component
function ShoppingListView({
  plan,
  week,
  checkboxState,
  onCheckboxChange,
}: {
  plan: DayPlan[]
  week: number
  checkboxState: CheckboxState
  onCheckboxChange: (week: number, day: number, mealType: string, ingredient: string, checked: boolean) => void
}) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const startDay = (week - 1) * 7 + 1
  const endDay = Math.min(week * 7, 30)

  // Collect ingredients with their sources (which meals they come from)
  const collectIngredientsWithSources = () => {
    const ingredientsMap: Record<string, {
      displayName: string
      totalQuantity: number
      unit: string
      sources: Array<{ day: number, mealType: string, ingredient: string, quantity: number }>
    }> = {}

    for (let day = startDay; day <= endDay; day++) {
      const dayData = plan.find((d) => d.day === day)
      if (!dayData) continue

      const mealTypes: Array<{ type: string, meal: any }> = [
        { type: 'breakfast', meal: dayData.meals.breakfast },
        { type: 'lunch', meal: dayData.meals.lunch },
        { type: 'dinner', meal: dayData.meals.dinner },
        { type: 'snack', meal: dayData.meals.snack }
      ]

      mealTypes.forEach(({ type, meal }) => {
        meal.ingredients.forEach((ingredient: string) => {
          const parsed = parseIngredient(ingredient)
          const key = parsed.name.toLowerCase()

          if (!ingredientsMap[key]) {
            ingredientsMap[key] = {
              displayName: parsed.displayName,
              totalQuantity: 0,
              unit: parsed.unit,
              sources: []
            }
          }

          // Add to total if units match
          if (ingredientsMap[key].unit === parsed.unit) {
            ingredientsMap[key].totalQuantity += parsed.quantity
          }

          // Track source
          ingredientsMap[key].sources.push({
            day,
            mealType: type,
            ingredient,
            quantity: parsed.quantity
          })
        })
      })
    }

    return ingredientsMap
  }

  const ingredientsWithSources = collectIngredientsWithSources()

  // Convert to old format for categorization
  const ingredients = Object.entries(ingredientsWithSources).reduce((acc, [key, data]) => {
    acc[key] = {
      quantity: data.totalQuantity,
      unit: data.unit,
      displayName: data.displayName
    }
    return acc
  }, {} as Record<string, { quantity: number; unit: string; displayName: string }>)

  const categories = categorizeIngredients(ingredients)

  // Filter items by search query
  const filterItems = (items: Array<{ name: string; count: number }>) => {
    if (!searchQuery) return items
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Calculate progress based on individual meal-ingredients
  const calculateProgress = () => {
    let totalSources = 0
    let checkedSources = 0

    Object.entries(ingredientsWithSources).forEach(([key, data]) => {
      data.sources.forEach(source => {
        totalSources++
        const uniqueKey = `${key}__${source.day}__${source.mealType}`
        if (checkboxState[week]?.[uniqueKey]) {
          checkedSources++
        }
      })
    })

    return {
      total: totalSources,
      checked: checkedSources,
      progress: totalSources > 0 ? Math.round((checkedSources / totalSources) * 100) : 0
    }
  }

  const { total: totalItems, checked: checkedItems, progress } = calculateProgress()

  // Bulk actions
  const handleCheckAll = () => {
    Object.entries(ingredientsWithSources).forEach(([key, data]) => {
      data.sources.forEach(source => {
        onCheckboxChange(week, source.day, source.mealType, source.ingredient, true)
      })
    })
  }

  const handleUncheckAll = () => {
    Object.entries(ingredientsWithSources).forEach(([key, data]) => {
      data.sources.forEach(source => {
        onCheckboxChange(week, source.day, source.mealType, source.ingredient, false)
      })
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const toggleItem = (itemKey: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemKey)) {
        next.delete(itemKey)
      } else {
        next.add(itemKey)
      }
      return next
    })
  }

  const handleCheckCategory = (category: string, items: Array<{ name: string; count: number }>) => {
    items.forEach(item => {
      const normalizedKey = getNormalizedIngredientKey(item.name)
      const data = ingredientsWithSources[normalizedKey]
      if (data) {
        data.sources.forEach(source => {
          onCheckboxChange(week, source.day, source.mealType, source.ingredient, true)
        })
      }
    })
  }

  const handleUncheckCategory = (category: string, items: Array<{ name: string; count: number }>) => {
    items.forEach(item => {
      const normalizedKey = getNormalizedIngredientKey(item.name)
      const data = ingredientsWithSources[normalizedKey]
      if (data) {
        data.sources.forEach(source => {
          onCheckboxChange(week, source.day, source.mealType, source.ingredient, false)
        })
      }
    })
  }

  // Category icons and colors
  const categoryConfig: Record<string, { Icon: any; color: string; bgColor: string; borderColor: string; gradientFrom: string; gradientTo: string }> = {
    'Месо и риба': {
      Icon: Fish,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      gradientFrom: 'from-red-500',
      gradientTo: 'to-rose-600'
    },
    'Яйца и млечни': {
      Icon: Egg,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-cyan-600'
    },
    'Плодове и зеленчуци': {
      Icon: Apple,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-emerald-600'
    },
    'Зърнени': {
      Icon: Wheat,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-orange-600'
    },
    'Други': {
      Icon: ShoppingCart,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      gradientFrom: 'from-gray-500',
      gradientTo: 'to-slate-600'
    }
  }

  return (
    <div className="print-shopping-list">
      {/* Header with Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-lg font-bold text-gray-900">
              Седмица {week}
            </h4>
            <p className="text-xs text-gray-600">Дни {startDay}-{endDay} • {totalItems} продукта</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUncheckAll}
              className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Изчисти всички
            </button>
            <button
              onClick={handleCheckAll}
              className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Маркирай всички
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" strokeWidth={2.5} />
              Принтирай
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Търси продукт..."
              className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition-all text-sm text-gray-900 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full transition-all duration-500 flex items-center justify-end pr-1.5"
            style={{ width: `${progress}%` }}
          >
            {progress > 15 && (
              <span className="text-xs font-bold text-white">{progress}%</span>
            )}
          </div>
        </div>
        <div className="flex justify-between mt-1.5 text-xs">
          <span className="text-gray-600">{checkedItems} от {totalItems} продукта</span>
          <span className={`font-semibold ${progress === 100 ? 'text-emerald-600' : 'text-gray-600'}`}>
            {progress === 100 ? '✓ Завършено!' : `Остават ${totalItems - checkedItems}`}
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {Object.entries(categories).map(([category, items]) => {
          const filteredItems = filterItems(items)
          if (filteredItems.length === 0 && searchQuery) return null
          if (items.length === 0) return null

          const config = categoryConfig[category] || categoryConfig['Други']

          // Calculate category progress based on sources
          let categoryTotalSources = 0
          let categoryCheckedSources = 0
          items.forEach(item => {
            const normalizedKey = getNormalizedIngredientKey(item.name)
            const data = ingredientsWithSources[normalizedKey]
            if (data) {
              data.sources.forEach(source => {
                categoryTotalSources++
                const uniqueKey = `${normalizedKey}__${source.day}__${source.mealType}`
                if (checkboxState[week]?.[uniqueKey]) {
                  categoryCheckedSources++
                }
              })
            }
          })
          const categoryProgress = categoryTotalSources > 0 ? Math.round((categoryCheckedSources / categoryTotalSources) * 100) : 0
          const isCollapsed = collapsedCategories.has(category)

          return (
            <div
              key={category}
              className={`border rounded-lg transition-all ${config.borderColor} ${config.bgColor}`}
            >
              {/* Category Header */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex items-center gap-2.5 flex-1 text-left group"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} flex items-center justify-center shadow-sm transition-transform group-hover:scale-110`}>
                      <config.Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <h5 className={`text-sm font-bold ${config.color}`}>{category}</h5>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                          strokeWidth={2.5}
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        {categoryCheckedSources}/{categoryTotalSources} закупени
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Category Quick Actions */}
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => handleCheckCategory(category, items)}
                        className="p-1.5 text-xs text-emerald-700 hover:bg-emerald-100 rounded transition-colors"
                        title="Маркирай всички"
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleUncheckCategory(category, items)}
                        className="p-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        title="Изчисти всички"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* Progress Circle */}
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          className="stroke-gray-200"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          className={categoryProgress === 100 ? 'stroke-emerald-500' : 'stroke-gray-400'}
                          strokeWidth="2.5"
                          strokeDasharray={`${categoryProgress} 100`}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xs font-bold ${categoryProgress === 100 ? 'text-emerald-600' : config.color}`}>
                          {categoryProgress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                {!isCollapsed && (
                  <div className="mt-2 bg-white/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${categoryProgress === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`}
                      style={{ width: `${categoryProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Items Grid - Modern Cards with Collapse */}
              {!isCollapsed && (
                <div className="px-3 pb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {filteredItems.map((item, index) => {
                      const itemId = `week-${week}-${category}-${index}`
                      const normalizedKey = getNormalizedIngredientKey(item.name)
                      const data = ingredientsWithSources[normalizedKey]

                      if (!data) return null

                      // Calculate purchased for this item
                      let purchased = 0
                      let total = data.sources.length

                      data.sources.forEach(source => {
                        const uniqueKey = `${normalizedKey}__${source.day}__${source.mealType}`
                        if (checkboxState[week]?.[uniqueKey]) {
                          purchased++
                        }
                      })

                      const itemProgress = total > 0 ? Math.round((purchased / total) * 100) : 0
                      const isFullyPurchased = purchased === total
                      const isExpanded = expandedItems.has(itemId)

                      // Get meal type labels
                      const mealTypeLabels: Record<string, string> = {
                        breakfast: 'Закуска',
                        lunch: 'Обяд',
                        dinner: 'Вечеря',
                        snack: 'Снакс'
                      }

                      return (
                        <div
                          key={itemId}
                          className={`rounded-lg border-2 transition-all ${
                            isFullyPurchased
                              ? 'bg-green-50 border-green-300'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* Item Header - Clickable */}
                          <button
                            onClick={() => toggleItem(itemId)}
                            className="w-full p-3 text-left"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h6 className={`text-sm font-semibold ${isFullyPurchased ? 'text-green-700' : 'text-gray-900'}`}>
                                    {item.name}
                                  </h6>
                                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} strokeWidth={2} />
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {purchased}/{total} закупени
                                </p>
                              </div>

                              {/* Percentage badge */}
                              <div className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold ${
                                isFullyPurchased
                                  ? 'bg-green-500 text-white'
                                  : itemProgress > 0
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-600'
                              }`}>
                                {itemProgress}%
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  isFullyPurchased
                                    ? 'bg-green-500'
                                    : itemProgress > 0
                                    ? 'bg-blue-500'
                                    : 'bg-gray-300'
                                }`}
                                style={{ width: `${itemProgress}%` }}
                              />
                            </div>
                          </button>

                          {/* Expandable Sources List */}
                          {isExpanded && (
                            <div className="border-t border-gray-200 p-3 space-y-2 bg-gray-50 animate-slideUp">
                              <div className="text-xs font-semibold text-gray-600 mb-2">Откъде идва:</div>
                              {data.sources.map((source, idx) => {
                                const uniqueKey = `${normalizedKey}__${source.day}__${source.mealType}`
                                const isSourceChecked = checkboxState[week]?.[uniqueKey] || false

                                return (
                                  <div key={idx} className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-all ${isSourceChecked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-medium text-gray-900">
                                        Ден {source.day} - {mealTypeLabels[source.mealType] || source.mealType}
                                      </div>
                                      <div className="text-[10px] text-gray-500 mt-0.5">
                                        {source.ingredient}
                                      </div>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onCheckboxChange(week, source.day, source.mealType, source.ingredient, !isSourceChecked)
                                      }}
                                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        isSourceChecked
                                          ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      {isSourceChecked ? 'Закупен ✓' : 'Закупи'}
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* No results message for search */}
                  {filteredItems.length === 0 && searchQuery && (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" strokeWidth={2} />
                      <p>Няма резултати за "{searchQuery}" в {category}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {totalItems === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" strokeWidth={2} />
          <p className="text-gray-600">Няма продукти за тази седмица</p>
        </div>
      )}
    </div>
  )
}

// Day Details Modal
function DayDetailsModal({
  day,
  selectedMealType,
  cookedMeals,
  checkboxState,
  selectedWeek,
  onMarkAsCooked,
  onCheckboxChange,
  areIngredientsAvailable,
  onSwapRequest,
  onClose,
}: {
  day: DayPlan
  selectedMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
  checkboxState: CheckboxState
  selectedWeek: number
  cookedMeals: Record<string, boolean>
  onMarkAsCooked: (day: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', meal: Meal) => void
  onCheckboxChange: (week: number, day: number, mealType: string, ingredient: string, checked: boolean) => void
  areIngredientsAvailable: (day: number, ingredients: string[]) => boolean
  onSwapRequest: (day: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', meal: Meal) => void
  onClose: () => void
}) {
  // Define meal configurations
  const mealConfigs = {
    breakfast: {
      type: 'breakfast' as const,
      icon: <Coffee className="w-6 h-6 text-orange-500" strokeWidth={2.5} />,
      title: 'Закуска',
      meal: day.meals.breakfast,
      color: 'from-orange-50 to-orange-100',
    },
    lunch: {
      type: 'lunch' as const,
      icon: <UtensilsCrossed className="w-6 h-6 text-yellow-500" strokeWidth={2.5} />,
      title: 'Обяд',
      meal: day.meals.lunch,
      color: 'from-yellow-50 to-yellow-100',
    },
    dinner: {
      type: 'dinner' as const,
      icon: <Utensils className="w-6 h-6 text-indigo-500" strokeWidth={2.5} />,
      title: 'Вечеря',
      meal: day.meals.dinner,
      color: 'from-indigo-50 to-indigo-100',
    },
    snack: {
      type: 'snack' as const,
      icon: <Cookie className="w-6 h-6 text-rose-500" strokeWidth={2.5} />,
      title: 'Снакс',
      meal: day.meals.snack,
      color: 'from-rose-50 to-rose-100',
    },
  }

  // Determine which meals to show
  const mealsToShow = selectedMealType
    ? [mealConfigs[selectedMealType]]
    : Object.values(mealConfigs)

  // Calculate cooked meals count for this day
  const totalMealsCount = selectedMealType ? 1 : 4
  const cookedCount = selectedMealType
    ? (cookedMeals[`${day.day}-${selectedMealType}`] ? 1 : 0)
    : Object.values(mealConfigs).filter(c => cookedMeals[`${day.day}-${c.type}`]).length

  // Get day name
  const dayNames = ['Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя']
  const dayOfWeek = dayNames[(day.day - 1) % 7]

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean Professional Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {dayOfWeek}, Ден {day.day}
                </h2>
                {selectedMealType && (
                  <p className="text-sm text-gray-500">
                    {mealConfigs[selectedMealType].title}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" strokeWidth={2} />
            </button>
          </div>

          {/* Enhanced Stats Bar */}
          {!selectedMealType && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cookedCount === totalMealsCount ? 'bg-green-500' : 'bg-orange-400'}`} />
                  <span className="text-sm font-medium text-gray-700">{cookedCount}/{totalMealsCount} ястия сготвени</span>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round((cookedCount / totalMealsCount) * 100)}% завършен
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                  <div className="text-[10px] text-purple-600 font-medium mb-0.5">Калории</div>
                  <div className="text-sm font-bold text-purple-900">{day.totals.calories}</div>
                  <div className="text-[9px] text-purple-600">kcal</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <div className="text-[10px] text-blue-600 font-medium mb-0.5">Протеин</div>
                  <div className="text-sm font-bold text-blue-900">{day.totals.protein}</div>
                  <div className="text-[9px] text-blue-600">грама</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                  <div className="text-[10px] text-orange-600 font-medium mb-0.5">Въглехидр.</div>
                  <div className="text-sm font-bold text-orange-900">{day.totals.carbs}</div>
                  <div className="text-[9px] text-orange-600">грама</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                  <div className="text-[10px] text-yellow-600 font-medium mb-0.5">Мазнини</div>
                  <div className="text-sm font-bold text-yellow-900">{day.totals.fat}</div>
                  <div className="text-[9px] text-yellow-600">грама</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          {/* Meals */}
          <div className="space-y-4">
            {mealsToShow.map((config, index) => (
              <MealDetail
                key={index}
                day={day.day}
                mealType={config.type}
                icon={config.icon}
                title={config.title}
                meal={config.meal}
                color={config.color}
                isCooked={cookedMeals[`${day.day}-${config.type}`] || false}
                ingredientsAvailable={areIngredientsAvailable(day.day, config.meal.ingredients)}
                checkboxState={checkboxState}
                selectedWeek={selectedWeek}
                onMarkAsCooked={() => onMarkAsCooked(day.day, config.type, config.meal)}
                onCheckboxChange={onCheckboxChange}
                onSwapRequest={() => onSwapRequest(day.day, config.type, config.meal)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Meal Detail Component
function MealDetail({
  day,
  mealType,
  icon,
  title,
  meal,
  color,
  isCooked,
  ingredientsAvailable,
  checkboxState,
  selectedWeek,
  onMarkAsCooked,
  onCheckboxChange,
  onSwapRequest,
}: {
  day: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  icon: React.ReactNode
  title: string
  meal: Meal
  color: string
  isCooked: boolean
  ingredientsAvailable: boolean
  checkboxState: CheckboxState
  selectedWeek: number
  onMarkAsCooked: () => void
  onCheckboxChange: (week: number, day: number, mealType: string, ingredient: string, checked: boolean) => void
  onSwapRequest: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showIngredients, setShowIngredients] = useState(true)
  const [showRecipe, setShowRecipe] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const calories = Math.round(meal.protein * 4 + meal.carbs * 4 + meal.fat * 9)

  // Get unpurchased ingredients
  const getUnpurchasedIngredients = () => {
    return meal.ingredients.filter((ing: string) => {
      const normalizedKey = getNormalizedIngredientKey(ing)
      const uniqueKey = `${normalizedKey}__${day}__${mealType}`
      return !checkboxState[selectedWeek]?.[uniqueKey]
    })
  }

  // Handle mark as cooked with confirmation
  const handleMarkAsCookedClick = () => {
    if (isCooked) {
      // If already cooked, just unmark it
      onMarkAsCooked()
      return
    }

    const unpurchased = getUnpurchasedIngredients()
    if (unpurchased.length > 0) {
      // Show confirmation modal
      setShowConfirmModal(true)
    } else {
      // All ingredients purchased, mark as cooked
      onMarkAsCooked()
    }
  }

  const handleConfirmCook = () => {
    setShowConfirmModal(false)
    onMarkAsCooked()
  }

  // Get color based on meal type
  const getMealColors = () => {
    switch(mealType) {
      case 'breakfast': return { border: 'border-l-orange-500', iconBg: 'bg-orange-50', borderHover: 'hover:border-orange-200' }
      case 'lunch': return { border: 'border-l-yellow-500', iconBg: 'bg-yellow-50', borderHover: 'hover:border-yellow-200' }
      case 'dinner': return { border: 'border-l-indigo-500', iconBg: 'bg-indigo-50', borderHover: 'hover:border-indigo-200' }
      case 'snack': return { border: 'border-l-rose-500', iconBg: 'bg-rose-50', borderHover: 'hover:border-rose-200' }
      default: return { border: 'border-l-gray-500', iconBg: 'bg-gray-50', borderHover: 'hover:border-gray-300' }
    }
  }
  const colors = getMealColors()

  return (
    <div className={`bg-white rounded-lg border-2 border-l-4 transition-all ${isCooked ? 'border-green-500 bg-green-50 border-l-green-500' : `border-gray-200 ${colors.border} ${colors.borderHover}`}`}>
      {/* Clickable Header with Icon */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${isCooked ? 'bg-green-500' : colors.iconBg} flex items-center justify-center transition-colors`}>
              <div className={isCooked ? 'text-white' : ''}>
                {icon}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-500 font-medium mb-0.5">{title}</div>
              <h3 className={`text-sm font-semibold truncate ${isCooked ? 'text-green-900' : 'text-gray-900'}`}>{meal.name}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                {meal.prepTime && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {meal.prepTime}мин
                  </span>
                )}
                {meal.difficulty && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    meal.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    meal.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {meal.difficulty === 'easy' ? 'Лесно' : meal.difficulty === 'medium' ? 'Средно' : 'Трудно'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCooked && (
              <div className="flex-shrink-0 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                <Check className="w-3 h-3" strokeWidth={2.5} />
                Сготвено
              </div>
            )}
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} strokeWidth={2} />
          </div>
        </div>
      </button>

      {/* Collapsible Body */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-3 animate-slideUp">
        {/* Clean Macros Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
            <div className="text-[10px] text-gray-500 font-medium mb-1">Калории</div>
            <div className="text-base font-semibold text-gray-900">{calories}<span className="text-xs text-gray-500 font-normal ml-0.5">kcal</span></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
            <div className="text-[10px] text-gray-500 font-medium mb-1">Протеин</div>
            <div className="text-base font-semibold text-gray-900">{meal.protein}<span className="text-xs text-gray-500 font-normal ml-0.5">г</span></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
            <div className="text-[10px] text-gray-500 font-medium mb-1">Въглех.</div>
            <div className="text-base font-semibold text-gray-900">{meal.carbs}<span className="text-xs text-gray-500 font-normal ml-0.5">г</span></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
            <div className="text-[10px] text-gray-500 font-medium mb-1">Мазнини</div>
            <div className="text-base font-semibold text-gray-900">{meal.fat}<span className="text-xs text-gray-500 font-normal ml-0.5">г</span></div>
          </div>
        </div>

        {/* Collapsible Ingredients */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowIngredients(!showIngredients)
          }}
          className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-gray-600" strokeWidth={2} />
            <span className="text-xs font-medium text-gray-700">Продукти ({meal.ingredients.length})</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showIngredients ? 'rotate-180' : ''}`} strokeWidth={2} />
        </button>

        {showIngredients && (
          <ul className="space-y-2 pl-6 animate-slideUp">
            {meal.ingredients.map((ing: string, i: number) => {
              const normalizedKey = getNormalizedIngredientKey(ing)
              const uniqueKey = `${normalizedKey}__${day}__${mealType}`
              const isChecked = checkboxState[selectedWeek]?.[uniqueKey] || false
              return (
                <li key={i}>
                  <div className="flex items-center justify-between gap-3">
                    <span className={`flex-1 text-xs font-medium ${isChecked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {ing}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCheckboxChange(selectedWeek, day, mealType, ing, !isChecked)
                      }}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isChecked
                          ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isChecked ? 'Закупен ✓' : 'Закупи'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {/* Collapsible Recipe */}
        {meal.cookingInstructions && meal.cookingInstructions.length > 0 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowRecipe(!showRecipe)
              }}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-gray-600" strokeWidth={2} />
                <span className="text-xs font-medium text-gray-700">Приготвяне</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showRecipe ? 'rotate-180' : ''}`} strokeWidth={2} />
            </button>

            {showRecipe && (
              <div className="pl-6 space-y-2 animate-slideUp">
                <ol className="space-y-2">
                  {meal.cookingInstructions.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-gray-700">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-800 text-white font-bold flex items-center justify-center text-[10px]">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>

                {meal.tips && meal.tips.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                    <div className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Съвети
                    </div>
                    <ul className="space-y-1.5">
                      {meal.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-gray-700 flex gap-2">
                          <span className="text-gray-400 flex-shrink-0">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="border-t border-gray-200 pt-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleMarkAsCookedClick()
            }}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              isCooked
                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
            }`}
          >
            {isCooked ? (
              <>
                <X className="w-4 h-4" strokeWidth={2} />
                <span>Премахни</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" strokeWidth={2} />
                <span>Сготвено</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onSwapRequest()
            }}
            className="flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Замени</span>
          </button>
        </div>
        </div>
      )}

      {/* Confirmation Modal for Unpurchased Ingredients */}
      {showConfirmModal && (
        <ConfirmCookModal
          mealName={meal.name}
          unpurchasedIngredients={getUnpurchasedIngredients()}
          onConfirm={handleConfirmCook}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  )
}

// Confirm Cook Modal (when ingredients are not purchased)
function ConfirmCookModal({
  mealName,
  unpurchasedIngredients,
  onConfirm,
  onCancel,
}: {
  mealName: string
  unpurchasedIngredients: string[]
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-gray-200 animate-slideUp">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900">Незакупени продукти</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                Имаш {unpurchasedIngredients.length} незакупени {unpurchasedIngredients.length === 1 ? 'продукт' : 'продукта'} за <span className="font-medium">{mealName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Body - List of unpurchased ingredients */}
        <div className="px-6 py-4 max-h-64 overflow-y-auto">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-orange-900 mb-2">Липсват:</div>
            <ul className="space-y-1.5">
              {unpurchasedIngredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
                  <span className="text-orange-500 flex-shrink-0 mt-0.5">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Сигурен ли си, че искаш да маркираш ястието като сготвено без всички продукти?
          </p>
        </div>

        {/* Footer - Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отказ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm"
          >
            Маркирай като сготвено
          </button>
        </div>
      </div>
    </div>
  )
}

// Swap Meal Modal Component
function SwapMealModal({
  day,
  mealType,
  currentMeal,
  budget,
  onSwap,
  onClose,
}: {
  day: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  currentMeal: Meal
  budget: PriceTier
  onSwap: (day: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', newMeal: Meal) => void
  onClose: () => void
}) {
  // Get similar meals (±15% macro tolerance)
  const similarMeals = findSimilarMeals(currentMeal, mealType === 'snack' ? 'snacks' : mealType, budget, 0.15)

  const mealTypeLabels = {
    breakfast: 'Закуска',
    lunch: 'Обяд',
    dinner: 'Вечеря',
    snack: 'Снакс'
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 animate-slideUp">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Замени {mealTypeLabels[mealType]} - Ден {day}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Текущо: {currentMeal.name} · {Math.round(currentMeal.protein * 4 + currentMeal.carbs * 4 + currentMeal.fat * 9)} kcal
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {similarMeals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Няма налични алтернативи</p>
              <p className="text-gray-500 text-sm mt-2">Не са намерени ястия със сходни макроси в твоя бюджет</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {similarMeals.map((meal, index) => {
                const calories = Math.round(meal.protein * 4 + meal.carbs * 4 + meal.fat * 9)
                const currentCalories = Math.round(currentMeal.protein * 4 + currentMeal.carbs * 4 + currentMeal.fat * 9)
                const calorieDiff = calories - currentCalories
                const proteinDiff = meal.protein - currentMeal.protein
                const carbsDiff = meal.carbs - currentMeal.carbs
                const fatDiff = meal.fat - currentMeal.fat

                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-gray-900 transition-all cursor-pointer group"
                    onClick={() => onSwap(day, mealType, meal)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">{meal.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>{calories} kcal</span>
                          {calorieDiff !== 0 && (
                            <span className={calorieDiff > 0 ? 'text-red-600' : 'text-green-600'}>
                              ({calorieDiff > 0 ? '+' : ''}{calorieDiff} kcal)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-medium text-gray-700 flex-shrink-0">
                        {meal.price === 'budget' ? 'Евтино' : meal.price === 'standard' ? 'Средно' : 'Премиум'}
                      </div>
                    </div>

                    {/* Macros Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                        <div className="text-[10px] text-gray-500 mb-0.5">Протеин</div>
                        <div className="text-sm font-semibold text-gray-900">{meal.protein}г</div>
                        {proteinDiff !== 0 && (
                          <div className={`text-[10px] ${proteinDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({proteinDiff > 0 ? '+' : ''}{Math.round(proteinDiff)}г)
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                        <div className="text-[10px] text-gray-500 mb-0.5">Въглехидрати</div>
                        <div className="text-sm font-semibold text-gray-900">{meal.carbs}г</div>
                        {carbsDiff !== 0 && (
                          <div className={`text-[10px] ${carbsDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ({carbsDiff > 0 ? '+' : ''}{Math.round(carbsDiff)}г)
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                        <div className="text-[10px] text-gray-500 mb-0.5">Мазнини</div>
                        <div className="text-sm font-semibold text-gray-900">{meal.fat}г</div>
                        {fatDiff !== 0 && (
                          <div className={`text-[10px] ${fatDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ({fatDiff > 0 ? '+' : ''}{Math.round(fatDiff)}г)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ingredients Preview */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                      <div className="text-xs font-semibold text-gray-700 mb-1">Съставки:</div>
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {meal.ingredients.join(', ')}
                      </div>
                    </div>

                    {/* Click to Swap */}
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-center gap-2 text-xs font-medium text-gray-600 group-hover:text-gray-900">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Кликни за замяна
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Weight Tracking Component
function WeightTrackingView({
  weightEntries,
  newWeight,
  onWeightChange,
  onAddWeight,
}: {
  weightEntries: Array<{ date: string; weight: number }>
  newWeight: string
  onWeightChange: (value: string) => void
  onAddWeight: () => void
}) {
  // Import chart components dynamically to avoid SSR issues
  const [chartComponents, setChartComponents] = useState<any>(null)

  useEffect(() => {
    import('react-chartjs-2').then((module) => {
      import('chart.js').then((chartModule) => {
        const { Chart, registerables } = chartModule
        Chart.register(...registerables)
        setChartComponents(module)
      })
    })
  }, [])

  const chartData = {
    labels: weightEntries.map((entry) => {
      const date = new Date(entry.date)
      return `${date.getDate()}/${date.getMonth() + 1}`
    }),
    datasets: [
      {
        label: 'Тегло (кг)',
        data: weightEntries.map((entry) => entry.weight),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.parsed.y} кг`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function (value: any) {
            return `${value} кг`
          },
        },
      },
    },
  }

  const Line = chartComponents?.Line

  return (
    <div className="space-y-4">
      {/* Add Weight Form */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-blue-600" />
          Добави ново измерване
        </h3>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            min="0"
            value={newWeight}
            onChange={(e) => onWeightChange(e.target.value)}
            placeholder="Тегло в кг"
            className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onAddWeight()
              }
            }}
          />
          <button
            onClick={onAddWeight}
            disabled={!newWeight || parseFloat(newWeight) <= 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добави
          </button>
        </div>
      </div>

      {/* Weight Progress Stats */}
      {weightEntries.length > 1 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">Начално</div>
            <div className="text-lg font-bold text-gray-900">
              {weightEntries[0].weight} кг
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">Текущо</div>
            <div className="text-lg font-bold text-gray-900">
              {weightEntries[weightEntries.length - 1].weight} кг
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-600 mb-1">Промяна</div>
            <div className={`text-lg font-bold ${
              weightEntries[weightEntries.length - 1].weight - weightEntries[0].weight < 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {(weightEntries[weightEntries.length - 1].weight - weightEntries[0].weight).toFixed(1)} кг
            </div>
          </div>
        </div>
      )}

      {/* Weight Chart */}
      {weightEntries.length > 0 ? (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-3">График на теглото</h3>
          <div className="h-64">
            {Line ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Зареждане на график...
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <TrendingDown className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Няма записани измервания</p>
          <p className="text-xs mt-1">Добави първото си измерване за да започнеш проследяване</p>
        </div>
      )}
    </div>
  )
}


