import type { Phase, TypeJournee } from '@/types'

// ------------------------------------------------------------
// Checklist anti-inflammatoire — 10 items "À PRIVILÉGIER"
// La barre de progression compte uniquement ces 10 items.
// ------------------------------------------------------------

export interface ItemChecklist {
  id: string
  label: string
  categorie: 'À consommer' | 'À éviter'
}

export const ITEMS_CHECKLIST: ItemChecklist[] = [
  { id: 'saumon_sardines',  label: 'Saumon ou sardines (2×/sem.)',          categorie: 'À consommer' },
  { id: 'legumineuses',     label: 'Lentilles / légumineuses (2×/sem.)',    categorie: 'À consommer' },
  { id: 'legumes_verts',    label: 'Épinards, brocoli ou kale (3×/sem.)',   categorie: 'À consommer' },
  { id: 'baies',            label: 'Myrtilles ou framboises (4×/sem.)',     categorie: 'À consommer' },
  { id: 'curcuma',          label: 'Curcuma + poivre noir (4×/sem.)',       categorie: 'À consommer' },
  { id: 'graines_lin',      label: 'Graines de lin (quotidien)',            categorie: 'À consommer' },
  { id: 'noix',             label: 'Noix ou amandes (4×/sem.)',             categorie: 'À consommer' },
  { id: 'huile_olive',      label: "Huile d'olive (quotidien)",             categorie: 'À consommer' },
  { id: 'tisane_gingembre', label: 'Tisane gingembre-citron (3×/sem.)',     categorie: 'À consommer' },
  { id: 'choco_noir',       label: 'Chocolat noir 85% (3×/sem.)',           categorie: 'À consommer' },
]

export const ITEMS_EVITER = [
  'Sucre raffiné',
  'Alcool',
  'Fast food / friture',
  'Café excessif (phase lutéale : 0)',
  'Sel en excès',
  'Produits ultra-transformés',
]

export function creerChecklistVide(): Record<string, boolean> {
  return Object.fromEntries(ITEMS_CHECKLIST.map((item) => [item.id, false]))
}

// ------------------------------------------------------------
// Macros par type de journée
// ------------------------------------------------------------

export const MACROS_JOURNEE: Record<TypeJournee, {
  kcal: number; proteines: number; glucides: number; lipides: number
}> = {
  sport:  { kcal: 1800, proteines: 120, glucides: 200, lipides: 55 },
  yoga:   { kcal: 1700, proteines: 120, glucides: 170, lipides: 58 },
  repos:  { kcal: 1620, proteines: 120, glucides: 155, lipides: 62 },
  regles: { kcal: 1800, proteines: 115, glucides: 175, lipides: 65 },
}

export const LABELS_JOURNEE: Record<TypeJournee, string> = {
  sport: '🏋️ Sport', yoga: '🧘 Yoga', repos: '😌 Repos', regles: '🩸 Règles',
}

// ------------------------------------------------------------
// Aliments stars par phase (pills)
// ------------------------------------------------------------

export const ALIMENTS_STARS: Record<Phase, string[]> = {
  menstruation: ['Lentilles 🫘', 'Épinards', 'Chocolat noir 🍫', 'Gingembre 🫚', 'Saumon 🐟', 'Amandes'],
  folliculaire: ['Saumon 🐟', 'Kéfir', 'Pois chiches', 'Graines courge 🌰', 'Avocat 🥑', 'Maquereau'],
  ovulation:    ['Brocoli 🥦', 'Betterave', 'Grenade 🍷', 'Myrtilles 🫐', 'Lin', 'Chou kale'],
  luteale:      ['Patate douce 🍠', 'Avoine', 'Noix 🥜', 'Quinoa', 'Chocolat noir 🍫', 'Banane 🍌'],
}

// ------------------------------------------------------------
// Liste de courses par phase (pour "Générer depuis le plan")
// ------------------------------------------------------------

export const LISTE_COURSES_PHASE: Record<Phase, string[]> = {
  menstruation: ['Lentilles', 'Épinards', 'Viande rouge maigre', 'Saumon', 'Lait végétal', 'Amandes', 'Chocolat noir 85%', 'Graines de lin', 'Bananes', 'Myrtilles', 'Quinoa', 'Brocoli', 'Patate douce', 'Sardines', 'Gingembre frais'],
  folliculaire: ['Saumon', 'Maquereau', 'Tofu', 'Kéfir', 'Avocat', 'Pois chiches', 'Graines de courge', 'Noix de cajou', 'Quinoa', 'Riz complet', 'Framboises', 'Citron', 'Hummus', 'Yaourt grec', 'Graines de lin'],
  ovulation:    ['Brocoli', 'Chou-fleur', 'Chou kale', 'Betterave', 'Grenade', 'Myrtilles', 'Graines de lin', 'Pois chiches', 'Lentilles corail', 'Saumon', 'Crevettes', 'Curcuma', 'Lait de coco', 'Quinoa', 'Tahini'],
  luteale:      ['Patate douce', 'Quinoa', 'Avoine', 'Noix', 'Amandes', 'Chocolat noir 85%', 'Bananes', 'Lentilles', 'Riz complet', 'Lait de coco', 'Gingembre', 'Cannelle', "Beurre d'amande", 'Graines de lin', 'Dattes'],
}

// ------------------------------------------------------------
// Styles Tailwind par phase (pour pills et bordures colorées)
// ------------------------------------------------------------

export const PHASE_STYLES: Record<Phase, { pill: string; border: string; bg: string }> = {
  menstruation: { pill: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',   border: 'border-teal-300 dark:border-teal-700',   bg: 'bg-teal-50 dark:bg-teal-900/20' },
  folliculaire: { pill: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ovulation:    { pill: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  luteale:      { pill: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700', bg: 'bg-purple-50 dark:bg-purple-900/20' },
}

// ------------------------------------------------------------
// Recommandations alimentaires par phase
// ------------------------------------------------------------

export interface RecommandationAlim { titre: string; details: string[] }

const RECOMMANDATIONS_PAR_PHASE: Record<Phase, RecommandationAlim> = {
  menstruation: {
    titre: 'Phase menstruelle — Reconstitue tes réserves',
    details: ['Fer : lentilles, épinards, viande rouge maigre, graines de citrouille', 'Magnésium : chocolat noir 70%+, amandes, banane', 'Anti-crampes : eau chaude avec citron et gingembre', 'Évite les aliments inflammatoires : sucre, alcool, friture'],
  },
  folliculaire: {
    titre: 'Phase folliculaire — Booste ton énergie',
    details: ['Oméga-3 : saumon, maquereau, graines de lin moulues', 'Aliments fermentés : yaourt, kéfir, choucroute', 'Protéines maigres : œufs, légumineuses, tofu', 'Zinc : graines de courge, noix de cajou, pois chiches'],
  },
  ovulation: {
    titre: 'Phase ovulatoire — Soutiens les œstrogènes',
    details: ['Légumes crucifères : brocoli, chou-fleur, chou frisé', "Fibres : fruits, légumineuses pour l'élimination des hormones", 'Antioxydants : baies, betterave, grenade', 'Graines de lin (œstrogène-modulant naturel)'],
  },
  luteale: {
    titre: 'Phase lutéale — Réduis le syndrome prémenstruel',
    details: ['Magnésium : noix, graines, cacao, légumes verts', 'Glucides complexes : patate douce, quinoa, avoine', "Réduis la caféine pour limiter l'anxiété et les tensions", 'Évite le sel en excès (rétention d\'eau)'],
  },
}

export function getRecommandationAlim(phase: Phase): RecommandationAlim {
  return RECOMMANDATIONS_PAR_PHASE[phase]
}
