import { SPORTS_CONFIG } from '@/lib/data/sportsConfig'
import { LABELS_PLANNING } from '@/lib/planning-sport'
import { entreesActivesPourDate } from '@/lib/planning-sport-recurrence'
import { PROFILS_DEFAUT } from '@/types'
import type {
  PlanningOverride,
  PlanningSportEntry,
  ProfilEffort,
  SportVariante,
  TypeActivite,
  TypePlanningJour,
} from '@/types'

/**
 * Profil par défaut générique pour une activité "Autre sport" sans réglage
 * connu (activité non listée dans PROFILS_DEFAUT, ex. danse, vélo...), ou
 * pour une substitution ponctuelle sans profil précis.
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

/**
 * Une séance "effective" du jour : une séance planifiée (éventuellement
 * remplacée par une substitution ponctuelle), ou une substitution "libre"
 * pour un jour sans séance prévue. `entreeId` vaut `null` dans ce dernier cas.
 * C'est cette liste qui sert à la fois à l'affichage (Aujourd'hui, Sport) et
 * au calcul des macros du jour.
 */
export interface SeanceEffectiveJour {
  entreeId: string | null
  type: TypePlanningJour
  activiteType: TypeActivite | null
  profil: ProfilEffort
}

/** Libellé + emoji d'une séance effective du jour. */
export function libelleSeanceEffective(seance: SeanceEffectiveJour): { label: string; emoji: string } {
  if (seance.type === 'autre' && seance.activiteType) {
    const config = SPORTS_CONFIG.find((s) => s.type === seance.activiteType)
    if (config) return { label: config.nom, emoji: LABELS_PLANNING.autre.emoji }
  }
  return { label: LABELS_PLANNING[seance.type].label, emoji: LABELS_PLANNING[seance.type].emoji }
}

function profilPourType(type: TypePlanningJour): ProfilEffort {
  const defaut = PROFILS_DEFAUT[type]
  return defaut ? { ...defaut } : { ...PROFIL_AUTRE_DEFAUT }
}

/**
 * Fusionne les séances planifiées (résolues) avec les substitutions ponctuelles
 * actives ce jour-là ("changer la séance d'aujourd'hui") : une substitution
 * vers "repos" annule la séance visée, une autre substitution remplace son
 * type et son profil. Une substitution "libre" (sans séance ciblée) ajoute une
 * séance effective si le jour n'avait aucune séance planifiée.
 */
export function seancesEffectivesJour(
  entreesResolues: SeanceResolue[],
  overrides: PlanningOverride[]
): SeanceEffectiveJour[] {
  const parEntree = new Map(overrides.filter((o) => o.entree_id).map((o) => [o.entree_id as string, o]))
  const overrideLibre = overrides.find((o) => o.entree_id == null) ?? null

  const resultats: SeanceEffectiveJour[] = []
  for (const { entree, profil } of entreesResolues) {
    const substitution = parEntree.get(entree.id)
    if (substitution) {
      if (substitution.type_planning === 'repos') continue
      resultats.push({
        entreeId: entree.id,
        type: substitution.type_planning,
        activiteType: null,
        profil: profilPourType(substitution.type_planning),
      })
    } else {
      resultats.push({ entreeId: entree.id, type: entree.type_seance, activiteType: entree.activite_type, profil })
    }
  }

  if (entreesResolues.length === 0 && overrideLibre && overrideLibre.type_planning !== 'repos') {
    resultats.push({
      entreeId: null,
      type: overrideLibre.type_planning,
      activiteType: null,
      profil: profilPourType(overrideLibre.type_planning),
    })
  }

  return resultats
}

const ORDRE_INTENSITE: Record<ProfilEffort['intensite'], number> = { legere: 0, moderee: 1, intense: 2 }

/**
 * La séance la plus intense parmi plusieurs séances effectives du même jour —
 * règle choisie par Léa pour calculer les macros quand plusieurs séances sont
 * prévues le même jour (ex. muscu ET yoga). `null` si aucune séance.
 */
export function seanceLaPlusIntense(seances: SeanceEffectiveJour[]): SeanceEffectiveJour | null {
  if (seances.length === 0) return null
  return seances.reduce((plusIntense, s) =>
    ORDRE_INTENSITE[s.profil.intensite] > ORDRE_INTENSITE[plusIntense.profil.intensite] ? s : plusIntense
  )
}
