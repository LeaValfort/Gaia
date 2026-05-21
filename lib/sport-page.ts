import { LABELS_PLANNING } from '@/lib/planning-sport'
import { LIBELLE_INTENSITE, profilEffortPourTypeSeance } from '@/lib/macros-planning-recap'
import type {
  PlanningSport,
  SeanceProfil,
  TypeEffort,
  TypePlanningJour,
} from '@/types'

export type SportLoggerId = 'yoga' | 'muscu' | 'natation'

export const CLES_SEMAINE: (keyof PlanningSport)[] = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
]

export const JOURS_ABREGE: Record<keyof PlanningSport, string> = {
  lundi: 'Lun',
  mardi: 'Mar',
  mercredi: 'Mer',
  jeudi: 'Jeu',
  vendredi: 'Ven',
  samedi: 'Sam',
  dimanche: 'Dim',
}

export const TYPE_COURT: Record<TypePlanningJour, string> = {
  muscu_full: 'Full',
  muscu_upper: 'Upper',
  yoga: 'Yoga',
  natation: 'Nage',
  autre: 'Autre',
  repos: 'Repos',
}

const LIBELLE_EFFORT: Record<TypeEffort, string> = {
  force: 'Force',
  cardio: 'Cardio',
  mixte: 'Mixte',
  mobilite: 'Mobilité',
  aucun: 'Repos',
}

export interface CarteLoggerSport {
  id: SportLoggerId
  nom: string
  emoji: string
  typesPlanning: TypePlanningJour[]
}

export const CARTES_LOGGER: CarteLoggerSport[] = [
  { id: 'yoga', nom: 'Yoga', emoji: '🧘', typesPlanning: ['yoga'] },
  { id: 'muscu', nom: 'Muscu', emoji: '💪', typesPlanning: ['muscu_full', 'muscu_upper'] },
  { id: 'natation', nom: 'Natation', emoji: '🏊', typesPlanning: ['natation'] },
]

/** Type planning du jour → carte logger suggérée (null si repos). */
export function carteSuggereePourTypeJour(
  typeJour: TypePlanningJour
): SportLoggerId | null {
  if (typeJour === 'repos') return null
  if (typeJour === 'yoga') return 'yoga'
  if (typeJour === 'natation') return 'natation'
  if (typeJour === 'muscu_full' || typeJour === 'muscu_upper') return 'muscu'
  return null
}

export function ouvrirAutrePourTypeJour(typeJour: TypePlanningJour): boolean {
  return typeJour === 'autre'
}

/** Cartes triées : séance suggérée en premier. */
export function ordreCartesLogger(typeJour: TypePlanningJour): CarteLoggerSport[] {
  const suggeree = carteSuggereePourTypeJour(typeJour)
  const reste = CARTES_LOGGER.filter((c) => c.id !== suggeree)
  if (suggeree) {
    const carte = CARTES_LOGGER.find((c) => c.id === suggeree)
    return carte ? [carte, ...reste] : CARTES_LOGGER
  }
  return [...CARTES_LOGGER]
}

function typeProfilPourCarte(
  carte: CarteLoggerSport,
  typeJour: TypePlanningJour
): TypePlanningJour {
  if (carte.typesPlanning.includes(typeJour)) return typeJour
  return carte.typesPlanning[0] ?? 'repos'
}

export function sousTitreCarteLogger(
  carte: CarteLoggerSport,
  typeJour: TypePlanningJour,
  seanceProfils: SeanceProfil[]
): string {
  const seanceType = typeProfilPourCarte(carte, typeJour)
  const profil = profilEffortPourTypeSeance(seanceType, seanceProfils)
  const typeLabel = LIBELLE_EFFORT[profil.type_effort]
  const duree =
    profil.duree_min > 0 ? `${profil.duree_min} min` : '—'
  const intensite = LIBELLE_INTENSITE[profil.intensite]
  return `${typeLabel} · ${duree} · ${intensite}`
}

export function emojiEtTypeCourt(type: TypePlanningJour): { emoji: string; court: string } {
  const meta = LABELS_PLANNING[type]
  return { emoji: meta.emoji, court: TYPE_COURT[type] }
}
