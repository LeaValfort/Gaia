import { format, getISODay, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { TypeJourneeMacros } from '@/lib/macro-calculator'
import { calculerMacrosJour as calculerMacrosProfil } from '@/lib/macro-calculator'
import {
  calculerMacrosJour,
  calculerMacrosJourSansCycle,
  getTypeJournee,
  getTypeJourneeEffectifMacros,
} from '@/lib/nutrition'
import { PLANNING_DEFAUT } from '@/lib/planning-sport'
import type {
  MacroProfile,
  MacrosCiblesJour,
  MacrosJour,
  Phase,
  PlanningSport,
  TypeJournee,
  TypePlanningJour,
} from '@/types'

const TZ_JOUR = process.env.NEXT_PUBLIC_CALENDAR_TZ ?? 'Europe/Paris'

const CLES_JOUR: (keyof PlanningSport)[] = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
]

const SEANCES_SPORT = new Set<TypePlanningJour>([
  'muscu_full',
  'muscu_upper',
  'yoga',
  'natation',
])

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

/** Date calendaire en fuseau utilisateur (évite un mauvais jour ISO sur Vercel UTC). */
export function datePourPlanningSport(date: Date): Date {
  const zoned = toZonedTime(date, TZ_JOUR)
  const iso = format(zoned, 'yyyy-MM-dd')
  return parseISO(`${iso}T12:00:00`)
}

/** Planning hebdo fusionné avec les valeurs par défaut. */
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

export function planningSportDepuisPrefs(
  planning: PlanningSport | null | undefined
): PlanningSport {
  return planningEffectif(planning)
}

function cleJourSemaine(date: Date): keyof PlanningSport {
  const idx = getISODay(date) - 1
  return CLES_JOUR[idx] ?? 'lundi'
}

/** Activité du planning `user_preferences.planning_sport` pour la date (fuseau Paris). */
export function activitePlanningDuJour(planning: PlanningSport, date: Date): TypePlanningJour {
  const dateStable = datePourPlanningSport(date)
  return planning[cleJourSemaine(dateStable)]
}

/**
 * Type macro : règles → cycle ; muscu / natation / yoga → sport ; sinon repos.
 */
export function typeJourneeMacrosDepuisPlanning(
  phase: Phase,
  planning: PlanningSport,
  date: Date,
  sansSuiviCycle: boolean
): TypeJourneeMacros {
  if (!sansSuiviCycle && phase === 'menstruation') return 'cycle'
  const activite = activitePlanningDuJour(planning, date)
  if (SEANCES_SPORT.has(activite)) return 'sport'
  return 'repos'
}

function typeJourneeAffichageDepuisMacros(typeMacro: TypeJourneeMacros): TypeJournee {
  if (typeMacro === 'cycle') return 'regles'
  if (typeMacro === 'repos') return 'repos'
  return 'sport'
}

function macrosJourDepuisProfilStocke(
  profil: MacroProfile,
  typeMacro: TypeJourneeMacros
): MacrosJour | null {
  switch (typeMacro) {
    case 'sport':
      if (
        profil.kcal_sport == null ||
        profil.proteines_sport_g == null ||
        profil.glucides_sport_g == null ||
        profil.lipides_sport_g == null
      ) {
        return null
      }
      return {
        kcal: profil.kcal_sport,
        proteines: profil.proteines_sport_g,
        glucides: profil.glucides_sport_g,
        lipides: profil.lipides_sport_g,
      }
    case 'repos':
      if (
        profil.kcal_repos == null ||
        profil.proteines_repos_g == null ||
        profil.glucides_repos_g == null ||
        profil.lipides_repos_g == null
      ) {
        return null
      }
      return {
        kcal: profil.kcal_repos,
        proteines: profil.proteines_repos_g,
        glucides: profil.glucides_repos_g,
        lipides: profil.lipides_repos_g,
      }
    case 'cycle':
      if (
        profil.kcal_base == null ||
        profil.proteines_g == null ||
        profil.glucides_g == null ||
        profil.lipides_g == null
      ) {
        return null
      }
      return {
        kcal: profil.kcal_base,
        proteines: profil.proteines_g,
        glucides: profil.glucides_g,
        lipides: profil.lipides_g,
      }
    default:
      return null
  }
}

function phasePourCalculMacro(typeMacro: TypeJourneeMacros, phase: Phase): Phase {
  if (typeMacro === 'cycle') return 'menstruation'
  return phase
}

function macrosCiblesDepuisProfil(
  profil: MacroProfile,
  phase: Phase,
  typeMacro: TypeJourneeMacros,
  typeJourneeUi: TypeJournee
): MacrosCiblesJour {
  const stocke = macrosJourDepuisProfilStocke(profil, typeMacro)
  const m =
    stocke ??
    calculerMacrosProfil(profil, phasePourCalculMacro(typeMacro, phase), typeMacro)

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
  const planningMerge = planningEffectif(planning)
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

  const typeMacro = typeJourneeMacrosDepuisPlanning(
    phase,
    planningMerge,
    date,
    sansSuiviCycle
  )
  return macrosCiblesDepuisProfil(
    profil,
    phase,
    typeMacro,
    typeJourneeAffichageDepuisMacros(typeMacro)
  )
}
