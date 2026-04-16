// Données statiques pour l'onglet Courses
// EnseigneConfig et ENSEIGNES_DEFAUT sont dans lib/data/nutrition.ts
export { EnseigneConfig, ENSEIGNES_DEFAUT } from '@/lib/data/nutrition'

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

// Mots-clés par catégorie (noms d'ingrédients Spoonacular en anglais)
const MOTS_POISSONS = ['salmon','tuna','cod','tilapia','trout','bass','halibut','snapper','swordfish','herring','mackerel','sardine','anchovy','shrimp','prawn','crab','lobster','scallop','mussel','clam','oyster','squid','octopus','fish','seafood']
const MOTS_VIANDES  = ['chicken','beef','pork','lamb','turkey','duck','veal','steak','bacon','ham','sausage','chorizo','pancetta','prosciutto','lardons','mince','ground meat','breast','thigh','tenderloin','sirloin','rib','cutlet','drumstick']
const MOTS_LEGUMES  = ['onion','garlic','tomato','carrot','potato','pepper','spinach','broccoli','cauliflower','zucchini','cucumber','lettuce','arugula','kale','cabbage','leek','celery','asparagus','eggplant','mushroom','corn','fennel','radish','beetroot','artichoke','squash','pumpkin','chard','bean sprout','watercress']
const MOTS_FRUITS   = ['apple','banana','avocado','lemon','lime','orange','strawberry','blueberry','raspberry','mango','pineapple','peach','grape','cherry','plum','pear','melon','watermelon','coconut','ginger','turmeric','herb','parsley','cilantro','basil','thyme','rosemary','mint','dill','oregano','sage']
const MOTS_FECULENTS = ['lentil','chickpea','black bean','kidney bean','white bean','rice','pasta','quinoa','oat','flour','bread','noodle','couscous','bulgur','barley','millet','buckwheat','polenta','almond','walnut','cashew','hazelnut','pecan','pistachio','flaxseed','chia seed','sunflower seed','sesame','hemp seed']

/**
 * Détermine automatiquement le rayon et l'enseigne
 * d'un ingrédient à partir de son nom en anglais.
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
