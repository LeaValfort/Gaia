'use client'

import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { MacrosCard } from '@/components/alimentation/MacrosCard'
import type { PhaseDesign } from '@/lib/data/phases-design'
import type { TotauxConsommesJour } from '@/lib/recapManuel'
import type { Phase, TypeJournee } from '@/types'

export interface AlimentationLayoutProps {
  design: PhaseDesign
  weekStartLabel: string
  todayIso: string
  typeJournee: TypeJournee
  phase: Phase
  sansSuiviCycle: boolean
  consoJour: TotauxConsommesJour
  children: ReactNode
}

export function AlimentationLayout({
  design,
  weekStartLabel,
  todayIso,
  typeJournee,
  phase,
  sansSuiviCycle,
  consoJour,
  children,
}: AlimentationLayoutProps) {
  const vars: CSSProperties = {
    ['--alim-accent' as string]: design.accent,
    ['--alim-text' as string]: design.texte,
    ['--alim-text-muted' as string]: design.texteMuted,
  }

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--alim-accent', design.accent)
    root.style.setProperty('--alim-text', design.texte)
    root.style.setProperty('--alim-text-muted', design.texteMuted)
    return () => {
      root.style.removeProperty('--alim-accent')
      root.style.removeProperty('--alim-text')
      root.style.removeProperty('--alim-text-muted')
    }
  }, [design.accent, design.texte, design.texteMuted])

  return (
    <div className="alimentation-page w-full" style={vars}>
      <header
        className={cn('mb-6 rounded-2xl border bg-gradient-to-br p-6', design.border, design.gradient)}
        style={{ borderColor: `${design.accent}33` }}
      >
        <h1
          className="text-2xl font-semibold"
          style={{ color: design.texte }}
        >
          Alimentation
        </h1>
        <p className="mt-1 text-sm" style={{ color: design.texteMuted }}>
          {weekStartLabel}
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_280px]">
        <div className="order-2 min-w-0 flex flex-col gap-4 md:order-1">{children}</div>
        <aside className="order-1 w-full min-w-0 flex-shrink-0 md:order-2 md:sticky md:top-4 md:self-start">
          <MacrosCard
            phase={phase}
            typeJournee={typeJournee}
            date={todayIso}
            sansSuiviCycle={sansSuiviCycle}
            conso={consoJour}
          />
        </aside>
      </div>
    </div>
  )
}
