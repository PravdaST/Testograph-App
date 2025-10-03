/**
 * Sleep Protocol Types
 */

export interface SleepAssessment {
  currentSleepHours: number
  bedtime: string // HH:MM format
  fallAsleepMinutes: number
  nightWakeups: number
}

export interface RoutineStep {
  time: string // e.g., "2 часа преди сън"
  title: string
  description: string
  icon: string
}

export interface BedroomChecklistItem {
  id: string
  title: string
  description: string
  completed: boolean
}

export interface SleepLog {
  id?: string
  date: string // YYYY-MM-DD
  bedtime: string // HH:MM
  waketime: string // HH:MM
  quality: number // 1-10
  hours: number
  notes?: string
}

export interface SleepStats {
  avg7DayQuality: number
  avg7DayHours: number
  avg30DayQuality: number
  avg30DayHours: number
}

export interface SleepProtocolData {
  assessment: SleepAssessment | null
  checklistItems: BedroomChecklistItem[]
  logs: SleepLog[]
}
