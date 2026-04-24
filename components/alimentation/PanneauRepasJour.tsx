'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { upsertDailyMealIntake } from '@/lib/db/dailyMealIntake'
import { objectifsMacroRepas, objectifsRepasDefaut } from '@/lib/repartitionRepas'
import { SousOngletsMacrosRepas, type CleMacro } from '@/components/alimentation/SousOngletsMacrosRepas'
import type { DailyMealIntake, TypeJournee } from '@/types'

function parseN(v: string, max: number): number {
  const n = Number.parseInt(v.replace(/\D/g, ''), 10)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(max, n))
}

interface PanneauRepasJourProps {
  userId: string
  intake: DailyMealIntake
  typeJournee: TypeJournee
  onEnregistre: () => void
}

export function PanneauRepasJour({ userId, intake, typeJournee, onEnregistre }: PanneauRepasJourProps) {
  const [macro, setMacro] = useState<CleMacro>('calories')
  const [act, setAct] = useState<Record<CleMacro, string>>({ calories: '0', proteines: '0', glucides: '0', lipides: '0' })
  const [obj, setObj] = useState<Record<CleMacro, string>>({ calories: '0', proteines: '0', glucides: '0', lipides: '0' })
  const [err, setErr] = useState<string | null>(null)

  const def = useMemo(() => objectifsRepasDefaut(typeJournee, intake.type_repas), [typeJournee, intake.type_repas])

  useEffect(() => {
    const o = objectifsMacroRepas(intake, typeJournee)
    setAct({
      calories: String(intake.calories),
      proteines: String(intake.proteines),
      glucides: String(intake.glucides),
      lipides: String(intake.lipides),
    })
    setObj({ calories: String(o.calories), proteines: String(o.proteines), glucides: String(o.glucides), lipides: String(o.lipides) })
    setErr(null)
  }, [intake, typeJournee])

  const enregistrer = async () => {
    setErr(null)
    const a = {
      calories: parseN(act.calories, 20000),
      proteines: parseN(act.proteines, 1000),
      glucides: parseN(act.glucides, 1000),
      lipides: parseN(act.lipides, 1000),
    }
    const o = {
      calories: parseN(obj.calories, 20000),
      proteines: parseN(obj.proteines, 1000),
      glucides: parseN(obj.glucides, 1000),
      lipides: parseN(obj.lipides, 1000),
    }
    const res = await upsertDailyMealIntake(supabase, userId, {
      date: intake.date,
      type_repas: intake.type_repas,
      quantite_realisee: 0,
      quantite_cible: 1,
      calories: a.calories,
      proteines: a.proteines,
      glucides: a.glucides,
      lipides: a.lipides,
      objectif_calories: o.calories === def.calories ? null : o.calories,
      objectif_proteines: o.proteines === def.proteines ? null : o.proteines,
      objectif_glucides: o.glucides === def.glucides ? null : o.glucides,
      objectif_lipides: o.lipides === def.lipides ? null : o.lipides,
      nom_personnalise: null,
      source_recipe_id: intake.source_recipe_id ?? null,
    })
    if (!res.ok) {
      setErr(res.message ?? 'Erreur enregistrement')
      return
    }
    onEnregistre()
  }

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/60 dark:bg-neutral-900/40 p-3 space-y-3">
      <SousOngletsMacrosRepas
        macro={macro}
        onMacro={setMacro}
        act={act}
        setAct={setAct}
        obj={obj}
        setObj={setObj}
        def={def}
      />
      {err ? <p className="text-xs text-red-600 dark:text-red-400">{err}</p> : null}
      <Button type="button" className="alimentation-btn-primaire h-9 w-full text-sm" onClick={() => void enregistrer()}>
        Enregistrer ce créneau
      </Button>
    </div>
  )
}
