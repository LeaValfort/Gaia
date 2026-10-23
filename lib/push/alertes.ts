import type { DailyLog } from '@/types'

/**
 * Détection des alertes à envoyer aux proches à partir du journal du jour.
 * Seuils volontairement simples et lisibles (échelles de l'appli :
 * énergie 1 à 5, douleur 0 à 10).
 */

export const SEUIL_DOULEUR_HAUTE = 7
export const SEUIL_ENERGIE_BASSE = 2

const EMOTIONS_DIFFICILES = ['Tristesse', 'Anxiété', 'Irritabilité']
const MOTS_HUMEUR_DIFFICILE = ['triste', 'anxieu', 'stress', 'angoiss', 'deprim', 'déprim', 'irrit', 'colere', 'colère', 'mal', 'pleur', 'epuis', 'épuis', 'nul', 'down']

export type TypeAlerte = 'debut_regles' | 'douleur_haute' | 'energie_basse' | 'humeur_difficile'

export function douleurHaute(log: Pick<DailyLog, 'pain'>): boolean {
  return (log.pain ?? 0) >= SEUIL_DOULEUR_HAUTE
}

export function energieBasse(log: Pick<DailyLog, 'energy'>): boolean {
  return log.energy != null && log.energy > 0 && log.energy <= SEUIL_ENERGIE_BASSE
}

export function humeurDifficile(log: Pick<DailyLog, 'mood' | 'emotions'>): boolean {
  if ((log.emotions ?? []).some((e) => EMOTIONS_DIFFICILES.includes(e))) return true
  const m = (log.mood ?? '').toLowerCase()
  return !!m && MOTS_HUMEUR_DIFFICILE.some((k) => m.includes(k))
}

/** Texte de la notification immédiate (prénom de la personne qui partage). */
export function messageAlerte(type: 'debut_regles' | 'douleur_haute', prenom: string): { titre: string; corps: string } {
  return type === 'debut_regles'
    ? { titre: `🩸 ${prenom} a ses règles`, corps: 'Un petit message ou une attention peut faire du bien aujourd’hui.' }
    : { titre: `😣 ${prenom} a mal aujourd’hui`, corps: 'Sa douleur est élevée : pense à prendre de ses nouvelles.' }
}
