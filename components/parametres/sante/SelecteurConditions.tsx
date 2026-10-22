'use client'

import { toast } from 'sonner'
import { CONDITIONS_SANTE, ORDRE_CONDITIONS } from '@/lib/data/conditions-sante'
import { cn } from '@/lib/utils'
import type { ConditionSante } from '@/types'

interface SelecteurConditionsProps {
  conditions: ConditionSante[]
  onChange: (conditions: ConditionSante[]) => Promise<boolean>
}

const GROUPES = ['Thyroïde', 'Gynéco', 'Autres'] as const

/** Profil santé : conditions qui adaptent recettes IA, conseils et symptômes du journal. */
export function SelecteurConditions({ conditions, onChange }: SelecteurConditionsProps) {
  async function basculer(c: ConditionSante) {
    const n = conditions.includes(c) ? conditions.filter((x) => x !== c) : [...conditions, c]
    if (!(await onChange(n))) toast.error('Enregistrement impossible')
  }

  return (
    <div className="space-y-3">
      {GROUPES.map((g) => (
        <div key={g}>
          <p className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">{g}</p>
          <div className="flex flex-wrap gap-1.5">
            {ORDRE_CONDITIONS.filter((c) => CONDITIONS_SANTE[c].groupe === g).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={conditions.includes(c)}
                onClick={() => void basculer(c)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm transition-colors',
                  conditions.includes(c)
                    ? 'border-violet-500 bg-violet-50 font-medium text-violet-900 dark:bg-violet-950/50 dark:text-violet-100'
                    : 'border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300'
                )}
              >
                {CONDITIONS_SANTE[c].label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        Gaia adapte les recettes IA, ajoute des conseils sourcés et des symptômes à suivre dans ton journal. Ce n’est pas un avis médical.
      </p>
    </div>
  )
}
