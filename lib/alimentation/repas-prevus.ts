import { calculerMacrosAvecPortions } from '@/lib/mealplan'
import type { MealPlanComplet, RepasPrevu, TypeRepas } from '@/types'

export const ORDRE_REPAS: TypeRepas[] = ['petit-dej', 'dejeuner', 'collation', 'diner']

export const LIBELLES_REPAS_COURTS: Record<TypeRepas, string> = {
  'petit-dej': '🌅 Petit-déj',
  dejeuner: '☀️ Déjeuner',
  collation: '🍎 Collation',
  diner: '🌙 Dîner',
}

/** Repas planifiés d'un jour (recette ou petit-déj résolus), dans l'ordre de la journée. */
export function repasPrevus(plans: MealPlanComplet[]): RepasPrevu[] {
  return plans
    .flatMap((p): RepasPrevu[] => {
      if (p.recette) {
        return [{ type_repas: p.type_repas, nom: p.recette.nom, portions: p.portions, recette_id: p.recette.id, ...calculerMacrosAvecPortions(p.recette, p.portions) }]
      }
      if (p.petitDej) {
        const k = p.portions
        return [{
          type_repas: p.type_repas,
          nom: `${p.petitDej.emoji} ${p.petitDej.nom}`,
          portions: k,
          recette_id: null,
          calories: p.petitDej.calories * k,
          proteines: p.petitDej.proteines * k,
          glucides: p.petitDej.glucides * k,
          lipides: p.petitDej.lipides * k,
        }]
      }
      return []
    })
    .sort((a, b) => ORDRE_REPAS.indexOf(a.type_repas) - ORDRE_REPAS.indexOf(b.type_repas))
}

export function totalKcal(repas: RepasPrevu[]): number {
  return repas.reduce((s, r) => s + r.calories, 0)
}
