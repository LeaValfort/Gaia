'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getEnseignes } from '@/lib/db/enseignes'
import type { EnseigneDB } from '@/types'

/**
 * Charge les enseignes de courses de l'utilisatrice (par défaut + personnalisées),
 * triées par ordre d'affichage. Recharge si l'utilisatrice change.
 */
export function useEnseignes(userId: string) {
  const [enseignes, setEnseignes] = useState<EnseigneDB[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    if (!userId) return
    let annule = false
    setChargement(true)
    getEnseignes(supabase, userId).then((data) => {
      if (!annule) {
        setEnseignes(data)
        setChargement(false)
      }
    })
    return () => {
      annule = true
    }
  }, [userId])

  return { enseignes, chargement: userId ? chargement : false }
}
