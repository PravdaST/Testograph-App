/**
 * Supplement Timing - Supabase Queries
 * Helper functions for CRUD operations on supplement tables
 */

import { createClient } from './client'
import type {
  UserSupplement,
  SupplementLog,
  SupplementSettings,
  DailyAdherence
} from '../types/supplement-timing'

// =====================================================
// USER SUPPLEMENTS (Selection)
// =====================================================

/**
 * Get user's selected supplements
 */
export async function getUserSupplements(userId: string): Promise<UserSupplement[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_supplements_app')
    .select('*')
    .eq('user_id', userId)
    .eq('enabled', true)
    .order('supplement_id', { ascending: true })

  if (error) {
    console.error('Error fetching user supplements:', error)
    return []
  }

  return data || []
}

/**
 * Add supplement to user's selection
 */
export async function addUserSupplement(
  userId: string,
  supplementId: number,
  supplementName: string
): Promise<UserSupplement | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_supplements_app')
    .insert({
      user_id: userId,
      supplement_id: supplementId,
      supplement_name: supplementName,
      enabled: true
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding supplement:', error)
    return null
  }

  return data
}

/**
 * Remove supplement from user's selection
 */
export async function removeUserSupplement(
  userId: string,
  supplementId: number
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('user_supplements_app')
    .delete()
    .eq('user_id', userId)
    .eq('supplement_id', supplementId)

  if (error) {
    console.error('Error removing supplement:', error)
    return false
  }

  return true
}

/**
 * Toggle supplement enabled/disabled
 */
export async function toggleUserSupplement(
  userId: string,
  supplementId: number,
  enabled: boolean
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('user_supplements_app')
    .update({ enabled })
    .eq('user_id', userId)
    .eq('supplement_id', supplementId)

  if (error) {
    console.error('Error toggling supplement:', error)
    return false
  }

  return true
}

// =====================================================
// SUPPLEMENT LOGS (Daily Tracking)
// =====================================================

/**
 * Get logs for a specific date
 */
export async function getLogsByDate(
  userId: string,
  date: string
): Promise<SupplementLog[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('supplement_logs_app')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date)
    .order('supplement_id', { ascending: true })

  if (error) {
    console.error('Error fetching logs:', error)
    return []
  }

  return data || []
}

/**
 * Get logs for date range (for history/stats)
 */
export async function getLogsForDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<SupplementLog[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('supplement_logs_app')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: false })

  if (error) {
    console.error('Error fetching log range:', error)
    return []
  }

  return data || []
}

/**
 * Upsert (create or update) a supplement log
 */
export async function upsertSupplementLog(
  userId: string,
  date: string,
  supplementId: number,
  supplementName: string,
  taken: boolean,
  takenTime: string | null = null,
  notes: string | null = null
): Promise<SupplementLog | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('supplement_logs_app')
    .upsert(
      {
        user_id: userId,
        log_date: date,
        supplement_id: supplementId,
        supplement_name: supplementName,
        taken,
        taken_time: takenTime,
        notes
      },
      {
        onConflict: 'user_id,log_date,supplement_id'
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error upserting log:', error)
    return null
  }

  return data
}

/**
 * Batch upsert logs for a day
 */
export async function batchUpsertLogs(
  userId: string,
  date: string,
  logs: {
    supplementId: number
    supplementName: string
    taken: boolean
    takenTime: string | null
    notes: string | null
  }[]
): Promise<boolean> {
  const supabase = createClient()

  const logsToInsert = logs.map((log) => ({
    user_id: userId,
    log_date: date,
    supplement_id: log.supplementId,
    supplement_name: log.supplementName,
    taken: log.taken,
    taken_time: log.takenTime,
    notes: log.notes
  }))

  const { error } = await supabase
    .from('supplement_logs_app')
    .upsert(logsToInsert, {
      onConflict: 'user_id,log_date,supplement_id'
    })

  if (error) {
    console.error('Error batch upserting logs:', error)
    return false
  }

  return true
}

// =====================================================
// SUPPLEMENT SETTINGS (Wake/Workout Times)
// =====================================================

/**
 * Get user's schedule settings
 */
export async function getSupplementSettings(
  userId: string
): Promise<SupplementSettings | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('supplement_settings_app')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // If no settings exist, return defaults
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching settings:', error)
    return null
  }

  return data
}

/**
 * Upsert (create or update) schedule settings
 */
export async function upsertSupplementSettings(
  userId: string,
  wakeTime: string,
  workoutTime: string
): Promise<SupplementSettings | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('supplement_settings_app')
    .upsert(
      {
        user_id: userId,
        wake_time: wakeTime,
        workout_time: workoutTime
      },
      {
        onConflict: 'user_id'
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error upserting settings:', error)
    return null
  }

  return data
}

// =====================================================
// STATS & ADHERENCE CALCULATIONS
// =====================================================

/**
 * Calculate daily adherence for date range
 */
export async function calculateDailyAdherence(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyAdherence[]> {
  const supabase = createClient()

  // Get all logs in range
  const { data: logs, error } = await supabase
    .from('supplement_logs_app')
    .select('log_date, taken')
    .eq('user_id', userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)

  if (error || !logs) {
    console.error('Error calculating adherence:', error)
    return []
  }

  // Group by date
  const adherenceMap = new Map<string, { total: number; taken: number }>()

  logs.forEach((log) => {
    const existing = adherenceMap.get(log.log_date) || { total: 0, taken: 0 }
    existing.total += 1
    if (log.taken) {
      existing.taken += 1
    }
    adherenceMap.set(log.log_date, existing)
  })

  // Convert to array
  const adherence: DailyAdherence[] = Array.from(adherenceMap.entries()).map(
    ([date, stats]) => ({
      date,
      total: stats.total,
      taken: stats.taken,
      percentage: stats.total > 0 ? Math.round((stats.taken / stats.total) * 100) : 0
    })
  )

  return adherence.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calculate current streak (consecutive days with 100% adherence)
 */
export async function calculateCurrentStreak(userId: string): Promise<number> {
  const supabase = createClient()

  // Get logs for last 90 days
  const today = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const adherence = await calculateDailyAdherence(userId, startDate, today)

  if (adherence.length === 0) return 0

  // Count streak from today backwards
  let streak = 0
  for (let i = adherence.length - 1; i >= 0; i--) {
    if (adherence[i].percentage === 100) {
      streak++
    } else {
      break
    }
  }

  return streak
}
