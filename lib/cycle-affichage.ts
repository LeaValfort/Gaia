import type { CycleStats, Phase } from '@/types'

export function labelRegulariteCycle(stats: CycleStats | null): string {
  if (!stats || stats.nb_cycles_utilise < 2) return 'À compléter'
  if (stats.nb_cycles_utilise >= 5) return 'Historique suffisant'
  return 'En cours'
}

/** Afficher la carte statistiques seulement si au moins une valeur est exploitable. */
export function statsCycleOntDesValeurs(stats: CycleStats | null): boolean {
  if (!stats) return false

  const dureeMoyenne =
    stats.cycle_length_moyen != null && stats.cycle_length_moyen > 0
  const reglesMoyennes =
    stats.period_length_moyen != null && stats.period_length_moyen > 0
  const cyclesAnalyses = stats.nb_cycles_utilise > 0
  const regularite = labelRegulariteCycle(stats) !== 'À compléter'

  return dureeMoyenne || reglesMoyennes || cyclesAnalyses || regularite
}

export const BADGE_PHASE_CYCLE: Record<Phase, string> = {
  menstruation: 'bg-rose-600 dark:bg-rose-700',
  folliculaire: 'bg-amber-600 dark:bg-amber-700',
  ovulation: 'bg-teal-600 dark:bg-teal-700',
  luteale: 'bg-violet-600 dark:bg-violet-700',
}

/** Soulignement et texte actif des onglets conseils (teal / amber / red / purple). */
export const ONGLET_CONSEIL_ACTIF: Record<Phase, string> = {
  menstruation:
    'data-active:text-rose-700 dark:data-active:text-rose-300 data-active:after:bg-rose-500',
  folliculaire:
    'data-active:text-amber-800 dark:data-active:text-amber-300 data-active:after:bg-amber-500',
  ovulation:
    'data-active:text-teal-800 dark:data-active:text-teal-300 data-active:after:bg-teal-500',
  luteale:
    'data-active:text-violet-800 dark:data-active:text-violet-300 data-active:after:bg-violet-500',
}
