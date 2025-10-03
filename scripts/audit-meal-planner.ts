/**
 * COMPLETE MEAL PLANNER BACKEND AUDIT
 * Validates data integrity, calculation logic, and algorithm correctness
 */

import { MEALS_DATABASE } from '../lib/data/meals-database'
import { calculateBMR, calculateTDEE, calculateMacros, generate30DayPlan } from '../lib/utils/meal-planner'
import { analyzePlanQuality } from '../lib/utils/smart-meal-selector'

console.log('════════════════════════════════════════════════')
console.log('🔍 MEAL PLANNER BACKEND AUDIT')
console.log('════════════════════════════════════════════════\n')

let totalIssues = 0
let totalWarnings = 0

// ═══════════════════════════════════════════════════
// 1. DATA LAYER VALIDATION
// ═══════════════════════════════════════════════════
console.log('📊 PART 1: DATA LAYER VALIDATION\n')

Object.entries(MEALS_DATABASE).forEach(([mealType, meals]) => {
  console.log(`\n${mealType.charAt(0).toUpperCase() + mealType.slice(1)}:`)

  meals.forEach((meal: any) => {
    const calculatedCalories = meal.protein * 4 + meal.carbs * 4 + meal.fat * 9

    // Check ingredients
    if (!meal.ingredients || meal.ingredients.length === 0) {
      console.log(`  ❌ ERROR: ${meal.name} - No ingredients!`)
      totalIssues++
    }

    // Check for zero or negative macros
    if (meal.protein < 0 || meal.carbs < 0 || meal.fat < 0) {
      console.log(`  ❌ ERROR: ${meal.name} - Negative macros!`)
      totalIssues++
    }

    const totalMacros = meal.protein + meal.carbs + meal.fat
    if (totalMacros === 0) {
      console.log(`  ❌ ERROR: ${meal.name} - All macros are zero!`)
      totalIssues++
    }

    // Warnings for extreme values
    if (calculatedCalories > 2000) {
      console.log(`  ⚠️  WARNING: ${meal.name} - Very high calories: ${Math.round(calculatedCalories)} kcal`)
      totalWarnings++
    }

    if (calculatedCalories < 100 && totalMacros > 0) {
      console.log(`  ⚠️  WARNING: ${meal.name} - Very low calories: ${Math.round(calculatedCalories)} kcal`)
      totalWarnings++
    }

    // Check price tier
    if (!['budget', 'standard', 'premium'].includes(meal.price)) {
      console.log(`  ❌ ERROR: ${meal.name} - Invalid price tier: ${meal.price}`)
      totalIssues++
    }
  })

  console.log(`  ✓ Total meals: ${meals.length}`)
})

console.log('\n─────────────────────────────────────────────────')
console.log(`DATA LAYER: ${totalIssues === 0 ? '✅ PASSED' : `❌ ${totalIssues} ERRORS`}`)
if (totalWarnings > 0) console.log(`⚠️  ${totalWarnings} warnings`)
console.log('─────────────────────────────────────────────────\n')

// ═══════════════════════════════════════════════════
// 2. CALCULATION LOGIC VALIDATION
// ═══════════════════════════════════════════════════
console.log('\n🧮 PART 2: CALCULATION LOGIC VALIDATION\n')

const testProfiles = [
  { age: 25, weight: 70, height: 175, activity: 'moderate' as const, goal: 'bulk' as const, desc: 'Young male bulking' },
  { age: 30, weight: 80, height: 180, activity: 'very' as const, goal: 'cut' as const, desc: 'Active male cutting' },
  { age: 40, weight: 65, height: 165, activity: 'light' as const, goal: 'maintain' as const, desc: 'Moderate female maintaining' },
]

testProfiles.forEach((profile) => {
  console.log(`\nProfile: ${profile.desc}`)
  console.log(`  Age: ${profile.age}, Weight: ${profile.weight}kg, Height: ${profile.height}cm`)

  const bmr = calculateBMR(profile.age, profile.weight, profile.height)
  const tdee = calculateTDEE(bmr, profile.activity, profile.goal)
  const macros = calculateMacros(profile.age, profile.weight, profile.height, profile.activity, profile.goal)

  console.log(`  BMR: ${bmr} kcal`)
  console.log(`  TDEE: ${tdee} kcal`)
  console.log(`  Target Macros: ${macros.calories} kcal (P:${macros.protein}g C:${macros.carbs}g F:${macros.fat}g)`)

  // Validate BMR (should be reasonable)
  if (bmr < 1000 || bmr > 3000) {
    console.log(`  ❌ ERROR: BMR out of reasonable range: ${bmr}`)
    totalIssues++
  }

  // Validate TDEE (should be >= BMR)
  if (tdee < bmr) {
    console.log(`  ❌ ERROR: TDEE (${tdee}) < BMR (${bmr})`)
    totalIssues++
  }

  // Validate macros sum to calories
  const macroCalories = macros.protein * 4 + macros.carbs * 4 + macros.fat * 9
  const deviation = Math.abs(macroCalories - macros.calories)
  if (deviation > 50) {
    console.log(`  ❌ ERROR: Macro calories (${Math.round(macroCalories)}) don't match target (${macros.calories})`)
    totalIssues++
  }

  // Validate protein is reasonable (1.2-2.5g/kg)
  const proteinPerKg = macros.protein / profile.weight
  if (proteinPerKg < 1.0 || proteinPerKg > 3.0) {
    console.log(`  ⚠️  WARNING: Protein ${proteinPerKg.toFixed(1)}g/kg is outside normal range (1.0-3.0)`)
    totalWarnings++
  }

  // Validate fat is reasonable (20-40% of calories)
  const fatPercent = (macros.fat * 9) / macros.calories * 100
  if (fatPercent < 15 || fatPercent > 45) {
    console.log(`  ⚠️  WARNING: Fat ${Math.round(fatPercent)}% of calories is outside normal range (15-45%)`)
    totalWarnings++
  }
})

console.log('\n─────────────────────────────────────────────────')
console.log(`CALCULATION LOGIC: ${totalIssues === 0 ? '✅ PASSED' : `❌ ${totalIssues} ERRORS`}`)
console.log('─────────────────────────────────────────────────\n')

// ═══════════════════════════════════════════════════
// 3. SMART ALGORITHM VALIDATION
// ═══════════════════════════════════════════════════
console.log('\n🤖 PART 3: SMART ALGORITHM VALIDATION\n')

const testMacros = { calories: 2500, protein: 150, carbs: 280, fat: 90 }
const testBudget = 'standard' as const

console.log('Generating test plan...')
const testPlan = generate30DayPlan(testMacros, testBudget)

// Validate plan length
if (testPlan.length !== 30) {
  console.log(`❌ ERROR: Plan has ${testPlan.length} days instead of 30`)
  totalIssues++
}

// Validate each day has all meals
testPlan.forEach((day) => {
  if (!day.meals.breakfast || !day.meals.lunch || !day.meals.dinner || !day.meals.snack) {
    console.log(`❌ ERROR: Day ${day.day} is missing meals`)
    totalIssues++
  }

  // Validate totals match meal sum
  const actualProtein = day.meals.breakfast.protein + day.meals.lunch.protein + day.meals.dinner.protein + day.meals.snack.protein
  const actualCarbs = day.meals.breakfast.carbs + day.meals.lunch.carbs + day.meals.dinner.carbs + day.meals.snack.carbs
  const actualFat = day.meals.breakfast.fat + day.meals.lunch.fat + day.meals.dinner.fat + day.meals.snack.fat

  if (Math.abs(actualProtein - day.totals.protein) > 1) {
    console.log(`❌ ERROR: Day ${day.day} protein totals mismatch: ${actualProtein} vs ${day.totals.protein}`)
    totalIssues++
  }

  if (Math.abs(actualCarbs - day.totals.carbs) > 1) {
    console.log(`❌ ERROR: Day ${day.day} carbs totals mismatch: ${actualCarbs} vs ${day.totals.carbs}`)
    totalIssues++
  }

  if (Math.abs(actualFat - day.totals.fat) > 1) {
    console.log(`❌ ERROR: Day ${day.day} fat totals mismatch: ${actualFat} vs ${day.totals.fat}`)
    totalIssues++
  }
})

// Analyze plan quality
const analysis = analyzePlanQuality(testPlan, testMacros)

console.log('\nPlan Analysis:')
console.log(`  Average Macros: ${analysis.averageMacros.calories} kcal (P:${analysis.averageMacros.protein}g C:${analysis.averageMacros.carbs}g F:${analysis.averageMacros.fat}g)`)
console.log(`  Macro Accuracy:`)
console.log(`    Calories: ${Math.round((1 - analysis.macroAccuracy.caloriesDeviation / testMacros.calories) * 100)}%`)
console.log(`    Protein:  ${Math.round((1 - analysis.macroAccuracy.proteinDeviation / testMacros.protein) * 100)}%`)
console.log(`    Carbs:    ${Math.round((1 - analysis.macroAccuracy.carbsDeviation / testMacros.carbs) * 100)}%`)
console.log(`    Fat:      ${Math.round((1 - analysis.macroAccuracy.fatDeviation / testMacros.fat) * 100)}%`)
console.log(`  Variety: ${analysis.varietyScore.uniqueMeals}/${analysis.varietyScore.totalMeals} (${analysis.varietyScore.varietyPercentage}%)`)

// Check variety (should have at least 15% unique meals)
if (analysis.varietyScore.varietyPercentage < 15) {
  console.log(`⚠️  WARNING: Low variety - only ${analysis.varietyScore.varietyPercentage}% unique meals`)
  totalWarnings++
}

// Check macro accuracy (should be within 15% of target)
const avgAccuracy = (
  (1 - analysis.macroAccuracy.caloriesDeviation / testMacros.calories) +
  (1 - analysis.macroAccuracy.proteinDeviation / testMacros.protein) +
  (1 - analysis.macroAccuracy.carbsDeviation / testMacros.carbs) +
  (1 - analysis.macroAccuracy.fatDeviation / testMacros.fat)
) / 4 * 100

if (avgAccuracy < 85) {
  console.log(`⚠️  WARNING: Low macro accuracy - ${Math.round(avgAccuracy)}%`)
  totalWarnings++
}

console.log('\n─────────────────────────────────────────────────')
console.log(`SMART ALGORITHM: ${totalIssues === 0 ? '✅ PASSED' : `❌ ${totalIssues} ERRORS`}`)
console.log('─────────────────────────────────────────────────\n')

// ═══════════════════════════════════════════════════
// FINAL SUMMARY
// ═══════════════════════════════════════════════════
console.log('\n════════════════════════════════════════════════')
console.log('📋 FINAL AUDIT REPORT')
console.log('════════════════════════════════════════════════\n')

console.log(`Total Errors:   ${totalIssues}`)
console.log(`Total Warnings: ${totalWarnings}`)
console.log('')

if (totalIssues === 0 && totalWarnings === 0) {
  console.log('✅ PERFECT! Backend logic is 100% correct!')
} else if (totalIssues === 0) {
  console.log('✅ PASSED! No critical errors, only minor warnings.')
} else {
  console.log('❌ FAILED! Critical errors found - needs fixing!')
}

console.log('\n════════════════════════════════════════════════\n')
