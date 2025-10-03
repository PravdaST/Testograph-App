/**
 * TypeScript types for Meal Planner
 */

export type PriceTier = 'budget' | 'standard' | 'premium'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks'
export type Goal = 'bulk' | 'maintain' | 'cut'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extreme'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Meal {
  name: string
  protein: number
  fat: number
  carbs: number
  price: PriceTier
  ingredients: string[]
  cookingInstructions?: string[]
  prepTime?: number // minutes
  difficulty?: Difficulty
  tips?: string[]
  healthScore?: number
}

export interface MealSet {
  breakfast: Meal
  lunch: Meal
  dinner: Meal
  snack: Meal
}

export interface DayMacros {
  protein: number
  carbs: number
  fat: number
  calories: number
}

export interface DayPlan {
  day: number
  meals: MealSet
  totals: DayMacros
}

export interface UserParams {
  age: number
  weight: number
  height: number
  activityLevel: ActivityLevel
  goal: Goal
  budget: PriceTier
  macros: DayMacros
}

export interface WeightEntry {
  date: string
  weight: number
}

export interface MealPlan {
  id?: string
  user_id?: string
  userParams: UserParams
  plan: DayPlan[]
  generatedAt: string
  weightEntries?: WeightEntry[]
  created_at?: string
  updated_at?: string
}

export interface CheckboxState {
  [week: string]: {
    [item: string]: boolean
  }
}

export interface MealsDatabase {
  breakfast: Meal[]
  lunch: Meal[]
  dinner: Meal[]
  snacks: Meal[]
}
