'use client'

import { useCallback, useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { TypeSeance } from '@/types'
import { cn } from '@/lib/utils'

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
  refreshToken?: number
  onModifier?: (date: string, type: TypeSeance) => void
}

export function DernieresSeances({ userId, refreshToken, onModifier }: DernieresSeancesProps) {
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
  }, [charger, refreshToken])

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
          {seances.map((s, i) => {
            const cliquable = onModifier && (s.type === 'muscu' || s.type === 'natation' || s.type === 'yoga')
            const contenu = (
              <>
                <span className="text-muted-foreground">
                  {format(parseISO(`${s.date}T12:00:00`), 'd MMM yyyy', { locale: fr })}
                </span>
                <span className="inline-flex items-center gap-1 text-neutral-800 dark:text-neutral-200">
                  {LIB_TYPE[s.type]}
                  {s.duration_min != null ? ` · ${s.duration_min} min` : ''}
                  {cliquable ? <ChevronRight className="size-3.5 opacity-50" aria-hidden /> : null}
                </span>
              </>
            )
            return (
              <li key={`${s.date}-${s.type}-${i}`}>
                {cliquable ? (
                  <button
                    type="button"
                    onClick={() => onModifier(s.date, s.type)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm text-left',
                      'hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors'
                    )}
                  >
                    {contenu}
                  </button>
                ) : (
                  <div className="flex items-center justify-between px-2 py-1.5 text-sm">{contenu}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
