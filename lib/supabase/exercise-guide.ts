/**
 * Supabase functions for Exercise Guide app
 */

import { createClient } from '@/lib/supabase/client'
import type {
  WorkoutProgram,
  ExerciseLog,
  ExerciseFavorite,
  WorkoutStats,
  ExerciseProgress
} from '@/lib/types/exercise-guide'

// =====================================================
// WORKOUT PROGRAMS
// =====================================================

export async function getActiveWorkoutProgram(userId: string): Promise<WorkoutProgram | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workout_programs_app')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching active workout program:', error)
    return null
  }

  return data
}

export async function getAllWorkoutPrograms(userId: string): Promise<WorkoutProgram[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workout_programs_app')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching workout programs:', error)
    return []
  }

  return data || []
}

export async function saveWorkoutProgram(program: WorkoutProgram): Promise<WorkoutProgram | null> {
  const supabase = createClient()

  // DELETE all old programs for this user (only 1 program per user!)
  const { error: deleteError } = await supabase
    .from('workout_programs_app')
    .delete()
    .eq('user_id', program.user_id!)

  if (deleteError) {
    console.error('Error deleting old programs:', deleteError)
  }

  // Insert new program as active
  const { data, error } = await supabase
    .from('workout_programs_app')
    .insert({
      user_id: program.user_id,
      program_name: program.program_name,
      description: program.description,
      selected_exercises: program.selected_exercises,
      exercises_data: program.exercises_data,
      is_active: true
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving workout program:', error)
    return null
  }

  return data
}

export async function updateWorkoutProgram(
  programId: string,
  updates: Partial<WorkoutProgram>
): Promise<WorkoutProgram | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workout_programs_app')
    .update(updates)
    .eq('id', programId)
    .select()
    .single()

  if (error) {
    console.error('Error updating workout program:', error)
    return null
  }

  return data
}

export async function deleteWorkoutProgram(programId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('workout_programs_app')
    .delete()
    .eq('id', programId)

  if (error) {
    console.error('Error deleting workout program:', error)
    return false
  }

  return true
}

// =====================================================
// EXERCISE LOGS
// =====================================================

export async function logExercise(log: ExerciseLog): Promise<ExerciseLog | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('exercise_logs_app')
    .insert({
      user_id: log.user_id,
      workout_program_id: log.workout_program_id,
      workout_date: log.workout_date,
      exercise_id: log.exercise_id,
      exercise_name: log.exercise_name,
      sets_completed: log.sets_completed,
      reps_completed: log.reps_completed,
      weight_used: log.weight_used,
      notes: log.notes
    })
    .select()
    .single()

  if (error) {
    console.error('Error logging exercise:', error)
    return null
  }

  return data
}

export async function getExerciseLogs(
  userId: string,
  limit: number = 50
): Promise<ExerciseLog[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('exercise_logs_app')
    .select('*')
    .eq('user_id', userId)
    .order('workout_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching exercise logs:', error)
    return []
  }

  return data || []
}

export async function getExerciseProgress(
  userId: string,
  exerciseId: string,
  limit: number = 10
): Promise<ExerciseProgress[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_exercise_progress', {
      p_user_id: userId,
      p_exercise_id: exerciseId,
      p_limit: limit
    })

  if (error) {
    console.error('Error fetching exercise progress:', error)
    return []
  }

  return data || []
}

export async function deleteExerciseLog(logId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('exercise_logs_app')
    .delete()
    .eq('id', logId)

  if (error) {
    console.error('Error deleting exercise log:', error)
    return false
  }

  return true
}

// =====================================================
// FAVORITES
// =====================================================

export async function getFavoriteExercises(userId: string): Promise<ExerciseFavorite[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('exercise_favorites_app')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false })

  if (error) {
    console.error('Error fetching favorites:', error)
    return []
  }

  return data || []
}

export async function addFavoriteExercise(
  userId: string,
  exerciseId: string,
  exerciseName: string
): Promise<ExerciseFavorite | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('exercise_favorites_app')
    .insert({
      user_id: userId,
      exercise_id: exerciseId,
      exercise_name: exerciseName
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding favorite:', error)
    return null
  }

  return data
}

export async function removeFavoriteExercise(
  userId: string,
  exerciseId: string
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('exercise_favorites_app')
    .delete()
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)

  if (error) {
    console.error('Error removing favorite:', error)
    return false
  }

  return true
}

export async function isExerciseFavorite(
  userId: string,
  exerciseId: string
): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('exercise_favorites_app')
    .select('id')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking favorite:', error)
    return false
  }

  return !!data
}

// =====================================================
// STATISTICS
// =====================================================

export async function getWorkoutStats(userId: string): Promise<WorkoutStats | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_workout_stats', {
      p_user_id: userId
    })
    .single()

  if (error) {
    console.error('Error fetching workout stats:', error)
    return null
  }

  return data
}

// =====================================================
// ADVANCED ANALYTICS (Fitness Trainer Dashboard)
// =====================================================

export interface ProgramCompliance {
  total_exercises: number
  trained_this_week: number
  compliance_percentage: number
  missing_exercises: string[]
}

export interface ProgressiveOverloadData {
  exercise_id: string
  exercise_name: string
  first_weight: number
  latest_weight: number
  improvement: number
  improvement_percentage: number
  first_date: string
  latest_date: string
}

export interface PersonalRecord {
  exercise_id: string
  exercise_name: string
  max_weight: number
  achieved_date: string
  sets: number
  reps: number
}

export interface TrainingVolume {
  total_volume: number
  weekly_volume: number
  monthly_volume: number
  top_exercises: Array<{
    exercise_name: string
    volume: number
  }>
}

// Get Program Compliance - колко от програмата си тренирал тази седмица
export async function getProgramCompliance(
  userId: string,
  programExercises: string[]
): Promise<ProgramCompliance> {
  const supabase = createClient()

  // Get all exercises trained this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { data, error } = await supabase
    .from('exercise_logs_app')
    .select('exercise_id, exercise_name')
    .eq('user_id', userId)
    .gte('workout_date', weekAgo.toISOString().split('T')[0])

  if (error) {
    console.error('Error fetching compliance:', error)
    return {
      total_exercises: programExercises.length,
      trained_this_week: 0,
      compliance_percentage: 0,
      missing_exercises: []
    }
  }

  const trainedIds = new Set(data.map(log => log.exercise_id))
  const trainedCount = programExercises.filter(id => trainedIds.has(id)).length
  const missing = programExercises.filter(id => !trainedIds.has(id))

  return {
    total_exercises: programExercises.length,
    trained_this_week: trainedCount,
    compliance_percentage: Math.round((trainedCount / programExercises.length) * 100),
    missing_exercises: missing
  }
}

// Get Progressive Overload Analysis
export async function getProgressiveOverload(userId: string): Promise<ProgressiveOverloadData[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('exercise_logs_app')
    .select('exercise_id, exercise_name, weight_used, workout_date')
    .eq('user_id', userId)
    .not('weight_used', 'is', null)
    .order('workout_date', { ascending: true })

  if (error || !data) {
    console.error('Error fetching progressive overload:', error)
    return []
  }

  // Group by exercise
  const exerciseMap = new Map<string, typeof data>()
  data.forEach(log => {
    if (!exerciseMap.has(log.exercise_id)) {
      exerciseMap.set(log.exercise_id, [])
    }
    exerciseMap.get(log.exercise_id)!.push(log)
  })

  const results: ProgressiveOverloadData[] = []

  exerciseMap.forEach((logs, exerciseId) => {
    if (logs.length >= 2) {
      const first = logs[0]
      const latest = logs[logs.length - 1]
      const improvement = (latest.weight_used || 0) - (first.weight_used || 0)
      const improvementPct = first.weight_used
        ? Math.round((improvement / first.weight_used) * 100)
        : 0

      results.push({
        exercise_id: exerciseId,
        exercise_name: first.exercise_name,
        first_weight: first.weight_used || 0,
        latest_weight: latest.weight_used || 0,
        improvement,
        improvement_percentage: improvementPct,
        first_date: first.workout_date,
        latest_date: latest.workout_date
      })
    }
  })

  return results.sort((a, b) => b.improvement - a.improvement)
}

// Get Personal Records
export async function getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('exercise_logs_app')
    .select('exercise_id, exercise_name, weight_used, workout_date, sets_completed, reps_completed')
    .eq('user_id', userId)
    .not('weight_used', 'is', null)

  if (error || !data) {
    console.error('Error fetching PRs:', error)
    return []
  }

  // Find max weight for each exercise
  const prMap = new Map<string, typeof data[0]>()

  data.forEach(log => {
    const current = prMap.get(log.exercise_id)
    if (!current || (log.weight_used || 0) > (current.weight_used || 0)) {
      prMap.set(log.exercise_id, log)
    }
  })

  return Array.from(prMap.values()).map(pr => ({
    exercise_id: pr.exercise_id,
    exercise_name: pr.exercise_name,
    max_weight: pr.weight_used || 0,
    achieved_date: pr.workout_date,
    sets: pr.sets_completed || 0,
    reps: pr.reps_completed || 0
  })).sort((a, b) => b.max_weight - a.max_weight)
}

// Get Training Volume
export async function getTrainingVolume(userId: string): Promise<TrainingVolume> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('exercise_logs_app')
    .select('exercise_name, sets_completed, reps_completed, weight_used, workout_date')
    .eq('user_id', userId)

  if (error || !data) {
    console.error('Error fetching volume:', error)
    return {
      total_volume: 0,
      weekly_volume: 0,
      monthly_volume: 0,
      top_exercises: []
    }
  }

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  let totalVolume = 0
  let weeklyVolume = 0
  let monthlyVolume = 0
  const exerciseVolumes = new Map<string, number>()

  data.forEach(log => {
    const volume = (log.sets_completed || 0) * (log.reps_completed || 0) * (log.weight_used || 0)
    const logDate = new Date(log.workout_date)

    totalVolume += volume

    if (logDate >= weekAgo) {
      weeklyVolume += volume
    }

    if (logDate >= monthAgo) {
      monthlyVolume += volume
    }

    // Track per exercise
    const currentVolume = exerciseVolumes.get(log.exercise_name) || 0
    exerciseVolumes.set(log.exercise_name, currentVolume + volume)
  })

  const topExercises = Array.from(exerciseVolumes.entries())
    .map(([exercise_name, volume]) => ({ exercise_name, volume }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5)

  return {
    total_volume: Math.round(totalVolume),
    weekly_volume: Math.round(weeklyVolume),
    monthly_volume: Math.round(monthlyVolume),
    top_exercises: topExercises
  }
}
