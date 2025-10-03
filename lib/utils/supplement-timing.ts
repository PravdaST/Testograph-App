/**
 * Supplement Timing Utility Functions
 */

import type { Supplement } from '../data/supplements-database'

export type WorkoutTime = 'morning' | 'lunch' | 'evening' | 'none'

export interface ScheduleEntry {
  time: string // HH:MM format
  supplements: Supplement[]
  label: string // e.g., "Сутрин (15 мин след събуждане)"
}

export interface UserSchedule {
  wakeTime: string
  workoutTime: WorkoutTime
}

/**
 * Calculate time by adding/subtracting minutes
 */
function calculateTime(baseTime: string, minutesOffset: number): string {
  const [hours, minutes] = baseTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + minutesOffset
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMinutes = totalMinutes % 60
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
}

/**
 * Get workout times based on selection
 */
function getWorkoutTimes(wakeTime: string, workoutTime: WorkoutTime) {
  if (workoutTime === 'none') {
    return {
      preWorkout: null,
      postWorkout: calculateTime(wakeTime, 5 * 60) // Lunch time as default
    }
  }

  const workoutMap = {
    morning: calculateTime(wakeTime, 60), // 1 hour after wake
    lunch: calculateTime(wakeTime, 5 * 60), // 5 hours after wake (12:00 if wake at 7:00)
    evening: calculateTime(wakeTime, 10 * 60) // 10 hours after wake (17:00 if wake at 7:00)
  }

  const workout = workoutMap[workoutTime]

  return {
    preWorkout: calculateTime(workout, -30), // 30 min before
    postWorkout: calculateTime(workout, 15) // 15 min after
  }
}

/**
 * Generate personalized supplement schedule
 */
export function generateSchedule(
  supplements: Supplement[],
  schedule: UserSchedule
): ScheduleEntry[] {
  const { wakeTime, workoutTime } = schedule
  const { preWorkout, postWorkout } = getWorkoutTimes(wakeTime, workoutTime)

  // Calculate times
  const morningTime = calculateTime(wakeTime, 15) // 15 min after wake
  const eveningTime = calculateTime(wakeTime, 13 * 60) // 13 hours after wake (20:00 if wake at 7:00)

  // Group supplements by timing
  const morningSupps = supplements.filter(s => s.timing === 'morning')
  const eveningSupps = supplements.filter(s => s.timing === 'evening')
  const preWorkoutSupps = supplements.filter(s => s.timing === 'pre-workout')
  const postWorkoutSupps = supplements.filter(s => s.timing === 'post-workout')

  const entries: ScheduleEntry[] = []

  // Morning supplements
  if (morningSupps.length > 0) {
    entries.push({
      time: morningTime,
      supplements: morningSupps,
      label: 'Сутрин (15 мин след събуждане)'
    })
  }

  // Pre-workout supplements
  if (preWorkout && preWorkoutSupps.length > 0) {
    entries.push({
      time: preWorkout,
      supplements: preWorkoutSupps,
      label: 'Преди тренировка (30 мин)'
    })
  }

  // Post-workout supplements
  if (postWorkout && postWorkoutSupps.length > 0) {
    entries.push({
      time: postWorkout,
      supplements: postWorkoutSupps,
      label: workoutTime === 'none' ? 'Обяд' : 'След тренировка (15 мин)'
    })
  }

  // Evening supplements
  if (eveningSupps.length > 0) {
    entries.push({
      time: eveningTime,
      supplements: eveningSupps,
      label: 'Вечер (1.5 часа преди сън)'
    })
  }

  // Sort by time
  entries.sort((a, b) => {
    const timeA = parseInt(a.time.replace(':', ''))
    const timeB = parseInt(b.time.replace(':', ''))
    return timeA - timeB
  })

  return entries
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: string): string {
  const icons = {
    testosterone: '💪',
    sleep: '😴',
    workout: '🏋️'
  }
  return icons[category as keyof typeof icons] || '📋'
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: string): string {
  const colors = {
    low: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    medium: 'bg-orange-50 border-orange-200 text-orange-900',
    high: 'bg-red-50 border-red-200 text-red-900'
  }
  return colors[severity as keyof typeof colors] || colors.low
}
