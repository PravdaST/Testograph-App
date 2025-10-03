'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EXERCISES, CATEGORIES, T_LEVELS } from '@/lib/data/exercises-database'
import type { Exercise } from '@/lib/data/exercises-database'
import {
  filterExercises,
  getCategoryColor,
  getTLevelColor,
  getTLevelIcon,
  type FilterOptions
} from '@/lib/utils/exercise-guide'

export default function ExerciseGuideClient() {
  const router = useRouter()

  // State
  const [filters, setFilters] = useState<FilterOptions>({
    tLevel: 'all',
    category: 'all'
  })
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  // Filter exercises
  const filteredExercises = filterExercises(EXERCISES, filters)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-700 hover:text-gray-900 mb-6 flex items-center gap-2 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад към Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exercise Guide</h1>
              <p className="text-gray-600">20 упражнения за оптимален тестостерон</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Филтри</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* T-Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Testosterone Boost
              </label>
              <select
                value={filters.tLevel}
                onChange={(e) => setFilters({ ...filters, tLevel: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Всички нива</option>
                {T_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Мускулна група
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Всички групи</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Показани: <span className="font-semibold text-gray-900">{filteredExercises.length}</span> от {EXERCISES.length} упражнения
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => setSelectedExercise(exercise)}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-500 transition-all cursor-pointer"
            >
              {/* Exercise Name */}
              <h3 className="text-lg font-bold text-gray-900 mb-3">{exercise.name}</h3>

              {/* Badges */}
              <div className="flex gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(exercise.category)}`}>
                  {exercise.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getTLevelColor(exercise.testosterone_benefit)}`}>
                  <span>{getTLevelIcon(exercise.testosterone_benefit)}</span>
                  {exercise.testosterone_benefit} T
                </span>
              </div>

              {/* Sets/Reps/Rest */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Серии:</span>
                  <span className="font-semibold text-gray-900">{exercise.sets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Повторения:</span>
                  <span className="font-semibold text-gray-900">{exercise.reps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Почивка:</span>
                  <span className="font-semibold text-gray-900">{exercise.rest}</span>
                </div>
              </div>

              {/* Click to view */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <span className="text-sm text-emerald-600 font-medium">Виж детайли →</span>
              </div>
            </div>
          ))}
        </div>

        {/* No results */}
        {filteredExercises.length === 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01" />
            </svg>
            <p className="text-gray-600">Няма намерени упражнения с избраните филтри.</p>
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedExercise(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedExercise.name}</h2>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(selectedExercise.category)}`}>
                      {selectedExercise.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getTLevelColor(selectedExercise.testosterone_benefit)}`}>
                      <span>{getTLevelIcon(selectedExercise.testosterone_benefit)}</span>
                      {selectedExercise.testosterone_benefit} T
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Training Parameters */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-emerald-700 font-medium mb-1">Серии</div>
                    <div className="text-2xl font-bold text-emerald-900">{selectedExercise.sets}</div>
                  </div>
                  <div>
                    <div className="text-sm text-emerald-700 font-medium mb-1">Повторения</div>
                    <div className="text-2xl font-bold text-emerald-900">{selectedExercise.reps}</div>
                  </div>
                  <div>
                    <div className="text-sm text-emerald-700 font-medium mb-1">Почивка</div>
                    <div className="text-2xl font-bold text-emerald-900">{selectedExercise.rest}</div>
                  </div>
                </div>
              </div>

              {/* Why T-Boost */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Защо повишава тестостерона?
                </h3>
                <p className="text-gray-700 leading-relaxed">{selectedExercise.testosterone_why}</p>
              </div>

              {/* Form Cues */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Правилна техника
                </h3>
                <ul className="space-y-2">
                  {selectedExercise.form.map((cue, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Mistakes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Чести грешки
                </h3>
                <ul className="space-y-2">
                  {selectedExercise.mistakes.map((mistake, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="flex-shrink-0 w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-700">{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <button
                onClick={() => setSelectedExercise(null)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Затвори
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
