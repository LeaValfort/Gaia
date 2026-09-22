// Données statiques de la checklist alimentation quotidienne (Chantier 6)

import type { Phase, Rayon, TypeJournee } from '@/types'

export interface ItemChecklist {
  id: string
  label: string
  categorie: 'preparation' | 'proteines' | 'graisses' | 'legumes' | 'hydratation' | 'eviter'
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

// Batch cooking — item séparé, hebdomadaire, non inclus dans le score du jour
export const BATCH_ITEM = {
  id: 'batch_done',
  label: 'Batch cooking du dimanche fait',
  description: 'Overnight oats + egg muffins préparés',
}

// Titres d'affichage pour chaque catégorie
export const CATEGORIES_LABELS: Record<ItemChecklist['categorie'], string> = {
  preparation: '🎯 Préparation de la séance du jour',
  proteines:   '🥩 Protéines',
  graisses:    '🫒 Graisses saines',
  legumes:     '🥦 Légumes & Fibres',
  hydratation: '💧 Hydratation',
  eviter:      '🚫 À éviter',
}

// Ordre d'affichage des catégories
export const ORDRE_CATEGORIES: ItemChecklist['categorie'][] = [
  'preparation', 'proteines', 'graisses', 'legumes', 'hydratation', 'eviter',
]

// ------------------------------------------------------------
// Préparation de la séance du jour — varie selon le type de journée réel
// (calculé à partir du planning + substitutions, pas le planning fixe)
// ------------------------------------------------------------

export const ITEMS_PREPARATION_SEANCE: Record<TypeJournee, ItemChecklist[]> = {
  sport: [
    { id: 'prep_glucides',   label: 'Repas riche en glucides 2-3h avant', categorie: 'preparation', description: 'Pour tenir la charge d’entraînement sans coup de mou', emoji: '🍚' },
    { id: 'prep_hydratation_sport', label: 'Bouteille d’eau prête',       categorie: 'preparation', description: 'À emporter ou à portée pendant la séance',                emoji: '🥤' },
    { id: 'prep_collation',  label: 'Collation protéinée post-séance prévue', categorie: 'preparation', description: 'Pour la récupération musculaire dans l’heure qui suit', emoji: '🥜' },
  ],
  yoga: [
    { id: 'prep_leger',  label: 'Repas léger avant la séance', categorie: 'preparation', description: 'Éviter un repas lourd juste avant une séance de yoga', emoji: '🥗' },
    { id: 'prep_tenue',  label: 'Tenue confortable et tapis prêts', categorie: 'preparation', description: 'Pour ne pas être gênée pendant les postures',        emoji: '🧘' },
  ],
  repos: [
    { id: 'prep_repos_repas', label: 'Repas équilibré, sans surcompenser', categorie: 'preparation', description: 'Jour de repos : pas besoin de charger en glucides', emoji: '🍲' },
  ],
  regles: [
    { id: 'prep_fer',    label: 'Aliments riches en fer au menu',           categorie: 'preparation', description: 'Viande rouge, lentilles, épinards — pour compenser les pertes', emoji: '🥩' },
    { id: 'prep_tisane', label: 'Tisane ou bouillotte anti-crampes prête',  categorie: 'preparation', description: 'Gingembre, camomille ou framboisier',                          emoji: '🍵' },
  ],
}

// ------------------------------------------------------------
// Symptômes à surveiller — rappel informatif par phase, pas de case à cocher
// ------------------------------------------------------------

export const SYMPTOMES_A_SURVEILLER: Record<Phase, string> = {
  menstruation: 'Fatigue, crampes et maux de tête sont fréquents cette phase — priorise le repos et l’hydratation.',
  folliculaire: 'L’énergie remonte généralement : bon moment pour les séances plus intenses, tout en restant à l’écoute.',
  ovulation: 'Une légère douleur ovulatoire ou une libido en hausse sont normales à cette phase.',
  luteale: 'Ballonnements, fringales sucrées et irritabilité peuvent apparaître — hydratation et magnésium aident.',
}

// Crée un état checklist vide pour une liste d'items donnée (tous à false)
export function creerChecklistVideDepuis(items: ItemChecklist[]): Record<string, boolean> {
  return Object.fromEntries(items.map((item) => [item.id, false]))
}

// ------------------------------------------------------------
// Configuration des enseignes de magasin
// ------------------------------------------------------------

export interface EnseigneConfig {
  id: string
  label: string
  emoji: string
  couleur: string   // classe Tailwind bg-
}

export const ENSEIGNES_DEFAUT: EnseigneConfig[] = [
  { id: 'biocoop',         label: 'Biocoop',        emoji: '🌿', couleur: 'bg-green-100 dark:bg-green-900/40' },
  { id: 'grand_frais',     label: 'Grand Frais',    emoji: '🐟', couleur: 'bg-blue-100 dark:bg-blue-900/40' },
  { id: 'boucherie',       label: 'Boucherie',      emoji: '🥩', couleur: 'bg-red-100 dark:bg-red-900/40' },
  { id: 'grande_surface',  label: 'Grande surface', emoji: '🛒', couleur: 'bg-yellow-100 dark:bg-yellow-900/40' },
]

/**
 * Palette de couleurs proposée pour une enseigne de courses personnalisée.
 * Volontairement distincte des couleurs des phases du cycle (teal/amber/coral/purple)
 * pour ne jamais créer de confusion visuelle avec les indicateurs de phase.
 */
export const PALETTE_COULEURS_ENSEIGNE: { label: string; classe: string }[] = [
  { label: 'Vert',    classe: 'bg-green-100 dark:bg-green-900/40' },
  { label: 'Bleu',     classe: 'bg-blue-100 dark:bg-blue-900/40' },
  { label: 'Rouge',    classe: 'bg-red-100 dark:bg-red-900/40' },
  { label: 'Jaune',    classe: 'bg-yellow-100 dark:bg-yellow-900/40' },
  { label: 'Orange',   classe: 'bg-orange-100 dark:bg-orange-900/40' },
  { label: 'Rose',     classe: 'bg-pink-100 dark:bg-pink-900/40' },
  { label: 'Indigo',   classe: 'bg-indigo-100 dark:bg-indigo-900/40' },
  { label: 'Gris',     classe: 'bg-slate-100 dark:bg-slate-900/40' },
]

// ------------------------------------------------------------
// Rayons de magasin
// ------------------------------------------------------------

export const RAYONS_PAR_LABEL: Record<Rayon, string> = {
  fruits_legumes:   '🥦 Fruits & Légumes',
  poissons_viandes: '🐟 Poissons & Viandes',
  cremerie:         '🧀 Crèmerie',
  epicerie_seche:   '🫙 Épicerie sèche',
  surgeles:         '❄️ Surgelés',
  hygiene_maison:   '🧴 Hygiène & Maison',
  autre:            '📦 Autre',
}
