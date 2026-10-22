'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { enregistrerLignesProgramme, getLignesProgramme } from '@/lib/db/lignes-programme'
import type { LigneSeanceLibre } from '@/types'

const DELAI_SAUVEGARDE_MS = 800

/**
 * Lignes perso d'un programme : chargées à chaque changement de programme
 * (`cle`), sauvegardées automatiquement peu après chaque modification.
 */
export function useLignesProgramme(userId: string, cle: string) {
  const [lignes, setLignesEtat] = useState<LigneSeanceLibre[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreurSauvegarde, setErreurSauvegarde] = useState(false)
  const minuterie = useRef<number | null>(null)
  // Sauvegarde en attente : envoyée tout de suite si on change de programme avant le délai.
  const enAttente = useRef<{ cle: string; lignes: LigneSeanceLibre[] } | null>(null)

  useEffect(() => {
    let annule = false
    getLignesProgramme(supabase, userId, cle).then((l) => {
      if (annule) return
      setLignesEtat(l)
      setChargement(false)
    })
    return () => {
      annule = true
      if (minuterie.current) window.clearTimeout(minuterie.current)
      const p = enAttente.current
      enAttente.current = null
      if (p) void enregistrerLignesProgramme(supabase, userId, p.cle, p.lignes)
    }
  }, [userId, cle])

  const setLignes = useCallback(
    (l: LigneSeanceLibre[]) => {
      setLignesEtat(l)
      enAttente.current = { cle, lignes: l }
      if (minuterie.current) window.clearTimeout(minuterie.current)
      minuterie.current = window.setTimeout(() => {
        enAttente.current = null
        // On garde les lignes même sans nom ici : elles sont en cours de saisie.
        void enregistrerLignesProgramme(supabase, userId, cle, l).then((ok) => setErreurSauvegarde(!ok))
      }, DELAI_SAUVEGARDE_MS)
    },
    [userId, cle]
  )

  return { lignes, setLignes, chargement, erreurSauvegarde }
}
