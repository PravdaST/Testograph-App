/**
 * Meal Planner Utility Functions
 * BMR, TDEE, Macro calculations and 30-day plan generation
 */

import type { Goal, DayMacros, DayPlan, PriceTier, Meal, MealType } from '../types/meal-planner'
import { getRandomMeal, MEALS_DATABASE } from '../data/meals-database'
import { generate30DayPlanSmart } from './smart-meal-selector'

/**
 * Calculate Basal Metabolic Rate (BMR)
 * Uses Mifflin-St Jeor Equation
 */
export function calculateBMR(age: number, weight: number, height: number): number {
  return 10 * weight + 6.25 * height - 5 * age + 5
}

/**
 * Get activity multiplier based on activity level
 */
export function getActivityMultiplier(activityLevel: 'sedentary' | 'light' | 'moderate' | 'very' | 'extreme'): number {
  const multipliers = {
    sedentary: 1.2,   // Офис работа, минимална активност
    light: 1.375,     // 1-2 тренировки седмично
    moderate: 1.55,   // 3-5 тренировки седмично
    very: 1.725,      // 6-7 тренировки седмично
    extreme: 1.9      // 2x дневно тренировки, физически труд
  }
  return multipliers[activityLevel]
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very' | 'extreme',
  goal: Goal
): number {
  let tdee = bmr * getActivityMultiplier(activityLevel)

  // Adjust for goal (по-консервативни проценти)
  if (goal === 'bulk') {
    tdee *= 1.10 // +10% за muscle gain (250-350 cal surplus)
  } else if (goal === 'cut') {
    tdee *= 0.85 // -15% за fat loss (300-500 cal deficit)
  }

  return tdee
}

/**
 * Calculate optimal macronutrients for testosterone optimization
 */
export function calculateMacros(
  age: number,
  weight: number,
  height: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very' | 'extreme',
  goal: Goal
): DayMacros {
  const bmr = calculateBMR(age, weight, height)
  const tdee = calculateTDEE(bmr, activityLevel, goal)

  // Macros optimized for testosterone
  const protein = weight * 1.8 // 1.8g per kg bodyweight (оптимално за muscle building)
  const fat = (tdee * 0.35) / 9 // 35% от calories от fat (важно за testosterone)
  const carbs = (tdee - (protein * 4 + fat * 9)) / 4 // Останалите calories

  return {
    calories: Math.round(tdee),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
  }
}

/**
 * Generate a 30-day meal plan (LEGACY - Random selection)
 * @deprecated Use generate30DayPlanSmart for better macro accuracy
 */
export function generate30DayPlanRandom(
  targetMacros: DayMacros,
  budget: PriceTier
): DayPlan[] {
  const plan: DayPlan[] = []

  for (let day = 1; day <= 30; day++) {
    // Select meals for the day
    const breakfast = getRandomMeal('breakfast', budget)
    const lunch = getRandomMeal('lunch', budget)
    const dinner = getRandomMeal('dinner', budget)
    const snack = getRandomMeal('snacks', budget)

    // Calculate totals
    const totalProtein = breakfast.protein + lunch.protein + dinner.protein + snack.protein
    const totalCarbs = breakfast.carbs + lunch.carbs + dinner.carbs + snack.carbs
    const totalFat = breakfast.fat + lunch.fat + dinner.fat + snack.fat
    const totalCalories = Math.round(totalProtein * 4 + totalCarbs * 4 + totalFat * 9)

    plan.push({
      day: day,
      meals: {
        breakfast: breakfast,
        lunch: lunch,
        dinner: dinner,
        snack: snack,
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
 * Generate a 30-day meal plan (SMART - Target-based selection)
 * Uses intelligent meal selection based on macro targets and variety tracking
 */
export function generate30DayPlan(
  targetMacros: DayMacros,
  budget: PriceTier
): DayPlan[] {
  return generate30DayPlanSmart(targetMacros, budget)
}

/**
 * Calculate average macros from a plan
 */
export function calculateAverageMacros(plan: DayPlan[]): DayMacros {
  const totals = plan.reduce(
    (acc, day) => ({
      calories: acc.calories + day.totals.calories,
      protein: acc.protein + day.totals.protein,
      carbs: acc.carbs + day.totals.carbs,
      fat: acc.fat + day.totals.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return {
    calories: Math.round(totals.calories / plan.length),
    protein: Math.round(totals.protein / plan.length),
    carbs: Math.round(totals.carbs / plan.length),
    fat: Math.round(totals.fat / plan.length),
  }
}

/**
 * Get normalized key from ingredient string for checkbox state
 * Examples:
 * "3 яйца (150г)" → "яйца"
 * "100г ориз" → "ориз"
 * "Яйца - 9бр" → "яйца"
 */
export function getNormalizedIngredientKey(ingredient: string): string {
  // If it's already a formatted shopping list item (contains " - ")
  if (ingredient.includes(' - ')) {
    const parts = ingredient.split(' - ')
    return parts[0].toLowerCase().trim()
  }

  // Otherwise parse it normally
  const parsed = parseIngredient(ingredient)
  return parsed.name.toLowerCase()
}

/**
 * Normalize ingredient name to singular/canonical form for aggregation
 * Handles Bulgarian singular/plural variations
 */
function normalizeIngredientName(name: string): string {
  const normalized = name.toLowerCase().trim()

  // Singular/Plural mappings
  const mappings: Record<string, string> = {
    'яйце': 'яйца',
    'домат': 'домати',
    'краставица': 'краставици',
    'тиквичка': 'тиквички',
    'морков': 'моркови',
    'картоф': 'картофи',
    'банан': 'банани',
    'ябълка': 'ябълки',
    'кюфте': 'кюфтета',
    'кебапче': 'кебапчета',
    'филия': 'филии',
  }

  return mappings[normalized] || normalized
}

/**
 * Parse ingredient string to extract quantity, unit, and name
 * Examples:
 * "3 яйца" → { quantity: 3, unit: "бр", name: "яйца", displayName: "яйца", originalUnit: "" }
 * "100г ориз" → { quantity: 100, unit: "г", name: "ориз", displayName: "ориз", originalUnit: "г" }
 * "1/2 авокадо" → { quantity: 0.5, unit: "бр", name: "авокадо", displayName: "авокадо", originalUnit: "" }
 */
export function parseIngredient(ingredient: string): {
  quantity: number
  unit: string
  name: string
  displayName: string
  originalUnit: string
} {
  // Remove parentheses content (like "(150г)")
  const cleanIngredient = ingredient.replace(/\([^)]*\)/g, '').trim()

  // Match patterns:
  // 1. "100г продукт" or "100 г продукт"
  // 2. "200мл продукт" or "200 мл продукт"
  // 3. "3 продукт"
  // 4. "1/2 продукт"

  // Try to match quantity + unit (г, мл, kg, л)
  let match = cleanIngredient.match(/^(\d+(?:[.,]\d+)?)\s*(г|мл|кг|л|kg|ml)\s+(.+)$/i)
  if (match) {
    const quantity = parseFloat(match[1].replace(',', '.'))
    const unit = match[2].toLowerCase()
    const rawName = match[3].trim()
    const name = normalizeIngredientName(rawName)
    return { quantity, unit, name, displayName: name, originalUnit: unit }
  }

  // Try to match fraction (1/2, 1/4, etc)
  match = cleanIngredient.match(/^(\d+)\/(\d+)\s+(.+)$/)
  if (match) {
    const quantity = parseInt(match[1]) / parseInt(match[2])
    const rawName = match[3].trim()
    const name = normalizeIngredientName(rawName)
    return { quantity, unit: 'бр', name, displayName: name, originalUnit: '' }
  }

  // Try to match simple number
  match = cleanIngredient.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/)
  if (match) {
    const quantity = parseFloat(match[1].replace(',', '.'))
    const rawName = match[2].trim()
    const name = normalizeIngredientName(rawName)
    return { quantity, unit: 'бр', name, displayName: name, originalUnit: '' }
  }

  // If no quantity found, assume 1
  const name = normalizeIngredientName(cleanIngredient)
  return {
    quantity: 1,
    unit: 'бр',
    name: name,
    displayName: name,
    originalUnit: ''
  }
}

/**
 * Collect ingredients for shopping list (by week) - with aggregation
 */
export function collectWeekIngredients(
  plan: DayPlan[],
  weekNumber: number
): Record<string, { quantity: number; unit: string; displayName: string }> {
  const startDay = (weekNumber - 1) * 7 + 1
  const endDay = Math.min(weekNumber * 7, 30)

  const ingredientsMap: Record<string, { quantity: number; unit: string; displayName: string }> = {}

  for (let day = startDay; day <= endDay; day++) {
    const dayData = plan.find((d) => d.day === day)
    if (!dayData) continue

    const { meals } = dayData

    // Collect from all meals
    ;[meals.breakfast, meals.lunch, meals.dinner, meals.snack].forEach((meal) => {
      meal.ingredients.forEach((ingredient) => {
        const parsed = parseIngredient(ingredient)
        const key = parsed.name.toLowerCase()

        if (ingredientsMap[key]) {
          // Same product exists - add quantity if units match
          if (ingredientsMap[key].unit === parsed.unit) {
            ingredientsMap[key].quantity += parsed.quantity
          } else {
            // Different units - keep separate for now
            const newKey = `${key}_${parsed.unit}`
            if (ingredientsMap[newKey]) {
              ingredientsMap[newKey].quantity += parsed.quantity
            } else {
              ingredientsMap[newKey] = {
                quantity: parsed.quantity,
                unit: parsed.unit,
                displayName: parsed.displayName
              }
            }
          }
        } else {
          ingredientsMap[key] = {
            quantity: parsed.quantity,
            unit: parsed.unit,
            displayName: parsed.displayName
          }
        }
      })
    })
  }

  return ingredientsMap
}

/**
 * Categorize ingredients for shopping list
 */
export function categorizeIngredients(
  ingredients: Record<string, { quantity: number; unit: string; displayName: string }>
): Record<string, Array<{ name: string; count: number }>> {
  const categories: Record<string, Array<{ name: string; count: number }>> = {
    'Месо и риба': [],
    'Яйца и млечни': [],
    'Плодове и зеленчуци': [],
    Зърнени: [],
    Други: [],
  }

  Object.entries(ingredients).forEach(([key, data]) => {
    const { quantity, unit, displayName } = data

    // Show exact quantity needed - user decides how many packs to buy
    // Examples: "яйца (11бр)", "кисело мляко (1200г)"
    const formattedName = `${displayName} (${quantity}${unit})`

    const item = { name: formattedName, count: 1 }

    // Categorize using regex patterns on displayName
    if (
      displayName.match(
        /месо|пилешк|свинск|телешк|говежд|риба|сьомга|тон|скумрия|пъстърва|кюфте|ребра|шунка|кебапче|котлет|скарид/i
      )
    ) {
      categories['Месо и риба'].push(item)
    } else if (displayName.match(/яйц|мляко|сирене|кашкавал|извара|кисело мляко|фета/i)) {
      categories['Яйца и млечни'].push(item)
    } else if (
      displayName.match(
        /домат|краставиц|салат|зеленчуц|броколи|спанак|моркови|тиквич|гъби|авокадо|зеле|лук|чесън|аспержи|боровинк|ябълк|банан|лимон/i
      )
    ) {
      categories['Плодове и зеленчуци'].push(item)
    } else if (displayName.match(/ориз|хляб|паста|овесен|мюсли|киноа|булгур|кус-кус|фили/i)) {
      categories['Зърнени'].push(item)
    } else {
      categories['Други'].push(item)
    }
  })

  return categories
}

/**
 * Find similar meals based on macros (±15% tolerance)
 * Used for meal swapping functionality
 */
export function findSimilarMeals(
  targetMeal: Meal,
  mealType: MealType,
  budget: PriceTier,
  tolerance: number = 0.15 // 15% tolerance
): Meal[] {
  const availableMeals = MEALS_DATABASE[mealType].filter(
    (meal) => meal.name !== targetMeal.name && // Exclude current meal
    (meal.price === budget || meal.price === 'budget') // Match budget or allow budget meals
  )

  // Calculate macro deviation for each meal
  const scoredMeals = availableMeals.map((meal) => {
    const proteinDiff = Math.abs(meal.protein - targetMeal.protein) / targetMeal.protein
    const carbsDiff = Math.abs(meal.carbs - targetMeal.carbs) / targetMeal.carbs
    const fatDiff = Math.abs(meal.fat - targetMeal.fat) / targetMeal.fat

    // Average deviation
    const avgDeviation = (proteinDiff + carbsDiff + fatDiff) / 3

    return {
      meal,
      deviation: avgDeviation
    }
  })

  // Filter meals within tolerance and sort by similarity
  return scoredMeals
    .filter((item) => item.deviation <= tolerance)
    .sort((a, b) => a.deviation - b.deviation)
    .slice(0, 5) // Return top 5 matches
    .map((item) => item.meal)
}
