'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { upsertDailyMealIntake } from '@/lib/db/dailyMealIntake'
import { objectifsRepasDefaut } from '@/lib/repartitionRepas'
import { cn } from '@/lib/utils'
import type { DailyMealIntake, TypeJournee } from '@/types'

type CleMacro = 'calories' | 'proteines' | 'glucides' | 'lipides'

const CHAMPS: { cle: CleMacro; label: string; unite: string; max: number }[] = [
  { cle: 'calories', label: 'Calories', unite: 'kcal', max: 20000 },
  { cle: 'proteines', label: 'Protéines', unite: 'g', max: 1000 },
  { cle: 'glucides', label: 'Glucides', unite: 'g', max: 1000 },
  { cle: 'lipides', label: 'Lipides', unite: 'g', max: 1000 },
]

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
  onAnnuler?: () => void
}

export function PanneauRepasJour({
  userId,
  intake,
  typeJournee,
  onEnregistre,
  onAnnuler,
}: PanneauRepasJourProps) {
  const [valeurs, setValeurs] = useState<Record<CleMacro, string>>({
    calories: '0',
    proteines: '0',
    glucides: '0',
    lipides: '0',
  })
  const [err, setErr] = useState<string | null>(null)
  const [envoi, setEnvoi] = useState(false)

  useEffect(() => {
    setValeurs({
      calories: String(intake.calories),
      proteines: String(intake.proteines),
      glucides: String(intake.glucides),
      lipides: String(intake.lipides),
    })
    setErr(null)
  }, [intake])

  async function enregistrer() {
    setErr(null)
    setEnvoi(true)
    const a = {
      calories: parseN(valeurs.calories, 20000),
      proteines: parseN(valeurs.proteines, 1000),
      glucides: parseN(valeurs.glucides, 1000),
      lipides: parseN(valeurs.lipides, 1000),
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
      objectif_calories: null,
      objectif_proteines: null,
      objectif_glucides: null,
      objectif_lipides: null,
      nom_personnalise: null,
      source_recipe_id: intake.source_recipe_id ?? null,
    })
    setEnvoi(false)
    if (!res.ok) {
      setErr(res.message ?? 'Erreur enregistrement')
      return
    }
    onEnregistre()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {CHAMPS.map(({ cle, label, unite, max }) => (
          <div key={cle} className="flex flex-col gap-1.5">
            <Label htmlFor={`repas-${intake.type_repas}-${cle}`} className="text-sm">
              {label} ({unite})
            </Label>
            <Input
              id={`repas-${intake.type_repas}-${cle}`}
              type="number"
              min={0}
              max={max}
              inputMode="numeric"
              value={valeurs[cle]}
              onChange={(e) =>
                setValeurs((prev) => ({
                  ...prev,
                  [cle]: e.target.value,
                }))
              }
              className="h-10"
            />
          </div>
        ))}
      </div>

      {err ? <p className="text-sm text-red-600 dark:text-red-400">{err}</p> : null}

      <Button
        type="button"
        disabled={envoi}
        className={cn(
          'h-10 w-full bg-amber-600 text-white hover:bg-amber-700',
          'dark:bg-amber-600 dark:hover:bg-amber-700'
        )}
        onClick={() => void enregistrer()}
      >
        {envoi ? 'Enregistrement…' : 'Enregistrer'}
      </Button>

      {onAnnuler ? (
        <Button type="button" variant="ghost" className="h-10 w-full" onClick={onAnnuler}>
          Annuler
        </Button>
      ) : null}
    </div>
  )
}

/** Sous-titre objectif créneau pour la modale repas. */
export function sousTitreObjectifRepas(
  typeJournee: TypeJournee,
  typeRepas: DailyMealIntake['type_repas']
): string {
  const o = objectifsRepasDefaut(typeJournee, typeRepas)
  return `Objectif : ${o.calories} kcal · ${o.proteines}g P · ${o.glucides}g G · ${o.lipides}g L`
}
