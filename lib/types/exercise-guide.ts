/**
 * TypeScript types for Exercise Guide
 */

import type { Week } from '@/lib/utils/exercise-program-generator'

export interface WorkoutProgram {
  id?: string
  user_id?: string
  program_name: string
  description?: string
  selected_exercises: string[] // Array of exercise IDs
  exercises_data: Week[] | Exercise[] | any // Supports both new (Week[]) and old (Exercise[]) formats
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface ExerciseLog {
  id?: string
  user_id?: string
  workout_program_id?: string
  workout_date: string
  exercise_id: string
  exercise_name: string
  sets_completed?: number
  reps_completed?: number
  weight_used?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface ExerciseFavorite {
  id?: string
  user_id?: string
  exercise_id: string
  exercise_name: string
  added_at?: string
}

export interface Exercise {
  id: number
  name: string
  category: 'Крака' | 'Гръб' | 'Гръд' | 'Рамене' | 'Кор'
  testosterone_benefit: 'Висок' | 'Среден' | 'Нисък'
  sets: string
  reps: string
  rest: string
  testosterone_why: string
  form: string[]
  mistakes: string[]
  image: string
}

export interface WorkoutStats {
  total_workouts: number
  total_exercises: number
  favorite_exercise: string | null
  current_streak: number
}

export interface ExerciseProgress {
  workout_date: string
  sets_completed: number
  reps_completed: number
  weight_used: number
  notes: string | null
}
