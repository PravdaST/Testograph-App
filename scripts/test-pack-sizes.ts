/**
 * Test script for Bulgarian pack sizes
 * Run with: npx ts-node scripts/test-pack-sizes.ts
 */

import { convertToPackFormat } from '../lib/data/pack-sizes-bulgaria'

console.log('=== BULGARIAN PACK SIZES TEST ===\n')

// Test cases based on real meal ingredients
const testCases = [
  { name: 'кисело мляко', qty: 200, unit: 'г', expected: '1/2 кофичка' },
  { name: 'кисело мляко', qty: 400, unit: 'г', expected: '1 кофичка' },
  { name: 'кисело мляко', qty: 650, unit: 'г', expected: '2 кофички' },
  { name: 'кисело мляко', qty: 800, unit: 'г', expected: '2 кофички' },

  { name: 'яйца', qty: 12, unit: 'бр', expected: '2 картона' },
  { name: 'яйца', qty: 30, unit: 'бр', expected: '3 картона' },

  { name: 'мляко', qty: 1000, unit: 'мл', expected: '1 кутия' },
  { name: 'мляко', qty: 2000, unit: 'мл', expected: '2 кутии' },

  { name: 'извара', qty: 250, unit: 'г', expected: '1 пакет' },
  { name: 'извара', qty: 500, unit: 'г', expected: '2 пакета' },

  { name: 'пилешки гърди', qty: 600, unit: 'г', expected: '2 опаковки' },
  { name: 'сьомга', qty: 400, unit: 'г', expected: '2 филета' },

  { name: 'ориз', qty: 500, unit: 'г', expected: '1 пакет' },
  { name: 'ориз', qty: 1000, unit: 'г', expected: '2 пакета' },

  { name: 'банан', qty: 3, unit: 'бр', expected: '3 банана' },
  { name: 'домат', qty: 5, unit: 'бр', expected: '5 домата' },
]

console.log('Testing pack size conversions:\n')

testCases.forEach((test, index) => {
  const result = convertToPackFormat(test.name, test.qty, test.unit)
  const pass = result.includes(test.expected.split(' ')[0]) ? '✅' : '❌'

  console.log(`${pass} Test ${index + 1}:`)
  console.log(`   Input: ${test.qty}${test.unit} ${test.name}`)
  console.log(`   Output: ${result}`)
  console.log(`   Expected: ${test.expected}`)
  console.log('')
})

console.log('\n=== REAL SHOPPING LIST SIMULATION ===\n')

// Simulate a week's shopping list
const weekIngredients = [
  { name: 'кисело мляко', qty: 1200, unit: 'г' },
  { name: 'яйца', qty: 24, unit: 'бр' },
  { name: 'пилешки гърди', qty: 1000, unit: 'г' },
  { name: 'ориз', qty: 700, unit: 'г' },
  { name: 'банан', qty: 7, unit: 'бр' },
  { name: 'броколи', qty: 600, unit: 'г' },
  { name: 'сьомга', qty: 360, unit: 'г' },
]

console.log('Седмица 1 - Списък за пазаруване:\n')

weekIngredients.forEach(item => {
  const formatted = convertToPackFormat(item.name, item.qty, item.unit)
  console.log(`  🛒 ${formatted}`)
})

console.log('\n=== TEST COMPLETE ===')
