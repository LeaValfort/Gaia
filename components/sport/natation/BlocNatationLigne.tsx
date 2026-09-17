import { libelleNage } from '@/lib/data/swimming'
import type { BlocNatation } from '@/types'

/**
 * Une ligne d'affichage pour un bloc de séance natation (nage + distance),
 * dans le même esprit visuel que les lignes d'exercices muscu / postures yoga.
 */
export function BlocNatationLigne({ bloc }: { bloc: BlocNatation }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 p-2 text-sm dark:border-emerald-900/50">
      <span className="font-medium text-neutral-900 dark:text-neutral-100">{libelleNage(bloc.nage)}</span>
      <span className="shrink-0 font-mono text-[#059669] dark:text-emerald-300">{bloc.distanceM} m</span>
    </div>
  )
}
