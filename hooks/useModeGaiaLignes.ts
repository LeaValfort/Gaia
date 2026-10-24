'use client'

import { useState } from 'react'
import { adapterLignesGaia } from '@/lib/sport/gaia-adaptation'
import type { LigneSeanceLibre } from '@/types'

/**
 * Bascule Séance normale / Séance Gaia sur des lignes de séance libre :
 * en mode Gaia, les lignes sont ajustées ; revenir en normal restaure
 * les valeurs d'origine (les modifications faites en mode Gaia sont perdues).
 */
export function useModeGaiaLignes(lignes: LigneSeanceLibre[], setLignes: (l: LigneSeanceLibre[]) => void, pct: number) {
  const [mode, setMode] = useState<'normale' | 'gaia'>('normale')
  const [originales, setOriginales] = useState<LigneSeanceLibre[] | null>(null)

  function changerMode(m: 'normale' | 'gaia') {
    if (m === mode) return
    if (m === 'gaia') {
      setOriginales(lignes)
      setLignes(adapterLignesGaia(lignes, pct))
    } else if (originales) {
      setLignes(originales)
      setOriginales(null)
    }
    setMode(m)
  }

  /** À appeler quand les lignes sont remplacées (modèle chargé, enregistrement). */
  function reinitialiser() {
    setMode('normale')
    setOriginales(null)
  }

  return { mode, changerMode, reinitialiser }
}
