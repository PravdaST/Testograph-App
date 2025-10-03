/**
 * Exercise Guide Utility Functions
 */

import type { Exercise } from '../data/exercises-database'

export type FilterOptions = {
  tLevel: string // 'all' | 'Висок' | 'Среден' | 'Нисък'
  category: string // 'all' | 'Крака' | 'Гръб' | 'Гръд' | 'Рамене' | 'Кор'
}

/**
 * Filter exercises based on T-level and category
 */
export function filterExercises(
  exercises: Exercise[],
  filters: FilterOptions
): Exercise[] {
  let filtered = exercises

  // Filter by T-level
  if (filters.tLevel !== 'all') {
    filtered = filtered.filter(ex => ex.testosterone_benefit === filters.tLevel)
  }

  // Filter by category
  if (filters.category !== 'all') {
    filtered = filtered.filter(ex => ex.category === filters.category)
  }

  return filtered
}

/**
 * Get category badge color
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Крака': 'bg-blue-100 text-blue-700 border-blue-200',
    'Гръб': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Гръд': 'bg-purple-100 text-purple-700 border-purple-200',
    'Рамене': 'bg-orange-100 text-orange-700 border-orange-200',
    'Кор': 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }
  return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200'
}

/**
 * Get T-level badge color
 */
export function getTLevelColor(tLevel: string): string {
  const colors: Record<string, string> = {
    'Висок': 'bg-red-100 text-red-700 border-red-300',
    'Среден': 'bg-orange-100 text-orange-700 border-orange-300',
    'Нисък': 'bg-gray-100 text-gray-700 border-gray-300'
  }
  return colors[tLevel] || 'bg-gray-100 text-gray-700 border-gray-200'
}

/**
 * Get T-level icon
 */
export function getTLevelIcon(tLevel: string): string {
  const icons: Record<string, string> = {
    'Висок': '⬆️',
    'Среден': '↗️',
    'Нисък': '→'
  }
  return icons[tLevel] || '→'
}
