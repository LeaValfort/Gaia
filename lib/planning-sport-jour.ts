import { SPORTS_CONFIG } from '@/lib/data/sportsConfig'
import { LABELS_PLANNING } from '@/lib/planning-sport'
import { entreesActivesPourDate } from '@/lib/planning-sport-recurrence'
import { PROFILS_DEFAUT } from '@/types'
import type { PlanningSportEntry, ProfilEffort, SportVariante, TypePlanningJour } from '@/types'

/**
 * Profil par défaut générique pour une activité "Autre sport" sans réglage
 * connu (activité non listée dans PROFILS_DEFAUT, ex. danse, vélo...).
 */
const PROFIL_AUTRE_DEFAUT: ProfilEffort = { intensite: 'moderee', type_effort: 'mixte', duree_min: 45 }

/** Libellé + emoji d'une séance planifiée (activité précise pour "Autre sport"). */
export function libelleEntreePlanning(entree: PlanningSportEntry): { label: string; emoji: string } {
  if (entree.type_seance === 'autre') {
    const config = entree.activite_type ? SPORTS_CONFIG.find((s) => s.type === entree.activite_type) : null
    return { label: config?.nom ?? LABELS_PLANNING.autre.label, emoji: LABELS_PLANNING.autre.emoji }
  }
  return { label: LABELS_PLANNING[entree.type_seance].label, emoji: LABELS_PLANNING[entree.type_seance].emoji }
}

/**
 * Profil d'effort (intensité/effort/durée) d'une séance planifiée, pour le
 * calcul des macros : celui du programme choisi (variante), sinon un profil
 * par défaut selon le type de séance ou l'activité.
 */
export function profilPourEntree(entree: PlanningSportEntry, variantes: SportVariante[]): ProfilEffort {
  if (entree.type_seance === 'autre') {
    const defaut = entree.activite_type ? PROFILS_DEFAUT[entree.activite_type] : null
    return defaut ? { ...defaut } : { ...PROFIL_AUTRE_DEFAUT }
  }
  if (entree.variante_id) {
    const variante = variantes.find((v) => v.id === entree.variante_id)
    if (variante) {
      return { intensite: variante.intensite, type_effort: variante.type_effort, duree_min: variante.duree_min }
    }
  }
  const defaut = PROFILS_DEFAUT[entree.type_seance]
  return defaut ? { ...defaut } : { ...PROFIL_AUTRE_DEFAUT }
}

/** Clé `TypePlanningJour` d'une séance planifiée — pour les macros manuelles (par type). */
export function typePlanningDeEntree(entree: PlanningSportEntry): TypePlanningJour {
  return entree.type_seance
}

/** Une séance planifiée pour une date précise, avec son profil d'effort résolu. */
export interface SeanceResolue {
  entree: PlanningSportEntry
  profil: ProfilEffort
}

/** Séances planifiées et résolues (profil d'effort inclus) pour une date précise. */
export function seancesResoluesPourDate(
  entrees: PlanningSportEntry[],
  variantes: SportVariante[],
  date: Date
): SeanceResolue[] {
  return entreesActivesPourDate(entrees, date).map((entree) => ({
    entree,
    profil: profilPourEntree(entree, variantes),
  }))
}

const ORDRE_INTENSITE: Record<ProfilEffort['intensite'], number> = { legere: 0, moderee: 1, intense: 2 }

/**
 * La séance la plus intense parmi plusieurs séances du même jour — règle
 * choisie par Léa pour calculer les macros quand plusieurs séances sont
 * prévues le même jour (ex. muscu ET yoga). `null` si aucune séance.
 */
export function seanceLaPlusIntense(seances: SeanceResolue[]): SeanceResolue | null {
  if (seances.length === 0) return null
  return seances.reduce((plusIntense, s) =>
    ORDRE_INTENSITE[s.profil.intensite] > ORDRE_INTENSITE[plusIntense.profil.intensite] ? s : plusIntense
  )
}
