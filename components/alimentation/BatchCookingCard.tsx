'use client'

// Rappel batch cooking du dimanche — reste hebdomadaire (nutrition_logs),
// séparé de la checklist quotidienne. Extrait de ChecklistJour pour respecter
// la limite de 150 lignes/fichier.

import { ChefHat } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { BATCH_ITEM } from '@/lib/data/nutrition'

interface BatchCookingCardProps {
  batchDone: boolean
  onToggle: () => void
}

export function BatchCookingCard({ batchDone, onToggle }: BatchCookingCardProps) {
  return (
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
        onCheckedChange={onToggle}
        className="mt-0.5 shrink-0"
      />
    </div>
  )
}
