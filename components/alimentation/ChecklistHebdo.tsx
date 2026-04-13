'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChefHat } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase'
import { getNutritionLogSemaine, upsertNutritionLog } from '@/lib/db/nutrition'
import { calculerScoreChecklist, getMessageScore } from '@/lib/nutrition'
import { ITEMS_CHECKLIST, CATEGORIES_LABELS, ORDRE_CATEGORIES, BATCH_ITEM, creerChecklistVide } from '@/lib/data/nutrition'

interface ChecklistHebdoProps {
  userId: string
  weekStart: string
}

export function ChecklistHebdo({ userId, weekStart }: ChecklistHebdoProps) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(creerChecklistVide())
  const [batchDone, setBatchDone] = useState(false)
  const [notes] = useState<string | null>(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  // Chargement initial depuis Supabase
  useEffect(() => {
    async function charger() {
      setChargement(true)
      const log = await getNutritionLogSemaine(supabase, userId, weekStart)
      if (log) {
        setChecklist({ ...creerChecklistVide(), ...(log.checklist as Record<string, boolean>) })
        setBatchDone(log.batch_done)
      }
      setChargement(false)
    }
    charger()
  }, [userId, weekStart])

  // Sauvegarde automatique après chaque changement
  const sauvegarder = useCallback(async (
    nouvelleChecklist: Record<string, boolean>,
    nouveauBatch: boolean
  ) => {
    try {
      await upsertNutritionLog(supabase, userId, weekStart, nouvelleChecklist, nouveauBatch, notes)
    } catch {
      setErreur('Erreur lors de la sauvegarde. Vérifie ta connexion.')
    }
  }, [userId, weekStart, notes])

  async function basculerItem(itemId: string) {
    const nouvelleChecklist = { ...checklist, [itemId]: !checklist[itemId] }
    setChecklist(nouvelleChecklist)
    await sauvegarder(nouvelleChecklist, batchDone)
  }

  async function basculerBatch() {
    const nouveauBatch = !batchDone
    setBatchDone(nouveauBatch)
    await sauvegarder(checklist, nouveauBatch)
  }

  const { fait, total, pourcentage } = calculerScoreChecklist(checklist, ITEMS_CHECKLIST)
  const messageScore = getMessageScore(pourcentage)

  // Items groupés par catégorie
  const parCategorie = ITEMS_CHECKLIST.reduce<Record<string, typeof ITEMS_CHECKLIST>>((acc, item) => {
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

      {/* En-tête : score + barre de progression */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-50">
              {fait} / {total} items cette semaine
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

      {erreur && (
        <p className="text-sm text-red-500 dark:text-red-400 px-1">{erreur}</p>
      )}

      {/* Sections par catégorie */}
      {ORDRE_CATEGORIES.map((categorie) => (
        <div key={categorie} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {CATEGORIES_LABELS[categorie]}
          </p>
          {(parCategorie[categorie] ?? []).map((item) => (
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
      ))}

      {/* Batch cooking — section séparée */}
      <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 flex items-start gap-3">
        <ChefHat size={20} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="flex-1 flex flex-col gap-1">
          <label htmlFor="batch" className="text-sm font-semibold text-amber-800 dark:text-amber-300 cursor-pointer">
            {BATCH_ITEM.label}
          </label>
          <p className="text-xs text-amber-700 dark:text-amber-400">{BATCH_ITEM.description}</p>
        </div>
        <Checkbox
          id="batch"
          checked={batchDone}
          onCheckedChange={basculerBatch}
          className="mt-0.5 shrink-0"
        />
      </div>

    </div>
  )
}
