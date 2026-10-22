'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getSanteProfil } from '@/lib/db/sante'
import type { ConditionSante } from '@/types'

/**
 * Conditions du profil santé de l'utilisatrice connectée (vide tant que non
 * chargé, ou si la table n'existe pas encore). Session locale : pas d'appel Auth réseau.
 */
export function useConditionsSante(): ConditionSante[] {
  const [conditions, setConditions] = useState<ConditionSante[]>([])

  useEffect(() => {
    let annule = false
    void supabase.auth.getSession().then(async ({ data }) => {
      const userId = data.session?.user.id
      if (!userId) return
      const p = await getSanteProfil(supabase, userId)
      if (!annule && p) setConditions(p.conditions)
    })
    return () => {
      annule = true
    }
  }, [])

  return conditions
}
