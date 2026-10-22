'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  getDernieresSeances,
  supprimerSeanceHistorique,
  type SeanceHistorique,
} from '@/lib/db/seances-historique'

/**
 * Historique des dernières séances (tous sports) + suppression.
 * `refreshToken` force un rechargement après un enregistrement.
 * Pendant un rechargement, l'ancienne liste reste affichée (pas de retour
 * à l'état « chargement ») pour éviter que la page change de hauteur et saute.
 */
export function useDernieresSeances(userId: string, refreshToken?: number) {
  const [seances, setSeances] = useState<SeanceHistorique[] | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  const [rechargement, setRechargement] = useState(0)

  useEffect(() => {
    let annule = false
    getDernieresSeances(supabase, userId)
      .then((data) => {
        if (annule) return
        setSeances(data)
        setErreur(null)
      })
      .catch(() => {
        if (annule) return
        setErreur('Impossible de charger l’historique.')
        setSeances((s) => s ?? [])
      })
    return () => {
      annule = true
    }
  }, [userId, refreshToken, rechargement])

  /** Retire la séance de l'écran tout de suite, la remet si la base refuse. */
  const supprimer = useCallback(
    async (seance: SeanceHistorique): Promise<boolean> => {
      const avant = seances
      setSeances((s) => (s ? s.filter((x) => x.id !== seance.id) : s))
      const ok = await supprimerSeanceHistorique(supabase, seance)
      if (!ok) setSeances(avant)
      else setRechargement((n) => n + 1)
      return ok
    },
    [seances]
  )

  return { seances, erreur, supprimer }
}
