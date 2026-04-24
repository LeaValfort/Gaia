'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { getRecettes } from '@/lib/db/recettes'
import { upsertDailyMealIntake } from '@/lib/db/dailyMealIntake'
import { calculerMacrosAvecPortions } from '@/lib/mealplan'
import type { Recipe, TypeRepas } from '@/types'

const TYPES: { v: TypeRepas; l: string }[] = [
  { v: 'petit-dej', l: '🌅 Petit-déj' },
  { v: 'dejeuner', l: '🌞 Déjeuner' },
  { v: 'collation', l: '🍎 Collation' },
  { v: 'diner', l: '🌙 Dîner' },
]

interface PanneauImportRecetteJournalProps {
  userId: string
  date: string
  onApplique: () => void
}

export function PanneauImportRecetteJournal({ userId, date, onApplique }: PanneauImportRecetteJournalProps) {
  const [recettes, setRecettes] = useState<Recipe[]>([])
  const [typeRepas, setTypeRepas] = useState<TypeRepas>('dejeuner')
  const [recetteId, setRecetteId] = useState('')
  const [portions, setPortions] = useState(1)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    void getRecettes(supabase, userId).then(setRecettes)
  }, [userId])

  const recetteChoisie = useMemo(() => recettes.find((x) => x.id === recetteId) ?? null, [recettes, recetteId])
  const apercu = useMemo(() => {
    if (!recetteChoisie) return null
    return calculerMacrosAvecPortions(recetteChoisie, portions)
  }, [recetteChoisie, portions])
  const macrosNulles = apercu && apercu.calories + apercu.proteines + apercu.glucides + apercu.lipides === 0

  const appliquer = async () => {
    setMessage(null)
    const r = recettes.find((x) => x.id === recetteId)
    if (!r) return
    const m = calculerMacrosAvecPortions(r, portions)
    const res = await upsertDailyMealIntake(supabase, userId, {
      date,
      type_repas: typeRepas,
      quantite_realisee: 0,
      quantite_cible: 1,
      calories: m.calories,
      proteines: m.proteines,
      glucides: m.glucides,
      lipides: m.lipides,
      objectif_calories: null,
      objectif_proteines: null,
      objectif_glucides: null,
      objectif_lipides: null,
      nom_personnalise: null,
      source_recipe_id: r.id,
    })
    if (!res.ok) {
      setMessage(res.message ?? 'Import impossible (table journal, droits RLS ou migration SQL).')
      return
    }
    setMessage('Import enregistré — onglet « Par repas » mis à jour.')
    onApplique()
  }

  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Copie les macros de la recette × portions dans le créneau du jour (modifiable dans « Par repas »).
      </p>
      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 border-l-2 border-neutral-300 dark:border-neutral-600 pl-2">
        Yazio : il n’existe pas d’API officielle ouverte pour connecter l’app ici. Des outils non officiels existent côté communauté, mais pas adaptés à une intégration fiable dans Gaia (conditions d’utilisation, maintenance). Export manuel ou saisie / import recette restent les options.
      </p>
      {recettes.length === 0 ? (
        <p className="text-xs text-amber-700 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-2">
          Aucune recette sauvegardée : ajoute-en depuis l’onglet « Suggestions » ou « Recettes », puis reviens ici.
        </p>
      ) : null}
      <div className="space-y-1">
        <Label className="text-xs">Créneau</Label>
        <select
          className="w-full h-9 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm px-2"
          value={typeRepas}
          onChange={(e) => setTypeRepas(e.target.value as TypeRepas)}
        >
          {TYPES.map(({ v, l }) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Recette sauvegardée</Label>
        <select
          className="w-full h-9 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm px-2"
          value={recetteId}
          onChange={(e) => setRecetteId(e.target.value)}
        >
          <option value="">— Choisir —</option>
          {recettes.map((x) => (
            <option key={x.id} value={x.id}>{x.nom}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Portions</Label>
        <Input
          className="h-9"
          inputMode="numeric"
          min={1}
          max={8}
          value={portions}
          onChange={(e) => setPortions(Math.max(1, Math.min(8, Number.parseInt(e.target.value, 10) || 1)))}
        />
      </div>
      {apercu ? (
        <div className="rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 p-2 text-xs tabular-nums">
          <p className="font-medium text-neutral-800 dark:text-neutral-200 mb-1">Aperçu import</p>
          <p>{apercu.calories} kcal · P {apercu.proteines} g · G {apercu.glucides} g · L {apercu.lipides} g</p>
          {macrosNulles ? (
            <p className="text-amber-700 dark:text-amber-300 mt-1">
              Cette recette n’a pas de macros en base : ouvre l’onglet « Recettes », modifie-la pour renseigner kcal / P / G / L par portion, puis réessaie.
            </p>
          ) : null}
        </div>
      ) : null}
      {message ? (
        <p
          className={`text-xs rounded-md p-2 ${
            message.startsWith('Import')
              ? 'text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
              : 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900'
          }`}
        >
          {message}
        </p>
      ) : null}
      <Button type="button" className="alimentation-btn-primaire w-full" disabled={!recetteId} onClick={() => void appliquer()}>
        Importer dans le journal du jour
      </Button>
    </div>
  )
}
