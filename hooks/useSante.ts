'use client'

import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import {
  creerRdvSante,
  enregistrerSanteProfil,
  getRdvSante,
  getSanteProfil,
  marquerRdvFait,
  supprimerRdvSante,
} from '@/lib/db/sante'
import type { RdvSante, SanteProfil } from '@/types'

const PROFIL_VIDE = (userId: string): SanteProfil => ({
  user_id: userId,
  contraception: 'aucune',
  date_pose: null,
  duree_ans: null,
  dernier_controle: null,
  conditions: [],
  updated_at: '',
})

/** Profil santé + RDV santé de l'utilisatrice, avec les actions de mise à jour. */
export function useSante(userId: string) {
  const [profil, setProfil] = useState<SanteProfil>(() => PROFIL_VIDE(userId))
  const [rdvs, setRdvs] = useState<RdvSante[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    let annule = false
    Promise.all([getSanteProfil(supabase, userId), getRdvSante(supabase, userId)]).then(([p, r]) => {
      if (annule) return
      if (p) setProfil(p)
      setRdvs(r)
      setChargement(false)
    })
    return () => {
      annule = true
    }
  }, [userId])

  /** Mise à jour optimiste, annulée si la base refuse. */
  const majProfil = useCallback(
    async (maj: Partial<Omit<SanteProfil, 'user_id' | 'updated_at'>>) => {
      const avant = profil
      setProfil({ ...profil, ...maj })
      const ok = await enregistrerSanteProfil(supabase, userId, maj)
      if (!ok) setProfil(avant)
      return ok
    },
    [profil, userId]
  )

  const controleFait = useCallback(() => majProfil({ dernier_controle: format(new Date(), 'yyyy-MM-dd') }), [majProfil])

  const ajouterRdv = useCallback(
    async (r: { titre: string; date: string; recurrence_mois: number | null; notes: string | null }) => {
      const cree = await creerRdvSante(supabase, userId, r)
      if (cree) setRdvs((l) => [...l, cree].sort((a, b) => a.date.localeCompare(b.date)))
      return !!cree
    },
    [userId]
  )

  const rdvFait = useCallback(async (r: RdvSante) => {
    const maj = await marquerRdvFait(supabase, r)
    if (maj) setRdvs((l) => (maj.fait ? l.filter((x) => x.id !== r.id) : l.map((x) => (x.id === r.id ? maj : x))))
    return !!maj
  }, [])

  const supprimerRdv = useCallback(async (id: string) => {
    const ok = await supprimerRdvSante(supabase, id)
    if (ok) setRdvs((l) => l.filter((x) => x.id !== id))
    return ok
  }, [])

  return { profil, rdvs, chargement, majProfil, controleFait, ajouterRdv, rdvFait, supprimerRdv }
}
