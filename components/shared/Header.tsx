'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Home, Heart, Dumbbell, Leaf, TrendingUp, Settings, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const LIENS_NAV = [
  { href: '/',              label: "Aujourd'hui", icone: Home },
  { href: '/cycle',         label: 'Cycle',        icone: Heart },
  { href: '/sport',         label: 'Sport',        icone: Dumbbell },
  { href: '/alimentation',  label: 'Alimentation', icone: Leaf },
  { href: '/progression',   label: 'Progression',  icone: TrendingUp },
  { href: '/parametres',    label: 'Paramètres',   icone: Settings },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  async function seDeconnecter() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="font-bold text-lg tracking-tight text-neutral-900 dark:text-neutral-50 shrink-0">
          Gaia
        </Link>

        {/* Navigation — masquée sur mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {LIENS_NAV.map(({ href, label, icone: Icone }) => {
            const actif = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors
                  ${actif
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 font-medium'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                  }`}
              >
                <Icone size={14} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8"
            aria-label="Changer le thème"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </Button>
          <Button variant="ghost" size="sm" onClick={seDeconnecter} className="text-sm h-8">
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Navigation mobile — barre du bas */}
      <nav className="md:hidden flex border-t border-neutral-200 dark:border-neutral-800">
        {LIENS_NAV.map(({ href, label, icone: Icone }) => {
          const actif = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors
                ${actif
                  ? 'text-neutral-900 dark:text-neutral-50'
                  : 'text-neutral-400 dark:text-neutral-500'
                }`}
            >
              <Icone size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
