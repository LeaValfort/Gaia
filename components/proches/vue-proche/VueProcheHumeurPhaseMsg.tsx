import { TITRE_HUMEUR_PHASE } from '@/lib/proches-vue-helpers'
import { CONSEILS_PAR_PHASE } from '@/lib/data/conseils-proches'
import type { PhaseDesign } from '@/lib/data/phases-design'
import type { Phase } from '@/types'
import { cn } from '@/lib/utils'

export function VueProcheHumeurPhaseMsg({
  phase,
  design,
  visible,
}: {
  phase: Phase
  design: PhaseDesign
  visible: boolean
}) {
  if (!visible) return null
  const c = CONSEILS_PAR_PHASE[phase]
  return (
    <div
      className={cn(
        'flex gap-3 rounded-2xl border p-4',
        design.border,
        design.bg,
        'dark:bg-neutral-900/35 dark:backdrop-blur-sm'
      )}
    >
      <span className="text-4xl shrink-0" aria-hidden>
        {c.emoji}
      </span>
      <div>
        <p className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
          {TITRE_HUMEUR_PHASE[phase]}
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-0.5 leading-snug">{c.description}</p>
      </div>
    </div>
  )
}
