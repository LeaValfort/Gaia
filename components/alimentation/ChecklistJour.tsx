'use client'

import { useState, useEffect, useCallback } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase'
import { getChecklistJour, upsertChecklistJour } from '@/lib/db/nutrition-checklist-jour'
import { getNutritionLogSemaine, upsertNutritionLog } from '@/lib/db/nutrition'
import { calculerScoreChecklist, getMessageScore, itemsChecklistDuJour } from '@/lib/nutrition'
import { CATEGORIES_LABELS, ORDRE_CATEGORIES, creerChecklistVideDepuis, type ItemChecklist } from '@/lib/data/nutrition'
import { SymptomesPhaseCard } from '@/components/alimentation/SymptomesPhaseCard'
import { BatchCookingCard } from '@/components/alimentation/BatchCookingCard'
import type { Phase, TypeJournee } from '@/types'

interface ChecklistJourProps {
  userId: string
  todayIso: string
  weekStart: string
  phase: Phase
  typeJournee: TypeJournee
}

export function ChecklistJour({ userId, todayIso, weekStart, phase, typeJournee }: ChecklistJourProps) {
  const items = itemsChecklistDuJour(phase, typeJournee)
  const [checklist, setChecklist] = useState<Record<string, boolean>>(creerChecklistVideDepuis(items))
  const [batchDone, setBatchDone] = useState(false)
  // Checklist/notes hebdomadaires existantes (héritées de l'ancien système) :
  // préservées telles quelles, seul batch_done est géré depuis cette page.
  const [checklistSemaine, setChecklistSemaine] = useState<Record<string, boolean>>({})
  const [notesSemaine, setNotesSemaine] = useState<string | null>(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  // Chargement initial : checklist du jour + log hebdomadaire (batch cooking)
  useEffect(() => {
    async function charger() {
      setChargement(true)
      const [logJour, logSemaine] = await Promise.all([
        getChecklistJour(supabase, userId, todayIso),
        getNutritionLogSemaine(supabase, userId, weekStart),
      ])
      setChecklist({ ...creerChecklistVideDepuis(items), ...(logJour?.checklist as Record<string, boolean> | undefined) })
      setBatchDone(logSemaine?.batch_done ?? false)
      setChecklistSemaine((logSemaine?.checklist as Record<string, boolean>) ?? {})
      setNotesSemaine(logSemaine?.notes ?? null)
      setChargement(false)
    }
    charger()
    // items dépend de phase/typeJournee : recalculé à chaque changement de jour, pas besoin ici
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, todayIso, weekStart])

  const sauvegarderJour = useCallback(async (nouvelleChecklist: Record<string, boolean>) => {
    try {
      await upsertChecklistJour(supabase, userId, todayIso, nouvelleChecklist)
    } catch {
      setErreur('Erreur lors de la sauvegarde. Vérifie ta connexion.')
    }
  }, [userId, todayIso])

  async function basculerItem(itemId: string) {
    const nouvelleChecklist = { ...checklist, [itemId]: !checklist[itemId] }
    setChecklist(nouvelleChecklist)
    await sauvegarderJour(nouvelleChecklist)
  }

  async function basculerBatch() {
    const nouveauBatch = !batchDone
    setBatchDone(nouveauBatch)
    try {
      await upsertNutritionLog(supabase, userId, weekStart, checklistSemaine, nouveauBatch, notesSemaine)
    } catch {
      setErreur('Erreur lors de la sauvegarde. Vérifie ta connexion.')
    }
  }

  const { fait, total, pourcentage } = calculerScoreChecklist(checklist, items)
  const messageScore = getMessageScore(pourcentage)
  const parCategorie = items.reduce<Record<string, ItemChecklist[]>>((acc, item) => {
    if (!acc[item.categorie]) acc[item.categorie] = []
    acc[item.categorie].push(item)
    return acc
  }, {})

  if (chargement) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">

      {/* En-tête : score + barre de progression du jour */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-50">
              {fait} / {total} items aujourd&rsquo;hui
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{messageScore}</p>
          </div>
          <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{pourcentage}%</span>
        </div>
        <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-violet-600 dark:bg-violet-400 transition-all duration-500"
            style={{ width: `${pourcentage}%` }}
          />
        </div>
      </div>

      <SymptomesPhaseCard phase={phase} />

      {erreur && (
        <p className="text-sm text-red-500 dark:text-red-400 px-1">{erreur}</p>
      )}

      {/* Sections par catégorie (préparation de la séance en premier) */}
      {ORDRE_CATEGORIES.map((categorie) => (
        (parCategorie[categorie]?.length ?? 0) > 0 && (
          <div key={categorie} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {CATEGORIES_LABELS[categorie]}
            </p>
            {parCategorie[categorie].map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <Checkbox
                  id={item.id}
                  checked={checklist[item.id] ?? false}
                  onCheckedChange={() => basculerItem(item.id)}
                  className="mt-0.5 shrink-0"
                />
                <label htmlFor={item.id} className="flex flex-col gap-0.5 cursor-pointer flex-1">
                  <span className={`text-sm font-medium transition-colors ${checklist[item.id] ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-800 dark:text-neutral-200'}`}>
                    {item.emoji} {item.label}
                  </span>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500 leading-snug">
                    {item.description}
                  </span>
                </label>
              </div>
            ))}
          </div>
        )
      ))}

      <BatchCookingCard batchDone={batchDone} onToggle={basculerBatch} />

    </div>
  )
}
