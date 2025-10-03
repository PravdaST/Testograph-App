/**
 * Reusable components for Meal Planner
 * Following DRY and KISS principles
 */

import { LucideIcon } from 'lucide-react'

// ============================================
// BUTTON COMPONENTS
// ============================================

interface SelectionButtonProps {
  label: string
  sublabel: string
  selected: boolean
  onClick: () => void
  Icon?: LucideIcon
}

export function SelectionButton({ label, sublabel, selected, onClick, Icon }: SelectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left w-full ${
        selected
          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
        {Icon && (
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0" strokeWidth={2} />
        )}
        <span className="font-semibold text-sm sm:text-base text-gray-900">{label}</span>
      </div>
      <p className="text-xs text-gray-600">{sublabel}</p>
    </button>
  )
}

// ============================================
// ACTIVITY LEVEL BUTTON
// ============================================

interface ActivityButtonProps {
  label: string
  sublabel: string
  selected: boolean
  onClick: () => void
}

export function ActivityButton({ label, sublabel, selected, onClick }: ActivityButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-center text-xs sm:text-sm w-full ${
        selected
          ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
          : 'border-gray-200 hover:border-gray-300 text-gray-700'
      }`}
    >
      <div className="font-semibold mb-0.5 sm:mb-1">{label}</div>
      <div className="text-xs opacity-75">{sublabel}</div>
    </button>
  )
}

// ============================================
// INPUT FIELD
// ============================================

interface InputFieldProps {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit: string
  helper: string
  type?: 'number' | 'text'
}

export function InputField({ id, label, value, onChange, min, max, step = 1, unit, helper, type = 'number' }: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : parseInt(e.target.value))}
          required
          className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900"
        />
        <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          {unit}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{helper}</p>
    </div>
  )
}

// ============================================
// STAT CARD
// ============================================

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  subtitle: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'amber'
}

const colorConfig = {
  blue: {
    border: 'border-blue-100',
    gradient: 'from-blue-500 to-blue-600',
    bg: 'from-blue-500 to-blue-600',
    text: 'text-blue-900',
    label: 'text-blue-700',
    subtitle: 'text-blue-600',
    bar: 'bg-gradient-to-r from-blue-500 to-blue-600'
  },
  green: {
    border: 'border-green-100',
    gradient: 'from-green-500 to-emerald-600',
    bg: 'from-green-500 to-emerald-600',
    text: 'text-green-900',
    label: 'text-green-700',
    subtitle: 'text-green-600',
    bar: 'bg-gradient-to-r from-green-500 to-emerald-600'
  },
  purple: {
    border: 'border-purple-100',
    gradient: 'from-purple-500 to-purple-600',
    bg: 'from-purple-500 to-purple-600',
    text: 'text-purple-900',
    label: 'text-purple-700',
    subtitle: 'text-purple-600',
    bar: 'bg-gradient-to-r from-purple-500 to-purple-600'
  },
  orange: {
    border: 'border-orange-100',
    gradient: 'from-orange-500 to-orange-600',
    bg: 'from-orange-500 to-orange-600',
    text: 'text-orange-900',
    label: 'text-orange-700',
    subtitle: 'text-orange-600',
    bar: 'bg-gradient-to-r from-orange-500 to-orange-600'
  },
  amber: {
    border: 'border-amber-100',
    gradient: 'from-amber-500 to-amber-600',
    bg: 'from-amber-500 to-amber-600',
    text: 'text-amber-900',
    label: 'text-amber-700',
    subtitle: 'text-amber-600',
    bar: 'bg-gradient-to-r from-amber-500 to-amber-600'
  }
}

export function StatCard({ icon: Icon, label, value, subtitle, color }: StatCardProps) {
  const config = colorConfig[color]

  return (
    <div className={`relative overflow-hidden bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border ${config.border}`}>
      <div className={`h-0.5 bg-gradient-to-r ${config.gradient}`} />
      <div className="p-2 sm:p-2.5">
        <div className="flex items-center justify-between mb-1">
          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded bg-gradient-to-br ${config.bg} flex items-center justify-center`}>
            <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={2.5} />
          </div>
          <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${config.label}`}>{label}</div>
        </div>
        <div className={`text-base sm:text-lg font-bold ${config.text}`}>{value}</div>
        <div className={`text-[10px] sm:text-xs mt-0.5 font-medium ${config.subtitle}`}>{subtitle}</div>
      </div>
    </div>
  )
}

// ============================================
// WEEK TAB
// ============================================

interface WeekTabProps {
  week: number
  selected: boolean
  progress: number
  onClick: () => void
}

export function WeekTab({ week, selected, progress, onClick }: WeekTabProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 px-3 sm:px-5 py-2.5 sm:py-3.5 font-semibold rounded-lg transition-all text-sm sm:text-base ${
        selected
          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg scale-105'
          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-300 hover:scale-102'
      }`}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <span className="truncate">Седм. {week}</span>
        <div className={`text-xs font-bold ${selected ? 'text-white' : 'text-emerald-600'}`}>
          {progress}%
        </div>
      </div>
    </button>
  )
}

// ============================================
// MEAL BUTTON
// ============================================

interface MealButtonProps {
  icon: LucideIcon
  label: string
  cooked: boolean
  onClick: () => void
  colorClass: string
  cookedColorClass: string
}

export function MealButton({ icon: Icon, label, cooked, onClick, colorClass, cookedColorClass }: MealButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded border transition-colors group/btn relative ${
        cooked ? cookedColorClass : colorClass
      }`}
    >
      <Icon className={`w-3 h-3 flex-shrink-0 ${cooked ? 'text-green-700' : ''}`} strokeWidth={2.5} />
      <span className={`text-xs font-medium truncate ${cooked ? 'text-green-800' : ''}`}>{label}</span>
      {cooked && (
        <svg className="w-3 h-3 text-green-700 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}

// ============================================
// LOADING SPINNER
// ============================================

export function LoadingSpinner() {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={2} strokeDasharray="60" strokeDashoffset="20" />
    </svg>
  )
}

// ============================================
// BACK BUTTON
// ============================================

interface BackButtonProps {
  onClick: () => void
  label?: string
}

export function BackButton({ onClick, label = 'Назад към Dashboard' }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group text-gray-700 hover:text-emerald-600 mb-3 flex items-center gap-1.5 text-sm font-medium transition-all"
    >
      <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </div>
      {label}
    </button>
  )
}

// ============================================
// ACTION BUTTON
// ============================================

interface ActionButtonProps {
  onClick: () => void
  icon?: LucideIcon
  label: string
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

export function ActionButton({ onClick, icon: Icon, label, variant = 'primary', loading = false }: ActionButtonProps) {
  const baseClasses = "group flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-200"

  const variantClasses = variant === 'primary'
    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-md hover:scale-105'
    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-300'

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses}`} disabled={loading}>
      {loading ? (
        <LoadingSpinner />
      ) : Icon && (
        <Icon className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" strokeWidth={2.5} />
      )}
      {label}
    </button>
  )
}
