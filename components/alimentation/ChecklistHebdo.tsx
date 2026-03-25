'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { toggleItemChecklist, upsertNutritionLog } from '@/lib/db/nutrition'
import { ITEMS_CHECKLIST } from '@/lib/nutrition'

interface ChecklistHebdoProps {
  weekStart: string
  checklistInitiale: Record<string, boolean>
  batchDoneInitial: boolean
}

const RECETTES_BATCH = [
  { titre: 'Overnight oats', details: 'Flocons + lait végétal + chia + fruits. Préparer 5 pots le dimanche.' },
  { titre: 'Egg muffins', details: '12 œufs + légumes + fromage. 20 min au four à 180°C. Se conservent 5 jours.' },
]

export function ChecklistHebdo({ weekStart, checklistInitiale, batchDoneInitial }: ChecklistHebdoProps) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(checklistInitiale)
  const [batchDone, setBatchDone] = useState(batchDoneInitial)

  async function basculerItem(itemId: string) {
    const nouvelleValeur = !checklist[itemId]
    setChecklist((prev) => ({ ...prev, [itemId]: nouvelleValeur }))
    await toggleItemChecklist(weekStart, itemId, nouvelleValeur, checklist, batchDone)
  }

  async function basculerBatch() {
    const nouvelleValeur = !batchDone
    setBatchDone(nouvelleValeur)
    await upsertNutritionLog({ weekStart, checklist, batchDone: nouvelleValeur })
  }

  const totalCoches = Object.values(checklist).filter(Boolean).length
  const totalItems = ITEMS_CHECKLIST.length

  const parCategorie = ITEMS_CHECKLIST.reduce<Record<string, typeof ITEMS_CHECKLIST>>((acc, item) => {
    if (!acc[item.categorie]) acc[item.categorie] = []
    acc[item.categorie].push(item)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6">

      {/* Checklist anti-inflammatoire */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Checklist cette semaine</h2>
          <span className="text-sm text-neutral-400">{totalCoches}/{totalItems}</span>
        </div>

        {/* Barre de progression */}
        <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-neutral-900 dark:bg-white transition-all duration-300"
            style={{ width: `${totalItems > 0 ? (totalCoches / totalItems) * 100 : 0}%` }}
          />
        </div>

        {Object.entries(parCategorie).map(([categorie, items]) => (
          <div key={categorie} className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">{categorie}</p>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <Checkbox
                  id={item.id}
                  checked={checklist[item.id] ?? false}
                  onCheckedChange={() => basculerItem(item.id)}
                />
                <label
                  htmlFor={item.id}
                  className={`text-sm cursor-pointer transition-colors
                    ${checklist[item.id]
                      ? 'line-through text-neutral-400 dark:text-neutral-500'
                      : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Batch cooking */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Batch cooking du dimanche</h2>
          <div className="flex items-center gap-2">
            <Checkbox id="batch" checked={batchDone} onCheckedChange={basculerBatch} />
            <label htmlFor="batch" className="text-sm text-neutral-500 dark:text-neutral-400 cursor-pointer">
              {batchDone ? 'Fait ✓' : 'À faire'}
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {RECETTES_BATCH.map((recette) => (
            <div key={recette.titre} className={`flex-1 rounded-xl p-4 transition-all ${batchDone ? 'bg-neutral-50 dark:bg-neutral-800/50 opacity-60' : 'bg-neutral-50 dark:bg-neutral-800/50'}`}>
              <p className="font-medium text-sm text-neutral-900 dark:text-neutral-50 mb-1">{recette.titre}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{recette.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
