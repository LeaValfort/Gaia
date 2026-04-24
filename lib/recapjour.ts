import type { MealPlanComplet, BudgetMacroJour, TypeRepas, TypeJournee } from '@/types'
import { MACROS_JOURNEE } from '@/lib/nutrition'
import { calculerMacrosAvecPortions } from '@/lib/mealplan'

export function calculerMacrosRepas(
  plan: MealPlanComplet,
  portions: number
): { calories: number; proteines: number; glucides: number; lipides: number } {
  if (plan.petitDej) {
    return {
      calories:  Math.round(plan.petitDej.calories * portions),
      proteines: Math.round(plan.petitDej.proteines * portions),
      glucides:  Math.round(plan.petitDej.glucides * portions),
      lipides:   Math.round(plan.petitDej.lipides * portions),
    }
  }
  if (plan.recette) return calculerMacrosAvecPortions(plan.recette, portions)
  return { calories: 0, proteines: 0, glucides: 0, lipides: 0 }
}

export interface LigneRecapRepas {
  typeRepas: TypeRepas
  nom: string
  calories: number
  proteines: number
  glucides: number
  lipides: number
  portions: number
  planId: string
}

export function calculerRecapJour(plans: MealPlanComplet[], budget: BudgetMacroJour): {
  parRepas: LigneRecapRepas[]
  total: { calories: number; proteines: number; glucides: number; lipides: number }
  reste: { calories: number; proteines: number; glucides: number; lipides: number }
  pourcentageAtteint: number
} {
  const cibles = MACROS_JOURNEE[budget.typeJournee]
  const ordre: TypeRepas[] = ['petit-dej', 'dejeuner', 'collation', 'diner']
  const tries = [...plans].sort((a, b) => ordre.indexOf(a.type_repas) - ordre.indexOf(b.type_repas))

  const parRepas: LigneRecapRepas[] = tries.map((p) => {
    const m = calculerMacrosRepas(p, p.portions)
    const nom = p.recette?.nom ?? p.petitDej?.nom ?? '—'
    return { typeRepas: p.type_repas, nom, ...m, portions: p.portions, planId: p.id }
  })

  const total = parRepas.reduce(
    (acc, r) => ({
      calories: acc.calories + r.calories,
      proteines: acc.proteines + r.proteines,
      glucides: acc.glucides + r.glucides,
      lipides: acc.lipides + r.lipides,
    }),
    { calories: 0, proteines: 0, glucides: 0, lipides: 0 }
  )

  const reste = {
    calories:  cibles.kcal - total.calories,
    proteines: cibles.proteines - total.proteines,
    glucides:  cibles.glucides - total.glucides,
    lipides:   cibles.lipides - total.lipides,
  }

  const pourcentageAtteint =
    cibles.kcal > 0 ? Math.min(150, Math.round((total.calories / cibles.kcal) * 100)) : 0

  return { parRepas, total, reste, pourcentageAtteint }
}

/** Couleur du texte « reste » selon le ratio kcal consommées / cible. */
export function couleurResteKcal(total: number, cible: number): string {
  if (cible <= 0) return 'text-neutral-600 dark:text-neutral-400'
  const r = total / cible
  if (r <= 1.1) return 'text-emerald-600 dark:text-emerald-400'
  if (r <= 1.2) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

/** Objet minimal pour `calculerRecapJour` (seul `typeJournee` est lu). */
export function budgetTypePourRecap(typeJournee: TypeJournee): BudgetMacroJour {
  return {
    date: '',
    phase: 'folliculaire',
    typeJournee,
    totalCalories: 0,
    totalProteines: 0,
    totalGlucides: 0,
    totalLipides: 0,
    resteCalories: 0,
    resteProteines: 0,
    resteGlucides: 0,
    resteLipides: 0,
    pourcentageAtteint: 0,
  }
}
