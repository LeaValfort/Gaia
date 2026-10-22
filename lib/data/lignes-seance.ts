import type { TypeActivite, TypeLigneSeanceLibre } from '@/types'

/** Libellés et emoji des types de lignes d'une séance libre. */
export const TYPES_LIGNE: Record<TypeLigneSeanceLibre, { label: string; emoji: string; aide: string }> = {
  exercice: { label: 'Exercice', emoji: '💪', aide: 'Séries × reps, charge' },
  bloc: { label: 'Bloc distance / durée', emoji: '📏', aide: 'Ex. 4 × 200 m, 10 min' },
  mouvement: { label: 'Mouvement', emoji: '🤸', aide: 'Nom + temps, minuteur' },
  intervalles: { label: 'Intervalles', emoji: '⏱️', aide: 'Ex. 8 × (30 s rapide + 30 s lent)' },
  circuit: { label: 'Circuit', emoji: '🔁', aide: 'Mouvements répétés en tours' },
  voie: { label: 'Voie / bloc', emoji: '🧗', aide: 'Cotation + réussie' },
}

const TOUS: TypeLigneSeanceLibre[] = ['exercice', 'mouvement', 'bloc', 'intervalles', 'circuit', 'voie']

/**
 * Types de lignes proposés en premier selon le sport (les autres restent
 * accessibles via « Plus »). Idée : ne montrer d'emblée que ce qui sert.
 */
const SUGGERES: Partial<Record<TypeActivite, TypeLigneSeanceLibre[]>> = {
  escalade: ['voie', 'mouvement', 'exercice'],
  velo: ['bloc', 'intervalles'],
  course: ['bloc', 'intervalles'],
  natation_libre: ['bloc', 'intervalles'],
  rando: ['bloc'],
  marche: ['bloc'],
  pilates: ['mouvement', 'exercice', 'circuit'],
  danse: ['mouvement', 'circuit'],
  boxe: ['intervalles', 'circuit', 'mouvement'],
  fitness: ['circuit', 'exercice', 'intervalles'],
  muscu_libre: ['exercice', 'circuit'],
}

export function typesLigneSuggeres(sport: TypeActivite | null): { suggeres: TypeLigneSeanceLibre[]; autres: TypeLigneSeanceLibre[] } {
  const suggeres = (sport && SUGGERES[sport]) || ['exercice', 'mouvement', 'bloc']
  return { suggeres, autres: TOUS.filter((t) => !suggeres.includes(t)) }
}
