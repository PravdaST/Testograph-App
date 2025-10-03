/**
 * Lab Testing Utility Functions
 */

import type { Lab } from '../data/labs-database'
import type {
  InterpretationInput,
  InterpretationResult,
  AgeRange,
  LabResult
} from '../types/lab-testing'

/**
 * Filter labs by city
 */
export function filterLabsByCity(labs: Lab[], city: string): Lab[] {
  if (city === 'all') return labs
  return labs.filter(lab => lab.city === city)
}

/**
 * Search labs by name or address
 */
export function searchLabs(labs: Lab[], query: string): Lab[] {
  if (!query.trim()) return labs

  const lowerQuery = query.toLowerCase()
  return labs.filter(lab =>
    lab.name.toLowerCase().includes(lowerQuery) ||
    lab.address.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get age range for interpretation
 */
export function getAgeRange(age: number): AgeRange {
  if (age <= 30) return '20-30'
  if (age <= 40) return '30-40'
  if (age <= 50) return '40-50'
  return '50+'
}

/**
 * Interpret testosterone results based on age
 */
export function interpretResults(input: InterpretationInput): InterpretationResult {
  const ageRange = getAgeRange(input.age)

  // Age-specific reference ranges
  const ranges: Record<AgeRange, { optimal: [number, number], low: number }> = {
    '20-30': { optimal: [600, 900], low: 300 },
    '30-40': { optimal: [500, 800], low: 270 },
    '40-50': { optimal: [450, 700], low: 250 },
    '50+': { optimal: [400, 600], low: 230 }
  }

  const range = ranges[ageRange]
  const [optimalMin, optimalMax] = range.optimal

  // Determine overall status
  let status: 'optimal' | 'suboptimal' | 'low'
  let statusLabel: string
  let totalTStatus: string

  if (input.total_t < range.low) {
    status = 'low'
    statusLabel = 'Нисък'
    totalTStatus = `${input.total_t} ng/dL - НИСЪК (под ${range.low} ng/dL)`
  } else if (input.total_t < optimalMin) {
    status = 'suboptimal'
    statusLabel = 'Субоптимален'
    totalTStatus = `${input.total_t} ng/dL - Субоптимален (под оптималния ${optimalMin}-${optimalMax} ng/dL)`
  } else if (input.total_t <= optimalMax) {
    status = 'optimal'
    statusLabel = 'Оптимален'
    totalTStatus = `${input.total_t} ng/dL - ОПТИМАЛЕН`
  } else {
    status = 'optimal'
    statusLabel = 'Над оптималния'
    totalTStatus = `${input.total_t} ng/dL - НАД оптималния ${optimalMin}-${optimalMax} ng/dL`
  }

  // Free T interpretation (optional)
  let freeTStatus: string | undefined
  if (input.free_t !== undefined) {
    if (input.free_t < 9) {
      freeTStatus = `${input.free_t} pg/mL - НИСЪК (норма: 9-30 pg/mL)`
    } else if (input.free_t <= 30) {
      freeTStatus = `${input.free_t} pg/mL - Нормален`
    } else {
      freeTStatus = `${input.free_t} pg/mL - НАД нормата`
    }
  }

  // SHBG interpretation (optional)
  let shbgStatus: string | undefined
  if (input.shbg !== undefined) {
    if (input.shbg < 10) {
      shbgStatus = `${input.shbg} nmol/L - НИСЪК (може да намали Free T)`
    } else if (input.shbg <= 50) {
      shbgStatus = `${input.shbg} nmol/L - Нормален`
    } else {
      shbgStatus = `${input.shbg} nmol/L - ВИСОК (намалява Free T)`
    }
  }

  // Estradiol interpretation (optional)
  let estradiolStatus: string | undefined
  if (input.estradiol !== undefined) {
    if (input.estradiol < 10) {
      estradiolStatus = `${input.estradiol} pg/mL - НИСЪК`
    } else if (input.estradiol <= 40) {
      estradiolStatus = `${input.estradiol} pg/mL - Оптимален`
    } else {
      estradiolStatus = `${input.estradiol} pg/mL - ВИСОК (може да се нуждае от контрол)`
    }
  }

  // Generate recommendations
  const recommendations = generateRecommendations(status, input)

  return {
    status,
    statusLabel,
    totalTStatus,
    freeTStatus,
    shbgStatus,
    estradiolStatus,
    ageRange,
    optimalRange: range.optimal,
    recommendations
  }
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(
  status: 'optimal' | 'suboptimal' | 'low',
  input: InterpretationInput
): string[] {
  const recs: string[] = []

  if (status === 'low') {
    recs.push('🔴 Консултация с ендокринолог е препоръчителна')
    recs.push('Фокус върху основните: сън 7-9 часа, тежки тренировки, храна с достатъчно мазнини')
    recs.push('Избягвай алкохол, обработена храна и стрес')
  } else if (status === 'suboptimal') {
    recs.push('🟡 Има място за подобрение с правилни навици')
    recs.push('Увеличи приема на цинк (15-30 мг), витамин D3 (4000 IU) и магнезий (400 мг)')
    recs.push('Добави compound упражнения: клякания, мъртва тяга, лежанка')
    recs.push('Оптимизирай съня: 7-9 часа, тъмна стая, без екрани 2 часа преди сън')
  } else {
    recs.push('🟢 Отличен резултат! Продължавай в същата посока')
    recs.push('Поддържай редовни тренировки и качествен сън')
    recs.push('Следи нивата периодично (на всеки 3-6 месеца)')
  }

  // SHBG specific
  if (input.shbg !== undefined && input.shbg > 50) {
    recs.push('⚠️ Високото SHBG намалява свободния тестостерон. Помагат: бор, крапива, магнезий')
  }

  // Estradiol specific
  if (input.estradiol !== undefined && input.estradiol > 40) {
    recs.push('⚠️ Високият естрадиол може да се контролира с добавки: DIM, цинк, витамин E')
  }

  return recs
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: 'optimal' | 'suboptimal' | 'low'): string {
  const colors = {
    optimal: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    suboptimal: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    low: 'bg-red-50 border-red-200 text-red-900'
  }
  return colors[status]
}

/**
 * Calculate progress improvement
 */
export function calculateImprovement(results: LabResult[]): {
  first: number
  last: number
  change: number
  changePercent: number
} | null {
  if (results.length < 2) return null

  const sortedResults = [...results].sort((a, b) =>
    new Date(a.test_date).getTime() - new Date(b.test_date).getTime()
  )

  const first = sortedResults[0].total_t
  const last = sortedResults[sortedResults.length - 1].total_t
  const change = last - first
  const changePercent = (change / first) * 100

  return { first, last, change, changePercent }
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('bg-BG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Export results to CSV
 */
export function exportToCSV(results: LabResult[]): string {
  const headers = ['Дата', 'Total T (ng/dL)', 'Free T (pg/mL)', 'SHBG (nmol/L)', 'Estradiol (pg/mL)', 'LH (mIU/mL)', 'Бележки']

  const rows = results.map(r => [
    r.test_date,
    r.total_t,
    r.free_t || '',
    r.shbg || '',
    r.estradiol || '',
    r.lh || '',
    r.notes || ''
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  return csv
}
