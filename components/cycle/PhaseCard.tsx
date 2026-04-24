import { Dumbbell, Leaf } from 'lucide-react'
import type { Phase } from '@/types'
import type { InfosPhase } from '@/lib/cycle'

interface PhaseCardProps {
  phase: Phase
  jourDuCycle: number
  infos: InfosPhase
  /** Fiabilité des prédictions (apprentissage sur l’historique). */
  fiabiliteCycle?: 'haute' | 'moyenne' | 'faible' | null
}

const LABEL_FIABILITE: Record<'haute' | 'moyenne' | 'faible', string> = {
  haute: 'Prédictions fiables',
  moyenne: 'Prédictions en cours d’affinage',
  faible: 'Encore peu de données — les prédictions gagneront en précision',
}

export function PhaseCard({ phase, jourDuCycle, infos, fiabiliteCycle }: PhaseCardProps) {
  return (
    <div className={`rounded-2xl p-5 ${infos.couleurFond}`}>

      {/* Badge phase + numéro du jour */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${infos.couleurBadge}`}>
          {infos.label}
        </span>
        <span className={`text-sm font-medium ${infos.couleurTexte}`}>
          Jour {jourDuCycle} du cycle
        </span>
        {fiabiliteCycle ? (
          <span className="text-xs text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-600 rounded-full px-2 py-0.5">
            {LABEL_FIABILITE[fiabiliteCycle]}
          </span>
        ) : null}
      </div>

      {/* Conseils */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-start gap-2">
          <Dumbbell size={16} className={`mt-0.5 shrink-0 ${infos.couleurTexte}`} />
          <div>
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-0.5 uppercase tracking-wide">
              Sport
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {infos.conseilSport}
            </p>
          </div>
        </div>

        <div className="hidden sm:block w-px bg-neutral-200 dark:bg-neutral-700" />

        <div className="flex-1 flex items-start gap-2">
          <Leaf size={16} className={`mt-0.5 shrink-0 ${infos.couleurTexte}`} />
          <div>
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-0.5 uppercase tracking-wide">
              Alimentation
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {infos.conseilAlimentation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
