/**
 * Fruits et légumes de saison en France métropolitaine, par mois (1 = janvier).
 * D'après le calendrier de l'ADEME (liste courante, non exhaustive). Sert à
 * orienter les recettes IA et à signaler les recettes de saison.
 */
export const SOURCE_SAISON = {
  titre: 'Calendrier des fruits et légumes de saison (ADEME)',
  url: 'https://agirpourlatransition.ademe.fr/acteurs-education/enseigner/calendrier-fruits-legumes-saison',
}

const HIVER_LEGUMES = ['poireau', 'chou', 'carotte', 'betterave', 'céleri', 'endive', 'navet', 'panais', 'potiron', 'courge', 'topinambour', 'mâche', 'épinard']
const HIVER_FRUITS = ['pomme', 'poire', 'kiwi', 'orange', 'clémentine', 'mandarine', 'pamplemousse', 'citron']

export const PRODUITS_SAISON: Record<number, string[]> = {
  1: [...HIVER_LEGUMES, ...HIVER_FRUITS],
  2: [...HIVER_LEGUMES, ...HIVER_FRUITS],
  3: ['poireau', 'chou', 'carotte', 'betterave', 'endive', 'navet', 'épinard', 'radis', 'mâche', 'pomme', 'poire', 'kiwi', 'citron'],
  4: ['asperge', 'radis', 'épinard', 'carotte', 'chou-fleur', 'laitue', 'petit pois', 'blette', 'pomme', 'kiwi', 'rhubarbe'],
  5: ['asperge', 'radis', 'petit pois', 'fève', 'artichaut', 'laitue', 'concombre', 'courgette', 'épinard', 'fraise', 'rhubarbe', 'cerise'],
  6: ['courgette', 'concombre', 'tomate', 'haricot vert', 'petit pois', 'fève', 'artichaut', 'aubergine', 'laitue', 'fraise', 'cerise', 'abricot', 'melon', 'framboise'],
  7: ['tomate', 'courgette', 'aubergine', 'poivron', 'concombre', 'haricot vert', 'maïs', 'laitue', 'abricot', 'pêche', 'nectarine', 'melon', 'pastèque', 'framboise', 'myrtille', 'cerise'],
  8: ['tomate', 'courgette', 'aubergine', 'poivron', 'concombre', 'haricot vert', 'maïs', 'brocoli', 'pêche', 'nectarine', 'prune', 'melon', 'pastèque', 'figue', 'mûre', 'myrtille'],
  9: ['tomate', 'courgette', 'aubergine', 'poivron', 'brocoli', 'chou-fleur', 'potiron', 'courge', 'champignon', 'raisin', 'figue', 'prune', 'pomme', 'poire', 'mûre'],
  10: ['potiron', 'courge', 'potimarron', 'brocoli', 'chou', 'chou-fleur', 'carotte', 'betterave', 'poireau', 'céleri', 'champignon', 'épinard', 'pomme', 'poire', 'raisin', 'châtaigne', 'coing'],
  11: ['potiron', 'courge', 'potimarron', 'chou', 'chou de Bruxelles', 'carotte', 'poireau', 'céleri', 'endive', 'panais', 'mâche', 'pomme', 'poire', 'kiwi', 'clémentine', 'châtaigne'],
  12: [...HIVER_LEGUMES, 'chou de Bruxelles', ...HIVER_FRUITS],
}

export function produitsDeSaison(date: Date): string[] {
  return [...new Set(PRODUITS_SAISON[date.getMonth() + 1] ?? [])]
}

/** Consigne pour le prompt des recettes IA. */
export function consigneSaison(date: Date): string {
  return `Privilégie les fruits et légumes de saison en France ce mois-ci : ${produitsDeSaison(date).join(', ')}.`
}

/** Produits de saison présents dans une liste d'ingrédients (pour un badge « de saison »). */
export function ingredientsDeSaison(ingredients: string[], date: Date): string[] {
  const saison = produitsDeSaison(date)
  const texte = ingredients.join(' ').toLowerCase()
  return saison.filter((p) => texte.includes(p.toLowerCase()))
}
