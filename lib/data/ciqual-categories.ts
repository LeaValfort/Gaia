// Mapping catégorie d'ingrédient (vocabulaire fixe donné à l'IA) → sous-groupes CIQUAL dont
// on fait la moyenne pour approximer un ingrédient non reconnu précisément (cf. ciqual.ts).
// Sous-groupes vérifiés dans lib/data/ciqual.json — toujours des groupes "bruts" (crus/nature)
// pour rester cohérent avec la convention "poids tel qu'acheté" du reste du dictionnaire.

import type { CategorieIngredient } from '@/types'

export const SOUS_GROUPES_PAR_CATEGORIE: Record<Exclude<CategorieIngredient, 'autre'>, string[]> = {
  legume: ['légumes'],
  fruit: ['fruits'],
  feculent: ['pâtes, riz et céréales', 'pommes de terre et autres tubercules'],
  legumineuse: ['légumineuses'],
  viande: ['viandes crues'],
  poisson: ['poissons crus'],
  oeuf: ['oeufs'],
  produit_laitier: ['produits laitiers frais et alternatives végétales', 'laits'],
  fromage: ['fromages et alternatives végétales'],
  fruit_a_coque: ['fruits à coque et graines oléagineuses'],
  matiere_grasse: ['huiles et graisses végétales', 'beurres', 'margarines'],
  sucre_sucrant: ['sucres, miels et assimilés'],
}

// Catégories comptant comme "fruits, légumes, légumineuses et oléagineux" pour le Nutri-score,
// qu'elles soient reconnues précisément ou approximées par leur moyenne de catégorie.
export const CATEGORIES_FRUITS_LEGUMES: CategorieIngredient[] = ['legume', 'fruit', 'legumineuse', 'fruit_a_coque']
