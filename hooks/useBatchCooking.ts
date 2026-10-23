'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { enregistrerSessionBatch, getSessionBatch, majEtapesFaites } from '@/lib/db/batch'
import { getMealPlanSemaine, getRecettesPourPlanning } from '@/lib/db/mealplan'
import { demanderDerouleBatch } from '@/lib/ia/batch-client'
import type { Recipe, SessionBatch } from '@/types'

/**
 * Batch cooking de la semaine : recettes planifiées (pré-sélection), toutes les
 * recettes, session enregistrée (déroulé + étapes cochées) et actions.
 */
export function useBatchCooking(userId: string, weekStart: string) {
  const [recettes, setRecettes] = useState<Recipe[]>([])
  const [planifiees, setPlanifiees] = useState<string[]>([])
  const [session, setSession] = useState<SessionBatch | null>(null)
  const [chargement, setChargement] = useState(true)
  const [generation, setGeneration] = useState(false)

  useEffect(() => {
    let annule = false
    Promise.all([
      getRecettesPourPlanning(supabase, userId),
      getMealPlanSemaine(supabase, userId, weekStart),
      getSessionBatch(supabase, userId, weekStart),
    ]).then(([r, plans, s]) => {
      if (annule) return
      setRecettes(r)
      setPlanifiees([...new Set(plans.map((p) => p.recette_id).filter((x): x is string => !!x))])
      setSession(s)
      setChargement(false)
    })
    return () => {
      annule = true
    }
  }, [userId, weekStart])

  /** Génère le déroulé commun et l'enregistre pour la semaine. Lève en cas d'échec. */
  const generer = useCallback(
    async (recetteIds: string[]) => {
      setGeneration(true)
      try {
        const deroule = await demanderDerouleBatch(recetteIds)
        const { session: s, message } = await enregistrerSessionBatch(supabase, userId, weekStart, recetteIds, deroule)
        if (!s) throw new Error(message ?? 'Déroulé généré mais non enregistré')
        setSession(s)
      } finally {
        setGeneration(false)
      }
    },
    [userId, weekStart]
  )

  /** Coche/décoche une étape (optimiste, annulé si la base refuse). */
  const basculerEtape = useCallback(
    async (id: string) => {
      if (!session) return
      const avant = session
      const faits = session.faits.includes(id) ? session.faits.filter((x) => x !== id) : [...session.faits, id]
      setSession({ ...session, faits })
      if (!(await majEtapesFaites(supabase, session.id, faits))) setSession(avant)
    },
    [session]
  )

  const ajouterRecettes = useCallback((nouvelles: Recipe[]) => setRecettes((l) => [...nouvelles, ...l]), [])

  return { recettes, planifiees, session, chargement, generation, generer, basculerEtape, ajouterRecettes }
}
