'use client'

import { useState, useEffect, useCallback } from 'react'
import { BookOpen } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { getRecettes, deleteRecette } from '@/lib/db/recettes'
import { CarteRecette } from './CarteRecette'
import { FormRecettePersoRapide } from '@/components/alimentation/FormRecettePersoRapide'
import type { Phase, TypeRepas, Recipe } from '@/types'

interface RecettesSauvegardeeProps {
  userId: string
  phase: Phase
  masquerFiltrePhase?: boolean
}

const FILTRES_PHASE: { value: Phase | 'toutes'; label: string }[] = [
  { value: 'toutes',       label: 'Toutes' },
  { value: 'menstruation', label: 'Menstruation' },
  { value: 'folliculaire', label: 'Folliculaire' },
  { value: 'ovulation',   label: 'Ovulation' },
  { value: 'luteale',     label: 'Lutéale' },
]

const FILTRES_REPAS: { value: TypeRepas | 'tous'; label: string }[] = [
  { value: 'tous',      label: 'Tous' },
  { value: 'petit-dej', label: 'Petit-déj' },
  { value: 'dejeuner',  label: 'Déjeuner' },
  { value: 'collation', label: 'Collation' },
  { value: 'diner',     label: 'Dîner' },
]

export function RecettesSauvegardees({ userId, phase, masquerFiltrePhase }: RecettesSauvegardeeProps) {
  const [recettes, setRecettes]       = useState<Recipe[]>([])
  const [chargement, setChargement]   = useState(true)
  const [erreur, setErreur]           = useState<string | null>(null)
  const [filtrePhase, setFiltrePhase] = useState<Phase | 'toutes'>(phase)
  const [filtreRepas, setFiltreRepas] = useState<TypeRepas | 'tous'>('tous')

  const charger = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) {
        setChargement(true)
        setErreur(null)
      }
      try {
        const data = await getRecettes(supabase, userId)
        setRecettes(data)
      } catch {
        if (!opts?.silent) setErreur('Impossible de charger les recettes.')
      } finally {
        if (!opts?.silent) setChargement(false)
      }
    },
    [userId]
  )

  useEffect(() => {
    void charger()
  }, [charger])

  useEffect(() => {
    if (masquerFiltrePhase) setFiltrePhase('toutes')
  }, [masquerFiltrePhase])

  async function handleDelete(id: string) {
    setRecettes((prev) => prev.filter((r) => r.id !== id))
    await deleteRecette(supabase, userId, id)
  }

  const recettesFiltrees = recettes.filter((r) => {
    const okPhase = filtrePhase === 'toutes' || r.phase === filtrePhase || r.phase === null
    const okRepas = filtreRepas === 'tous'   || r.type_repas === filtreRepas
    return okPhase && okRepas
  })

  if (chargement) return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-7 w-24 rounded-full shrink-0" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
      </div>
    </div>
  )

  if (erreur) return <p className="text-sm text-red-500 dark:text-red-400 py-4">{erreur}</p>

  const phasePourForm = filtrePhase === 'toutes' ? null : filtrePhase

  return (
    <div className="flex flex-col gap-4">

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-900/40 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Ajouter une recette à la main</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 max-w-md">
            Ingrédients, étapes et macros pour <span className="font-medium">1 portion</span> (tu peux copier depuis Yazio).
            {!masquerFiltrePhase && (
              <> La phase du filtre ci-dessous est proposée par défaut dans le formulaire.</>
            )}
          </p>
        </div>
        <FormRecettePersoRapide
          userId={userId}
          phaseInitiale={phasePourForm}
          onCree={() => void charger({ silent: true })}
        />
      </div>

      {!masquerFiltrePhase ? (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FILTRES_PHASE.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFiltrePhase(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors shrink-0 ${filtrePhase === f.value ? 'bg-violet-600 text-white border-violet-600' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTRES_REPAS.map((f) => (
          <button key={f.value} onClick={() => setFiltreRepas(f.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors shrink-0 ${filtreRepas === f.value ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-transparent' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {recettesFiltrees.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <BookOpen size={32} className="text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {recettes.length === 0
              ? 'Aucune recette sauvegardée.'
              : 'Aucune recette pour ces filtres.'}
          </p>
          {recettes.length === 0 && (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs">
              Utilise le bouton <span className="font-medium">Ajouter une recette</span> ci-dessus, ou l&apos;onglet <span className="font-medium">Suggestions</span> pour en découvrir d&apos;autres.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {recettesFiltrees.map((r) => (
            <CarteRecette key={r.id} recette={r} onDelete={handleDelete} />
          ))}
        </div>
      )}

    </div>
  )
}
