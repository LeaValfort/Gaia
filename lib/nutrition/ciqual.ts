// Recherche d'un ingrédient dans la table CIQUAL (ANSES, licence ouverte) — seule source
// de vérité pour les macros des recettes générées par l'IA (Chantier 5, refonte).
// Volontairement AUCUN matching approximatif ("fuzzy") sur le NOM : soit un ingrédient est
// reconnu avec certitude (dictionnaire vérifié ou nom identique à un intitulé CIQUAL), soit on
// se rabat sur la moyenne CIQUAL de sa catégorie (trouverAlimentOuApproximation) — jamais de
// macro devinée hors de ces deux sources.

import ciqualDataBrut from '@/lib/data/ciqual.json'
import { SYNONYMES_CIQUAL, INGREDIENTS_NEGLIGEABLES } from '@/lib/data/ciqual-synonymes'
import { SOUS_GROUPES_PAR_CATEGORIE } from '@/lib/data/ciqual-categories'
import type { CategorieIngredient, EntreeCiqual, IngredientRecette } from '@/types'

const ciqualData = ciqualDataBrut as unknown as EntreeCiqual[]
const CIQUAL_PAR_CODE = new Map(ciqualData.map((e) => [e.code, e]))

/** Entrée synthétique pour un ingrédient considéré comme négligeable (sel, poivre, herbes...). */
const ENTREE_NEGLIGEABLE: EntreeCiqual = {
  code: 'NEGLIGEABLE',
  nom: 'Assaisonnement (négligeable)',
  groupe: '',
  sousGroupe: '',
  kcal: 0,
  proteines: 0,
  glucides: 0,
  lipides: 0,
  sucres: 0,
  ags: 0,
  fibres: 0,
  sel: 0,
}

/** Minuscules, sans accents, ponctuation réduite à des espaces — pour comparer sans piège. */
export function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function correspondTousLesMots(nomNormalise: string, motsCles: string[]): boolean {
  return motsCles.every((mot) => nomNormalise.includes(normaliser(mot)))
}

/**
 * Cherche l'ingrédient `nom` (donné par l'IA) dans CIQUAL.
 * Ordre de recherche : ingrédient négligeable > dictionnaire de synonymes vérifiés
 * (le plus spécifique gagne) > correspondance exacte avec un intitulé CIQUAL.
 * Retourne `null` si aucune correspondance fiable n'est trouvée.
 */
export function trouverAliment(nom: string): EntreeCiqual | null {
  const nomNormalise = normaliser(nom)
  if (!nomNormalise) return null

  if (INGREDIENTS_NEGLIGEABLES.some((mot) => nomNormalise.includes(normaliser(mot)))) {
    return ENTREE_NEGLIGEABLE
  }

  let meilleur: { code: string; specificite: number } | null = null
  for (const { motsCles, code } of SYNONYMES_CIQUAL) {
    if (!correspondTousLesMots(nomNormalise, motsCles)) continue
    const specificite = motsCles.join('').length
    if (!meilleur || specificite > meilleur.specificite) {
      meilleur = { code, specificite }
    }
  }
  if (meilleur) return CIQUAL_PAR_CODE.get(meilleur.code) ?? null

  const exact = ciqualData.find((e) => normaliser(e.nom) === nomNormalise)
  return exact ?? null
}

const MOYENNES_PAR_CATEGORIE = new Map<CategorieIngredient, EntreeCiqual | null>()

function moyenneDeChamp(entrees: EntreeCiqual[], champ: keyof EntreeCiqual): number | null {
  const valeurs = entrees.map((e) => e[champ]).filter((v): v is number => typeof v === 'number')
  if (valeurs.length === 0) return null
  return Math.round((valeurs.reduce((a, b) => a + b, 0) / valeurs.length) * 100) / 100
}

/** Moyenne CIQUAL (pour 100 g) des aliments de la catégorie donnée — mise en cache après le
 *  premier calcul. `null` pour 'autre' (pas de catégorie exploitable) ou catégorie sans données. */
export function moyenneCategorie(categorie: CategorieIngredient): EntreeCiqual | null {
  if (categorie === 'autre') return null
  if (MOYENNES_PAR_CATEGORIE.has(categorie)) return MOYENNES_PAR_CATEGORIE.get(categorie) ?? null

  const sousGroupes = SOUS_GROUPES_PAR_CATEGORIE[categorie]
  const entrees = ciqualData.filter((e) => sousGroupes.includes(e.sousGroupe))
  const moyenne: EntreeCiqual | null =
    entrees.length === 0
      ? null
      : {
          code: `MOYENNE_${categorie}`,
          nom: `Moyenne CIQUAL de la catégorie "${categorie}"`,
          groupe: '',
          sousGroupe: '',
          kcal: moyenneDeChamp(entrees, 'kcal'),
          proteines: moyenneDeChamp(entrees, 'proteines'),
          glucides: moyenneDeChamp(entrees, 'glucides'),
          lipides: moyenneDeChamp(entrees, 'lipides'),
          sucres: moyenneDeChamp(entrees, 'sucres'),
          ags: moyenneDeChamp(entrees, 'ags'),
          fibres: moyenneDeChamp(entrees, 'fibres'),
          sel: moyenneDeChamp(entrees, 'sel'),
        }
  MOYENNES_PAR_CATEGORIE.set(categorie, moyenne)
  return moyenne
}

/**
 * Trouve les macros d'un ingrédient de recette : correspondance exacte d'abord (trouverAliment),
 * puis moyenne de sa catégorie en dernier recours. `approxime` indique laquelle des deux a été
 * utilisée, pour que l'affichage puisse le signaler honnêtement plutôt que de le taire.
 */
export function trouverAlimentOuApproximation(
  ingredient: IngredientRecette
): { entree: EntreeCiqual; approxime: boolean } | null {
  const exact = trouverAliment(ingredient.nom)
  if (exact) return { entree: exact, approxime: false }

  const moyenne = moyenneCategorie(ingredient.categorie)
  if (moyenne) return { entree: moyenne, approxime: true }

  return null
}
