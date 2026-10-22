'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getDernieresCharges } from '@/lib/db/charges'
import { enregistrerModeleSeance, getModelesSeance, supprimerModeleSeance } from '@/lib/db/modeles-seance'
import type { DerniereCharge, LigneSeanceLibre, ModeleSeance, TypeActivite } from '@/types'

/**
 * Données annexes du formulaire « autre sport » : modèles enregistrés et
 * dernières charges (placeholder gris clair des exercices).
 */
export function useSeanceLibre(userId: string) {
  const [modeles, setModeles] = useState<ModeleSeance[]>([])
  const [dernieres, setDernieres] = useState<Map<string, DerniereCharge>>(new Map())
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    let annule = false
    Promise.all([getModelesSeance(supabase, userId), getDernieresCharges(supabase, userId)])
      .then(([m, d]) => {
        if (annule) return
        setModeles(m)
        setDernieres(new Map(d.map((c) => [c.exercise_name, c])))
      })
      .finally(() => {
        if (!annule) setChargement(false)
      })
    return () => {
      annule = true
    }
  }, [userId])

  const enregistrerModele = useCallback(
    async (m: { nom: string; sport_type: TypeActivite; sport_name: string | null; contenu: LigneSeanceLibre[] }) => {
      const res = await enregistrerModeleSeance(supabase, userId, m)
      if (res) setModeles((liste) => [...liste.filter((x) => x.nom !== res.nom), res].sort((a, b) => a.nom.localeCompare(b.nom)))
      return res
    },
    [userId]
  )

  const supprimerModele = useCallback(async (id: string) => {
    const ok = await supprimerModeleSeance(supabase, id)
    if (ok) setModeles((liste) => liste.filter((x) => x.id !== id))
    return ok
  }, [])

  return { modeles, dernieres, chargement, enregistrerModele, supprimerModele }
}
