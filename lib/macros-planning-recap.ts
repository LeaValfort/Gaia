import { calculerMacrosDepuisProfil } from '@/lib/macro-calculator'
import { LABELS_PLANNING } from '@/lib/planning-sport'
import { PROFILS_DEFAUT } from '@/types'
import type {
  IntensiteEffort,
  MacroProfile,
  MacrosJour,
  Phase,
  PlanningSportEntry,
  ProfilEffort,
  SeanceProfil,
  TypePlanningJour,
} from '@/types'

const ORDRE_SEANCES: TypePlanningJour[] = [
  'muscu_full',
  'muscu_upper',
  'natation',
  'yoga',
  'autre',
  'repos',
]

const SEANCE_TYPE_REPOS = 'repos'
const PHASE_RECAP_DEFAUT: Phase = 'folliculaire'

export const LIBELLE_INTENSITE: Record<IntensiteEffort, string> = {
  legere: 'Légère',
  moderee: 'Modérée',
  intense: 'Intense',
}

export type RecapSeancePlanning = {
  seanceType: TypePlanningJour
  titre: string
  emoji: string
  profilEffort: ProfilEffort
  macros: MacrosJour
}

/**
 * Types de séance distincts présents dans le calendrier de planification
 * (`planning_sport_entries`). "Repos" seul si aucune séance planifiée.
 */
export function seancesUniquesDuCalendrier(entrees: PlanningSportEntry[]): TypePlanningJour[] {
  const types = new Set<TypePlanningJour>()
  for (const e of entrees) types.add(e.type_seance)
  if (types.size === 0) types.add(SEANCE_TYPE_REPOS)
  return ORDRE_SEANCES.filter((t) => types.has(t))
}

export function profilEffortPourTypeSeance(
  seanceType: TypePlanningJour,
  seanceProfils: SeanceProfil[]
): ProfilEffort {
  const perso = seanceProfils.find((s) => s.seance_type === seanceType)
  if (perso) {
    return {
      intensite: perso.intensite,
      type_effort: perso.type_effort,
      duree_min: perso.duree_min,
    }
  }
  const defaut = PROFILS_DEFAUT[seanceType]
  if (defaut) return { ...defaut }
  return { ...PROFILS_DEFAUT[SEANCE_TYPE_REPOS] }
}

/** Récap macros par séance du planning (calculateur automatique). */
export function recapMacrosPlanning(
  profil: MacroProfile,
  entrees: PlanningSportEntry[],
  seanceProfils: SeanceProfil[],
  phase: Phase = PHASE_RECAP_DEFAUT
): RecapSeancePlanning[] {
  return seancesUniquesDuCalendrier(entrees).map((seanceType) => {
    const meta = LABELS_PLANNING[seanceType]
    const profilEffort = profilEffortPourTypeSeance(seanceType, seanceProfils)
    return {
      seanceType,
      titre: meta.label,
      emoji: meta.emoji,
      profilEffort,
      macros: calculerMacrosDepuisProfil(profil, profilEffort, phase),
    }
  })
}

export function macrosManuelsDepuisProfil(
  profil: MacroProfile | null
): Partial<Record<TypePlanningJour, MacrosJour>> {
  if (!profil?.macros_manuels || typeof profil.macros_manuels !== 'object') {
    return {}
  }
  return profil.macros_manuels as Partial<Record<TypePlanningJour, MacrosJour>>
}

/** Mappe les macros manuelles vers les colonnes legacy de macro_profiles. */
export function colonnesLegacyDepuisManuels(
  manuels: Partial<Record<TypePlanningJour, MacrosJour>>
): {
  kcal_base: number | null
  proteines_g: number | null
  glucides_g: number | null
  lipides_g: number | null
  kcal_sport: number | null
  proteines_sport_g: number | null
  glucides_sport_g: number | null
  lipides_sport_g: number | null
  kcal_repos: number | null
  proteines_repos_g: number | null
  glucides_repos_g: number | null
  lipides_repos_g: number | null
} {
  const repos = manuels.repos
  const sport =
    manuels.muscu_full ??
    manuels.muscu_upper ??
    manuels.natation ??
    manuels.yoga ??
    manuels.autre

  return {
    kcal_base: null,
    proteines_g: null,
    glucides_g: null,
    lipides_g: null,
    kcal_sport: sport?.kcal ?? null,
    proteines_sport_g: sport?.proteines ?? null,
    glucides_sport_g: sport?.glucides ?? null,
    lipides_sport_g: sport?.lipides ?? null,
    kcal_repos: repos?.kcal ?? null,
    proteines_repos_g: repos?.proteines ?? null,
    glucides_repos_g: repos?.glucides ?? null,
    lipides_repos_g: repos?.lipides ?? null,
  }
}
