/**
 * Test algorithm with CUT diet (lower macros)
 */

import { generate30DayPlan, calculateMacros } from '../lib/utils/meal-planner'
import { analyzePlanQuality } from '../lib/utils/smart-meal-selector'

// Test profile - CUT DIET
const age = 30
const weight = 80
const height = 175
const activityLevel = 'moderate' as const
const goal = 'cut' as const // CUT instead of bulk
const budget = 'standard' as const

console.log('=== TESTING ALGORITHM WITH CUT DIET ===\n')
console.log('Test profile:')
console.log(`  Age: ${age} years`)
console.log(`  Weight: ${weight}kg`)
console.log(`  Height: ${height}cm`)
console.log(`  Activity: ${activityLevel}`)
console.log(`  Goal: ${goal} (fat loss)`)
console.log(`  Budget: ${budget}`)
console.log('')

// Calculate target macros for CUT
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
console.log('📊 RESULTS - CUT DIET')
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

const avgAccuracy = Math.round((caloriesAccuracy + proteinAccuracy + carbsAccuracy + fatAccuracy) / 4)

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🎯 ASSESSMENT')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

if (avgAccuracy >= 90) {
  console.log('✅ EXCELLENT: Algorithm works great for CUT diet!')
  console.log(`   Average macro accuracy: ${avgAccuracy}%`)
} else if (avgAccuracy >= 80) {
  console.log('✅ GOOD: Algorithm works well for CUT diet')
  console.log(`   Average macro accuracy: ${avgAccuracy}%`)
} else {
  console.log('⚠️  NEEDS IMPROVEMENT')
  console.log(`   Average macro accuracy: ${avgAccuracy}%`)
}

console.log('')
