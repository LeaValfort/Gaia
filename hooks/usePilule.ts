'use client'

import { useCallback, useEffect, useState } from 'react'
import { format, subDays } from 'date-fns'
import {
  REGLAGES_PILULE_DEFAUT,
  enregistrerReglagesPilule,
  getPrisesPilule,
  getReglagesPilule,
  marquerPrisePilule,
} from '@/lib/db/pilule'
import { supabase } from '@/lib/supabase'
import type { ReglagesPilule } from '@/types'

/** Prises des 7 derniers jours + réglage du rappel. Les actions renvoient false en cas d'échec. */
export function usePilule(userId: string) {
  const [reglages, setReglages] = useState<ReglagesPilule>(REGLAGES_PILULE_DEFAUT)
  const [prises, setPrises] = useState<Map<string, string>>(new Map())
  const [chargement, setChargement] = useState(true)
  const aujourdhui = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    let annule = false
    void Promise.all([getReglagesPilule(supabase, userId), getPrisesPilule(supabase, userId, format(subDays(new Date(), 6), 'yyyy-MM-dd'))]).then(
      ([r, p]) => {
        if (annule) return
        setReglages(r)
        setPrises(p)
        setChargement(false)
      }
    )
    return () => {
      annule = true
    }
  }, [userId])

  const basculerPrise = useCallback(
    async (date: string) => {
      const prise = !prises.has(date)
      const res = await marquerPrisePilule(supabase, userId, date, prise)
      if (res.ok) {
        setPrises((m) => {
          const n = new Map(m)
          if (prise) n.set(date, new Date().toISOString())
          else n.delete(date)
          return n
        })
      }
      return res.ok
    },
    [prises, userId]
  )

  const majReglages = useCallback(
    async (r: ReglagesPilule) => {
      const avant = reglages
      setReglages(r)
      const res = await enregistrerReglagesPilule(supabase, userId, r)
      if (!res.ok) setReglages(avant)
      return res.ok
    },
    [reglages, userId]
  )

  return { reglages, prises, chargement, aujourdhui, basculerPrise, majReglages }
}
