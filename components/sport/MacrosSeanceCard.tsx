'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getMacrosSeance } from '@/lib/db/macros-seance'
import { updateWorkoutCibles } from '@/lib/db/workout-cibles'
import { LIBELLE_TYPE_SEANCE, macrosDefautsTypeSeance } from '@/lib/data/macros-seance-defaults'
import { PHASES_DESIGN, PHASE_DESIGN_ACCUEIL_NEUTRE } from '@/lib/data/phases-design'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { MacrosSeance, Phase, TypePlanningJour, WorkoutMuscuComplet, WorkoutNatationComplet, WorkoutYogaComplet } from '@/types'

type C = { c: number | null; p: number | null; g: number | null; l: number | null }

function numIn(s: string): number | null {
  const t = s.trim()
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? Math.round(n) : null
}

function str(n: number | null | undefined): string {
  if (n == null) return ''
  return String(n)
}

function ciblesSeance(
  w: WorkoutMuscuComplet | WorkoutNatationComplet | WorkoutYogaComplet | null | undefined
): C | null {
  if (!w) return null
  if (
    w.calories_cibles == null &&
    w.proteines_cibles == null &&
    w.glucides_cibles == null &&
    w.lipides_cibles == null
  ) {
    return null
  }
  return {
    c: w.calories_cibles ?? null,
    p: w.proteines_cibles ?? null,
    g: w.glucides_cibles ?? null,
    l: w.lipides_cibles ?? null,
  }
}

function ciblesDepuisMacro(m: MacrosSeance): C {
  return {
    c: m.calories,
    p: m.proteines,
    g: m.glucides,
    l: m.lipides,
  }
}

function cDepuisDef(def: { calories: number; proteines: number; glucides: number; lipides: number }): C {
  return { c: def.calories, p: def.proteines, g: def.glucides, l: def.lipides }
}

export function MacrosSeanceCard({
  typeSeance,
  userId,
  phase,
  workoutId,
  seanceExistante,
}: {
  typeSeance: TypePlanningJour
  userId: string
  phase: Phase
  workoutId?: string
  seanceExistante?: WorkoutMuscuComplet | WorkoutNatationComplet | WorkoutYogaComplet | null
}) {
  const [enBase, setEnBase] = useState<C | null>(null)
  const [aConfigPerso, setAConfigPerso] = useState(false)
  const [edit, setEdit] = useState(false)
  const [fc, setFc] = useState('')
  const [fp, setFp] = useState('')
  const [fg, setFg] = useState('')
  const [fl, setFl] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const design = PHASES_DESIGN[phase] ?? PHASE_DESIGN_ACCUEIL_NEUTRE
  const def = macrosDefautsTypeSeance(typeSeance)

  const load = useCallback(async () => {
    const list = await getMacrosSeance(supabase, userId)
    const r = list.find((x) => x.type_seance === typeSeance)
    setAConfigPerso(!!r)
    if (r) setEnBase(ciblesDepuisMacro(r))
    else setEnBase(cDepuisDef(def))
    setLoading(false)
  }, [userId, typeSeance, def])

  useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  const ov = ciblesSeance(seanceExistante ?? null)
  const show = ov ?? enBase
  if (!loading && !aConfigPerso && !ov) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 p-3 text-sm text-neutral-600 dark:text-neutral-400">
        <p>
          Configure tes macros dans les{' '}
          <Link href="/parametres" className="text-violet-600 dark:text-violet-400 font-medium underline">
            Paramètres
          </Link>
          .
        </p>
      </div>
    )
  }
  if (loading || !show) return null

  function startEdit() {
    const s = ov ?? enBase ?? cDepuisDef(def)
    setFc(str(s.c))
    setFp(str(s.p))
    setFg(str(s.g))
    setFl(str(s.l))
    setEdit(true)
  }

  async function saveW() {
    if (!workoutId) {
      toast.message('Enregistre d’abord la séance pour mémoriser un ajustement sur cette entrée.')
      return
    }
    const ok = await updateWorkoutCibles(workoutId, {
      calories_cibles: numIn(fc),
      proteines_cibles: numIn(fp),
      glucides_cibles: numIn(fg),
      lipides_cibles: numIn(fl),
    })
    if (ok) {
      toast.success('Macros de séance mises à jour')
      setEdit(false)
      router.refresh()
    } else {
      toast.error('Impossible d’enregistrer')
    }
  }

  return (
    <div
      className={cn('rounded-xl border p-4 text-sm', design.border, design.bg, 'dark:bg-neutral-900/30')}
    >
      <p className="font-semibold text-neutral-900 dark:text-neutral-100 flex flex-wrap items-center gap-2">
        🎯 Macros cibles · {LIBELLE_TYPE_SEANCE[typeSeance]}
        {ov ? (
          <span className="text-xs font-normal text-neutral-500">(ajusté pour cette séance)</span>
        ) : null}
      </p>
      {!edit ? (
        <div className="mt-2 flex flex-wrap gap-3 text-neutral-800 dark:text-neutral-200">
          <span>{show.c ?? '—'} kcal</span>
          <span>P {show.p ?? '—'}</span>
          <span>G {show.g ?? '—'}</span>
          <span>L {show.l ?? '—'}</span>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <div className="w-[4.5rem]">
            <span className="text-[10px] text-neutral-500">kcal</span>
            <Input className="h-8 w-[4.5rem] text-sm" value={fc} onChange={(e) => setFc(e.target.value)} inputMode="numeric" />
          </div>
          <div className="w-[4.5rem]">
            <span className="text-[10px] text-neutral-500">P</span>
            <Input className="h-8 w-[4.5rem] text-sm" value={fp} onChange={(e) => setFp(e.target.value)} inputMode="numeric" />
          </div>
          <div className="w-[4.5rem]">
            <span className="text-[10px] text-neutral-500">G</span>
            <Input className="h-8 w-[4.5rem] text-sm" value={fg} onChange={(e) => setFg(e.target.value)} inputMode="numeric" />
          </div>
          <div className="w-[4.5rem]">
            <span className="text-[10px] text-neutral-500">L</span>
            <Input className="h-8 w-[4.5rem] text-sm" value={fl} onChange={(e) => setFl(e.target.value)} inputMode="numeric" />
          </div>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {!edit ? (
          <Button type="button" size="sm" variant="outline" onClick={startEdit}>
            ✏️ Ajuster pour cette séance
          </Button>
        ) : (
          <>
            <Button type="button" size="sm" onClick={() => void saveW()}>
              Enregistrer
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEdit(false)}>
              Annuler
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
