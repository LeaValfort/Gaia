import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formaterProchaineCycleFr } from '@/lib/proches-partage-data'
import type { PhaseDesign } from '@/lib/data/phases-design'
import type { ProchePartageData } from '@/types'
import { DEFAULT_CYCLE_LENGTH } from '@/types'
import { cn } from '@/lib/utils'

function capFr(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function VueProcheHero({
  partage,
  design,
  visible,
}: {
  partage: ProchePartageData
  design: PhaseDesign
  visible: boolean
}) {
  if (!visible) return null
  const d = new Date()
  const dateStr = capFr(format(d, 'EEEE d MMMM yyyy', { locale: fr }))
  const jour = partage.jourDuCycle
  const dateProch = formaterProchaineCycleFr(partage.prochaineCyclePredite)
  return (
    <div
      className={cn(
        'rounded-2xl p-4 border-2',
        'bg-gradient-to-br dark:from-neutral-900/90 dark:via-neutral-900/60 dark:to-neutral-950/90',
        design.border,
        'dark:border-opacity-60',
        design.gradient
      )}
    >
      <p
        className="mb-2 inline-block rounded-full px-3 py-1 text-sm font-semibold text-white"
        style={{ backgroundColor: design.accent }}
      >
        {design.label}
      </p>
      <p className="text-base font-bold text-neutral-900 dark:text-neutral-50">
        Jour {jour ?? '—'} sur {DEFAULT_CYCLE_LENGTH}
      </p>
      <p className="text-sm text-neutral-700 dark:text-neutral-200/90 mt-0.5">{dateStr}</p>
      {dateProch ? (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
          Prochain cycle estimé le <span className="font-medium text-neutral-800 dark:text-neutral-200">{dateProch}</span>
        </p>
      ) : null}
    </div>
  )
}
