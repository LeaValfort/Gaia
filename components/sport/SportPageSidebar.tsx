'use client'

import { useCallback, useEffect, useState } from 'react'
import { addDays, format, isSameDay, parseISO, startOfDay, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { LABELS_PLANNING } from '@/lib/planning-sport'
import type { PlanningSport, TypeSeance } from '@/types'

const CLES: (keyof PlanningSport)[] = [
  'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
]

const LIB_TYPE: Record<TypeSeance, string> = {
  muscu: 'Muscu',
  natation: 'Nage',
  yoga: 'Yoga',
  escalade: 'Autre',
  autre: 'Autre',
}

const CARD = 'rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900'
const TITRE = 'mb-3 text-[10px] font-medium uppercase tracking-widest text-gray-400'

export function SportPageSidebar({ userId, planning }: { userId: string; planning: PlanningSport }) {
  const [semaine, setSemaine] = useState<{ n: number; d: number; min: number } | null>(null)
  const [histo, setHisto] = useState<{ date: string; type: TypeSeance; duration_min: number | null }[]>([])

  const charger = useCallback(async () => {
    if (!userId) return
    const deb = startOfWeek(new Date(), { weekStartsOn: 1 })
    const debStr = format(deb, 'yyyy-MM-dd')
    const finStr = format(new Date(), 'yyyy-MM-dd')

    const { data: w, error: e1 } = await supabase
      .from('workouts')
      .select('date, type, duration_min')
      .eq('user_id', userId)
      .gte('date', debStr)
      .lte('date', finStr)
    if (e1) return

    const rows = w ?? []
    const d = new Set<string>()
    let min = 0
    for (const r of rows) {
      d.add(r.date as string)
      min += r.duration_min != null ? Number(r.duration_min) : 0
    }

    setSemaine({ n: rows.length, d: d.size, min })

    const { data: h, error: e2 } = await supabase
      .from('workouts')
      .select('date, type, duration_min, created_at')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(6)
    if (!e2) setHisto((h ?? []) as { date: string; type: TypeSeance; duration_min: number | null }[])
  }, [userId])

  useEffect(() => {
    void charger()
  }, [charger])

  const auj = startOfDay(new Date())
  const previsions = CLES.filter((c) => planning[c] !== 'repos').length

  return (
    <div className="flex flex-col gap-4">
      <div className={CARD}>
        <p className={TITRE}>Cette semaine</p>
        {semaine != null ? (
          <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
            <li className="flex justify-between">
              <span className="text-neutral-500">Séances (plan)</span>
              <span className="font-medium">{previsions} prévues</span>
            </li>
            <li className="flex justify-between">
              <span className="text-neutral-500">Séances enregistrées</span>
              <span className="font-medium">{semaine.n}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-neutral-500">Jours avec séance</span>
              <span className="font-medium">{semaine.d}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-neutral-500">Temps (yoga, etc.)</span>
              <span className="font-medium">{semaine.min > 0 ? `${semaine.min} min` : '—'}</span>
            </li>
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">Chargement…</p>
        )}
      </div>

      <div className={CARD}>
        <p className={TITRE}>Mon planning</p>
        <div className="grid grid-cols-7 gap-1 text-center">
          {CLES.map((cle) => {
            const t = planning[cle]
            const m = LABELS_PLANNING[t]
            const idx = CLES.indexOf(cle)
            const dateJour = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), idx)
            const estAuj = isSameDay(dateJour, auj)
            return (
              <div key={cle} className="flex min-w-0 flex-col items-center gap-0.5">
                <span className="text-[9px] font-medium text-neutral-400">
                  {format(dateJour, 'EEE', { locale: fr })}
                </span>
                <span className="text-base leading-none" title={m.label}>
                  {m.emoji}
                </span>
                {estAuj ? <span className="h-0.5 w-4 rounded-full bg-rose-500" /> : <span className="h-0.5" />}
              </div>
            )
          })}
        </div>
        <Link href="/parametres" className="mt-3 block text-center text-xs text-rose-600 underline dark:text-rose-400">
          Modifier
        </Link>
      </div>

      <div className={CARD}>
        <p className={TITRE}>Dernières séances</p>
        {histo.length === 0 ? (
          <p className="text-sm text-neutral-500">Aucune séance récente.</p>
        ) : (
          <ul className="space-y-2">
            {histo.map((h, i) => (
              <li key={`${h.date}-${h.type}-${i}`} className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">
                  {format(parseISO(h.date + 'T12:00:00'), 'd MMM', { locale: fr })}
                </span>
                <span className="font-medium text-neutral-800 dark:text-neutral-100">
                  {LIB_TYPE[h.type]}
                  {h.duration_min != null ? ` · ${h.duration_min} min` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
