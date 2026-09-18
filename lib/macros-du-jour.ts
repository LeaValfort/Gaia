import { calculerMacrosDepuisProfil, type TypeJourneeMacros } from '@/lib/macro-calculator'
import {
  calculerMacrosJour,
  calculerMacrosJourSansCycle,
  getTypeJournee,
  getTypeJourneeEffectifMacros,
} from '@/lib/nutrition'
import { datePourPlanningSport } from '@/lib/planning-sport-recurrence'
import { seanceLaPlusIntense, typePlanningDeEntree, type SeanceResolue } from '@/lib/planning-sport-jour'
import { PROFILS_DEFAUT } from '@/types'
import type {
  MacroProfile,
  MacrosCiblesJour,
  MacrosJour,
  MacrosMode,
  Phase,
  ProfilEffort,
  TypeJournee,
  TypePlanningJour,
} from '@/types'

// Fuseau horaire utilisé pour dater les séances — voir `datePourPlanningSport`
// dans `lib/planning-sport-recurrence.ts` (source unique, réexportée ici pour
// compatibilité avec le code existant qui l'importait depuis ce fichier).
export { datePourPlanningSport }

const LIBELLE_TYPE_MACROS: Record<TypeJourneeMacros, string> = {
  sport: 'Jour de sport',
  repos: 'Jour de repos',
  cycle: 'Jour de règles',
}

const LIBELLE_PHASE: Record<Phase, string> = {
  menstruation: 'règles',
  folliculaire: 'folliculaire',
  ovulation: 'ovulatoire',
  luteale: 'lutéale',
}

/**
 * Type macro du jour : règles → cycle (si suivi du cycle actif) ; au moins une
 * séance planifiée (n'importe quel type, "Autre sport" compris) → sport ;
 * sinon repos.
 */
export function typeJourneeMacrosDepuisEntrees(
  phase: Phase,
  entreesResolues: SeanceResolue[],
  sansSuiviCycle: boolean
): TypeJourneeMacros {
  if (!sansSuiviCycle && phase === 'menstruation') return 'cycle'
  return entreesResolues.length > 0 ? 'sport' : 'repos'
}

function typeJourneeAffichageDepuisMacros(typeMacro: TypeJourneeMacros): TypeJournee {
  if (typeMacro === 'cycle') return 'regles'
  if (typeMacro === 'repos') return 'repos'
  return 'sport'
}

function macrosDepuisManuels(profil: MacroProfile, seanceType: TypePlanningJour): MacrosJour | null {
  const manuels = profil.macros_manuels
  if (!manuels || typeof manuels !== 'object') return null
  const m = manuels[seanceType]
  if (!m || m.kcal == null) return null
  return {
    kcal: m.kcal,
    proteines: m.proteines,
    glucides: m.glucides,
    lipides: m.lipides,
  }
}

function macrosCiblesDepuisProfil(
  profil: MacroProfile,
  phase: Phase,
  typeMacro: TypeJourneeMacros,
  typeJourneeUi: TypeJournee,
  profilEffort: ProfilEffort,
  seanceType: TypePlanningJour,
  macrosMode: MacrosMode
): MacrosCiblesJour {
  const manuel = macrosMode === 'manuel' ? macrosDepuisManuels(profil, seanceType) : null
  const m = manuel ?? calculerMacrosDepuisProfil(profil, profilEffort, phase)

  return {
    calories: m.kcal,
    proteines: m.proteines,
    glucides: m.glucides,
    lipides: m.lipides,
    typeJournee: typeJourneeUi,
    phase,
    message: `${LIBELLE_TYPE_MACROS[typeMacro]} — phase ${LIBELLE_PHASE[phase]}`,
  }
}

/**
 * Cibles de macros pour une date précise, à partir des séances planifiées
 * déjà résolues (voir `seancesResoluesPourDate` dans `lib/planning-sport-jour.ts`).
 * S'il y a plusieurs séances ce jour-là, le profil d'effort le plus intense
 * est utilisé (choix de Léa).
 */
export function macrosCiblesPourJour(options: {
  profil: MacroProfile | null
  phase: Phase
  entreesResolues: SeanceResolue[]
  date: Date
  sansSuiviCycle: boolean
  macrosMode?: MacrosMode
}): MacrosCiblesJour {
  const { profil, phase, entreesResolues, date, sansSuiviCycle, macrosMode = 'auto' } = options
  const dateStable = datePourPlanningSport(date)
  const typeJourneePlanning = getTypeJournee(dateStable)
  const typeJourneeUi = sansSuiviCycle
    ? typeJourneePlanning
    : getTypeJourneeEffectifMacros(phase, typeJourneePlanning, sansSuiviCycle)

  if (!profil) {
    return sansSuiviCycle
      ? calculerMacrosJourSansCycle(typeJourneePlanning)
      : calculerMacrosJour(phase, typeJourneePlanning)
  }

  const typeMacro = typeJourneeMacrosDepuisEntrees(phase, entreesResolues, sansSuiviCycle)
  const seanceIntense = seanceLaPlusIntense(entreesResolues)
  const effort = seanceIntense?.profil ?? { ...PROFILS_DEFAUT.repos }
  const seanceType = seanceIntense ? typePlanningDeEntree(seanceIntense.entree) : 'repos'

  return macrosCiblesDepuisProfil(
    profil,
    phase,
    typeMacro,
    typeJourneeAffichageDepuisMacros(typeMacro),
    effort,
    seanceType,
    macrosMode
  )
}
