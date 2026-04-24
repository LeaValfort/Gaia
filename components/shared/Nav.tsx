'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  Home,
  Moon,
  Sun,
  Dumbbell,
  UtensilsCrossed,
  MoreHorizontal,
  TrendingUp,
  HeartHandshake,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { designPhaseAffichage } from '@/lib/cycle'
import type { ModeUtilisateur, Phase } from '@/types'
import { DEFAULT_MODE_UTILISATEUR } from '@/types'
import { cn } from '@/lib/utils'

const LIENS_DESKTOP = [
  { href: '/', label: "Aujourd'hui", icone: Home },
  { href: '/cycle', label: 'Cycle', icone: Moon },
  { href: '/sport', label: 'Sport', icone: Dumbbell },
  { href: '/alimentation', label: 'Alimentation', icone: UtensilsCrossed },
  { href: '/progression', label: 'Progression', icone: TrendingUp },
  { href: '/proches', label: 'Proches', icone: HeartHandshake },
  { href: '/parametres', label: 'Paramètres', icone: Settings },
] as const

const LIENS_MOBILE_PRINCIPAL: { href: string; label: string; icone: LucideIcon }[] = [
  { href: '/', label: 'Accueil', icone: Home },
  { href: '/cycle', label: 'Cycle', icone: Moon },
  { href: '/sport', label: 'Sport', icone: Dumbbell },
  { href: '/alimentation', label: 'Manger', icone: UtensilsCrossed },
]

const LIENS_PLUS = [
  { href: '/progression', label: 'Progression', icone: TrendingUp },
  { href: '/proches', label: 'Proches', icone: HeartHandshake },
  { href: '/parametres', label: 'Paramètres', icone: Settings },
] as const

export interface NavProps {
  phase: Phase | null
  sansCycle?: boolean
  prenom?: string | null
}

export function Nav({ phase, sansCycle, prenom }: NavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mode, setMode] = useState<ModeUtilisateur>(DEFAULT_MODE_UTILISATEUR)
  const [plusOuvert, setPlusOuvert] = useState(false)
  const d = designPhaseAffichage(phase, { sansCycle })

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--phase-accent', d.accent)
    root.style.setProperty('--phase-bg', d.bgCard)
    root.style.setProperty('--phase-texte', d.texte)
    return () => {
      root.style.removeProperty('--phase-accent')
      root.style.removeProperty('--phase-bg')
      root.style.removeProperty('--phase-texte')
    }
  }, [d.accent, d.bgCard, d.texte])

  useEffect(() => {
    let annule = false
    async function chargerMode() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || annule) return
      const { data } = await supabase.from('user_preferences').select('mode_utilisateur').eq('user_id', user.id).maybeSingle()
      if (annule || !data) return
      const m = data.mode_utilisateur
      if (m === 'sans_cycle' || m === 'cycle') setMode(m)
    }
    void chargerMode()
    const onPrefs = () => void chargerMode()
    window.addEventListener('gaia-prefs-updated', onPrefs)
    return () => {
      annule = true
      window.removeEventListener('gaia-prefs-updated', onPrefs)
    }
  }, [pathname])

  const liensDesktop =
    mode === 'sans_cycle' ? LIENS_DESKTOP.filter((l) => l.href !== '/cycle') : [...LIENS_DESKTOP]
  const liensMobile =
    mode === 'sans_cycle' ? LIENS_MOBILE_PRINCIPAL.filter((l) => l.href !== '/cycle') : LIENS_MOBILE_PRINCIPAL

  async function seDeconnecter() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <header className="sticky top-0 z-50 hidden w-full border-b border-gray-200/80 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/90 md:block">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6">
          <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-gray-900 dark:text-gray-50">
            🌿 Gaia
          </Link>
          <nav className="flex flex-1 flex-wrap items-center justify-center gap-1">
            {liensDesktop.map(({ href, label, icone: Ic }) => {
              const actif = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                    actif
                      ? 'font-semibold text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/80'
                  )}
                  style={actif ? { backgroundColor: d.accent } : undefined}
                >
                  <Ic size={15} />
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Thème" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </Button>
            {prenom ? <span className="max-w-[120px] truncate text-sm text-gray-600 dark:text-gray-300">{prenom}</span> : null}
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => void seDeconnecter()}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-gray-200/80 bg-white/85 px-1 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/85 md:hidden">
        {liensMobile.map(({ href, label, icone: Ic }) => {
          const actif = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-all duration-200',
                actif ? 'font-semibold' : 'text-gray-500 dark:text-gray-400'
              )}
              style={{ color: actif ? d.accent : undefined }}
            >
              {actif ? <span className="absolute top-1.5 size-1.5 rounded-full" style={{ backgroundColor: d.accent }} /> : null}
              <Ic size={22} className={actif ? '' : 'opacity-80'} />
              {label}
            </Link>
          )
        })}
        <button
          type="button"
          onClick={() => setPlusOuvert(true)}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] text-gray-500 dark:text-gray-400"
        >
          <MoreHorizontal size={22} />
          Plus
        </button>
        <Dialog open={plusOuvert} onOpenChange={setPlusOuvert}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle>Plus</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-1 py-2">
              {LIENS_PLUS.map(({ href, label, icone: Ic }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setPlusOuvert(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Ic size={18} />
                  {label}
                </Link>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </nav>
    </>
  )
}
