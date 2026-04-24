import type { Phase } from '@/types'

export interface PhaseDesign {
  bg: string
  bgCard: string
  accent: string
  accentClass: string
  border: string
  texte: string
  texteMuted: string
  gradient: string
  emoji: string
  label: string
}

export const PHASES_DESIGN: Record<Phase, PhaseDesign> = {
  menstruation: {
    bg: 'bg-rose-50',
    bgCard: '#FFF1F2',
    accent: '#E11D48',
    accentClass: 'text-rose-600',
    border: 'border-rose-200',
    texte: '#881337',
    texteMuted: '#BE123C',
    gradient: 'from-rose-50 to-rose-100',
    emoji: '🔴',
    label: 'Menstruation',
  },
  folliculaire: {
    bg: 'bg-amber-50',
    bgCard: '#FFFBEB',
    accent: '#D97706',
    accentClass: 'text-amber-600',
    border: 'border-amber-200',
    texte: '#92400E',
    texteMuted: '#B45309',
    gradient: 'from-amber-50 to-amber-100',
    emoji: '🌱',
    label: 'Folliculaire',
  },
  ovulation: {
    bg: 'bg-emerald-50',
    bgCard: '#ECFDF5',
    accent: '#059669',
    accentClass: 'text-emerald-600',
    border: 'border-emerald-200',
    texte: '#065F46',
    texteMuted: '#047857',
    gradient: 'from-emerald-50 to-emerald-100',
    emoji: '✨',
    label: 'Ovulation',
  },
  luteale: {
    bg: 'bg-violet-50',
    bgCard: '#F5F3FF',
    accent: '#7C3AED',
    accentClass: 'text-violet-600',
    border: 'border-violet-200',
    texte: '#4C1D95',
    texteMuted: '#6D28D9',
    gradient: 'from-violet-50 to-violet-100',
    emoji: '🌙',
    label: 'Lutéale',
  },
}

/** Mode sans cycle ou accueil sans phase : palette neutre type bien-être */
export const PHASE_DESIGN_ACCUEIL_NEUTRE: PhaseDesign = {
  bg: 'bg-emerald-50',
  bgCard: '#ECFDF5',
  accent: '#059669',
  accentClass: 'text-emerald-600',
  border: 'border-emerald-200',
  texte: '#065F46',
  texteMuted: '#047857',
  gradient: 'from-emerald-50 to-teal-100',
  emoji: '🌿',
  label: 'Bien-être',
}

export function designPhaseAffichage(
  phase: Phase | null,
  opts?: { sansCycle?: boolean }
): PhaseDesign {
  if (opts?.sansCycle || !phase) return PHASE_DESIGN_ACCUEIL_NEUTRE
  return PHASES_DESIGN[phase]
}

/** Couleurs cellules calendrier page Cycle (aligné visuel distinct par phase). */
export const PHASES_CALENDRIER_CELL: Record<
  Phase,
  { bg: string; border: string; texte: string }
> = {
  menstruation: { bg: '#FFD6DA', border: '#F87171', texte: '#9B1C1C' },
  folliculaire: { bg: '#FEF08A', border: '#EAB308', texte: '#713F12' },
  ovulation: { bg: '#BBF7D0', border: '#22C55E', texte: '#14532D' },
  luteale: { bg: '#DDD6FE', border: '#8B5CF6', texte: '#3B0764' },
}

export const CALENDRIER_PREDICTION = {
  bg: '#FFFFFF',
  border: '#D1D5DB',
  texte: '#9CA3AF',
} as const

export const CALENDRIER_RETARD = {
  bg: '#FED7AA',
  border: '#F97316',
  texte: '#7C2D12',
} as const
