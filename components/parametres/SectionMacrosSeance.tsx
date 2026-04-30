'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getMacrosSeance, saveMacrosSeance } from '@/lib/db/macros-seance'
import { LIBELLE_TYPE_SEANCE, macrosDefautsTypeSeance } from '@/lib/data/macros-seance-defaults'
import { supabase } from '@/lib/supabase'
import type { MacrosSeance, TypePlanningJour } from '@/types'
import { cn } from '@/lib/utils'

const TYPES: TypePlanningJour[] = [
  'muscu_full',
  'muscu_upper',
  'natation',
  'yoga',
  'autre',
  'repos',
]

type Ligne = {
  type_seance: TypePlanningJour
  calories: string
  proteines: string
  glucides: string
  lipides: string
  notes: string
}

function num(s: string): number | null {
  const t = s.trim()
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? Math.round(n) : null
}

function ligneDepuis(
  t: TypePlanningJour,
  m: MacrosSeance | undefined,
  def: { calories: number; proteines: number; glucides: number; lipides: number }
): Ligne {
  return {
    type_seance: t,
    calories: m?.calories != null ? String(m.calories) : String(def.calories),
    proteines: m?.proteines != null ? String(m.proteines) : String(def.proteines),
    glucides: m?.glucides != null ? String(m.glucides) : String(def.glucides),
    lipides: m?.lipides != null ? String(m.lipides) : String(def.lipides),
    notes: m?.notes ?? '',
  }
}

export function SectionMacrosSeance({ userId }: { userId: string }) {
  const [lignes, setLignes] = useState<Ligne[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const list = await getMacrosSeance(supabase, userId)
    const by = new Map(list.map((x) => [x.type_seance, x] as const))
    setLignes(
      TYPES.map((t) => ligneDepuis(t, by.get(t), macrosDefautsTypeSeance(t)))
    )
    setLoading(false)
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  async function saveRow(t: TypePlanningJour) {
    const l = lignes.find((r) => r.type_seance === t)
    if (!l) return
    try {
      await saveMacrosSeance(supabase, userId, t, {
        calories: num(l.calories),
        proteines: num(l.proteines),
        glucides: num(l.glucides),
        lipides: num(l.lipides),
        notes: l.notes.trim() || null,
      })
      toast.success('Macros enregistrées')
      void load()
    } catch {
      toast.error('Enregistrement impossible')
    }
  }

  function up(t: TypePlanningJour, f: Partial<Ligne>) {
    setLignes((s) => s.map((r) => (r.type_seance === t ? { ...r, ...f } : r)))
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-6 text-sm text-neutral-500">
        Chargement des macros…
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/15 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">🔥 Macros par type de séance</h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Définis tes besoins nutritionnels selon le sport pratiqué
      </p>
      <div className="space-y-3 overflow-x-auto">
        {TYPES.map((t) => {
          const l = lignes.find((r) => r.type_seance === t)
          if (!l) return null
          return (
            <div
              key={t}
              className={cn(
                'grid gap-2 sm:grid-cols-[minmax(0,1fr)_repeat(4,5rem)_minmax(0,1.5fr)_auto] items-end',
                'border border-neutral-200/80 dark:border-neutral-800 rounded-lg p-3 bg-white/80 dark:bg-neutral-950/40'
              )}
            >
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 pr-2">
                {LIBELLE_TYPE_SEANCE[t]}
              </p>
              {(
                [
                  ['calories', 'kcal'],
                  ['proteines', 'P'],
                  ['glucides', 'G'],
                  ['lipides', 'L'],
                ] as const
              ).map(([k, lab]) => (
                <div key={k} className="w-[5rem]">
                  <label className="text-[10px] uppercase text-neutral-500 block">{lab}</label>
                  <Input
                    className="h-8 text-sm w-20"
                    value={l[k as keyof Ligne] as string}
                    onChange={(e) => up(t, { [k]: e.target.value } as Partial<Ligne>)}
                    inputMode="numeric"
                  />
                </div>
              ))}
              <Textarea
                rows={1}
                className="text-sm min-h-8"
                value={l.notes}
                onChange={(e) => up(t, { notes: e.target.value })}
                placeholder="Notes"
              />
              <Button type="button" size="sm" className="shrink-0" onClick={() => void saveRow(t)}>
                Sauvegarder
              </Button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
