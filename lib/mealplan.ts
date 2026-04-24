import type { Phase, TypeJournee, MealPlan, MealPlanComplet, BudgetMacroJour, Recipe, OptionPetitDej } from '@/types'
import { MACROS_JOURNEE, parseIngredientLine } from '@/lib/nutrition'

// ------------------------------------------------------------
// Calcul du budget macro du jour
// ------------------------------------------------------------

/**
 * Calcule les macros restantes pour déj + collation + dîner
 * après avoir déduit le petit-déjeuner.
 */
export function calculerBudgetMacroJour(
  date: string,
  phase: Phase,
  typeJournee: TypeJournee,
  petitDej: OptionPetitDej | null,
  portions: number,
  opts?: { sansSuiviCycle?: boolean }
): BudgetMacroJour {
  const typeEffectif: TypeJournee =
    opts?.sansSuiviCycle ? typeJournee : phase === 'menstruation' ? 'regles' : typeJournee
  const cibles = MACROS_JOURNEE[typeEffectif]

  const pdCalories  = petitDej ? petitDej.calories  * portions : 0
  const pdProteines = petitDej ? petitDej.proteines * portions : 0
  const pdGlucides  = petitDej ? petitDej.glucides  * portions : 0
  const pdLipides   = petitDej ? petitDej.lipides   * portions : 0

  const resteCalories  = Math.max(0, cibles.kcal      - pdCalories)
  const resteProteines = Math.max(0, cibles.proteines - pdProteines)
  const resteGlucides  = Math.max(0, cibles.glucides  - pdGlucides)
  const resteLipides   = Math.max(0, cibles.lipides   - pdLipides)

  const totalCalories  = pdCalories
  const totalProteines = pdProteines
  const totalGlucides  = pdGlucides
  const totalLipides   = pdLipides

  const pourcentageAtteint = cibles.kcal > 0
    ? Math.min(100, Math.round((totalCalories / cibles.kcal) * 100))
    : 0

  return {
    date, phase, typeJournee: typeEffectif,
    totalCalories, totalProteines, totalGlucides, totalLipides,
    resteCalories, resteProteines, resteGlucides, resteLipides,
    pourcentageAtteint,
  }
}

// ------------------------------------------------------------
// Calcul des macros d'une recette selon les portions
// ------------------------------------------------------------

export function calculerMacrosAvecPortions(
  recette: Recipe,
  portions: number
): { calories: number; proteines: number; glucides: number; lipides: number } {
  return {
    calories:  Math.round((recette.calories  ?? 0) * portions),
    proteines: Math.round((recette.proteines ?? 0) * portions),
    glucides:  Math.round((recette.glucides  ?? 0) * portions),
    lipides:   Math.round((recette.lipides   ?? 0) * portions),
  }
}

// ------------------------------------------------------------
// Génération automatique d'un plan semaine
// ------------------------------------------------------------

const TYPES_REPAS_HORS_PD = ['dejeuner', 'collation', 'diner'] as const

/**
 * Attribue automatiquement des recettes sur la semaine.
 * Petits-dejs : choix selon la phase recommandée.
 * Autres repas : rotation des recettes par type_repas.
 */
export function genererPlanAuto(
  dates: string[],
  phases: Phase[],
  typeJournees: TypeJournee[],
  recettes: Recipe[],
  petitsDej: OptionPetitDej[],
  opts?: { sansSuiviCycle?: boolean }
): Omit<MealPlan, 'id' | 'user_id' | 'created_at'>[] {
  const plans: Omit<MealPlan, 'id' | 'user_id' | 'created_at'>[] = []
  const weekStart = dates[0] ?? ''

  // Compteurs de rotation par type_repas
  const compteurs: Record<string, number> = {}

  dates.forEach((date, i) => {
    const phase = phases[i] ?? phases[0] ?? 'folliculaire'
    const typeJournee = typeJournees[i] ?? 'repos'

    const pdRecommandes = opts?.sansSuiviCycle
      ? petitsDej
      : petitsDej.filter((pd) => pd.phasesRecommandees.includes(phase))
    const pdPool = pdRecommandes.length > 0 ? pdRecommandes : petitsDej
    const pdChoisi = pdPool[i % pdPool.length]

    if (pdChoisi) {
      plans.push({
        week_start: weekStart,
        date,
        type_repas: 'petit-dej',
        recette_id: null,
        petit_dej_id: pdChoisi.id,
        portions: 1,
        notes: null,
      })
    }

    // Autres repas : rotation des recettes selon le type
    TYPES_REPAS_HORS_PD.forEach((typeRepas) => {
      const recettesFiltrees = recettes.filter(
        (r) => r.type_repas === typeRepas || r.type_repas === null
      )
      if (recettesFiltrees.length === 0) return

      const compteur = compteurs[typeRepas] ?? 0
      const recetteChoisie = recettesFiltrees[compteur % recettesFiltrees.length]
      compteurs[typeRepas] = compteur + 1

      plans.push({
        week_start: weekStart,
        date,
        type_repas: typeRepas,
        recette_id: recetteChoisie.id,
        petit_dej_id: null,
        portions: 1,
        notes: null,
      })
    })

    void typeJournee // utilisé dans le futur pour ajustements fins
  })

  return plans
}

// ------------------------------------------------------------
// Extraction des ingrédients pour la liste de courses
// ------------------------------------------------------------

export function extraireIngredientsSemaine(
  plans: MealPlanComplet[]
): { nom: string; quantite: string; recette: string }[] {
  const ingredients: { nom: string; quantite: string; recette: string }[] = []

  plans.forEach((plan) => {
    if (plan.recette) {
      plan.recette.ingredients.forEach((ing) => {
        const p = parseIngredientLine(ing)
        if (p.source === 'json') {
          let q = p.quantite ?? ''
          if (plan.portions > 1) {
            q = q ? `${q} (x${plan.portions})` : `x${plan.portions}`
          }
          ingredients.push({ nom: p.nom, quantite: q, recette: plan.recette!.nom })
          return
        }
        const [nom, ...reste] = ing.split(' ')
        const quantite = reste.join(' ') || `x${plan.portions}`
        ingredients.push({
          nom: nom ?? ing,
          quantite: plan.portions > 1 ? `${quantite} (x${plan.portions})` : quantite,
          recette: plan.recette!.nom,
        })
      })
    } else if (plan.petitDej) {
      plan.petitDej.ingredients.forEach((ing) => {
        ingredients.push({
          nom: ing,
          quantite: plan.portions > 1 ? `x${plan.portions}` : '',
          recette: plan.petitDej!.nom,
        })
      })
    }
  })

  return ingredients
}
