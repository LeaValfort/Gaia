import Link from 'next/link'
import { Timer } from 'lucide-react'
import { designPhaseAffichage, getInfosPhase } from '@/lib/cycle'
import { LABELS_PLANNING } from '@/lib/planning-sport'
import type { Phase, TypePlanningJour } from '@/types'
import { cn } from '@/lib/utils'

const CARD =
  'rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900'

export interface SeanceDuJourProps {
  phase: Phase | null
  sansCycle?: boolean
  /** Activité planifiée aujourd'hui (planning hebdo) — affichée à la place du libellé de phase. */
  typeSeance?: TypePlanningJour
}

export function SeanceDuJour({ phase, sansCycle, typeSeance }: SeanceDuJourProps) {
  const d = designPhaseAffichage(phase, { sansCycle })
  const titre = typeSeance
    ? `${LABELS_PLANNING[typeSeance].emoji} ${LABELS_PLANNING[typeSeance].label}`
    : phase && !sansCycle
      ? `Séance conseillée — ${getInfosPhase(phase).label}`
      : 'Séance du jour'
  const duree = phase && !sansCycle && (phase === 'ovulation' || phase === 'folliculaire') ? '40–50 min' : '25–35 min'

  return (
    <div className={cn(CARD)} style={{ borderColor: `${d.accent}44` }}>
      <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
        Mouvement
      </p>
      <p className="font-semibold text-gray-900 dark:text-gray-50">{titre}</p>
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Timer className="size-4 shrink-0" style={{ color: d.accent }} aria-hidden />
        <span>Durée estimée · {duree}</span>
      </div>
      <Link
        href="/sport"
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
      >
        Commencer
      </Link>
    </div>
  )
}
