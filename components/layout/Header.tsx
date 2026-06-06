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
import { Home, FileText, User, LogOut, Settings, History, Crown, Users, Menu, PenTool, Bell, ChevronDown } from 'lucide-react'
import { createClient, resetClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
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
    full_name?: string | null
    role: 'student' | 'admin' | 'dev'
  } | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/notifications?unread_only=true')

        if (res.status === 401) {
          setUnreadCount(0)
          return
        }

        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.unreadCount || 0)
        }
      } catch {
        // Silently fail - notifications are non-critical
      }
    }

    fetchUnreadCount()
  // Fetch only when user changes (login/logout), NOT on every navigation.
  }, [user])

  const handleSignOut = async () => {
    await supabaseRef.current.auth.signOut()
    resetClient()
    router.push('/login')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path

  const isPro = user?.email.endsWith('@ptnk.edu.vn') || false

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ocean-200 bg-sky-100/70 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto relative flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl md:text-3xl lg:text-4xl font-[family-name:var(--font-shrikhand)]">
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">IELTS</span>
            <span className="text-slate-800">4Life</span>
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <TooltipProvider>
          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center space-x-1">
            {user ? (
              <Link href="/dashboard" className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-ocean-50 hover:text-ocean-700 ${isActive('/dashboard') ? 'text-ocean-700' : 'text-slate-600'} group`}>
                <Home className="h-4 w-4" />
                Dashboard
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-200 ${isActive('/dashboard') ? 'w-4/5' : 'w-0 group-hover:w-1/2'}`} />
              </Link>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="ghost"
                      className="text-slate-300 cursor-not-allowed"
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

            <Link href="/write" className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-ocean-50 hover:text-ocean-700 ${isActive('/write') ? 'text-ocean-700' : 'text-slate-600'} group`}>
              <FileText className="h-4 w-4" />
              Score Essay
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-200 ${isActive('/write') ? 'w-4/5' : 'w-0 group-hover:w-1/2'}`} />
            </Link>

            <Link href="/write/prompts" className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-ocean-50 hover:text-ocean-700 ${pathname.startsWith('/write/prompts') ? 'text-ocean-700' : 'text-slate-600'} group`}>
              <PenTool className="h-4 w-4" />
              Write
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-200 ${pathname.startsWith('/write/prompts') ? 'w-4/5' : 'w-0 group-hover:w-1/2'}`} />
            </Link>

            {user ? (
              <Link href="/history" className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-ocean-50 hover:text-ocean-700 ${isActive('/history') ? 'text-ocean-700' : 'text-slate-600'} group`}>
                <History className="h-4 w-4" />
                History
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-200 ${isActive('/history') ? 'w-4/5' : 'w-0 group-hover:w-1/2'}`} />
              </Link>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="ghost"
                      className="text-slate-300 cursor-not-allowed"
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
          </nav>
        </TooltipProvider>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-ocean-50">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-white border-l border-slate-100">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-[family-name:var(--font-shrikhand)]">
                  <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">IELTS</span>
                  <span className="text-slate-800">4Life</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-6">
                {user ? (
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start ${isActive('/dashboard') ? 'text-ocean-700 bg-ocean-50' : 'text-slate-600 hover:text-ocean-700 hover:bg-ocean-50'}`}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-300 cursor-not-allowed"
                    disabled
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                )}

                <Link href="/write" onClick={() => setIsOpen(false)}>
                  <Button
                    variant={isActive('/write') ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${isActive('/write') ? 'text-ocean-700 bg-ocean-50' : 'text-slate-600 hover:text-ocean-700 hover:bg-ocean-50'}`}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Score Essay
                  </Button>
                </Link>

                <Link href="/write/prompts" onClick={() => setIsOpen(false)}>
                  <Button
                    variant={pathname.startsWith('/write/prompts') ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${pathname.startsWith('/write/prompts') ? 'text-ocean-700 bg-ocean-50' : 'text-slate-600 hover:text-ocean-700 hover:bg-ocean-50'}`}
                  >
                    <PenTool className="mr-2 h-4 w-4" />
                    Write
                  </Button>
                </Link>

                {user ? (
                  <Link href="/history" onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive('/history') ? 'secondary' : 'ghost'}
                      className={`w-full justify-start ${isActive('/history') ? 'text-ocean-700 bg-ocean-50' : 'text-slate-600 hover:text-ocean-700 hover:bg-ocean-50'}`}
                    >
                      <History className="mr-2 h-4 w-4" />
                      History
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-300 cursor-not-allowed"
                    disabled
                  >
                    <History className="mr-2 h-4 w-4" />
                    History
                  </Button>
                )}

                <div className="border-t border-slate-100 my-2" />

                {user ? (
                  <>
                    <Link href="/subscription" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-ocean-700 hover:bg-ocean-50">
                        <Crown className="mr-2 h-4 w-4" />
                        Subscription
                      </Button>
                    </Link>
                    <Link href="/notifications" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-ocean-700 hover:bg-ocean-50">
                        <div className="flex items-center w-full">
                          <Bell className="mr-2 h-4 w-4" />
                          Notifications
                          {unreadCount > 0 && (
                            <span className="ml-2 flex h-2 w-2 rounded-full bg-red-500" />
                          )}
                        </div>
                      </Button>
                    </Link>
                    {user && !isPro && (
                      <Link href="/invite" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-ocean-700 hover:bg-ocean-50">
                          <Users className="mr-2 h-4 w-4" />
                          Invite Friends
                        </Button>
                      </Link>
                    )}
                    {(user?.role === 'admin' || user?.role === 'dev') && (
                      <Link href="/admin" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-ocean-700 hover:bg-ocean-50">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
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
                      <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-ocean-700 hover:bg-ocean-50">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* User Menu or Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-slate-600 hover:text-ocean-700 hover:bg-ocean-50 relative">
                  <User className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline max-w-[140px] truncate">{user.full_name || user.email}</span>
                  <ChevronDown className="hidden md:inline h-3.5 w-3.5 ml-1 opacity-70" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="text-sm text-slate-500">
                  {user.role === 'admin' ? 'Administrator' : 'Student'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/subscription" className="cursor-pointer">
                    <Crown className="mr-2 h-4 w-4" />
                    Subscription
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notifications" className="cursor-pointer">
                    <div className="flex items-center w-full">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-auto flex h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
                {(user && !isPro) || (user?.role === 'admin' || user?.role === 'dev') ? (
                  <DropdownMenuSeparator />
                ) : null}
                {user && !isPro && (
                  <DropdownMenuItem asChild>
                    <Link href="/invite" className="cursor-pointer">
                      <Users className="mr-2 h-4 w-4" />
                      Invite Friends
                    </Link>
                  </DropdownMenuItem>
                )}
                {(user?.role === 'admin' || user?.role === 'dev') && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
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
                <Button variant="ghost" className="text-slate-600 hover:text-ocean-700 hover:bg-ocean-50 text-sm px-3">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm px-4">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
