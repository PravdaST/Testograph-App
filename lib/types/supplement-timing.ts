/**
 * Supplement Timing Types
 * For personalized supplement scheduling and tracking
 */

// =====================================================
// CORE SUPPLEMENT TYPES
// =====================================================

export type SupplementCategory = 'testosterone' | 'sleep' | 'workout' | 'general'
export type SupplementTiming = 'morning' | 'evening' | 'pre-workout' | 'post-workout'
export type WorkoutTime = 'morning' | 'lunch' | 'evening' | 'none'

export interface Supplement {
  id: number
  name: string
  dosage: string
  timing: SupplementTiming
  withFood: string
  withFat: boolean
  category: SupplementCategory
  why: string // Why this supplement is important
  color: string // Hex color for visual identification
  isTestoUp?: boolean // Flag for TestoUP product
  shopUrl?: string // Link to shop (for TestoUP)
  benefits?: string[] // Key benefits list
}

export interface SupplementInteraction {
  supplements: string[]
  warning: string
  severity: 'low' | 'medium' | 'high'
}

// =====================================================
// DATABASE TYPES (Supabase)
// =====================================================

export interface UserSupplement {
  id: string
  user_id: string
  supplement_id: number
  supplement_name: string
  enabled: boolean
  custom_dosage: string | null
  custom_timing: string | null
  created_at: string
  updated_at: string
}

export interface SupplementLog {
  id: string
  user_id: string
  log_date: string // YYYY-MM-DD format
  supplement_id: number
  supplement_name: string
  taken: boolean
  taken_time: string | null // HH:MM format
  notes: string | null
  created_at: string
}

export interface SupplementSettings {
  user_id: string
  wake_time: string // HH:MM format
  workout_time: WorkoutTime
  created_at: string
  updated_at: string
}

// =====================================================
// UI / CLIENT TYPES
// =====================================================

export interface ScheduleEntry {
  time: string // HH:MM format
  supplements: Supplement[]
  label: string // e.g., "Сутрин (15 мин след събуждане)"
}

export interface UserSchedule {
  wakeTime: string
  workoutTime: WorkoutTime
}

export interface DailyChecklistItem {
  supplement: Supplement
  scheduledTime: string
  taken: boolean
  takenTime: string | null
  notes: string
}

// =====================================================
// ADHERENCE / STATS TYPES
// =====================================================

export interface AdherenceStats {
  totalSupplements: number
  takenToday: number
  adherenceToday: number // Percentage
  adherence7Day: number // 7-day average percentage
  adherence30Day: number // 30-day average percentage
  currentStreak: number // Consecutive days with 100% adherence
  longestStreak: number
}

export interface DailyAdherence {
  date: string // YYYY-MM-DD
  total: number
  taken: number
  percentage: number
}

// =====================================================
// TESTOUP PROMO TYPES
// =====================================================

export interface TestoUpPromo {
  title: string
  description: string
  features: string[]
  shopUrl: string
  discount?: string
  ctaText: string
}

// =====================================================
// FORM INPUT TYPES
// =====================================================

export interface SupplementSelectionForm {
  selectedSupplements: number[] // Array of supplement IDs
}

export interface ScheduleSettingsForm {
  wakeTime: string
  workoutTime: WorkoutTime
}

export interface DailyLogForm {
  date: string
  supplements: {
    id: number
    taken: boolean
    takenTime: string | null
    notes: string
  }[]
}
