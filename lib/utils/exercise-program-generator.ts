/**
 * Smart Exercise Program Generator
 * Generates personalized 4-week workout programs with:
 * - Progressive overload (different sets/reps each week)
 * - Exercise rotation (different exercises each week)
 * - Automatic REST day placement
 * - 50+ exercise variations for professional periodization
 */

import { EXERCISES } from '@/lib/data/exercises-database'
import type { Exercise } from '@/lib/types/exercise-guide'

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
export type FitnessGoal = 'strength' | 'muscle' | 'fat-loss' | 'athletic' | 'general'
export type Equipment = 'full-gym' | 'barbell-only' | 'minimal' | 'bodyweight'

export interface UserAssessment {
  fitnessLevel: FitnessLevel
  goal: FitnessGoal
  daysPerWeek: number // 2-6
  equipment: Equipment
  injuries?: string
  experience?: string
}

export interface WorkoutDay {
  dayNumber: number // 1-7 (within week)
  dayName: string // "Понеделник", "Вторник", etc.
  isRestDay: boolean
  focus: string // "Push", "Pull", "Legs", "REST"
  exercises: Exercise[]
}

export interface Week {
  weekNumber: number // 1-4
  days: WorkoutDay[]
}

export interface GeneratedProgram {
  weeks: Week[] // 4 weeks
  programName: string
  description: string
  reasoning: string
}

// Exercise selection based on goals
const GOAL_PRIORITIES = {
  strength: {
    preferredBenefit: 'Висок',
    preferredCategories: ['Крака', 'Гръб'],
    exerciseCount: { 2: 6, 3: 8, 4: 10, 5: 10, 6: 10 }
  },
  muscle: {
    preferredBenefit: 'Висок',
    preferredCategories: ['Крака', 'Гръб', 'Гръд'],
    exerciseCount: { 2: 6, 3: 8, 4: 10, 5: 10, 6: 10 }
  },
  'fat-loss': {
    preferredBenefit: 'Висок',
    preferredCategories: ['Крака', 'Гръб', 'Гръд'],
    exerciseCount: { 2: 6, 3: 8, 4: 9, 5: 10, 6: 10 }
  },
  athletic: {
    preferredBenefit: 'Висок',
    preferredCategories: ['Крака', 'Гръб', 'Кор'],
    exerciseCount: { 2: 6, 3: 8, 4: 9, 5: 10, 6: 10 }
  },
  general: {
    preferredBenefit: null,
    preferredCategories: null,
    exerciseCount: { 2: 6, 3: 8, 4: 9, 5: 10, 6: 10 }
  }
}

// Essential exercises that should always be included for beginners
const ESSENTIAL_BEGINNER = [1, 2, 3, 4, 5] // Squats, Deadlift, Bench, OHP, Pull-ups

// Advanced exercises
const ADVANCED_EXERCISES = [9, 11, 18] // Romanian DL, Sumo DL, Pendlay Row

/**
 * Generate personalized workout program based on assessment
 */
export function generateWorkoutProgram(assessment: UserAssessment): GeneratedProgram {
  const { fitnessLevel, goal, daysPerWeek, equipment } = assessment

  const goalPriority = GOAL_PRIORITIES[goal]
  const targetCount = goalPriority.exerciseCount[daysPerWeek as keyof typeof goalPriority.exerciseCount] || 8

  let selectedExercises: Exercise[] = []
  let availableExercises = [...EXERCISES]

  // Filter based on fitness level
  if (fitnessLevel === 'beginner') {
    // Include essential exercises first
    const essentials = EXERCISES.filter(ex => ESSENTIAL_BEGINNER.includes(ex.id))
    selectedExercises.push(...essentials)

    // Remove advanced exercises for beginners
    availableExercises = availableExercises.filter(ex => !ADVANCED_EXERCISES.includes(ex.id))
  }

  // Filter based on equipment
  if (equipment === 'bodyweight') {
    availableExercises = availableExercises.filter(ex =>
      ex.name.includes('Pull-ups') ||
      ex.name.includes('Dips') ||
      ex.name.includes('Plank')
    )
  }

  // Remove already selected
  availableExercises = availableExercises.filter(ex =>
    !selectedExercises.find(sel => sel.id === ex.id)
  )

  // Prioritize by T-boost level
  if (goalPriority.preferredBenefit) {
    const highBenefit = availableExercises.filter(ex =>
      ex.testosterone_benefit === goalPriority.preferredBenefit
    )
    const remaining = availableExercises.filter(ex =>
      ex.testosterone_benefit !== goalPriority.preferredBenefit
    )
    availableExercises = [...highBenefit, ...remaining]
  }

  // Prioritize by category
  if (goalPriority.preferredCategories) {
    const preferred = availableExercises.filter(ex =>
      goalPriority.preferredCategories!.includes(ex.category)
    )
    const others = availableExercises.filter(ex =>
      !goalPriority.preferredCategories!.includes(ex.category)
    )
    availableExercises = [...preferred, ...others]
  }

  // Fill to target count
  const needed = targetCount - selectedExercises.length
  selectedExercises.push(...availableExercises.slice(0, needed))

  // Generate program metadata
  const programName = generateProgramName(goal, fitnessLevel, daysPerWeek)
  const description = generateDescription(goal, fitnessLevel, daysPerWeek)
  const weeks = generate4WeekProgram(selectedExercises, daysPerWeek)
  const reasoning = generateReasoning(goal, fitnessLevel, selectedExercises.length)

  return {
    weeks,
    programName,
    description,
    reasoning
  }
}

const DAY_NAMES = ['Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя']

/**
 * Modify exercise sets/reps for progressive overload
 */
function modifyExerciseForWeek(exercise: Exercise, weekNum: number): Exercise {
  const weekModifications = {
    1: { sets: '3', reps: '8-10', rest: '90 сек' }, // Base volume
    2: { sets: '4', reps: '6-8', rest: '2 мин' },   // Strength focus
    3: { sets: '3', reps: '12-15', rest: '60 сек' }, // Hypertrophy volume
    4: { sets: '2', reps: '10-12', rest: '90 сек' }  // Deload/Recovery
  }

  const mods = weekModifications[weekNum as keyof typeof weekModifications] || weekModifications[1]

  return {
    ...exercise,
    sets: mods.sets,
    reps: mods.reps,
    rest: mods.rest
  }
}

/**
 * Generate 4-week program with REST days and progressive overload
 * Each week has DIFFERENT exercise variations (not just different sets/reps)
 */
function generate4WeekProgram(exercises: Exercise[], daysPerWeek: number): Week[] {
  // Define which days are workout days based on frequency
  const workoutDayIndices: { [key: number]: number[] } = {
    2: [0, 3], // Mon, Thu
    3: [0, 2, 4], // Mon, Wed, Fri
    4: [0, 1, 3, 4], // Mon, Tue, Thu, Fri
    5: [0, 1, 2, 3, 4], // Mon-Fri
    6: [0, 1, 2, 3, 4, 5] // Mon-Sat
  }

  const activeIndices = workoutDayIndices[daysPerWeek] || [0, 2, 4]

  // Create 4 weeks with progressive overload AND exercise rotation
  const weeks: Week[] = []

  for (let weekNum = 1; weekNum <= 4; weekNum++) {
    // Get DIFFERENT exercises for this week
    const weekExercises = rotateExercisesForWeek(exercises, weekNum)

    // Get workout templates for THIS week
    const workoutTemplates = splitExercisesByDays(weekExercises, daysPerWeek)

    const days: WorkoutDay[] = []

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const isWorkoutDay = activeIndices.includes(dayIndex)

      if (isWorkoutDay) {
        // Find which workout template to use
        const workoutIndex = activeIndices.indexOf(dayIndex)
        const template = workoutTemplates[workoutIndex % workoutTemplates.length]

        // Modify exercises for this week (progressive overload)
        const modifiedExercises = template.exercises.map(ex => modifyExerciseForWeek(ex, weekNum))

        days.push({
          dayNumber: dayIndex + 1,
          dayName: DAY_NAMES[dayIndex],
          isRestDay: false,
          focus: template.focus,
          exercises: modifiedExercises
        })
      } else {
        // REST day
        days.push({
          dayNumber: dayIndex + 1,
          dayName: DAY_NAMES[dayIndex],
          isRestDay: true,
          focus: 'Почивка',
          exercises: []
        })
      }
    }

    weeks.push({
      weekNumber: weekNum,
      days
    })
  }

  return weeks
}

/**
 * Rotate exercises by week for variety
 * Week 1: Heavy compounds (Barbell/High T-boost focus)
 * Week 2: Dumbbell/Unilateral variations
 * Week 3: Isolation/Machine exercises (pump work)
 * Week 4: Light compound variations (deload week)
 *
 * DYNAMIC SYSTEM: Automatically categorizes exercises by name patterns
 * No hardcoded IDs - scalable and maintainable
 */
function rotateExercisesForWeek(baseExercises: Exercise[], weekNum: number): Exercise[] {
  // Categorize ALL exercises by muscle group
  const byCategory = {
    chest: EXERCISES.filter(ex => ex.category === 'Гръд'),
    back: EXERCISES.filter(ex => ex.category === 'Гръб'),
    legs: EXERCISES.filter(ex => ex.category === 'Крака'),
    shoulders: EXERCISES.filter(ex => ex.category === 'Рамене'),
    core: EXERCISES.filter(ex => ex.category === 'Кор')
  }

  // Helper: Check if exercise is compound (based on name patterns)
  const isCompound = (ex: Exercise) => {
    const compoundKeywords = ['Клякания', 'Мъртва тяга', 'Лежанка', 'Преса', 'Лостове', 'Гребане', 'Лег прес', 'Хак']
    return compoundKeywords.some(keyword => ex.name.includes(keyword))
  }

  // Helper: Check if exercise is dumbbell-based
  const isDumbbell = (ex: Exercise) => ex.name.includes('дъмбел')

  // Helper: Check if exercise is isolation/machine
  const isIsolation = (ex: Exercise) => {
    const isolationKeywords = ['Разперване', 'Кроссовър', 'Повдигания', 'Кърл', 'Екстеншън', 'Калф', 'Планк', 'Кранчове']
    return isolationKeywords.some(keyword => ex.name.includes(keyword))
  }

  // Select exercises per week based on intelligent categorization
  const selectForWeek = (exercises: Exercise[], count: number = 2): Exercise[] => {
    let selected: Exercise[] = []

    if (weekNum === 1) {
      // Week 1: Heavy compounds with high T-boost
      selected = exercises
        .filter(ex => isCompound(ex) && ex.testosterone_benefit === 'Висок' && !isDumbbell(ex))
        .slice(0, count)
    } else if (weekNum === 2) {
      // Week 2: Dumbbell variations and unilateral work
      selected = exercises
        .filter(ex => isDumbbell(ex) || ex.name.includes('сплит') || ex.name.includes('едноръчн'))
        .slice(0, count)
    } else if (weekNum === 3) {
      // Week 3: Isolation and machine work for pump
      selected = exercises
        .filter(ex => isIsolation(ex))
        .slice(0, count)
    } else {
      // Week 4: Light compound variations (deload)
      selected = exercises
        .filter(ex => isCompound(ex) && ex.testosterone_benefit !== 'Висок')
        .slice(0, count)
    }

    // Fallback: If not enough exercises found, take any available
    if (selected.length < count) {
      const remaining = exercises.filter(ex => !selected.includes(ex)).slice(0, count - selected.length)
      selected = [...selected, ...remaining]
    }

    return selected
  }

  // Build week exercises with intelligent rotation
  const weekExercises: Exercise[] = []

  // Chest: 2 exercises
  weekExercises.push(...selectForWeek(byCategory.chest, 2))

  // Back: 3 exercises (larger muscle group)
  weekExercises.push(...selectForWeek(byCategory.back, 3))

  // Legs: 2-3 exercises
  weekExercises.push(...selectForWeek(byCategory.legs, weekNum === 3 ? 3 : 2))

  // Shoulders: 2 exercises
  weekExercises.push(...selectForWeek(byCategory.shoulders, 2))

  // Core: 1-2 exercises
  weekExercises.push(...selectForWeek(byCategory.core, weekNum === 3 ? 2 : 1))

  return weekExercises
}

/**
 * Split exercises into workout templates (without REST days)
 */
function splitExercisesByDays(exercises: Exercise[], daysPerWeek: number): Omit<WorkoutDay, 'dayNumber' | 'dayName' | 'isRestDay'>[] {
  // Categorize exercises by muscle group
  const chestShoulderTriceps = exercises.filter(ex => ex.category === 'Гръд' || ex.category === 'Рамене')
  const backBiceps = exercises.filter(ex => ex.category === 'Гръб')
  const legs = exercises.filter(ex => ex.category === 'Крака')
  const core = exercises.filter(ex => ex.category === 'Кор')

  if (daysPerWeek === 2) {
    // Full Body x2 - Split all exercises evenly
    const half = Math.ceil(exercises.length / 2)
    return [
      {
        focus: 'Цяло тяло',
        exercises: exercises.slice(0, half)
      },
      {
        focus: 'Цяло тяло',
        exercises: exercises.slice(half)
      }
    ]
  }

  if (daysPerWeek === 3) {
    // Push/Pull/Legs
    return [
      {
        focus: 'Блъскащи (Гръд, Рамене)',
        exercises: [...chestShoulderTriceps]
      },
      {
        focus: 'Теглещи (Гръб, Бицепс)',
        exercises: [...backBiceps]
      },
      {
        focus: 'Крака и Кор',
        exercises: [...legs, ...core]
      }
    ]
  }

  if (daysPerWeek === 4) {
    // Upper/Lower Split
    const upper1 = [...chestShoulderTriceps.slice(0, Math.ceil(chestShoulderTriceps.length / 2))]
    const upper2 = [...chestShoulderTriceps.slice(Math.ceil(chestShoulderTriceps.length / 2)), ...backBiceps.slice(0, Math.ceil(backBiceps.length / 2))]
    const lower1 = [...legs.slice(0, Math.ceil(legs.length / 2)), ...core.slice(0, 1)]
    const lower2 = [...legs.slice(Math.ceil(legs.length / 2)), ...core.slice(1)]

    return [
      {
        focus: 'Горна част',
        exercises: [...upper1, ...backBiceps.slice(Math.ceil(backBiceps.length / 2))]
      },
      {
        focus: 'Долна част',
        exercises: lower1
      },
      {
        focus: 'Горна част',
        exercises: upper2
      },
      {
        focus: 'Долна част',
        exercises: lower2
      }
    ]
  }

  if (daysPerWeek === 5) {
    // Push/Pull/Legs + Upper/Lower
    return [
      {
        focus: 'Блъскащи',
        exercises: chestShoulderTriceps
      },
      {
        focus: 'Теглещи',
        exercises: backBiceps
      },
      {
        focus: 'Крака',
        exercises: legs
      },
      {
        focus: 'Горна част',
        exercises: [...chestShoulderTriceps.slice(0, 2), ...backBiceps.slice(0, 2)]
      },
      {
        focus: 'Кор и Кондиция',
        exercises: core
      }
    ]
  }

  if (daysPerWeek === 6) {
    // Push/Pull/Legs x2
    return [
      {
        focus: 'Блъскащи',
        exercises: chestShoulderTriceps
      },
      {
        focus: 'Теглещи',
        exercises: backBiceps
      },
      {
        focus: 'Крака и Кор',
        exercises: [...legs.slice(0, Math.ceil(legs.length / 2)), ...core.slice(0, 1)]
      },
      {
        focus: 'Блъскащи',
        exercises: chestShoulderTriceps
      },
      {
        focus: 'Теглещи',
        exercises: backBiceps
      },
      {
        focus: 'Крака и Кор',
        exercises: [...legs.slice(Math.ceil(legs.length / 2)), ...core.slice(1)]
      }
    ]
  }

  // Default fallback - distribute evenly
  return [
    {
      focus: 'Цяло тяло',
      exercises: exercises
    }
  ]
}

function generateProgramName(goal: FitnessGoal, level: FitnessLevel, days: number): string {
  const goalNames = {
    strength: 'Сила',
    muscle: 'Мускулна маса',
    'fat-loss': 'Отслабване',
    athletic: 'Атлетизъм',
    general: 'Обща форма'
  }

  const levelNames = {
    beginner: 'Начинаещи',
    intermediate: 'Среден',
    advanced: 'Напреднал'
  }

  return `${goalNames[goal]} - ${levelNames[level]} (${days}x/седмица)`
}

function generateDescription(goal: FitnessGoal, level: FitnessLevel, days: number): string {
  const descriptions = {
    strength: `Фокус на тежки compound движения с ниски повторения за максимална сила. ${days} тренировки седмично.`,
    muscle: `Балансирана програма за хипертрофия с moderate volume и интензитет. ${days} тренировки седмично.`,
    'fat-loss': `High-intensity програма с метаболитен фокус за горене на мазнини. ${days} тренировки седмично.`,
    athletic: `Explosive movements и функционална сила за спортна производителност. ${days} тренировки седмично.`,
    general: `Балансирана програма за обща физическа форма и здраве. ${days} тренировки седмично.`
  }

  return descriptions[goal]
}

function generateReasoning(goal: FitnessGoal, level: FitnessLevel, count: number): string {
  const reasons = {
    strength: `Избрани са ${count} compound упражнения с висок T-boost ефект за максимален хормонален отговор и сила.`,
    muscle: `Подбрани ${count} упражнения за балансиран мускулен растеж на всички основни групи.`,
    'fat-loss': `${count} метаболитно интензивни упражнения за максимално изгаряне на калории.`,
    athletic: `${count} функционални движения за взривна сила и спортна производителност.`,
    general: `Балансирана селекция от ${count} упражнения за цялостна физическа форма.`
  }

  return reasons[goal]
}
