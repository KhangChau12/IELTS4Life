import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between space-y-3 md:flex-row md:space-y-0">
          <div className="text-center text-xs md:text-sm text-slate-600 md:text-left">
            <p>&copy; {new Date().getFullYear()} IELTS4Life. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs md:text-sm text-slate-600">
            <Link href="/privacy" className="text-ocean-600 hover:text-ocean-700 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/terms" className="text-ocean-600 hover:text-ocean-700 transition-colors">
              Terms of Service
            </Link>
            <span className="text-slate-300">|</span>
            <a href="mailto:phuckhangtdn@gmail.com" className="hover:text-ocean-600 transition-colors break-all md:break-normal">
              phuckhangtdn@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
