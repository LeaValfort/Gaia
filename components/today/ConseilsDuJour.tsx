import { Dumbbell, Leaf } from 'lucide-react'
import { designPhaseAffichage, getInfosPhase } from '@/lib/cycle'
import type { Phase } from '@/types'
import { cn } from '@/lib/utils'

const CARD =
  'rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900'

export interface ConseilsDuJourProps {
  phase: Phase | null
  sansCycle?: boolean
}

export function ConseilsDuJour({ phase, sansCycle }: ConseilsDuJourProps) {
  const d = designPhaseAffichage(phase, { sansCycle })
  const sport = phase && !sansCycle ? getInfosPhase(phase).conseilSport : 'Marche légère ou yoga doux — écoute ton corps.'
  const nut = phase && !sansCycle ? getInfosPhase(phase).conseilAlimentation : 'Priorité aux aliments peu transformés, oméga-3 et légumes de saison.'

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className={cn(CARD)} style={{ borderColor: `${d.accent}44` }}>
        <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          Sport
        </p>
        <div className="flex gap-2">
          <Dumbbell className="size-5 shrink-0" style={{ color: d.accent }} aria-hidden />
          <p className="text-sm text-gray-700 dark:text-gray-200 leading-snug">{sport}</p>
        </div>
      </div>
      <div className={cn(CARD)} style={{ borderColor: `${d.accent}44` }}>
        <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          Nutrition
        </p>
        <div className="flex gap-2">
          <Leaf className="size-5 shrink-0" style={{ color: d.accent }} aria-hidden />
          <p className="text-sm text-gray-700 dark:text-gray-200 leading-snug">{nut}</p>
        </div>
      </div>
    </div>
  )
}
