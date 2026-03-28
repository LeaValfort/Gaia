import type { Phase, TypeYoga } from '@/types'

// ------------------------------------------------------------
// Niveaux de natation (1 → 5) — version allégée pour les composants legacy
// La version complète avec critères est dans lib/data/swimming.ts
// ------------------------------------------------------------

export interface NiveauNatation {
  label: string
  description: string
  distanceTotale: number
}

export const NIVEAUX_NATATION: Record<number, NiveauNatation> = {
  1: { label: 'Départ',              description: '5×(50B + 150C)',       distanceTotale: 1000 },
  2: { label: 'Étape 1',             description: '5×(25B + 175C)',       distanceTotale: 1100 },
  3: { label: 'Étape 2',             description: '5×200C + 30s pause',   distanceTotale: 1300 },
  4: { label: 'Étape 3',             description: '3×400C + 1min pause',  distanceTotale: 1600 },
  5: { label: 'Étape 4 — Objectif',  description: '800C+100B+8×50C+300C', distanceTotale: 2000 },
}

export function getNiveauNatation(level: number): NiveauNatation {
  return NIVEAUX_NATATION[level] ?? NIVEAUX_NATATION[1]
}

// ------------------------------------------------------------
// Yoga selon la phase du cycle
// TypeYoga est défini dans types/index.ts
// ------------------------------------------------------------

export type { TypeYoga }

interface ConseilYoga {
  typeRecommande: TypeYoga
  conseil: string
}

const CONSEILS_YOGA: Record<Phase, ConseilYoga> = {
  menstruation: {
    typeRecommande: 'yin',
    conseil: 'Yoga yin — postures longues, respirations profondes, aucun effort.',
  },
  folliculaire: {
    typeRecommande: 'flow',
    conseil: 'Yoga flow — enchaînements fluides, énergie montante.',
  },
  ovulation: {
    typeRecommande: 'power',
    conseil: 'Yoga power — séquences dynamiques, force et endurance.',
  },
  luteale: {
    typeRecommande: 'flow',
    conseil: 'Yoga flow doux — transitions calmes, focus sur la respiration.',
  },
}

export function getConseilYoga(phase: Phase): ConseilYoga {
  return CONSEILS_YOGA[phase]
}
