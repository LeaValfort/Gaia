// Dictionnaire d'ingrédients courants → code CIQUAL vérifié manuellement.
// Chaque entrée : l'IA doit citer TOUS les mots-clés (dans le nom qu'elle donne à l'ingrédient)
// pour que le match soit retenu. En cas de plusieurs entrées valables, lib/nutrition/ciqual.ts
// retient celle dont les mots-clés couvrent le plus de caractères (la plus spécifique).
// Convention : les codes "cru/sec" sont pris par défaut (poids tel qu'acheté), les variantes
// "cuit" ne sont utilisées que si l'IA précise explicitement la cuisson dans le nom.
// Ne jamais ajouter une ligne sans avoir vérifié le code dans lib/data/ciqual.json.

export interface SynonymeCiqual {
  motsCles: string[]
  code: string
}

export const SYNONYMES_CIQUAL: SynonymeCiqual[] = [
  // Légumes
  { motsCles: ['oignon'], code: '20034' },
  { motsCles: ['ail'], code: '11000' },
  { motsCles: ['carotte'], code: '20009' },
  { motsCles: ['brocoli'], code: '20057' },
  { motsCles: ['epinard'], code: '20059' },
  { motsCles: ['patate', 'douce'], code: '4101' },
  { motsCles: ['pomme', 'terre'], code: '4008' },
  { motsCles: ['courgette'], code: '20020' },
  { motsCles: ['poivron'], code: '20041' },
  { motsCles: ['champignon'], code: '20056' },
  { motsCles: ['chou', 'fleur'], code: '20016' },
  { motsCles: ['avocat'], code: '13004' },
  { motsCles: ['tomate'], code: '20385' },
  { motsCles: ['concombre'], code: '20019' },
  { motsCles: ['laitue'], code: '20031' },
  { motsCles: ['salade', 'verte'], code: '20031' },

  // Féculents / céréales (poids cru par défaut)
  { motsCles: ['pain', 'complet'], code: '7110' },
  { motsCles: ['avoine', 'cuit'], code: '9313' },
  { motsCles: ['avoine'], code: '32140' },
  { motsCles: ['flocons', 'avoine'], code: '32140' },
  { motsCles: ['riz', 'cuit'], code: '9104' },
  { motsCles: ['riz'], code: '9100' },
  { motsCles: ['quinoa', 'cuit'], code: '9341' },
  { motsCles: ['quinoa'], code: '9340' },
  { motsCles: ['pates', 'cuit'], code: '9811' },
  { motsCles: ['pates'], code: '9810' },
  { motsCles: ['farine', '45'], code: '9440' },
  { motsCles: ['farine'], code: '9436' },
  { motsCles: ['semoule'], code: '9683' },
  { motsCles: ['couscous'], code: '9683' },
  { motsCles: ['boulgour', 'cuit'], code: '9691' },
  { motsCles: ['boulgour'], code: '9690' },

  // Légumineuses (cuites par défaut : forme la plus utilisée telle quelle en recette)
  { motsCles: ['pois', 'chiche', 'conserve'], code: '20532' },
  { motsCles: ['pois', 'chiche', 'sec'], code: '20516' },
  { motsCles: ['pois', 'chiche'], code: '20507' },
  { motsCles: ['haricot', 'rouge'], code: '20503' },
  { motsCles: ['haricot', 'blanc'], code: '20502' },
  { motsCles: ['lentille', 'sec'], code: '20359' },
  { motsCles: ['lentille'], code: '20360' },
  { motsCles: ['tofu'], code: '20904' },

  // Viandes / poissons / oeufs (poids cru par défaut)
  { motsCles: ['dinde'], code: '36304' },
  { motsCles: ['poulet', 'cuisse'], code: '36024' },
  { motsCles: ['cuisse', 'poulet'], code: '36024' },
  { motsCles: ['poulet'], code: '36007' },
  { motsCles: ['boeuf', 'hache'], code: '6254' },
  { motsCles: ['steak', 'hache'], code: '6254' },
  { motsCles: ['porc', 'filet'], code: '28204' },
  { motsCles: ['agneau'], code: '21502' },
  { motsCles: ['jambon', 'poulet'], code: '28963' },
  { motsCles: ['jambon', 'dinde'], code: '28964' },
  { motsCles: ['jambon'], code: '28900' },
  { motsCles: ['saumon'], code: '26036' },
  { motsCles: ['thon', 'frais'], code: '26053' },
  { motsCles: ['thon'], code: '26039' },
  { motsCles: ['cabillaud'], code: '26043' },
  { motsCles: ['oeuf'], code: '22000' },

  // Produits laitiers
  { motsCles: ['yaourt'], code: '19593' },
  { motsCles: ['fromage', 'blanc'], code: '19501' },
  { motsCles: ['creme', 'fraiche'], code: '19410' },
  { motsCles: ['creme', 'epaisse'], code: '19410' },
  { motsCles: ['lait'], code: '19016' },
  { motsCles: ['beurre'], code: '16400' },
  { motsCles: ['emmental'], code: '12118' },
  { motsCles: ['fromage', 'rape'], code: '12775' },
  { motsCles: ['feta'], code: '12060' },
  { motsCles: ['chevre'], code: '12812' },

  // Fruits
  { motsCles: ['banane'], code: '13005' },
  { motsCles: ['pomme'], code: '13039' },
  { motsCles: ['citron'], code: '13009' },

  // Oléagineux / graines / matières grasses
  { motsCles: ['amande'], code: '15000' },
  { motsCles: ['noix', 'cajou'], code: '15054' },
  { motsCles: ['noix'], code: '15005' },
  { motsCles: ['graine', 'courge'], code: '15064' },
  { motsCles: ['graine', 'tournesol'], code: '15011' },
  { motsCles: ['beurre', 'cacahuete'], code: '15202' },
  { motsCles: ['huile', 'olive'], code: '17270' },
  { motsCles: ['huile', 'colza'], code: '17130' },
  { motsCles: ['huile', 'tournesol'], code: '17440' },

  // Sucrant / divers
  { motsCles: ['miel'], code: '31008' },
  { motsCles: ['chocolat', 'noir'], code: '31005' },
]

// Assaisonnements dont la contribution calorique est négligeable aux quantités habituelles
// d'une recette (pincée, quelques grammes) : on les compte pour 0 plutôt que de bloquer le
// calcul des macros de toute la recette pour un ingrédient qui ne pèse presque rien.
export const INGREDIENTS_NEGLIGEABLES = [
  'sel', 'poivre', 'epice', 'herbes de provence', 'persil', 'basilic', 'thym',
  'laurier', 'vanille', 'cannelle', 'muscade', 'paprika', 'cumin', 'curry',
  'gingembre en poudre', 'levure', 'bicarbonate', 'eau', 'ciboulette', 'origan',
  'romarin', 'aneth', 'coriandre en poudre', 'piment', 'vinaigre',
]
