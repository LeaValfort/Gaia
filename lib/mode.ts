import type { ModeUtilisateur } from '@/types'

/**
 * Pas de phases (ni conseils par phase, ni prédictions) : sans cycle, ou
 * contraception hormonale sans règles (plus d'ovulation, donc plus de vraies phases).
 */
export function sansPhases(mode: ModeUtilisateur | string | null | undefined): boolean {
  return mode === 'sans_cycle' || mode === 'sans_regles'
}

/** La page Cycle reste accessible (journal, spotting, pilule) sauf en mode sans cycle. */
export function avecPageCycle(mode: ModeUtilisateur | string | null | undefined): boolean {
  return mode !== 'sans_cycle'
}

/** Lecture prudente d'une valeur venue de la base. */
export function modeDepuis(v: unknown): ModeUtilisateur {
  return v === 'sans_cycle' || v === 'sans_regles' ? v : 'cycle'
}
