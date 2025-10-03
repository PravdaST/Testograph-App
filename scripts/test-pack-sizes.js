/**
 * Test script for Bulgarian pack sizes
 * Run with: node scripts/test-pack-sizes.js
 */

// Simple inline implementation for testing
function convertToPackFormat(ingredientName, quantity, unit) {
  const packSizes = {
    'кисело мляко': { pack: 400, name: 'кофичка', plural: 'кофички' },
    'яйца': { pack: 10, name: 'картон', plural: 'картона' },
    'мляко': { pack: 1000, name: 'кутия', plural: 'кутии' },
    'извара': { pack: 250, name: 'пакет', plural: 'пакета' },
    'пилешки гърди': { pack: 500, name: 'опаковка', plural: 'опаковки' },
    'сьомга': { pack: 200, name: 'филе', plural: 'филета' },
    'ориз': { pack: 500, name: 'пакет', plural: 'пакета' },
    'банан': { pack: 1, name: 'банан', plural: 'банана' },
    'домат': { pack: 1, name: 'домат', plural: 'домата' },
    'броколи': { pack: 500, name: 'глава', plural: 'глави' },
  }

  const name = ingredientName.toLowerCase()
  const packInfo = packSizes[name]

  if (!packInfo) {
    return `${quantity}${unit} ${ingredientName}`
  }

  const packCount = Math.ceil(quantity / packInfo.pack)
  const packName = packCount === 1 ? packInfo.name : packInfo.plural

  if (packCount === 1) {
    return `${packInfo.name} ${ingredientName} (${packInfo.pack}${unit})`
  } else {
    return `${packCount} ${packName} ${ingredientName} (${packCount * packInfo.pack}${unit})`
  }
}

console.log('=== BULGARIAN PACK SIZES TEST ===\n')

// Test cases based on real meal ingredients
const testCases = [
  { name: 'кисело мляко', qty: 200, unit: 'г', expected: '1 кофичка (rounded up)' },
  { name: 'кисело мляко', qty: 400, unit: 'г', expected: '1 кофичка' },
  { name: 'кисело мляко', qty: 650, unit: 'г', expected: '2 кофички' },
  { name: 'кисело мляко', qty: 1200, unit: 'г', expected: '3 кофички' },

  { name: 'яйца', qty: 12, unit: 'бр', expected: '2 картона' },
  { name: 'яйца', qty: 24, unit: 'бр', expected: '3 картона' },

  { name: 'мляко', qty: 1000, unit: 'мл', expected: '1 кутия' },
  { name: 'мляко', qty: 2000, unit: 'мл', expected: '2 кутии' },

  { name: 'пилешки гърди', qty: 600, unit: 'г', expected: '2 опаковки' },
  { name: 'пилешки гърди', qty: 1000, unit: 'г', expected: '2 опаковки' },

  { name: 'сьомга', qty: 360, unit: 'г', expected: '2 филета' },

  { name: 'банан', qty: 3, unit: 'бр', expected: '3 банана' },
  { name: 'банан', qty: 7, unit: 'бр', expected: '7 банана' },
]

console.log('Testing pack size conversions:\n')

testCases.forEach((test, index) => {
  const result = convertToPackFormat(test.name, test.qty, test.unit)
  console.log(`Test ${index + 1}:`)
  console.log(`   Input: ${test.qty}${test.unit} ${test.name}`)
  console.log(`   Output: ${result}`)
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
console.log('🛒 ЯЙЦА И МЛЕЧНИ:')

weekIngredients
  .filter(i => ['кисело мляко', 'яйца'].includes(i.name))
  .forEach(item => {
    const formatted = convertToPackFormat(item.name, item.qty, item.unit)
    console.log(`   ☐ ${formatted}`)
  })

console.log('\n🛒 МЕСО И РИБА:')
weekIngredients
  .filter(i => ['пилешки гърди', 'сьомга'].includes(i.name))
  .forEach(item => {
    const formatted = convertToPackFormat(item.name, item.qty, item.unit)
    console.log(`   ☐ ${formatted}`)
  })

console.log('\n🛒 ПЛОДОВЕ И ЗЕЛЕНЧУЦИ:')
weekIngredients
  .filter(i => ['банан', 'броколи'].includes(i.name))
  .forEach(item => {
    const formatted = convertToPackFormat(item.name, item.qty, item.unit)
    console.log(`   ☐ ${formatted}`)
  })

console.log('\n🛒 ЗЪРНЕНИ:')
weekIngredients
  .filter(i => ['ориз'].includes(i.name))
  .forEach(item => {
    const formatted = convertToPackFormat(item.name, item.qty, item.unit)
    console.log(`   ☐ ${formatted}`)
  })

console.log('\n=== COMPARISON ===\n')

console.log('❌ BEFORE (confusing):')
console.log('   1200г кисело мляко  ← How many кофички???')
console.log('   24бр яйца           ← How many картона???')
console.log('   1000г пилешки гърди ← How many опаковки???')

console.log('\n✅ AFTER (crystal clear):')
weekIngredients.forEach(item => {
  const formatted = convertToPackFormat(item.name, item.qty, item.unit)
  console.log(`   ${formatted}`)
})

console.log('\n=== TEST COMPLETE ===')
