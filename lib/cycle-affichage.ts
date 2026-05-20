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
    'data-active:text-rose-800 dark:data-active:text-rose-200 data-active:after:bg-rose-600',
  folliculaire:
    'data-active:text-amber-900 dark:data-active:text-amber-200 data-active:after:bg-amber-600',
  ovulation:
    'data-active:text-teal-900 dark:data-active:text-teal-200 data-active:after:bg-teal-600',
  luteale:
    'data-active:text-violet-900 dark:data-active:text-violet-200 data-active:after:bg-violet-600',
}

/** Texte des conseils : contraste fort sur fond pastel clair. */
export const TEXTE_CONSEIL_PHASE: Record<Phase, string> = {
  menstruation: 'text-rose-950 dark:text-rose-50',
  folliculaire: 'text-amber-950 dark:text-amber-50',
  ovulation: 'text-teal-950 dark:text-teal-50',
  luteale: 'text-violet-950 dark:text-violet-50',
}

export const ONGLET_CONSEIL_INACTIF =
  'text-neutral-800 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-200'
