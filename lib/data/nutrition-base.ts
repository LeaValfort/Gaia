import type { TypeJournee } from '@/types'

export interface ConseilNutritionBase {
  typeJournee: TypeJournee
  titre: string
  description: string
  aliments: { categorie: string; items: string[]; raison: string }[]
  aEviter: string[]
}

export const CONSEILS_NUTRITION_BASE: ConseilNutritionBase[] = [
  {
    typeJournee: 'sport',
    titre: 'Jour de sport — boost récupération',
    description:
      'Priorité aux protéines et glucides complexes pour la récupération musculaire.',
    aliments: [
      { categorie: '🥩 Protéines', items: ['Poulet', 'Saumon', 'Œufs', 'Tofu', 'Légumineuses'], raison: 'Réparation musculaire post-effort' },
      { categorie: '🌾 Glucides complexes', items: ['Patate douce', 'Riz complet', 'Quinoa', 'Avoine'], raison: 'Reconstitution du glycogène' },
      { categorie: '🫒 Anti-inflammatoires', items: ['Curcuma', 'Gingembre', "Huile d'olive", 'Noix', 'Baies'], raison: "Réduire l'inflammation post-effort" },
    ],
    aEviter: ['Alcool', 'Sucre raffiné', 'Ultra-transformés', 'Graisses saturées excessives'],
  },
  {
    typeJournee: 'yoga',
    titre: 'Jour de yoga — légèreté et clarté',
    description: 'Repas légers et digestibles pour ne pas alourdir la pratique.',
    aliments: [
      { categorie: '🥗 Légumes', items: ['Épinards', 'Concombre', 'Avocat', 'Brocoli', 'Courgette'], raison: 'Légèreté digestive et minéraux' },
      { categorie: '🐟 Protéines légères', items: ['Poisson blanc', 'Œufs', 'Yaourt grec', 'Tofu soyeux'], raison: 'Protéines faciles à digérer' },
      { categorie: '🫐 Antioxydants', items: ['Myrtilles', 'Grenade', 'Thé vert', 'Matcha', 'Cacao cru'], raison: 'Clarté mentale et anti-stress' },
    ],
    aEviter: ['Repas lourds avant la séance', 'Caféine en excès', 'Plats très épicés'],
  },
  {
    typeJournee: 'repos',
    titre: 'Jour de repos — régénération',
    description: "Focus sur les aliments anti-inflammatoires et la digestion.",
    aliments: [
      { categorie: '🌿 Anti-inflammatoires stars', items: ['Saumon', 'Sardines', 'Graines de chia', 'Lin', 'Noix'], raison: "Oméga-3 pour réduire l'inflammation" },
      { categorie: '🥦 Crucifères', items: ['Brocoli', 'Chou-fleur', 'Choux de Bruxelles', 'Radis'], raison: 'Détox et fibres' },
      { categorie: '🍵 Hydratation', items: ['Eau citron', 'Tisane gingembre', 'Bouillon', 'Kombucha'], raison: 'Digestion et élimination' },
    ],
    aEviter: ['Alcool', 'Caféine après 14h', 'Sucre raffiné', 'Gluten si sensibilité'],
  },
  {
    typeJournee: 'regles',
    titre: 'Jour difficile — douceur et réconfort',
    description: 'Aliments réconfortants et riches en nutriments utiles.',
    aliments: [
      { categorie: '🔴 Fer', items: ['Lentilles', 'Épinards', 'Viande rouge maigre', 'Tofu'], raison: 'Soutien des réserves en fer' },
      { categorie: '✨ Magnésium', items: ['Chocolat noir 70%+', 'Amandes', 'Graines de courge', 'Banane'], raison: 'Crampes et fatigue' },
    ],
    aEviter: ['Caféine', 'Alcool', 'Sel en excès', 'Sucre raffiné'],
  },
]

export function getConseilNutritionBase(type: TypeJournee): ConseilNutritionBase {
  return CONSEILS_NUTRITION_BASE.find((c) => c.typeJournee === type) ?? CONSEILS_NUTRITION_BASE[2]!
}
