import { getISODay } from 'date-fns'
import type {
  CategorieExercice,
  DerniereCharge,
  ExerciceAdapte,
  ExerciceCustom,
  Phase,
  PlanningSport,
  SeanceAdaptee,
  TypePlanningJour,
} from '@/types'

export const COEFFICIENTS_PHASE = {
  menstruation: {
    charges: 0.7,
    reps: 0.7,
    series: 0.67,
    message:
      'Phase de règles — séance allégée : -30% charges et reps, 2 séries au lieu de 3',
  },
  folliculaire: {
    charges: 1.05,
    reps: 1.0,
    series: 1.0,
    message: 'Énergie en hausse ! +5% sur les charges si tu te sens bien',
  },
  ovulation: {
    charges: 1.1,
    reps: 1.0,
    series: 1.0,
    message: "Pic d'énergie ! Tu peux pousser plus fort aujourd'hui +10%",
  },
  luteale: {
    charges: 0.9,
    reps: 0.8,
    series: 1.0,
    message: 'Phase lutéale — réduis progressivement : -10% charges, -20% reps',
  },
} as const

export const LABELS_PLANNING: Record<
  TypePlanningJour,
  { label: string; emoji: string; couleur: string }
> = {
  muscu_full: { label: 'Muscu Full body', emoji: '💪', couleur: 'bg-blue-100' },
  muscu_upper: { label: 'Muscu Upper/Lower', emoji: '🏋️', couleur: 'bg-blue-100' },
  yoga: { label: 'Yoga', emoji: '🧘', couleur: 'bg-violet-100' },
  natation: { label: 'Natation', emoji: '🏊', couleur: 'bg-emerald-100' },
  autre: { label: 'Autre sport', emoji: '🎯', couleur: 'bg-amber-100' },
  repos: { label: 'Repos', emoji: '😴', couleur: 'bg-gray-100' },
}

export const PLANNING_DEFAUT: PlanningSport = {
  lundi: 'muscu_full',
  mardi: 'repos',
  mercredi: 'yoga',
  jeudi: 'repos',
  vendredi: 'muscu_upper',
  samedi: 'natation',
  dimanche: 'repos',
}

const CLES_JOUR: (keyof PlanningSport)[] = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
]

export function getJourSemaine(date: Date): keyof PlanningSport {
  const idx = getISODay(date) - 1
  return CLES_JOUR[idx] ?? 'lundi'
}

export function getActiviteduJour(planning: PlanningSport, date: Date): TypePlanningJour {
  return planning[getJourSemaine(date)]
}

export function calculerChargeProposee(
  derniereCharge: number | null,
  coefficient: number
): number | null {
  if (derniereCharge == null || !Number.isFinite(derniereCharge)) return null
  const v = derniereCharge * coefficient
  return Math.round(v * 2) / 2
}

function typeAdaptationPourPhase(phase: Phase): SeanceAdaptee['typeAdaptation'] {
  if (phase === 'menstruation' || phase === 'luteale') return 'reduite'
  if (phase === 'ovulation') return 'alternative'
  return 'normale'
}

function catDefaut(): CategorieExercice {
  return 'compound'
}

export function adapterSeancePhase(
  exercices: ExerciceCustom[],
  dernieresCharges: DerniereCharge[],
  phase: Phase
): SeanceAdaptee {
  const coeff = COEFFICIENTS_PHASE[phase]
  const parNom = new Map(dernieresCharges.map((d) => [d.exercise_name, d]))
  const sortis: ExerciceAdapte[] = []

  for (const ex of [...exercices].sort((a, b) => a.ordre - b.ordre)) {
    const d = parNom.get(ex.nom)
    const seriesAdaptees = Math.max(1, Math.round(ex.seriesDefaut * coeff.series))
    const repsAdaptees = Math.max(1, Math.round(ex.repsDefaut * coeff.reps))
    const chargeOrig = d?.weight_kg ?? null
    const chargeProposee = calculerChargeProposee(chargeOrig, coeff.charges)
    const estAdapte =
      seriesAdaptees !== ex.seriesDefaut ||
      repsAdaptees !== ex.repsDefaut ||
      (chargeProposee != null && chargeProposee !== chargeOrig)

    sortis.push({
      nom: ex.nom,
      muscles: [],
      categorie: catDefaut(),
      seriesDefaut: ex.seriesDefaut,
      repsDefaut: ex.repsDefaut,
      unite: ex.unite,
      reposSecondes: ex.reposSecondes,
      description: '',
      conseil: '',
      seriesAdaptees,
      repsAdaptees,
      chargeProposee,
      chargeOriginale: chargeOrig,
      estAdapte,
    })
  }

  return {
    exercices: sortis,
    messageAdaptation: coeff.message,
    typeAdaptation: typeAdaptationPourPhase(phase),
  }
}
