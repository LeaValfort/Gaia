// Rappel informatif des symptômes fréquents de la phase — purement indicatif,
// pas de case à cocher, pas de lien avec le journal quotidien (choix de Léa).

import { AlertCircle } from 'lucide-react'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import { SYMPTOMES_A_SURVEILLER } from '@/lib/data/nutrition'
import type { Phase } from '@/types'
import { cn } from '@/lib/utils'

interface SymptomesPhaseCardProps {
  phase: Phase
}

export function SymptomesPhaseCard({ phase }: SymptomesPhaseCardProps) {
  const design = PHASES_DESIGN[phase]

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4',
        design.border,
        design.bg,
        'dark:border-neutral-800 dark:bg-neutral-900/60'
      )}
    >
      <AlertCircle size={20} className="mt-0.5 shrink-0 text-neutral-500 dark:text-neutral-400" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Symptômes à surveiller
        </p>
        <p className="text-sm leading-snug text-neutral-600 dark:text-neutral-300">
          {SYMPTOMES_A_SURVEILLER[phase]}
        </p>
      </div>
    </div>
  )
}
