import { getISODay } from 'date-fns'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import type {
  CategorieExercice,
  DerniereCharge,
  ExerciceAdapte,
  ExerciceCustom,
  Phase,
  PlanningSport,
  PourcentagesGaia,
  SeanceAdaptee,
  TypePlanningJour,
} from '@/types'

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

/**
 * Planning hebdo fusionné avec les valeurs par défaut. Encore utilisé pour
 * l'affichage "séance du jour" (héritage de l'ancien planning jour-par-jour,
 * en cours de remplacement par le nouveau calendrier `planning_sport_entries`).
 */
export function planningEffectif(planning: PlanningSport | null | undefined): PlanningSport {
  const d = PLANNING_DEFAUT
  if (!planning) return d
  return {
    lundi: planning.lundi ?? d.lundi,
    mardi: planning.mardi ?? d.mardi,
    mercredi: planning.mercredi ?? d.mercredi,
    jeudi: planning.jeudi ?? d.jeudi,
    vendredi: planning.vendredi ?? d.vendredi,
    samedi: planning.samedi ?? d.samedi,
    dimanche: planning.dimanche ?? d.dimanche,
  }
}

/**
 * Activité effective d'un jour : la substitution ponctuelle (`planning_overrides`)
 * si elle existe pour cette date, sinon le planning hebdo normal.
 */
export function getActiviteduJourEffectif(
  planning: PlanningSport,
  date: Date,
  override: TypePlanningJour | null
): TypePlanningJour {
  return override ?? getActiviteduJour(planning, date)
}

/**
 * Applique un pourcentage d'ajustement (+/-) à une valeur numérique (charge en
 * muscu, distance en natation...), avec un arrondi adapté à l'unité utilisée.
 * Le pourcentage vient des réglages de l'utilisatrice (Paramètres > Planning
 * sport) — voir POURCENTAGES_GAIA_DEFAUT dans types/index.ts.
 */
export function appliquerPourcentage(valeur: number, pourcentage: number, arrondi = 1): number {
  if (!Number.isFinite(valeur)) return valeur
  const v = valeur * (1 + pourcentage / 100)
  return Math.round(v / arrondi) * arrondi
}

export function calculerChargeProposee(
  derniereCharge: number | null,
  pourcentage: number
): number | null {
  if (derniereCharge == null || !Number.isFinite(derniereCharge)) return null
  return appliquerPourcentage(derniereCharge, pourcentage, 0.5)
}

function typeAdaptationPourPourcentage(pourcentage: number): SeanceAdaptee['typeAdaptation'] {
  if (pourcentage < 0) return 'reduite'
  if (pourcentage > 0) return 'alternative'
  return 'normale'
}

/**
 * Message affiché dans la bannière "Suggestion Gaia", basé sur le pourcentage
 * réglé par l'utilisatrice pour la phase (pas une valeur figée en dur).
 */
export function messagePourcentageGaia(phase: Phase, pourcentage: number): string {
  const label = PHASES_DESIGN[phase].label
  if (pourcentage === 0) return `${label} — pas d'ajustement particulier aujourd'hui.`
  const signe = pourcentage > 0 ? '+' : ''
  return `${label} — charge/distance ajustée de ${signe}${pourcentage}% (réglable dans Paramètres).`
}

function catDefaut(): CategorieExercice {
  return 'compound'
}

export function adapterSeancePhase(
  exercices: ExerciceCustom[],
  dernieresCharges: DerniereCharge[],
  phase: Phase,
  pourcentages: PourcentagesGaia
): SeanceAdaptee {
  const pourcentage = pourcentages[phase]
  const parNom = new Map(dernieresCharges.map((d) => [d.exercise_name, d]))
  const sortis: ExerciceAdapte[] = []

  for (const ex of [...exercices].sort((a, b) => a.ordre - b.ordre)) {
    const d = parNom.get(ex.nom)
    const chargeOrig = d?.weight_kg ?? null
    const chargeProposee = calculerChargeProposee(chargeOrig, pourcentage)
    // Seule la masse (charge) est ajustée selon la phase — le nombre de reps
    // et de séries reste identique quelle que soit la phase (choix de Léa).
    const estAdapte = chargeProposee != null && chargeProposee !== chargeOrig

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
      seriesAdaptees: ex.seriesDefaut,
      repsAdaptees: ex.repsDefaut,
      chargeProposee,
      chargeOriginale: chargeOrig,
      estAdapte,
    })
  }

  return {
    exercices: sortis,
    messageAdaptation: messagePourcentageGaia(phase, pourcentage),
    typeAdaptation: typeAdaptationPourPourcentage(pourcentage),
  }
}
