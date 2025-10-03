import { MEALS_DATABASE } from '../lib/data/meals-database'

console.log('=== TARGET MACROS FOR BULK (2982 kcal) ===')
console.log('Target carbs: 341g total')
console.log('  Breakfast (29%): ~99g')
console.log('  Lunch (38%): ~130g')
console.log('  Dinner (21%): ~72g')
console.log('  Snack (12%): ~41g')
console.log('')

console.log('=== MAX CARBS AVAILABLE (Standard/Budget) ===\n')

const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snacks'> = ['breakfast', 'lunch', 'dinner', 'snacks']

mealTypes.forEach(type => {
  const typeUpper = type.charAt(0).toUpperCase() + type.slice(1)
  console.log(`${typeUpper.toUpperCase()}:`)
  const meals = MEALS_DATABASE[type]
    .filter(m => m.price === 'standard' || m.price === 'budget')
    .map(m => ({ name: m.name, carbs: m.carbs, protein: m.protein, fat: m.fat }))
    .sort((a, b) => b.carbs - a.carbs)

  meals.slice(0, 3).forEach(m => {
    console.log(`  ${m.carbs}g carbs - ${m.name} (P:${m.protein} F:${m.fat})`)
  })
  console.log('')
})
