'use client'

import { useEffect, type CSSProperties, type ReactNode } from 'react'
import type { PhaseDesign } from '@/lib/data/phases-design'

export interface AlimentationLayoutProps {
  design: PhaseDesign
  children: ReactNode
}

/** Applique les variables CSS phase pour les boutons alimentation. */
export function AlimentationLayout({ design, children }: AlimentationLayoutProps) {
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
    <div className="alimentation-page w-full max-w-2xl" style={vars}>
      {children}
    </div>
  )
}
