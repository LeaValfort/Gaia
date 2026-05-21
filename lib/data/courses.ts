// Données statiques pour l'onglet Courses
// EnseigneConfig et ENSEIGNES_DEFAUT sont dans lib/data/nutrition.ts
export type { EnseigneConfig } from '@/lib/data/nutrition'
export { ENSEIGNES_DEFAUT } from '@/lib/data/nutrition'

import type { Rayon } from '@/types'

export interface RayonConfig {
  label: string
  emoji: string
  ordre: number
}

/** Configuration complète des rayons, triable par ordre */
export const RAYONS_CONFIG: Record<Rayon, RayonConfig> = {
  fruits_legumes:   { label: 'Fruits & Légumes',   emoji: '🥦', ordre: 1 },
  poissons_viandes: { label: 'Poissons & Viandes', emoji: '🐟', ordre: 2 },
  cremerie:         { label: 'Crèmerie',           emoji: '🧀', ordre: 3 },
  epicerie_seche:   { label: 'Épicerie sèche',     emoji: '🫙', ordre: 4 },
  surgeles:         { label: 'Surgelés',           emoji: '❄️', ordre: 5 },
  hygiene_maison:   { label: 'Hygiène & Maison',   emoji: '🧴', ordre: 6 },
  autre:            { label: 'Autre',              emoji: '📦', ordre: 7 },
}

// ── ASSIGNATION AUTOMATIQUE ──────────────────────────────────

import type { Enseigne } from '@/types'

export interface AssignationAuto { rayon: Rayon; enseigne: Enseigne }

// Mots-clés par catégorie (français + anglais)
const MOTS_POISSONS = ['saumon','salmon','thon','tuna','cabillaud','cod','truite','trout','crevette','shrimp','prawn','crab','homard','lobster','moule','mussel','sardine','anchois','anchovy','poisson','fish','seafood','fruits de mer']
const MOTS_VIANDES  = ['poulet','chicken','boeuf','beef','bœuf','porc','pork','agneau','lamb','dinde','turkey','canard','duck','viande','steak','bacon','jambon','ham','saucisse','sausage','chorizo','lardons','mince','ground meat','breast','thigh']
const MOTS_LEGUMES  = ['oignon','onion','ail','garlic','tomate','tomato','carotte','carrot','pomme de terre','potato','poivron','pepper','épinard','spinach','brocoli','broccoli','chou','cabbage','courgette','zucchini','concombre','cucumber','salade','lettuce','champignon','mushroom','légume','haricot vert','celeri','celery','asperge','asparagus','aubergine','eggplant','courge','squash','pumpkin','potiron','fenouil','fennel','radis','radish','betterave','beetroot','artichaut','artichoke']
const MOTS_FRUITS   = ['pomme','apple','banane','banana','avocat','avocado','citron','lemon','citron vert','lime','orange','fraise','strawberry','myrtille','blueberry','framboise','raspberry','mangue','mango','ananas','pineapple','pêche','peach','raisin','grape','cerise','cherry','prune','plum','poire','pear','melon','pastèque','watermelon','noix de coco','coconut','gingembre','ginger','curcuma','turmeric','persil','parsley','coriandre','cilantro','basilic','basil','thym','thyme','romarin','rosemary','menthe','mint','aneth','dill','origan','oregano','sauge','sage']
const MOTS_FECULENTS = ['lentille','lentil','pois chiche','chickpea','haricot','black bean','kidney bean','riz','rice','pâtes','pasta','quinoa','avoine','oat','farine','flour','pain','bread','nouille','noodle','couscous','boulgour','bulgur','orge','barley','millet','sarrasin','buckwheat','polenta','amande','almond','noix','walnut','cajou','cashew','noisette','hazelnut','pécan','pecan','pistache','pistachio','lin','flaxseed','graine de chia','chia seed','tournesol','sunflower seed','sésame','sesame']

/**
 * Détermine automatiquement le rayon et l'enseigne
 * d'un ingrédient à partir de son nom (français ou anglais).
 */
export function devinerAssignation(nom: string): AssignationAuto {
  const n = nom.toLowerCase()
  if (MOTS_POISSONS.some((m) => n.includes(m))) return { rayon: 'poissons_viandes', enseigne: 'grand_frais' }
  if (MOTS_VIANDES.some((m) => n.includes(m)))  return { rayon: 'poissons_viandes', enseigne: 'boucherie' }
  if (MOTS_LEGUMES.some((m) => n.includes(m)))  return { rayon: 'fruits_legumes',   enseigne: 'grand_frais' }
  if (MOTS_FRUITS.some((m) => n.includes(m)))   return { rayon: 'fruits_legumes',   enseigne: 'grand_frais' }
  if (MOTS_FECULENTS.some((m) => n.includes(m))) return { rayon: 'epicerie_seche',  enseigne: 'biocoop' }
  return { rayon: 'autre', enseigne: 'grande_surface' }
}

/** Retourne les rayons triés par ordre d'affichage */
export function getRayonsOrdonnes(): { rayon: Rayon; config: RayonConfig }[] {
  return (Object.entries(RAYONS_CONFIG) as [Rayon, RayonConfig][])
    .sort((a, b) => a[1].ordre - b[1].ordre)
    .map(([rayon, config]) => ({ rayon, config }))
}

/** Génère les semaines disponibles (semaine courante + 3 précédentes) */
export function getSemainesDisponibles(): { value: string; label: string }[] {
  const semaines = []
  const maintenant = new Date()
  for (let i = 0; i < 4; i++) {
    const date = new Date(maintenant)
    date.setDate(date.getDate() - i * 7)
    // Recule au lundi
    const jour = date.getDay()
    const decalage = jour === 0 ? 6 : jour - 1
    date.setDate(date.getDate() - decalage)
    date.setHours(0, 0, 0, 0)
    const value = date.toISOString().slice(0, 10)
    const label = i === 0
      ? `Cette semaine (${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'long' })})`
      : `Semaine du ${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'long' })}`
    semaines.push({ value, label })
  }
  return semaines
}
