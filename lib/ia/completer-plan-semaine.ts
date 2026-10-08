// Complète le pool de recettes du plan de la semaine avec des suggestions IA, pour les types
// de repas où l'utilisatrice a peu de recettes perso enregistrées — demande de Léa le 23/09 :
// "proposer aussi des repas via l'IA pour avoir plus de choix que seulement ce qui est
// enregistré". Extrait de PlanSemaine.tsx pour respecter la règle 1 fichier = 1 responsabilité
// (toute logique métier dans lib/, jamais dans les pages/composants).
import type { SupabaseClient } from '@supabase/supabase-js'
import { insertRecetteGeneree } from '@/lib/db/recettes'
import { TYPES_REPAS_HORS_PD } from '@/lib/mealplan'
import type { Phase, Recipe, RecetteGeneree, TypeJournee, TypeRepas } from '@/types'

/** Sous ce nombre de recettes perso disponibles pour un type de repas, on complète avec l'IA. */
const SEUIL_RECETTES_MIN_PAR_TYPE = 3
/** Nombre de suggestions IA demandées par type de repas en déficit. */
const NB_SUGGESTIONS_IA_PAR_TYPE = 3

/**
 * Pour chaque type de repas (déjeuner/collation/dîner) en-dessous du seuil, va chercher des
 * suggestions IA via `/api/recettes/generer` et les sauvegarde comme des recettes normales
 * (modifiables, supprimables comme les autres — jamais de recette "fantôme" non enregistrée).
 * Renvoie la liste des recettes nouvellement créées, à fusionner avec le pool existant.
 */
export async function completerRecettesAvecIA(
  supabase: SupabaseClient,
  userId: string,
  recettesActuelles: Recipe[],
  phaseRepresentative: Phase,
  typeJourneeRepresentatif: TypeJournee
): Promise<Recipe[]> {
  const nouvelles: Recipe[] = []

  for (const typeRepas of TYPES_REPAS_HORS_PD) {
    const dejaDisponibles = recettesActuelles.filter(
      (r) => r.type_repas === typeRepas || r.type_repas === null
    )
    if (dejaDisponibles.length >= SEUIL_RECETTES_MIN_PAR_TYPE) continue

    try {
      const params = new URLSearchParams({
        typeJournee: typeJourneeRepresentatif,
        typeRepas,
        allergies: '',
        tempsMax: '30',
        phase: phaseRepresentative,
        avecIA: 'true',
      })
      const rep = await fetch(`/api/recettes/generer?${params}`)
      if (!rep.ok) continue
      const data = (await rep.json()) as { generees?: RecetteGeneree[] }
      const suggestions = (data.generees ?? []).slice(0, NB_SUGGESTIONS_IA_PAR_TYPE)
      for (const suggestion of suggestions) {
        const creee = await insertRecetteGeneree(supabase, userId, {
          ...suggestion,
          type_repas: suggestion.type_repas ?? (typeRepas as TypeRepas),
        })
        if (creee) nouvelles.push(creee)
      }
    } catch {
      // Une suggestion IA manquée ne doit pas bloquer la génération du reste du plan.
    }
  }

  return nouvelles
}
