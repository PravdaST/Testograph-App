'use client'

import { useState } from 'react'

/**
 * Data Disclaimer Component
 * Informs users that lab data may be outdated and should be verified
 * Production-ready for customer-facing application
 */
export function DataDisclaimer() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 sm:p-5 mb-6">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-amber-900 mb-1">
            Важна информация за данните
          </h3>
          <p className="text-sm text-amber-800 mb-2">
            Информацията за лабораториите е ориентировъчна. Моля, потвърдете детайлите директно с лабораторията.
          </p>

          {/* Expandable section */}
          {isExpanded && (
            <div className="mt-3 space-y-2 text-sm text-amber-800">
              <p className="font-semibold">Моля, преди да посетите лаборатория:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Обадете се на посочения телефон за цени и условия</li>
                <li>Проверете актуалните работни часове</li>
                <li>Попитайте дали е необходимо записване на час</li>
                <li>Уточнете точния адрес на локацията</li>
                <li>Попитайте какви изследвания предлагат (Total T, Free T, Пакет)</li>
              </ul>
              <p className="mt-3 pt-3 border-t border-amber-200 text-xs">
                <strong>Забележка:</strong> Ние не носим отговорност за неточности в данните.
                Всички детайли трябва да бъдат потвърдени директно с лабораторията.
              </p>
            </div>
          )}

          {/* Toggle button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-1"
          >
            {isExpanded ? 'Скрий детайли' : 'Виж повече'}
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
