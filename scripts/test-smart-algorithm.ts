/**
 * Test the new Sequential Balancing Algorithm
 * Generates a real 30-day plan and shows accuracy stats
 */

import { generate30DayPlan, calculateMacros } from '../lib/utils/meal-planner'
import { analyzePlanQuality } from '../lib/utils/smart-meal-selector'

// Test profile
const age = 30
const weight = 80
const height = 175
const activityLevel = 'moderate' as const
const goal = 'bulk' as const
const budget = 'standard' as const

console.log('=== TESTING NEW SEQUENTIAL BALANCING ALGORITHM ===\n')
console.log('Test profile:')
console.log(`  Age: ${age} years`)
console.log(`  Weight: ${weight}kg`)
console.log(`  Height: ${height}cm`)
console.log(`  Activity: ${activityLevel}`)
console.log(`  Goal: ${goal}`)
console.log(`  Budget: ${budget}`)
console.log('')

// Calculate target macros
const targetMacros = calculateMacros(age, weight, height, activityLevel, goal)

console.log('TARGET MACROS:')
console.log(`  Calories: ${targetMacros.calories} kcal`)
console.log(`  Protein:  ${targetMacros.protein}g`)
console.log(`  Carbs:    ${targetMacros.carbs}g`)
console.log(`  Fat:      ${targetMacros.fat}g`)
console.log('')

// Generate plan
console.log('Generating 30-day plan...')
const plan = generate30DayPlan(targetMacros, budget)

// Analyze plan
const analysis = analyzePlanQuality(plan, targetMacros)

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📊 RESULTS - Sequential Balancing Algorithm')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('AVERAGE MACROS:')
console.log(`  Calories: ${analysis.averageMacros.calories} kcal  (${analysis.averageMacros.calories > targetMacros.calories ? '+' : ''}${analysis.averageMacros.calories - targetMacros.calories} deviation)`)
console.log(`  Protein:  ${analysis.averageMacros.protein}g      (${analysis.averageMacros.protein > targetMacros.protein ? '+' : ''}${analysis.averageMacros.protein - targetMacros.protein}g deviation)`)
console.log(`  Carbs:    ${analysis.averageMacros.carbs}g      (${analysis.averageMacros.carbs > targetMacros.carbs ? '+' : ''}${analysis.averageMacros.carbs - targetMacros.carbs}g deviation)`)
console.log(`  Fat:      ${analysis.averageMacros.fat}g      (${analysis.averageMacros.fat > targetMacros.fat ? '+' : ''}${analysis.averageMacros.fat - targetMacros.fat}g deviation)`)
console.log('')

console.log('ACCURACY:')
const caloriesAccuracy = Math.round((1 - analysis.macroAccuracy.caloriesDeviation / targetMacros.calories) * 100)
const proteinAccuracy = Math.round((1 - analysis.macroAccuracy.proteinDeviation / targetMacros.protein) * 100)
const carbsAccuracy = Math.round((1 - analysis.macroAccuracy.carbsDeviation / targetMacros.carbs) * 100)
const fatAccuracy = Math.round((1 - analysis.macroAccuracy.fatDeviation / targetMacros.fat) * 100)

console.log(`  Calories: ${caloriesAccuracy}%`)
console.log(`  Protein:  ${proteinAccuracy}%`)
console.log(`  Carbs:    ${carbsAccuracy}%`)
console.log(`  Fat:      ${fatAccuracy}%`)
console.log('')

console.log('VARIETY:')
console.log(`  Unique meals: ${analysis.varietyScore.uniqueMeals} / ${analysis.varietyScore.totalMeals}`)
console.log(`  Variety score: ${analysis.varietyScore.varietyPercentage}%`)
console.log('')

// Show first 3 days as examples
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📋 SAMPLE DAYS (First 3 days)')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

plan.slice(0, 3).forEach((day) => {
  console.log(`DAY ${day.day}:`)
  console.log(`  🥐 Breakfast: ${day.meals.breakfast.name} (P:${day.meals.breakfast.protein}g C:${day.meals.breakfast.carbs}g F:${day.meals.breakfast.fat}g)`)
  console.log(`  🍽️  Lunch:     ${day.meals.lunch.name} (P:${day.meals.lunch.protein}g C:${day.meals.lunch.carbs}g F:${day.meals.lunch.fat}g)`)
  console.log(`  🍲 Dinner:    ${day.meals.dinner.name} (P:${day.meals.dinner.protein}g C:${day.meals.dinner.carbs}g F:${day.meals.dinner.fat}g)`)
  console.log(`  🥜 Snack:     ${day.meals.snack.name} (P:${day.meals.snack.protein}g C:${day.meals.snack.carbs}g F:${day.meals.snack.fat}g)`)
  console.log(`  📊 TOTALS:    P:${day.totals.protein}g C:${day.totals.carbs}g F:${day.totals.fat}g = ${day.totals.calories} kcal`)
  const dayDeviation = Math.abs(day.totals.calories - targetMacros.calories)
  console.log(`  ✅ Accuracy:  ${Math.round((1 - dayDeviation / targetMacros.calories) * 100)}%`)
  console.log('')
})

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🎯 ASSESSMENT')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const avgAccuracy = Math.round((caloriesAccuracy + proteinAccuracy + carbsAccuracy + fatAccuracy) / 4)

if (avgAccuracy >= 95) {
  console.log('✅ EXCELLENT: Algorithm is working perfectly!')
  console.log(`   Average macro accuracy: ${avgAccuracy}%`)
} else if (avgAccuracy >= 85) {
  console.log('✅ GOOD: Algorithm is working well')
  console.log(`   Average macro accuracy: ${avgAccuracy}%`)
} else {
  console.log('⚠️  NEEDS IMPROVEMENT: Algorithm needs tuning')
  console.log(`   Average macro accuracy: ${avgAccuracy}%`)
}

console.log('')
