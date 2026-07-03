'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Lock, CheckCircle, Waves, CheckCircle2, ShieldCheck } from 'lucide-react'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Check if we have a valid recovery token
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        // Check if we're in password recovery flow
        if (session) {
          setIsValidToken(true)
        } else {
          setError('Invalid or expired reset link. Please request a new one.')
        }
      } catch (err) {
        setError('An error occurred. Please try again.')
      } finally {
        setIsChecking(false)
      }
    }

    checkSession()
  }, [])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while checking token
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-ocean-600 mx-auto mb-4" />
          <p className="text-ocean-600">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex">
        {/* Left side - Hero section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 px-16 py-20 flex-col justify-center relative overflow-hidden">
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

          <div className="relative z-10 text-center max-w-lg mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/80 backdrop-blur-sm rounded-2xl mb-8 border border-cyan-200 shadow-lg">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-5xl font-bold text-slate-900 mb-6">Password Updated!</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Your password has been successfully changed. Redirecting you to your dashboard...
            </p>
          </div>
        </div>

        {/* Right side - Success message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 md:px-8 py-8 md:py-20 [@media(max-height:450px)]:py-2 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-5 md:p-8 [@media(max-height:450px)]:p-4 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 [@media(max-height:450px)]:w-10 [@media(max-height:450px)]:h-10 [@media(max-height:450px)]:mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-ocean-800 mb-2">All Set!</h2>
              <p className="text-ocean-600 mb-6">
                Your password has been successfully updated.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-ocean-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to dashboard...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center border border-cyan-200 shadow-lg">
              <Waves className="w-7 h-7 text-cyan-600" />
            </div>
            <span className="text-2xl font-bold text-slate-900">IELTS4Life</span>
          </div>

          {/* Main heading */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Set new password
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Choose a strong password to keep your account secure and continue your IELTS journey.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-lg text-slate-700">Minimum 6 characters required</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-lg text-slate-700">Secure encryption for your data</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-lg text-slate-700">Access all your essays and progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form section */}
      <div className="w-full lg:w-1/2 flex items-start justify-center px-4 md:px-8 py-8 md:py-20 [@media(max-height:450px)]:py-2 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden [@media(max-height:450px)]:hidden text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-ocean-600 rounded-xl mb-3 md:mb-4">
              <Waves className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-ocean-800">IELTS4Life</h1>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-xl p-5 md:p-8 [@media(max-height:450px)]:p-4">
            <div className="mb-6 md:mb-8 [@media(max-height:450px)]:mb-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-ocean-100 rounded-xl mb-4 [@media(max-height:450px)]:hidden">
                <ShieldCheck className="w-6 h-6 text-ocean-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-ocean-800 mb-2 [@media(max-height:450px)]:text-xl [@media(max-height:450px)]:mb-1">Create new password</h2>
              <p className="text-sm md:text-base text-ocean-600 [@media(max-height:450px)]:hidden">
                Your new password must be different from previous passwords.
              </p>
            </div>

            {!isValidToken ? (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error || 'This reset link is invalid or has expired.'}
                </div>
                <Link href="/forgot-password">
                  <Button
                    variant="outline"
                    className="w-full h-11 border-ocean-200 hover:bg-ocean-50 text-ocean-700"
                  >
                    Request New Reset Link
                  </Button>
                </Link>
                <p className="text-center text-sm text-ocean-600">
                  <Link href="/login" className="font-semibold text-ocean-700 hover:text-ocean-800">
                    Back to login
                  </Link>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 [@media(max-height:450px)]:space-y-2">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-ocean-700 font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ocean-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 6 characters"
                      className="pl-10 h-11 border-ocean-200 focus:border-ocean-400"
                      disabled={isLoading}
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-ocean-700 font-medium">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ocean-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      className="pl-10 h-11 border-ocean-200 focus:border-ocean-400"
                      disabled={isLoading}
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
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
                      Updating password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
