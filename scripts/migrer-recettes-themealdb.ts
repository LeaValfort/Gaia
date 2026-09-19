/**
 * Script one-shot — Chantier 5, étape 5a-1.
 *
 * Pour chaque recette déjà sauvegardée avec un spoonacular_id (= identifiant TheMealDB)
 * et sans "instructions" enregistrées, va chercher une dernière fois les étapes de
 * préparation sur TheMealDB avant qu'on ne coupe cette dépendance (étape 5a-2).
 *
 * Le nom et les ingrédients ne sont PAS retouchés : ils sont déjà en français, tels que
 * sauvegardés au moment du clic "Sauvegarder". Seules les étapes de préparation (jamais
 * stockées jusqu'ici pour les recettes TheMealDB) et le nombre de portions sont complétés.
 * Note : les instructions TheMealDB restent en anglais (déjà le cas sur l'ancienne fiche
 * détail — pas de régression, juste pas de traduction pour ce texte long).
 *
 * Le Nutri-score (nutrition_100g) n'est PAS calculé ici : TheMealDB/Open Food Facts ne
 * donnent pas assez de données (poids total du plat, sucres, AGS, sel, fibres) pour
 * l'estimer honnêtement. Ces recettes migrées resteront simplement sans Nutri-score.
 *
 * Usage (une seule fois, depuis la racine du projet) :
 *   $env:SUPABASE_SERVICE_ROLE_KEY="..."  (PowerShell — clé "service_role" du Dashboard Supabase > Settings > API)
 *   npx tsx scripts/migrer-recettes-themealdb.ts
 *
 * Une fois exécuté avec succès (voir le résumé affiché), ce script et la clé utilisée
 * peuvent être supprimés — il ne sert plus une fois toutes les recettes migrées.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

interface MealDBLookupResponse {
  meals?: { strInstructions?: string }[] | null
}

async function recupererInstructions(spoonacularId: number): Promise<string | null> {
  const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${spoonacularId}`
  const reponse = await fetch(url)
  if (!reponse.ok) return null
  const json = (await reponse.json()) as MealDBLookupResponse
  return json.meals?.[0]?.strInstructions?.trim() || null
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises.')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: recettes, error } = await supabase
    .from('recipes')
    .select('id, nom, spoonacular_id')
    .not('spoonacular_id', 'is', null)
    .is('instructions', null)

  if (error) {
    console.error('Erreur de lecture des recettes :', error.message)
    process.exit(1)
  }

  console.log(`${recettes?.length ?? 0} recette(s) à migrer.`)

  let migrees = 0
  let echecs = 0

  for (const recette of recettes ?? []) {
    try {
      const instructions = await recupererInstructions(recette.spoonacular_id as number)
      if (!instructions) {
        console.warn(`  ⚠ Pas d'instructions trouvées pour "${recette.nom}" (id TheMealDB ${recette.spoonacular_id})`)
        echecs += 1
        continue
      }

      const { error: erreurMaj } = await supabase
        .from('recipes')
        .update({ instructions, portions: 4 })
        .eq('id', recette.id)

      if (erreurMaj) throw erreurMaj

      console.log(`  ✓ "${recette.nom}" migrée`)
      migrees += 1
    } catch (erreur) {
      console.error(`  ✗ Échec pour "${recette.nom}" :`, erreur)
      echecs += 1
    }
  }

  console.log(`\nTerminé : ${migrees} migrée(s), ${echecs} échec(s).`)
}

main()
