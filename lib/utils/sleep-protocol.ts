/**
 * Sleep Protocol Utility Functions
 */

import type { SleepAssessment, RoutineStep, BedroomChecklistItem, SleepLog, SleepStats } from '../types/sleep-protocol'

/**
 * Generate personalized evening routine based on assessment
 */
export function generateEveningRoutine(assessment: SleepAssessment): RoutineStep[] {
  const [hours, minutes] = assessment.bedtime.split(':').map(Number)

  // Calculate times backwards from bedtime
  const getTimeString = (hoursBack: number, minutesBack: number = 0) => {
    const totalMinutes = hours * 60 + minutes - (hoursBack * 60 + minutesBack)
    const h = Math.floor(totalMinutes / 60) % 24
    const m = totalMinutes % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const routine: RoutineStep[] = [
    {
      time: getTimeString(2, 0),
      title: 'Спри екраните',
      description: 'Изключи телефона, компютъра и телевизора. Синята светлина блокира мелатонина.',
      icon: 'screen-off'
    },
    {
      time: getTimeString(1, 30),
      title: 'Хранителни добавки',
      description: 'Вземи Melatonin 5mg + Magnesium 400mg за подобряване на качеството на съня.',
      icon: 'pill'
    },
    {
      time: getTimeString(1, 10),
      title: 'Леко разтягане',
      description: '10-15 минути леко разтягане или йога за релаксация на мускулите.',
      icon: 'stretch'
    },
    {
      time: getTimeString(1, 0),
      title: 'Топъл душ/вана',
      description: 'Топлата вода помага за релаксация. Спадането на температурата след душа подготвя тялото за сън.',
      icon: 'shower'
    },
    {
      time: getTimeString(0, 30),
      title: 'Четене или медитация',
      description: 'Прочети книга (не от екран) или медитирай 10-20 минути.',
      icon: 'book'
    },
    {
      time: getTimeString(0, 15),
      title: 'Подготви спалнята',
      description: 'Провери температурата (18-20°C), тъмнината и проветри стаята.',
      icon: 'bed-prep'
    },
    {
      time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      title: 'Лягай',
      description: 'Време е за сън. Спалнята е оптимизирана и тялото ти е готово.',
      icon: 'sleep'
    }
  ]

  return routine
}

/**
 * Get default bedroom checklist items
 */
export function getDefaultChecklistItems(): BedroomChecklistItem[] {
  return [
    {
      id: 'darkness',
      title: 'Пълна тъмнина',
      description: 'Blackout завеси или плътна маска за сън. Дори малка светлина намалява мелатонина.',
      completed: false
    },
    {
      id: 'temperature',
      title: 'Оптимална температура',
      description: '18-20°C (64-68°F) е идеалната температура за дълбок сън.',
      completed: false
    },
    {
      id: 'electronics',
      title: 'Без електроника',
      description: 'Премахни всички устройства или постави на 2+ метра от леглото.',
      completed: false
    },
    {
      id: 'phone',
      title: 'Телефон извън стаята',
      description: 'Постави телефона в друга стая или използвай будилник вместо телефона.',
      completed: false
    },
    {
      id: 'mattress',
      title: 'Качествен матрак',
      description: 'Матракът трябва да е удобен и не по-стар от 7-10 години.',
      completed: false
    },
    {
      id: 'bedding',
      title: 'Качествено спално бельо',
      description: 'Памучни или бамбукови материи, които дишат.',
      completed: false
    },
    {
      id: 'noise',
      title: 'Бял шум или вентилатор',
      description: 'Помага за маскиране на външни звуци и създава равномерен фон.',
      completed: false
    },
    {
      id: 'clutter',
      title: 'Без безпорядък',
      description: 'Чиста и подредена стая намалява стреса и подобрява съня.',
      completed: false
    },
    {
      id: 'eye-mask',
      title: 'Маска за сън',
      description: 'Ако не можеш да постигнеш пълна тъмнина, използвай удобна маска.',
      completed: false
    },
    {
      id: 'air-quality',
      title: 'Чист въздух',
      description: 'Проветри преди сън или използвай въздухопречиствател.',
      completed: false
    }
  ]
}

/**
 * Calculate sleep hours from bedtime and waketime
 */
export function calculateSleepHours(bedtime: string, waketime: string): number {
  const [bedHours, bedMinutes] = bedtime.split(':').map(Number)
  const [wakeHours, wakeMinutes] = waketime.split(':').map(Number)

  let bedMinutesTotal = bedHours * 60 + bedMinutes
  let wakeMinutesTotal = wakeHours * 60 + wakeMinutes

  // If wake time is earlier (next day), add 24 hours
  if (wakeMinutesTotal < bedMinutesTotal) {
    wakeMinutesTotal += 24 * 60
  }

  const sleepMinutes = wakeMinutesTotal - bedMinutesTotal
  return Math.round((sleepMinutes / 60) * 10) / 10 // Round to 1 decimal
}

/**
 * Calculate sleep statistics
 */
export function calculateSleepStats(logs: SleepLog[]): SleepStats {
  if (logs.length === 0) {
    return {
      avg7DayQuality: 0,
      avg7DayHours: 0,
      avg30DayQuality: 0,
      avg30DayHours: 0
    }
  }

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const last7 = sortedLogs.slice(0, 7)
  const last30 = sortedLogs.slice(0, 30)

  const avg7Quality = last7.length > 0
    ? last7.reduce((sum, log) => sum + log.quality, 0) / last7.length
    : 0

  const avg7Hours = last7.length > 0
    ? last7.reduce((sum, log) => sum + log.hours, 0) / last7.length
    : 0

  const avg30Quality = last30.length > 0
    ? last30.reduce((sum, log) => sum + log.quality, 0) / last30.length
    : 0

  const avg30Hours = last30.length > 0
    ? last30.reduce((sum, log) => sum + log.hours, 0) / last30.length
    : 0

  return {
    avg7DayQuality: Math.round(avg7Quality * 10) / 10,
    avg7DayHours: Math.round(avg7Hours * 10) / 10,
    avg30DayQuality: Math.round(avg30Quality * 10) / 10,
    avg30DayHours: Math.round(avg30Hours * 10) / 10
  }
}

/**
 * Get chart data for last 7 days
 */
export function getChartData(logs: SleepLog[]) {
  const sortedLogs = [...logs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)

  return {
    labels: sortedLogs.map(log => {
      const date = new Date(log.date)
      return date.toLocaleDateString('bg-BG', { weekday: 'short', day: 'numeric' })
    }),
    quality: sortedLogs.map(log => log.quality),
    hours: sortedLogs.map(log => log.hours)
  }
}
