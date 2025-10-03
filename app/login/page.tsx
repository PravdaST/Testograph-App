'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showLoadingScreen, setShowLoadingScreen] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const toggleForgotPassword = (show: boolean) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setShowForgotPassword(show)
      setError(null)
      setIsTransitioning(false)
    }, 300)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('Грешен имейл или парола')
        setLoading(false)
        return
      }

      if (data.user) {
        // Show loading screen before redirect
        setShowLoadingScreen(true)

        // Small delay for smooth animation then redirect
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 800)
      }
    } catch (err) {
      setError('Възникна грешка. Моля опитайте отново.')
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!email) {
      setError('Моля въведете вашия имейл')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setError('Възникна грешка. Моля опитайте отново.')
        setLoading(false)
        return
      }

      setResetSent(true)
      setLoading(false)
    } catch (err) {
      setError('Възникна грешка. Моля опитайте отново.')
      setLoading(false)
    }
  }

  // Loading Screen
  if (showLoadingScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 animate-gradient">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        {/* Loading Content */}
        <div className="relative z-10 text-center animate-scaleIn px-4">
          <div className="mb-6">
            {/* Spinning loader */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 animate-pulse">
            Влизане...
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            Подготвяме вашия профил
          </p>
        </div>
      </div>
    )
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex overflow-hidden">
        {/* Left Side - Hero Section (same as login) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden animate-gradient">
          {/* Animated Mesh Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-3xl animate-float animate-mesh"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-3xl animate-float-delayed"></div>
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>

          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white animate-slideInLeft">
            <div className="mb-8">
              <h1 className="text-4xl xl:text-5xl font-bold mb-4">Testograph Apps</h1>
              <p className="text-lg xl:text-xl text-indigo-100">
                Вашата персонална платформа за оптимизация на здравето и резултатите
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Forgot Password Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50 relative overflow-hidden overflow-y-auto">
          {/* Subtle animated background */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
          </div>

          <div className="w-full max-w-md animate-slideInRight relative z-10">
            <div className="lg:hidden text-center mb-8 animate-slideInLeft">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent animate-gradient">
                Testograph Apps
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Възстановяване на парола
              </p>
            </div>

            <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-md transition-shadow duration-300 ${isTransitioning ? 'animate-fadeOut' : 'animate-fadeInUp'}`}>
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Забравена парола</h2>
                <p className="text-sm text-gray-600">
                  Въведете вашия имейл за да получите линк за възстановяване
                </p>
              </div>

              {resetSent ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4 animate-slideUp">
                    <p className="text-sm text-green-800">
                      Изпратихме ви имейл с линк за възстановяване на паролата. Моля проверете вашата поща.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setResetSent(false)
                      toggleForgotPassword(false)
                    }}
                    className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Обратно към вход
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4 animate-slideUp">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="group">
                    <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Имейл адрес
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        id="reset-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-400 transition-all duration-200"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 sm:py-2.5 px-4 text-base sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group touch-manipulation"
                  >
                    {loading ? 'Изпращане...' : (
                      <>
                        Изпрати линк
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleForgotPassword(false)}
                    className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors hover:scale-105"
                  >
                    Обратно към вход
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden animate-gradient">
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-3xl animate-float animate-mesh"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white animate-slideInLeft">
          <div className="mb-8">
            <h1 className="text-4xl xl:text-5xl font-bold mb-4">
              Testograph Apps
            </h1>
            <p className="text-lg xl:text-xl text-indigo-100">
              Вашата персонална платформа за оптимизация на здравето и резултатите
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-4 mt-8">
            {[
              'Персонализирани хранителни планове',
              'Научно базирани протоколи за сън',
              'Оптимален timing на хранителни добавки',
              'Тренировъчни програми и лабораторни анализи',
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 opacity-0 animate-slideInLeft transition-all hover:translate-x-2"
                style={{
                  animationDelay: `${0.3 + index * 0.1}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-all hover:bg-white/30 hover:scale-110">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-indigo-50">{feature}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/20 opacity-0 animate-slideInLeft" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
            <div className="transition-all hover:scale-110">
              <div className="text-3xl font-bold">5+</div>
              <div className="text-sm text-indigo-200">Приложения</div>
            </div>
            <div className="transition-all hover:scale-110">
              <div className="text-3xl font-bold">30</div>
              <div className="text-sm text-indigo-200">Дни планиране</div>
            </div>
            <div className="transition-all hover:scale-110">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-indigo-200">Достъп</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50 relative overflow-hidden overflow-y-auto">
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="w-full max-w-md animate-slideInRight relative z-10">
          {/* Logo for Mobile */}
          <div className="lg:hidden text-center mb-8 animate-slideInLeft">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent animate-gradient">
              Testograph Apps
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Платформа за оптимизация на здравето
            </p>
          </div>

          {/* Form Card */}
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-md transition-shadow duration-300 ${isTransitioning ? 'animate-fadeOut' : 'animate-fadeInUp'}`}>
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Добре дошли
              </h2>
              <p className="text-sm text-gray-600">
                Влезте в акаунта си за достъп до вашите приложения
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="group">
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2">
                  Имейл адрес
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-400 transition-all duration-200"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Парола
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-400 transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => toggleForgotPassword(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  Забравена парола?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 sm:py-2.5 px-4 text-base sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group touch-manipulation"
              >
                {loading ? 'Влизане...' : (
                  <>
                    Влез
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Нямате акаунт?{' '}
                <a
                  href="https://shop.testograph.eu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold transition-all hover:underline hover:scale-105 inline-block"
                >
                  Закупете пакет
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
