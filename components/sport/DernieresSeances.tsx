'use client'

import { useCallback, useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import type { TypeSeance } from '@/types'

const LIB_TYPE: Record<TypeSeance, string> = {
  muscu: 'Muscu',
  natation: 'Natation',
  yoga: 'Yoga',
  escalade: 'Autre',
  autre: 'Autre',
}

interface SeanceRecente {
  date: string
  type: TypeSeance
  duration_min: number | null
}

interface DernieresSeancesProps {
  userId: string
}

export function DernieresSeances({ userId }: DernieresSeancesProps) {
  const [seances, setSeances] = useState<SeanceRecente[] | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  const charger = useCallback(async () => {
    setErreur(null)
    const { data, error } = await supabase
      .from('workouts')
      .select('date, type, duration_min')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(6)

    if (error) {
      setErreur('Impossible de charger l’historique.')
      setSeances([])
      return
    }
    setSeances((data ?? []) as SeanceRecente[])
  }, [userId])

  useEffect(() => {
    void charger()
  }, [charger])

  return (
    <section className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
      <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
        Dernières séances
      </h2>

      {seances === null ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : erreur ? (
        <p className="text-sm text-muted-foreground">{erreur}</p>
      ) : seances.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune séance récente.</p>
      ) : (
        <ul className="space-y-2">
          {seances.map((s, i) => (
            <li
              key={`${s.date}-${s.type}-${i}`}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">
                {format(parseISO(`${s.date}T12:00:00`), 'd MMM yyyy', { locale: fr })}
              </span>
              <span className="text-neutral-800 dark:text-neutral-200">
                {LIB_TYPE[s.type]}
                {s.duration_min != null ? ` · ${s.duration_min} min` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
