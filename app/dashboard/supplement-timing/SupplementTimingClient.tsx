'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SUPPLEMENTS, INTERACTIONS } from '@/lib/data/supplements-database'
import type { Supplement } from '@/lib/data/supplements-database'
import {
  generateSchedule,
  getSeverityColor,
  type WorkoutTime,
  type UserSchedule
} from '@/lib/utils/supplement-timing'

interface SupplementTimingClientProps {
  userId: string
}

export default function SupplementTimingClient({ userId }: SupplementTimingClientProps) {
  const router = useRouter()

  // State
  const [wakeTime, setWakeTime] = useState('07:00')
  const [workoutTime, setWorkoutTime] = useState<WorkoutTime>('morning')
  const [schedule, setSchedule] = useState<ReturnType<typeof generateSchedule>>([])

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`supplement_schedule_${userId}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      setWakeTime(parsed.wakeTime)
      setWorkoutTime(parsed.workoutTime)
    }
    generateTimeline()
  }, [userId])

  // Generate timeline when inputs change
  useEffect(() => {
    generateTimeline()
  }, [wakeTime, workoutTime])

  const generateTimeline = () => {
    const userSchedule: UserSchedule = {
      wakeTime,
      workoutTime
    }

    const timeline = generateSchedule(SUPPLEMENTS, userSchedule)
    setSchedule(timeline)

    // Save to localStorage
    localStorage.setItem(`supplement_schedule_${userId}`, JSON.stringify(userSchedule))
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-page-break {
            page-break-after: always;
          }
          @page {
            margin: 1.5cm;
          }
        }
      `}} />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="no-print text-gray-700 hover:text-gray-900 mb-6 flex items-center gap-2 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад към Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="8" y="8" width="8" height="8" rx="2" strokeWidth={2} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V4m0 16v-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Supplement Timing</h1>
                <p className="text-gray-600">Персонализиран график за хранителни добавки</p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="no-print px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Принтирай
            </button>
          </div>
        </div>

        {/* Input Form */}
        <div className="no-print bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Настрой графика</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wake Time */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Време на събуждане
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Workout Time */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Време на тренировка
              </label>
              <select
                value={workoutTime}
                onChange={(e) => setWorkoutTime(e.target.value as WorkoutTime)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="morning">Сутрин (7-10)</option>
                <option value="lunch">Обяд (12-14)</option>
                <option value="evening">Вечер (17-20)</option>
                <option value="none">Не тренирам</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Твоя ежедневен график</h2>
          <div className="space-y-6">
            {schedule.map((entry, index) => (
              <div key={index} className="relative">
                {/* Time Badge */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-20">
                    <div className="bg-purple-100 text-purple-900 font-bold text-lg px-4 py-2 rounded-lg text-center">
                      {entry.time}
                    </div>
                    <div className="text-xs text-gray-600 text-center mt-1">{entry.label}</div>
                  </div>

                  {/* Supplements */}
                  <div className="flex-1 space-y-3">
                    {entry.supplements.map((supp) => (
                      <div
                        key={supp.id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-500 transition-all"
                        style={{ borderLeftColor: supp.color, borderLeftWidth: '4px' }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900">{supp.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              supp.category === 'testosterone'
                                ? 'bg-blue-100 text-blue-700'
                                : supp.category === 'sleep'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {supp.category === 'testosterone' ? 'Testosterone' :
                               supp.category === 'sleep' ? 'Sleep' : 'Workout'}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-purple-600">{supp.dosage}</div>
                            <div className="text-xs text-gray-600">{supp.withFood}</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{supp.why}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connector Line */}
                {index < schedule.length - 1 && (
                  <div className="absolute left-10 top-full h-6 w-0.5 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Interactions Warning */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            НИКОГА не комбинирай
          </h2>
          <div className="space-y-3">
            {INTERACTIONS.map((interaction, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 ${getSeverityColor(interaction.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">
                      {interaction.supplements.join(' + ')}
                    </div>
                    <p className="text-sm">{interaction.warning}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                    interaction.severity === 'high'
                      ? 'bg-red-200 text-red-900'
                      : interaction.severity === 'medium'
                      ? 'bg-orange-200 text-orange-900'
                      : 'bg-yellow-200 text-yellow-900'
                  }`}>
                    {interaction.severity === 'high' ? 'Високо' : interaction.severity === 'medium' ? 'Средно' : 'Ниско'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
