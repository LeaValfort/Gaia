import type { OpenFoodProduct } from '@/types'

interface OffNutriments {
  'energy-kcal_100g'?: number
  energy_100g?: number
  proteins_100g?: number
  carbohydrates_100g?: number
  fat_100g?: number
}

interface OffProductRaw {
  code?: string
  product_name?: string
  nutriments?: OffNutriments
  ingredients_text?: string
  ingredients_text_fr?: string
  image_url?: string
}

interface OffSearchResponse {
  products?: OffProductRaw[]
}

interface OffProductV2Response {
  status?: number
  product?: OffProductRaw
}

function lireNutriment(nutriments: OffNutriments | undefined, cle: keyof OffNutriments): number | null {
  const valeur = nutriments?.[cle]
  if (valeur === undefined || Number.isNaN(valeur)) return null
  return Math.round(valeur * 10) / 10
}

function calories100g(nutriments: OffNutriments | undefined): number | null {
  const kcal = lireNutriment(nutriments, 'energy-kcal_100g')
  if (kcal !== null) return kcal
  const kj = lireNutriment(nutriments, 'energy_100g')
  if (kj === null) return null
  return Math.round((kj / 4.184) * 10) / 10
}

function mapperProduit(raw: OffProductRaw): OpenFoodProduct | null {
  const id = raw.code?.trim()
  const nom = raw.product_name?.trim()
  if (!id || !nom) return null

  const ingredients =
    raw.ingredients_text_fr?.trim() ||
    raw.ingredients_text?.trim() ||
    null

  return {
    id,
    nom,
    calories_100g: calories100g(raw.nutriments),
    proteines_100g: lireNutriment(raw.nutriments, 'proteins_100g'),
    glucides_100g: lireNutriment(raw.nutriments, 'carbohydrates_100g'),
    lipides_100g: lireNutriment(raw.nutriments, 'fat_100g'),
    ingredients,
    image_url: raw.image_url?.trim() || null,
  }
}

/** Recherche de produits alimentaires via Open Food Facts (sans clé API). */
export async function searchRecipes(
  query: string,
  langue: string = 'fr'
): Promise<OpenFoodProduct[]> {
  const searchTerms = query.trim()
  if (!searchTerms) return []

  try {
    const params = new URLSearchParams({
      search_terms: searchTerms,
      search_simple: '1',
      action: 'process',
      json: '1',
      lang: langue,
      page_size: '12',
      fields: 'code,product_name,nutriments,ingredients_text,ingredients_text_fr,image_url',
    })

    const reponse = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?${params.toString()}`,
      {
        headers: { 'User-Agent': 'Gaia/1.0 (app-alimentation)' },
        cache: 'no-store',
      }
    )

    if (!reponse.ok) {
      throw new Error(`Open Food Facts recherche : HTTP ${reponse.status}`)
    }

    const json = (await reponse.json()) as OffSearchResponse
    const produits = (json.products ?? [])
      .map(mapperProduit)
      .filter((p): p is OpenFoodProduct => p !== null)

    return produits
  } catch (erreur) {
    console.error('Erreur searchRecipes Open Food Facts:', erreur)
    return []
  }
}

/** Détail d'un produit par code-barres. */
export async function getProductByBarcode(barcode: string): Promise<OpenFoodProduct | null> {
  const code = barcode.trim()
  if (!code) return null

  try {
    const reponse = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}?fields=code,product_name,nutriments,ingredients_text,ingredients_text_fr,image_url`,
      {
        headers: { 'User-Agent': 'Gaia/1.0 (app-alimentation)' },
        cache: 'no-store',
      }
    )

    if (!reponse.ok) {
      throw new Error(`Open Food Facts produit : HTTP ${reponse.status}`)
    }

    const json = (await reponse.json()) as OffProductV2Response
    if (json.status !== 1 || !json.product) return null

    return mapperProduit(json.product)
  } catch (erreur) {
    console.error('Erreur getProductByBarcode Open Food Facts:', erreur)
    return null
  }
}
