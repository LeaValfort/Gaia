'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { getRecettes } from '@/lib/db/recettes'
import { upsertDailyMealIntake } from '@/lib/db/dailyMealIntake'
import { objectifsRepasDefaut } from '@/lib/repartitionRepas'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { DailyMealIntake, Recipe, TypeJournee, TypeRepas } from '@/types'

type CleMacro = 'calories' | 'proteines' | 'glucides' | 'lipides'
type ModeSaisie = 'manuel' | 'recette'

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

function macrosRecette(r: Recipe): string {
  const kcal = r.calories ?? 0
  const p = r.proteines ?? 0
  const g = r.glucides ?? 0
  const l = r.lipides ?? 0
  return `${kcal} kcal · ${p}g P · ${g}g G · ${l}g L`
}

function valeursDepuisRecette(r: Recipe): Record<CleMacro, string> {
  return {
    calories: String(r.calories ?? 0),
    proteines: String(r.proteines ?? 0),
    glucides: String(r.glucides ?? 0),
    lipides: String(r.lipides ?? 0),
  }
}

export interface ModaleSaisieRepasProps {
  ouvert: boolean
  onOuvertChange: (ouvert: boolean) => void
  userId: string
  intake: DailyMealIntake
  typeJournee: TypeJournee
  emoji: string
  libelleRepas: string
  onEnregistre: () => void
  /** Ferme la modale et ouvre l’onglet Recettes. */
  onVersRecettes?: () => void
}

export function ModaleSaisieRepas({
  ouvert,
  onOuvertChange,
  userId,
  intake,
  typeJournee,
  emoji,
  libelleRepas,
  onEnregistre,
  onVersRecettes,
}: ModaleSaisieRepasProps) {
  const [mode, setMode] = useState<ModeSaisie>('manuel')
  const [valeurs, setValeurs] = useState<Record<CleMacro, string>>({
    calories: '0',
    proteines: '0',
    glucides: '0',
    lipides: '0',
  })
  const [sourceRecipeId, setSourceRecipeId] = useState<string | null>(null)
  const [recettes, setRecettes] = useState<Recipe[]>([])
  const [chargementRecettes, setChargementRecettes] = useState(false)
  const [erreurRecettes, setErreurRecettes] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [envoi, setEnvoi] = useState(false)

  const sousTitre = useMemo(
    () => sousTitreObjectifRepas(typeJournee, intake.type_repas),
    [typeJournee, intake.type_repas]
  )

  const chargerRecettes = useCallback(async () => {
    setChargementRecettes(true)
    setErreurRecettes(null)
    try {
      const rows = await getRecettes(supabase, userId)
      setRecettes(rows)
    } catch {
      setErreurRecettes('Impossible de charger tes recettes.')
      setRecettes([])
    } finally {
      setChargementRecettes(false)
    }
  }, [userId])

  useEffect(() => {
    if (!ouvert) return
    setMode('manuel')
    setSourceRecipeId(intake.source_recipe_id ?? null)
    setValeurs({
      calories: String(intake.calories),
      proteines: String(intake.proteines),
      glucides: String(intake.glucides),
      lipides: String(intake.lipides),
    })
    setErr(null)
    void chargerRecettes()
  }, [ouvert, intake, chargerRecettes])

  function importerRecette(r: Recipe) {
    setValeurs(valeursDepuisRecette(r))
    setSourceRecipeId(r.id)
    setMode('manuel')
    setErr(null)
  }

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
      source_recipe_id: sourceRecipeId,
    })
    setEnvoi(false)
    if (!res.ok) {
      setErr(res.message ?? 'Erreur enregistrement')
      return
    }
    onEnregistre()
    onOuvertChange(false)
  }

  return (
    <Dialog open={ouvert} onOpenChange={onOuvertChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span aria-hidden>{emoji}</span>
            {libelleRepas}
          </DialogTitle>
          <DialogDescription className="text-left text-sm text-muted-foreground">
            {sousTitre}
          </DialogDescription>
        </DialogHeader>

        <div
          className="grid grid-cols-2 gap-1 rounded-lg border border-neutral-200 bg-neutral-100/80 p-1 dark:border-neutral-700 dark:bg-neutral-800/50"
          role="tablist"
        >
          {(
            [
              { id: 'manuel' as const, label: 'Saisie manuelle' },
              { id: 'recette' as const, label: 'Depuis une recette' },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => setMode(id)}
              className={cn(
                'rounded-md px-2 py-2 text-xs font-medium transition-colors sm:text-sm',
                mode === id
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-50'
                  : 'text-muted-foreground hover:text-neutral-800 dark:hover:text-neutral-200'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'recette' ? (
          <div className="flex flex-col gap-3">
            {erreurRecettes ? (
              <p className="text-sm text-red-600 dark:text-red-400">{erreurRecettes}</p>
            ) : null}

            {chargementRecettes ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : recettes.length === 0 ? (
              <div className="flex flex-col items-start gap-2 py-2">
                <p className="text-sm text-muted-foreground">
                  Aucune recette enregistrée pour le moment.
                </p>
                {onVersRecettes ? (
                  <button
                    type="button"
                    onClick={() => {
                      onOuvertChange(false)
                      onVersRecettes()
                    }}
                    className="text-sm text-muted-foreground underline-offset-2 hover:text-neutral-900 hover:underline dark:hover:text-neutral-200"
                  >
                    Aller à Recettes →
                  </button>
                ) : null}
              </div>
            ) : (
              <ul className="max-h-52 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                {recettes.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2.5 last:border-0 dark:border-neutral-800"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-50">
                        {r.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">{macrosRecette(r)}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="shrink-0 h-8 text-xs"
                      onClick={() => importerRecette(r)}
                    >
                      Importer
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {CHAMPS.map(({ cle, label, unite, max }) => (
              <div key={cle} className="flex flex-col gap-1.5">
                <Label htmlFor={`modale-repas-${intake.type_repas}-${cle}`} className="text-sm">
                  {label} ({unite})
                </Label>
                <Input
                  id={`modale-repas-${intake.type_repas}-${cle}`}
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
        )}

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

        <Button
          type="button"
          variant="ghost"
          className="h-10 w-full"
          onClick={() => onOuvertChange(false)}
        >
          Annuler
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export function sousTitreObjectifRepas(
  typeJournee: TypeJournee,
  typeRepas: TypeRepas
): string {
  const o = objectifsRepasDefaut(typeJournee, typeRepas)
  return `Objectif : ${o.calories} kcal · ${o.proteines}g P · ${o.glucides}g G · ${o.lipides}g L`
}
