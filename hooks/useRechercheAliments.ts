'use client'

import { useEffect, useState } from 'react'
import type { AlimentRecherche } from '@/types'

const DELAI_MS = 250

/** Recherche CIQUAL via /api/aliments, avec un léger délai pendant la frappe. */
export function useRechercheAliments(q: string) {
  const [resultats, setResultats] = useState<AlimentRecherche[]>([])
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(false)

  useEffect(() => {
    const t = q.trim()
    let annule = false
    const id = window.setTimeout(() => {
      if (t.length < 2) {
        setResultats([])
        return
      }
      setChargement(true)
      fetch(`/api/aliments?q=${encodeURIComponent(t)}`)
        .then((r) => (r.ok ? (r.json() as Promise<AlimentRecherche[]>) : Promise.reject(new Error(String(r.status)))))
        .then((d) => {
          if (annule) return
          setResultats(d)
          setErreur(false)
        })
        .catch(() => !annule && setErreur(true))
        .finally(() => !annule && setChargement(false))
    }, DELAI_MS)
    return () => {
      annule = true
      window.clearTimeout(id)
    }
  }, [q])

  return { resultats, chargement, erreur }
}

/** Charge des aliments précis par code (raccourcis). */
export async function alimentsParCodes(codes: string[]): Promise<AlimentRecherche[]> {
  const r = await fetch(`/api/aliments?codes=${codes.join(',')}`)
  return r.ok ? ((await r.json()) as AlimentRecherche[]) : []
}
