import { calculerMacrosJour as calculerMacrosProfil } from '@/lib/macro-calculator'
import type { TypeJourneeMacros } from '@/lib/macro-calculator'
import {
  calculerMacrosJour,
  calculerMacrosJourSansCycle,
  getTypeJournee,
  getTypeJourneeEffectifMacros,
} from '@/lib/nutrition'
import { getActiviteduJour, PLANNING_DEFAUT } from '@/lib/planning-sport'
import type {
  MacroProfile,
  MacrosCiblesJour,
  MacrosJour,
  Phase,
  PlanningSport,
  TypeJournee,
} from '@/types'

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

/** Type macro selon planning + phase (séance prévue → sport, règles → cycle, sinon repos). */
export function typeJourneeMacrosDepuisPlanning(
  phase: Phase,
  planning: PlanningSport,
  date: Date,
  sansSuiviCycle: boolean
): TypeJourneeMacros {
  if (!sansSuiviCycle && phase === 'menstruation') return 'cycle'
  const activite = getActiviteduJour(planning, date)
  if (activite !== 'repos') return 'sport'
  return 'repos'
}

function typeJourneeAffichageDepuisMacros(typeMacro: TypeJourneeMacros): TypeJournee {
  if (typeMacro === 'cycle') return 'regles'
  if (typeMacro === 'repos') return 'repos'
  return 'sport'
}

function macrosCiblesDepuisProfil(
  profil: MacroProfile,
  phase: Phase,
  typeMacro: TypeJourneeMacros,
  typeJourneeUi: TypeJournee
): MacrosCiblesJour {
  const m: MacrosJour = calculerMacrosProfil(profil, phase, typeMacro)
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

export function macrosCiblesPourJour(options: {
  profil: MacroProfile | null
  phase: Phase
  planning: PlanningSport
  date: Date
  sansSuiviCycle: boolean
}): MacrosCiblesJour {
  const { profil, phase, planning, date, sansSuiviCycle } = options
  const typeJourneePlanning = getTypeJournee(date)
  const typeJourneeUi = sansSuiviCycle
    ? typeJourneePlanning
    : getTypeJourneeEffectifMacros(phase, typeJourneePlanning, sansSuiviCycle)

  if (!profil) {
    return sansSuiviCycle
      ? calculerMacrosJourSansCycle(typeJourneePlanning)
      : calculerMacrosJour(phase, typeJourneePlanning)
  }

  const typeMacro = typeJourneeMacrosDepuisPlanning(phase, planning, date, sansSuiviCycle)
  return macrosCiblesDepuisProfil(profil, phase, typeMacro, typeJourneeAffichageDepuisMacros(typeMacro))
}

export function planningSportDepuisPrefs(
  planning: PlanningSport | null | undefined
): PlanningSport {
  return planning ?? PLANNING_DEFAUT
}
