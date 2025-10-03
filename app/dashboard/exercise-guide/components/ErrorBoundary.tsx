'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component for graceful error handling
 * Prevents entire app crash when component errors occur
 * Production-ready for 1000+ users
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to console (in production, send to error tracking service like Sentry)
    console.error('Exercise Guide Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Нещо се обърка
            </h2>

            <p className="text-gray-600 mb-6">
              Извинете, възникна грешка при зареждане на Exercise Guide.
              Моля, опреснете страницата или се свържете с поддръжка ако проблемът продължава.
            </p>

            {this.state.error && (
              <details className="text-left mb-6 p-4 bg-gray-50 rounded-lg">
                <summary className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Технически детайли
                </summary>
                <p className="text-xs text-gray-600 mt-2 font-mono">
                  {this.state.error.toString()}
                </p>
              </details>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              Опресни страницата
            </button>

            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="w-full mt-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Опитай отново
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
