'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getSemainesPlanifiees } from '@/lib/db/mealplan'

/** Historique des semaines planifiées (rechargé quand `rafraichir` change). */
export function useSemainesPlanifiees(userId: string, rafraichir: number) {
  const [semaines, setSemaines] = useState<string[]>([])
  useEffect(() => {
    let annule = false
    getSemainesPlanifiees(supabase, userId).then((s) => !annule && setSemaines(s))
    return () => {
      annule = true
    }
  }, [userId, rafraichir])
  return semaines
}
