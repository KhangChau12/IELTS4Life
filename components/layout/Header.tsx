'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Home, FileText, BookOpen, User, LogOut, Settings, History, Crown, Users, Menu, ChevronDown, PenTool } from 'lucide-react'
import { createClient, resetClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface HeaderProps {
  user?: {
    email: string
    role: 'student' | 'admin'
  } | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Reset singleton client to clear cached auth state
    resetClient()
    router.push('/login')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path

  // Check if user is Pro (PTNK email)
  const isPro = user?.email.endsWith('@ptnk.edu.vn') || false

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ocean-600 bg-ocean-700 shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl md:text-3xl lg:text-4xl font-[family-name:var(--font-shrikhand)]">
            <span className="text-cyan-400">IELTS</span>
            <span className="text-white">4Life</span>
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <TooltipProvider>
          <nav className="hidden md:flex items-center space-x-1">
            {/* Dashboard - Show for all, tooltip for guests */}
            {user ? (
              <Link href="/dashboard">
                <Button
                  variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
                  className={isActive('/dashboard') ? 'text-ocean-700' : 'text-white hover:bg-ocean-600'}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="ghost"
                      className="text-white/60 hover:bg-ocean-600 cursor-not-allowed"
                      disabled
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Sign up to access Dashboard & track your progress</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Essay Dropdown - Always accessible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={pathname.startsWith('/write') ? 'secondary' : 'ghost'}
                  className={pathname.startsWith('/write') ? 'text-ocean-700' : 'text-white hover:bg-ocean-600'}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Essay
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/write" className="cursor-pointer flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Score your Essay
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/write/prompts" className="cursor-pointer flex items-center">
                    <PenTool className="mr-2 h-4 w-4" />
                    Write new essay
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* History - Show for all, tooltip for guests */}
            {user ? (
              <Link href="/history">
                <Button
                  variant={isActive('/history') ? 'secondary' : 'ghost'}
                  className={isActive('/history') ? 'text-ocean-700' : 'text-white hover:bg-ocean-600'}
                >
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
              </Link>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="ghost"
                      className="text-white/60 hover:bg-ocean-600 cursor-not-allowed"
                      disabled
                    >
                      <History className="mr-2 h-4 w-4" />
                      History
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Sign up to access History & review past essays</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Vocabulary - Show for all, tooltip for guests */}
            {user ? (
              <Link href="/vocabulary">
                <Button
                  variant={isActive('/vocabulary') ? 'secondary' : 'ghost'}
                  className={isActive('/vocabulary') ? 'text-ocean-700' : 'text-white hover:bg-ocean-600'}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Vocabulary
                </Button>
              </Link>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="ghost"
                      className="text-white/60 hover:bg-ocean-600 cursor-not-allowed"
                      disabled
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Vocabulary
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Sign up to access your Vocabulary collection</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Invite - Show for Free tier users only (not Pro/PTNK) */}
            {user && !isPro && (
              <Link href="/invite">
                <Button
                  variant={isActive('/invite') ? 'secondary' : 'ghost'}
                  className={isActive('/invite') ? 'text-ocean-700' : 'text-white hover:bg-ocean-600'}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Invite
                </Button>
              </Link>
            )}

            {/* Admin - Show for admin only */}
            {user?.role === 'admin' && (
              <Link href="/admin">
                <Button
                  variant={isActive('/admin') ? 'secondary' : 'ghost'}
                  className={isActive('/admin') ? 'text-ocean-700' : 'text-white hover:bg-ocean-600'}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
          </nav>
        </TooltipProvider>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-ocean-600">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-ocean-700 text-white border-l border-ocean-600">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-[family-name:var(--font-shrikhand)]">
                  <span className="text-cyan-400">IELTS</span>
                  <span className="text-white">4Life</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {/* Dashboard */}
                {user ? (
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start ${isActive('/dashboard') ? 'text-ocean-700' : 'text-white hover:bg-ocean-600'}`}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white/60 hover:bg-ocean-600 cursor-not-allowed"
                    disabled
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                )}

                {/* Essay Section */}
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-3 py-1">Essay</p>
                  <Link href="/write" onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive('/write') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start pl-6 ${isActive('/write') ? 'text-ocean-700' : 'text-white hover:bg-ocean-600'}`}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Score your Essay
                    </Button>
                  </Link>
                  <Link href="/write/prompts" onClick={() => setIsOpen(false)}>
                    <Button
                      variant={pathname.startsWith('/write/prompts') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start pl-6 ${pathname.startsWith('/write/prompts') ? 'text-ocean-700' : 'text-white hover:bg-ocean-600'}`}
                    >
                      <PenTool className="mr-2 h-4 w-4" />
                      Write new essay
                    </Button>
                  </Link>
                </div>

                {/* History */}
                {user ? (
                  <Link href="/history" onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive('/history') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start ${isActive('/history') ? 'text-ocean-700' : 'text-white hover:bg-ocean-600'}`}
                    >
                      <History className="mr-2 h-4 w-4" />
                      History
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white/60 hover:bg-ocean-600 cursor-not-allowed"
                    disabled
                  >
                    <History className="mr-2 h-4 w-4" />
                    History
                  </Button>
                )}

                {/* Vocabulary */}
                {user ? (
                  <Link href="/vocabulary" onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive('/vocabulary') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start ${isActive('/vocabulary') ? 'text-ocean-700' : 'text-white hover:bg-ocean-600'}`}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Vocabulary
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white/60 hover:bg-ocean-600 cursor-not-allowed"
                    disabled
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Vocabulary
                  </Button>
                )}

                {/* Invite - Show for Free tier users only */}
                {user && !isPro && (
                  <Link href="/invite" onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive('/invite') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start ${isActive('/invite') ? 'text-ocean-700' : 'text-white hover:bg-ocean-600'}`}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Invite
                    </Button>
                  </Link>
                )}

                {/* Admin - Show for admin only */}
                {user?.role === 'admin' && (
                  <Link href="/admin" onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive('/admin') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start ${isActive('/admin') ? 'text-ocean-700' : 'text-white hover:bg-ocean-600'}`}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}

                {/* Divider */}
                <div className="border-t border-ocean-600 my-2" />

                {/* User Actions */}
                {user ? (
                  <>
                    <Link href="/subscription" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-ocean-600">
                        <Crown className="mr-2 h-4 w-4" />
                        Subscription
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-400 hover:bg-ocean-600"
                      onClick={() => {
                        handleSignOut()
                        setIsOpen(false)
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-ocean-600">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full justify-start bg-cyan-500 hover:bg-cyan-600">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* User Menu or Auth Buttons */}
        <div className="hidden md:flex items-center space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-ocean-600">
                  <User className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="text-sm text-slate-600">
                  {user.role === 'admin' ? 'Administrator' : 'Student'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/subscription" className="cursor-pointer">
                    <Crown className="mr-2 h-4 w-4" />
                    Subscription
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:bg-ocean-600 text-sm md:text-base px-2 md:px-4">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-sm md:text-base px-3 md:px-4">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Sign Up</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
