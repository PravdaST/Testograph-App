/**
 * Smart Meal Selection Algorithm
 * Selects meals based on target macros, variety, and optimization rules
 */

import type { Meal, MealType, PriceTier, DayMacros } from '../types/meal-planner'
import { MEALS_DATABASE } from '../data/meals-database'

interface MealSelectionOptions {
  type: MealType
  budget: PriceTier
  targetMacros: DayMacros
  currentDayTotals: DayMacros // Running totals for the day so far
  mealsRemaining: number // How many meals left to select today (including this one)
  usedMealsThisWeek: Map<string, number> // meal name -> count
  maxRepetitionsPerWeek?: number
}

interface ScoredMeal {
  meal: Meal
  score: number
  macroDeviation: number
  varietyPenalty: number
}

/**
 * Meal type weights for sequential balancing
 * Adjusted based on available meal database calories
 * Breakfast & Lunch have high-calorie options, Dinner & Snacks are limited
 */
const MEAL_WEIGHTS = {
  breakfast: 1.4,  // 29% of daily macros (high-calorie options available)
  lunch: 1.8,      // 38% of daily macros (largest meal, most options)
  dinner: 1.0,     // 21% of daily macros (limited to ~600 kcal max)
  snacks: 0.6,     // 12% of daily macros (limited to ~450 kcal max)
}

const TOTAL_WEIGHT = 1.4 + 1.8 + 1.0 + 0.6 // = 4.8

/**
 * Get meal weight for a meal type
 */
function getMealWeight(type: MealType): number {
  return MEAL_WEIGHTS[type]
}

/**
 * Calculate remaining weight sum for meals not yet selected
 */
function getRemainingWeight(mealsRemaining: number, currentMealType: MealType): number {
  const mealOrder: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']
  const currentIndex = mealOrder.indexOf(currentMealType)

  let weightSum = 0
  for (let i = currentIndex; i < mealOrder.length; i++) {
    weightSum += MEAL_WEIGHTS[mealOrder[i]]
  }

  return weightSum
}

/**
 * Score a meal based on weighted ideal macros
 * Uses meal weights to calculate realistic targets (lunch > breakfast > dinner > snacks)
 */
function calculateMacroDeviation(
  meal: Meal,
  mealType: MealType,
  currentTotals: DayMacros,
  targetMacros: DayMacros,
  mealsRemaining: number
): number {
  // Calculate remaining macros needed
  const remainingProtein = targetMacros.protein - currentTotals.protein
  const remainingCarbs = targetMacros.carbs - currentTotals.carbs
  const remainingFat = targetMacros.fat - currentTotals.fat

  // Get weight allocation for this meal type
  const currentWeight = getMealWeight(mealType)
  const totalRemainingWeight = getRemainingWeight(mealsRemaining, mealType)

  // Calculate ideal macros for this meal (weighted share of remaining)
  const idealProtein = (remainingProtein * currentWeight) / totalRemainingWeight
  const idealCarbs = (remainingCarbs * currentWeight) / totalRemainingWeight
  const idealFat = (remainingFat * currentWeight) / totalRemainingWeight

  // Calculate how close this meal is to ideal
  const proteinDiff = Math.abs(meal.protein - idealProtein)
  const carbsDiff = Math.abs(meal.carbs - idealCarbs)
  const fatDiff = Math.abs(meal.fat - idealFat)

  // Weighted deviation (protein is most important)
  return (proteinDiff * 2 + carbsDiff * 1.5 + fatDiff * 1) / 4.5
}

/**
 * Calculate variety penalty
 * Penalize meals that were used too many times in the plan
 * Progressive penalty encourages variety while maintaining macro accuracy
 */
function calculateVarietyPenalty(
  mealName: string,
  usedMeals: Map<string, number>,
  maxRepetitions: number
): number {
  const timesUsed = usedMeals.get(mealName) || 0

  if (timesUsed === 0) {
    return 0 // No penalty for new meals
  } else if (timesUsed === 1) {
    return 10 // Moderate penalty for 1st repetition (balance variety & accuracy)
  } else if (timesUsed >= maxRepetitions) {
    return 5000 // Very high penalty - strongly avoid
  } else {
    return timesUsed * 30 // Progressive penalty
  }
}

/**
 * Smart meal selection - finds best match based on ideal macros and variety
 */
export function selectSmartMeal(options: MealSelectionOptions): Meal {
  const {
    type,
    budget,
    targetMacros,
    currentDayTotals,
    mealsRemaining,
    usedMealsThisWeek,
    maxRepetitionsPerWeek = 2,
  } = options

  // Get all meals of this type and budget
  const availableMeals = MEALS_DATABASE[type].filter(
    (meal) => meal.price === budget || meal.price === 'budget' // Always allow budget meals
  )

  if (availableMeals.length === 0) {
    throw new Error(`No meals found for type: ${type}, budget: ${budget}`)
  }

  // Score all meals based on weighted ideal macros
  const scoredMeals: ScoredMeal[] = availableMeals.map((meal) => {
    const macroDeviation = calculateMacroDeviation(
      meal,
      type,
      currentDayTotals,
      targetMacros,
      mealsRemaining
    )
    const varietyPenalty = calculateVarietyPenalty(
      meal.name,
      usedMealsThisWeek,
      maxRepetitionsPerWeek
    )

    const totalScore = macroDeviation + varietyPenalty

    return {
      meal,
      score: totalScore,
      macroDeviation,
      varietyPenalty,
    }
  })

  // Sort by score (lower is better)
  scoredMeals.sort((a, b) => a.score - b.score)

  // Return best match
  return scoredMeals[0].meal
}

/**
 * Generate 30-day plan with smart meal selection
 * Uses sequential balancing - each meal is selected to bring daily totals closer to target
 * Tracks variety globally across all 30 days (max 7 repetitions per meal = ~1 every 4 days)
 */
export function generate30DayPlanSmart(
  targetMacros: DayMacros,
  budget: PriceTier
): Array<{
  day: number
  meals: {
    breakfast: Meal
    lunch: Meal
    dinner: Meal
    snack: Meal
  }
  totals: DayMacros
}> {
  const plan = []

  // Track meals used globally across all 30 days for variety
  const globalMealTracker = new Map<string, number>()

  for (let day = 1; day <= 30; day++) {
    // Track running totals for this day
    let runningTotals: DayMacros = { protein: 0, carbs: 0, fat: 0, calories: 0 }

    // Select breakfast (first meal - 4 meals remaining including this one)
    const breakfast = selectSmartMeal({
      type: 'breakfast',
      budget,
      targetMacros,
      currentDayTotals: runningTotals,
      mealsRemaining: 4,
      usedMealsThisWeek: globalMealTracker,
      maxRepetitionsPerWeek: 7, // Allow max 7 times in 30 days (roughly 1x per 4-5 days)
    })
    globalMealTracker.set(breakfast.name, (globalMealTracker.get(breakfast.name) || 0) + 1)
    runningTotals = {
      protein: runningTotals.protein + breakfast.protein,
      carbs: runningTotals.carbs + breakfast.carbs,
      fat: runningTotals.fat + breakfast.fat,
      calories: runningTotals.calories + Math.round(breakfast.protein * 4 + breakfast.carbs * 4 + breakfast.fat * 9),
    }

    // Select lunch (3 meals remaining)
    const lunch = selectSmartMeal({
      type: 'lunch',
      budget,
      targetMacros,
      currentDayTotals: runningTotals,
      mealsRemaining: 3,
      usedMealsThisWeek: globalMealTracker,
      maxRepetitionsPerWeek: 7,
    })
    globalMealTracker.set(lunch.name, (globalMealTracker.get(lunch.name) || 0) + 1)
    runningTotals = {
      protein: runningTotals.protein + lunch.protein,
      carbs: runningTotals.carbs + lunch.carbs,
      fat: runningTotals.fat + lunch.fat,
      calories: runningTotals.calories + Math.round(lunch.protein * 4 + lunch.carbs * 4 + lunch.fat * 9),
    }

    // Select dinner (2 meals remaining)
    const dinner = selectSmartMeal({
      type: 'dinner',
      budget,
      targetMacros,
      currentDayTotals: runningTotals,
      mealsRemaining: 2,
      usedMealsThisWeek: globalMealTracker,
      maxRepetitionsPerWeek: 7,
    })
    globalMealTracker.set(dinner.name, (globalMealTracker.get(dinner.name) || 0) + 1)
    runningTotals = {
      protein: runningTotals.protein + dinner.protein,
      carbs: runningTotals.carbs + dinner.carbs,
      fat: runningTotals.fat + dinner.fat,
      calories: runningTotals.calories + Math.round(dinner.protein * 4 + dinner.carbs * 4 + dinner.fat * 9),
    }

    // Select snack (last meal - 1 remaining, this perfectly balances the day)
    const snack = selectSmartMeal({
      type: 'snacks',
      budget,
      targetMacros,
      currentDayTotals: runningTotals,
      mealsRemaining: 1,
      usedMealsThisWeek: globalMealTracker,
      maxRepetitionsPerWeek: 7,
    })
    globalMealTracker.set(snack.name, (globalMealTracker.get(snack.name) || 0) + 1)

    // Calculate final totals
    const totalProtein = breakfast.protein + lunch.protein + dinner.protein + snack.protein
    const totalCarbs = breakfast.carbs + lunch.carbs + dinner.carbs + snack.carbs
    const totalFat = breakfast.fat + lunch.fat + dinner.fat + snack.fat
    const totalCalories = Math.round(totalProtein * 4 + totalCarbs * 4 + totalFat * 9)

    plan.push({
      day,
      meals: {
        breakfast,
        lunch,
        dinner,
        snack,
      },
      totals: {
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
        calories: totalCalories,
      },
    })
  }

  return plan
}

/**
 * Analyze plan quality
 * Returns stats about macro accuracy and variety
 */
export function analyzePlanQuality(
  plan: Array<{ day: number; meals: any; totals: DayMacros }>,
  targetMacros: DayMacros
): {
  averageMacros: DayMacros
  macroAccuracy: {
    proteinDeviation: number
    carbsDeviation: number
    fatDeviation: number
    caloriesDeviation: number
  }
  varietyScore: {
    uniqueMeals: number
    totalMeals: number
    varietyPercentage: number
  }
} {
  // Calculate averages
  const totals = plan.reduce(
    (acc, day) => ({
      protein: acc.protein + day.totals.protein,
      carbs: acc.carbs + day.totals.carbs,
      fat: acc.fat + day.totals.fat,
      calories: acc.calories + day.totals.calories,
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 }
  )

  const averageMacros: DayMacros = {
    protein: Math.round(totals.protein / plan.length),
    carbs: Math.round(totals.carbs / plan.length),
    fat: Math.round(totals.fat / plan.length),
    calories: Math.round(totals.calories / plan.length),
  }

  // Calculate deviations
  const macroAccuracy = {
    proteinDeviation: Math.abs(averageMacros.protein - targetMacros.protein),
    carbsDeviation: Math.abs(averageMacros.carbs - targetMacros.carbs),
    fatDeviation: Math.abs(averageMacros.fat - targetMacros.fat),
    caloriesDeviation: Math.abs(averageMacros.calories - targetMacros.calories),
  }

  // Calculate variety
  const allMeals = plan.flatMap((day) => [
    day.meals.breakfast.name,
    day.meals.lunch.name,
    day.meals.dinner.name,
    day.meals.snack.name,
  ])

  const uniqueMeals = new Set(allMeals).size
  const totalMeals = allMeals.length

  return {
    averageMacros,
    macroAccuracy,
    varietyScore: {
      uniqueMeals,
      totalMeals,
      varietyPercentage: Math.round((uniqueMeals / totalMeals) * 100),
    },
  }
}
