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

/** Types de séance du jour → cartes logger suggérées (une séance peut en suggérer plusieurs). */
export function cartesSuggereesPourTypesJour(typesJour: TypePlanningJour[]): SportLoggerId[] {
  const suggerees = new Set<SportLoggerId>()
  for (const t of typesJour) {
    if (t === 'yoga') suggerees.add('yoga')
    else if (t === 'natation') suggerees.add('natation')
    else if (t === 'muscu_full' || t === 'muscu_upper') suggerees.add('muscu')
  }
  return CARTES_LOGGER.map((c) => c.id).filter((id) => suggerees.has(id))
}

export function ouvrirAutrePourTypesJour(typesJour: TypePlanningJour[]): boolean {
  return typesJour.includes('autre')
}

/** Cartes triées : séances suggérées en premier. */
export function ordreCartesLogger(typesJour: TypePlanningJour[]): CarteLoggerSport[] {
  const suggerees = new Set(cartesSuggereesPourTypesJour(typesJour))
  const suggeree = CARTES_LOGGER.filter((c) => suggerees.has(c.id))
  const reste = CARTES_LOGGER.filter((c) => !suggerees.has(c.id))
  return [...suggeree, ...reste]
}

function typeProfilPourCarte(carte: CarteLoggerSport, typesJour: TypePlanningJour[]): TypePlanningJour {
  const correspondance = typesJour.find((t) => carte.typesPlanning.includes(t))
  return correspondance ?? carte.typesPlanning[0] ?? 'repos'
}

export function sousTitreCarteLogger(
  carte: CarteLoggerSport,
  typesJour: TypePlanningJour[],
  seanceProfils: SeanceProfil[]
): string {
  const seanceType = typeProfilPourCarte(carte, typesJour)
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
