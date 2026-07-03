'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, ArrowLeft, Waves, CheckCircle2, KeyRound } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Use NEXT_PUBLIC_SITE_URL if available (production), otherwise use window.location.origin (local dev)
      // This ensures production URL is used even when testing from localhost
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          // IMPORTANT: Add type=recovery so callback knows this is password reset flow
          redirectTo: `${baseUrl}/auth/callback?type=recovery`,
        }
      )

      if (resetError) {
        setError(resetError.message)
        return
      }

      setUserEmail(data.email)
      setEmailSent(true)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // If email sent, show success message
  if (emailSent) {
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
              <Mail className="w-12 h-12 text-cyan-600" />
            </div>
            <h2 className="text-5xl font-bold text-slate-900 mb-6">Check Your Email</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              We've sent password reset instructions to your email address.
            </p>
          </div>
        </div>

        {/* Right side - Success message */}
        <div className="w-full lg:w-1/2 flex items-start justify-center px-4 md:px-8 py-8 md:py-20 [@media(max-height:450px)]:py-2 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden [@media(max-height:450px)]:hidden text-center mb-6 md:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-ocean-600 rounded-xl mb-3 md:mb-4">
                <Waves className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-ocean-800">IELTS4Life</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-5 md:p-8 [@media(max-height:450px)]:p-4">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center mb-4 [@media(max-height:450px)]:w-10 [@media(max-height:450px)]:h-10 [@media(max-height:450px)]:mb-2">
                  <Mail className="w-8 h-8 text-ocean-600 [@media(max-height:450px)]:w-5 [@media(max-height:450px)]:h-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-ocean-800 mb-2 [@media(max-height:450px)]:text-xl">Email Sent!</h2>
                <p className="text-ocean-600 mb-2 [@media(max-height:450px)]:hidden">We've sent a password reset link to</p>
                <p className="text-lg font-semibold text-ocean-700 break-all">{userEmail}</p>
              </div>

              <div className="bg-ocean-50 border border-ocean-200 rounded-lg p-4 mt-6 mb-6 [@media(max-height:450px)]:mt-3 [@media(max-height:450px)]:mb-3 [@media(max-height:450px)]:p-2">
                <div className="flex items-center justify-center gap-2 text-ocean-700 mb-2 [@media(max-height:450px)]:mb-0">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Check your inbox</span>
                </div>
                <p className="text-sm text-ocean-600 text-center [@media(max-height:450px)]:hidden">
                  Click the link in the email to reset your password. The link expires in 1 hour.
                </p>
              </div>

              <div className="space-y-2 text-sm text-ocean-600 mb-6 [@media(max-height:450px)]:hidden">
                <p className="font-medium text-center">Didn't receive the email?</p>
                <ul className="list-disc list-inside space-y-1 text-ocean-500 pl-4">
                  <li>Check your spam/junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes and refresh your inbox</li>
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full h-11 border-ocean-200 hover:bg-ocean-50 text-ocean-700 mb-4"
                onClick={() => setEmailSent(false)}
              >
                Try Different Email
              </Button>

              <p className="text-center text-sm text-ocean-600">
                Remember your password?{' '}
                <Link href="/login" className="font-semibold text-ocean-700 hover:text-ocean-800">
                  Sign in here
                </Link>
              </p>
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
              Reset your password
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Don't worry! It happens. Enter your email and we'll send you instructions to reset your password.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-lg text-slate-700">Quick and secure password recovery</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-lg text-slate-700">Email link expires in 1 hour</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="text-lg text-slate-700">Get back to your IELTS practice instantly</p>
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
            {/* Back button */}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-ocean-600 hover:text-ocean-700 mb-6 [@media(max-height:450px)]:mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>

            <div className="mb-6 md:mb-8 [@media(max-height:450px)]:mb-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-ocean-100 rounded-xl mb-4 [@media(max-height:450px)]:hidden">
                <KeyRound className="w-6 h-6 text-ocean-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-ocean-800 mb-2 [@media(max-height:450px)]:text-xl [@media(max-height:450px)]:mb-1">Forgot password?</h2>
              <p className="text-sm md:text-base text-ocean-600 [@media(max-height:450px)]:hidden">
                No worries, we'll send you reset instructions.
              </p>
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

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-ocean-600 to-cyan-600 hover:from-ocean-700 hover:to-cyan-700 text-white font-medium shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>

            <div className="mt-6">
              <p className="text-center text-sm text-ocean-600">
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-ocean-700 hover:text-ocean-800"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
