import type { DailyMealIntake, TypeJournee, TypeRepas } from '@/types'
import { MACROS_JOURNEE } from '@/lib/nutrition'

/** Parts du budget journalier par créneau (somme ≈ 1 pour chaque nutriment). */
const PART: Record<TypeRepas, { k: number; p: number; g: number; l: number }> = {
  'petit-dej': { k: 0.22, p: 0.22, g: 0.2, l: 0.22 },
  dejeuner: { k: 0.35, p: 0.35, g: 0.38, l: 0.35 },
  collation: { k: 0.08, p: 0.08, g: 0.1, l: 0.08 },
  diner: { k: 0.35, p: 0.35, g: 0.32, l: 0.35 },
}

/** Créneau probable selon l'heure actuelle — sert de valeur initiale au sélecteur de recettes. */
export function repasParDefautSelonHeure(maintenant: Date = new Date()): TypeRepas {
  const heure = maintenant.getHours() + maintenant.getMinutes() / 60
  if (heure < 10.5) return 'petit-dej'
  if (heure < 14.5) return 'dejeuner'
  if (heure < 18.5) return 'collation'
  return 'diner'
}

export function objectifsRepasDefaut(typeJournee: TypeJournee, typeRepas: TypeRepas): {
  calories: number
  proteines: number
  glucides: number
  lipides: number
} {
  const M = MACROS_JOURNEE[typeJournee]
  const f = PART[typeRepas]
  return {
    calories: Math.round(M.kcal * f.k),
    proteines: Math.round(M.proteines * f.p),
    glucides: Math.round(M.glucides * f.g),
    lipides: Math.round(M.lipides * f.l),
  }
}

/** Objectifs affichés : personnalisés en base ou répartition auto. */
export function objectifsMacroRepas(
  intake: DailyMealIntake,
  typeJournee: TypeJournee
): { calories: number; proteines: number; glucides: number; lipides: number } {
  const d = objectifsRepasDefaut(typeJournee, intake.type_repas)
  return {
    calories: intake.objectif_calories ?? d.calories,
    proteines: intake.objectif_proteines ?? d.proteines,
    glucides: intake.objectif_glucides ?? d.glucides,
    lipides: intake.objectif_lipides ?? d.lipides,
  }
}
