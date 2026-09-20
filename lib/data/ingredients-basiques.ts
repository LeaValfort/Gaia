// Ingrédients "basiques" achetés en grande quantité (épices, huile, condiments...)
// qu'on a souvent déjà en stock, à la différence des produits frais du quotidien.
// Sert uniquement à proposer une vérification rapide au moment d'ajouter une
// recette aux courses (Chantier 5, 20/09) : rien n'est mémorisé en base, la
// question est reposée à chaque ajout (choix explicite de Léa).
const MOTS_BASIQUES = [
  'huile', 'vinaigre', 'sel', 'poivre', 'sucre', 'farine', 'levure', 'bicarbonate',
  'moutarde', 'miel', 'sauce soja', 'ketchup', 'mayonnaise', 'sauce worcestershire',
  'tabasco', 'bouillon', 'fond de veau', 'fond de volaille', 'concentré de tomate',
  'câpre', 'cornichon', 'olive', 'gélatine', 'extrait de vanille', 'vanille',
  'cacao', 'chocolat pâtissier', 'chapelure', 'maïzena', 'fécule',
  'cumin', 'curry', 'paprika', 'cannelle', 'muscade', 'curcuma', 'gingembre en poudre',
  'herbes de provence', 'origan', 'thym', 'laurier', "piment d'espelette",
  'piment en poudre', 'piment de cayenne', 'cardamome', 'coriandre en poudre',
  'ail en poudre', 'oignon en poudre', 'graine de moutarde', 'sésame',
]

/** Détecte un ingrédient "basique" (épice, condiment, huile...) probablement déjà
 *  en stock, pour le distinguer des ingrédients frais à acheter chaque semaine. */
export function estIngredientBasique(nom: string): boolean {
  const n = nom.toLowerCase()
  return MOTS_BASIQUES.some((mot) => n.includes(mot))
}
