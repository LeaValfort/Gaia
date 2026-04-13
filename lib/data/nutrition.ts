// Données statiques de la checklist anti-inflammatoire

export interface ItemChecklist {
  id: string
  label: string
  categorie: 'proteines' | 'graisses' | 'legumes' | 'hydratation' | 'eviter'
  description: string
  emoji: string
}

export const ITEMS_CHECKLIST: ItemChecklist[] = [
  // Protéines — objectif 120g/jour
  { id: 'proteines_matin',    label: 'Protéines au petit-déjeuner', categorie: 'proteines',   description: '20g minimum le matin pour réduire les fringales',            emoji: '🥚' },
  { id: 'proteines_dejeuner', label: 'Protéines au déjeuner',       categorie: 'proteines',   description: 'Viande, poisson, légumineuses ou tofu',                     emoji: '🍗' },
  { id: 'proteines_diner',    label: 'Protéines au dîner',          categorie: 'proteines',   description: "Compléter l'objectif 120g/jour",                            emoji: '🐟' },

  // Graisses anti-inflammatoires
  { id: 'omega3',      label: "Oméga-3 du jour",          categorie: 'graisses', description: 'Poisson gras, noix, graines de lin ou de chia',                emoji: '🐠' },
  { id: 'huile_olive', label: "Huile d'olive vierge",     categorie: 'graisses', description: '2 cuillères à soupe minimum, crue de préférence',             emoji: '🫒' },
  { id: 'avocat_noix', label: 'Avocat ou poignée de noix', categorie: 'graisses', description: 'Graisses mono-insaturées pour les hormones',                  emoji: '🥑' },

  // Légumes & fibres
  { id: 'legumes_midi',  label: 'Légumes au déjeuner',          categorie: 'legumes', description: "Moitié de l'assiette en légumes",                              emoji: '🥦' },
  { id: 'legumes_soir',  label: 'Légumes au dîner',             categorie: 'legumes', description: 'Variété de couleurs pour les antioxydants',                   emoji: '🥕' },
  { id: 'cruciferes',    label: 'Crucifères cette semaine',      categorie: 'legumes', description: 'Brocoli, chou, radis — équilibre les œstrogènes',             emoji: '🥬' },
  { id: 'legumineuses',  label: 'Légumineuses cette semaine',    categorie: 'legumes', description: 'Lentilles, pois chiches, haricots — fer végétal',             emoji: '🫘' },

  // Hydratation
  { id: 'eau_15L', label: "1,5L d'eau minimum",          categorie: 'hydratation', description: 'Essentiel pour les crampes et la digestion',                emoji: '💧' },
  { id: 'tisane',  label: 'Tisane anti-crampes si besoin', categorie: 'hydratation', description: 'Gingembre, camomille ou framboisier',                      emoji: '🍵' },

  // À éviter (cocher = évité avec succès)
  { id: 'evite_alcool',           label: 'Alcool évité',              categorie: 'eviter', description: 'Pro-inflammatoire, perturbe le sommeil et les hormones', emoji: '🚫' },
  { id: 'evite_sucre',            label: 'Sucre raffiné limité',      categorie: 'eviter', description: 'Pas de sodas, pâtisseries industrielles',              emoji: '🍬' },
  { id: 'evite_ultra_transforme', label: 'Ultra-transformé évité',    categorie: 'eviter', description: 'Plats préparés, charcuterie industrielle',             emoji: '🏭' },
]

// Batch cooking — item séparé, non inclus dans le score principal
export const BATCH_ITEM = {
  id: 'batch_done',
  label: 'Batch cooking du dimanche fait',
  description: 'Overnight oats + egg muffins préparés',
}

// Titres d'affichage pour chaque catégorie
export const CATEGORIES_LABELS: Record<ItemChecklist['categorie'], string> = {
  proteines:   '🥩 Protéines',
  graisses:    '🫒 Graisses saines',
  legumes:     '🥦 Légumes & Fibres',
  hydratation: '💧 Hydratation',
  eviter:      '🚫 À éviter',
}

// Ordre d'affichage des catégories
export const ORDRE_CATEGORIES: ItemChecklist['categorie'][] = [
  'proteines', 'graisses', 'legumes', 'hydratation', 'eviter',
]

// Crée un état checklist vide (tous les items à false)
export function creerChecklistVide(): Record<string, boolean> {
  return Object.fromEntries(ITEMS_CHECKLIST.map((item) => [item.id, false]))
}
