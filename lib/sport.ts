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
  1: { label: 'Départ',              description: 'Éch.+Bras seul+5×(50B+150C)', distanceTotale: 1250 },
  2: { label: 'Étape 1',             description: 'Éch.+Catch-up+5×(25B+175C)',  distanceTotale: 1350 },
  3: { label: 'Étape 2',             description: 'Éch.+Bilatérale+5×200C+30s',  distanceTotale: 1550 },
  4: { label: 'Étape 3',             description: 'Éch.+Jambes+3×400C+1min',     distanceTotale: 1850 },
  5: { label: 'Étape 4 — Objectif',  description: 'Éch.+Jambes+sprints+2000m+',  distanceTotale: 2250 },
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
