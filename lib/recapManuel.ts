import type { DailyMealIntake, TypeJournee, TypeRepas } from '@/types'
import { MACROS_JOURNEE } from '@/lib/nutrition'

/** Totaux consommés (récap du jour), alignés sur `daily_meal_intakes`. */
export type TotauxConsommesJour = {
  calories: number
  proteines: number
  glucides: number
  lipides: number
}

export const ORDRE_TYPES_REPAS = ['petit-dej', 'dejeuner', 'collation', 'diner'] as const

export function intakeDefaut(date: string, type_repas: TypeRepas): DailyMealIntake {
  return {
    id: '',
    user_id: '',
    date,
    type_repas,
    quantite_realisee: 0,
    quantite_cible: 1,
    calories: 0,
    proteines: 0,
    glucides: 0,
    lipides: 0,
    objectif_calories: null,
    objectif_proteines: null,
    objectif_glucides: null,
    objectif_lipides: null,
    nom_personnalise: null,
    source_recipe_id: null,
    created_at: '',
  }
}

export function fusionIntakesJour(date: string, rows: DailyMealIntake[]): DailyMealIntake[] {
  return ORDRE_TYPES_REPAS.map((type) => {
    const x = rows.find((r) => r.type_repas === type)
    return x ?? intakeDefaut(date, type)
  })
}

/** Somme des macros saisies / importées pour la journée (4 repas fusionnés). */
export function totauxDepuisIntakes(intakes: DailyMealIntake[]): TotauxConsommesJour {
  return intakes.reduce(
    (acc, r) => ({
      calories: acc.calories + r.calories,
      proteines: acc.proteines + r.proteines,
      glucides: acc.glucides + r.glucides,
      lipides: acc.lipides + r.lipides,
    }),
    { calories: 0, proteines: 0, glucides: 0, lipides: 0 },
  )
}

export function calculerRecapDepuisIntakes(intakes: DailyMealIntake[], typeJournee: TypeJournee): {
  total: { calories: number; proteines: number; glucides: number; lipides: number }
  reste: { calories: number; proteines: number; glucides: number; lipides: number }
  pourcentageAtteint: number
} {
  const cibles = MACROS_JOURNEE[typeJournee]
  const total = totauxDepuisIntakes(intakes)
  const reste = {
    calories: cibles.kcal - total.calories,
    proteines: cibles.proteines - total.proteines,
    glucides: cibles.glucides - total.glucides,
    lipides: cibles.lipides - total.lipides,
  }
  const pourcentageAtteint =
    cibles.kcal > 0 ? Math.min(150, Math.round((total.calories / cibles.kcal) * 100)) : 0
  return { total, reste, pourcentageAtteint }
}
