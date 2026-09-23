'use client'

import { useEffect, type CSSProperties, type ReactNode } from 'react'

export interface AlimentationLayoutProps {
  children: ReactNode
}

// Palette crème/orange-rouge de la page Alimentation (Chantier 5b), fixe — contrairement aux
// autres pages (cycle, accueil...), les boutons d'action et l'onglet actif ne suivent plus la
// couleur de la phase du cycle ici. Les badges de phase et les vignettes recette, eux, gardent
// leur code couleur habituel (PHASES_DESIGN), inchangé.
const ALIM_ACCENT = '#EA580C'
const ALIM_TEXT = '#7C2D12'
const ALIM_TEXT_MUTED = '#C2410C'

/** Applique les variables CSS crème/orange-rouge pour les onglets et boutons alimentation. */
export function AlimentationLayout({ children }: AlimentationLayoutProps) {
  const vars: CSSProperties = {
    ['--alim-accent' as string]: ALIM_ACCENT,
    ['--alim-text' as string]: ALIM_TEXT,
    ['--alim-text-muted' as string]: ALIM_TEXT_MUTED,
  }

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--alim-accent', ALIM_ACCENT)
    root.style.setProperty('--alim-text', ALIM_TEXT)
    root.style.setProperty('--alim-text-muted', ALIM_TEXT_MUTED)
    return () => {
      root.style.removeProperty('--alim-accent')
      root.style.removeProperty('--alim-text')
      root.style.removeProperty('--alim-text-muted')
    }
  }, [])

  return (
    <div className="alimentation-page w-full max-w-2xl" style={vars}>
      {children}
    </div>
  )
}
