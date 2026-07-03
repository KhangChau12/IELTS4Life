'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock, CheckCircle2 } from 'lucide-react'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (signInData.user) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 px-16 py-20 flex-col justify-start relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-sky-400/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Floating shapes */}
            <div className="absolute top-1/4 left-1/4 h-4 w-4 rounded-full bg-cyan-400/40 animate-float" />
            <div className="absolute top-1/3 right-1/3 h-3 w-3 rounded-full bg-blue-400/40 animate-float" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-1/3 left-1/2 h-5 w-5 rounded-full bg-sky-400/40 animate-float" style={{ animationDelay: '1.5s' }} />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0f2fe_1px,transparent_1px),linear-gradient(to_bottom,#e0f2fe_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <div className="mb-16">
            <span className="text-3xl font-[family-name:var(--font-shrikhand)]">
              <span className="text-cyan-500">IELTS</span>
              <span className="text-slate-800">4Life</span>
            </span>
          </div>

          {/* Main heading */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Welcome back
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Continue your journey to IELTS success with AI-powered feedback and expert guidance.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-lg text-slate-700">Instant detailed feedback on your essays</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-lg text-slate-700">Accurate IELTS band score predictions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-lg text-slate-700">Track your progress over time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form section */}
      <div className="w-full lg:w-1/2 flex items-start justify-center px-4 md:px-8 py-4 sm:py-8 md:py-20 [@media(max-height:450px)]:py-2 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo (hidden on desktop, hidden on short landscape) */}
          <div className="lg:hidden [@media(max-height:450px)]:hidden text-center mb-4 sm:mb-6 md:mb-8">
            <span className="text-2xl md:text-3xl font-[family-name:var(--font-shrikhand)]">
              <span className="text-cyan-500">IELTS</span>
              <span className="text-ocean-800">4Life</span>
            </span>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-xl p-5 md:p-8 [@media(max-height:450px)]:p-4">
            <div className="mb-5 md:mb-6 [@media(max-height:450px)]:mb-3">
              <h2 className="text-2xl md:text-3xl font-bold text-ocean-800 mb-2 [@media(max-height:450px)]:text-xl [@media(max-height:450px)]:mb-1">Sign in</h2>
              <p className="text-sm md:text-base text-ocean-600 [@media(max-height:450px)]:hidden">Continue your IELTS journey</p>
            </div>

            {/* Quick sign-in options */}
            <div className="flex flex-col gap-4 [@media(max-height:450px)]:gap-2">
              <GoogleAuthButton label="Sign in with Google" />

              <Link href="/score" className="block">
                <Button
                  variant="outline"
                  className="w-full h-11 border-ocean-200 hover:bg-ocean-50 text-ocean-700"
                >
                  Try as Guest (1 Free Essay)
                </Button>
              </Link>
            </div>

            {/* Divider */}
            <div className="relative my-5 [@media(max-height:450px)]:my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ocean-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-ocean-500">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 [@media(max-height:450px)]:space-y-2">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-ocean-700 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ocean-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10 h-11 border-ocean-200 focus:border-ocean-400"
                    disabled={isLoading}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-ocean-700 font-medium">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-ocean-600 hover:text-ocean-700"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ocean-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10 h-11 border-ocean-200 focus:border-ocean-400"
                    disabled={isLoading}
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-ocean-600 to-cyan-600 hover:from-ocean-700 hover:to-cyan-700 text-white font-medium shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-ocean-600 mt-5">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-ocean-700 hover:text-ocean-800"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
