import type { RecetteBase } from '@/lib/ia/recette-brute'

/** Règles de réutilisation des recettes de la bibliothèque commune (logique pure). */

/** Minuscules, sans accents ni ponctuation : clé anti-doublon. */
export function normaliserNomRecette(nom: string): string {
  return nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/gi, 'oe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Mois proches (même saison à peu près) : le mois courant ± 1. */
export function moisProches(mois: number): number[] {
  return [((mois + 10) % 12) + 1, mois, (mois % 12) + 1]
}

export interface RecetteCommune extends RecetteBase {
  id: string
  conditions: string[]
}

/**
 * Recette réutilisable pour cette utilisatrice : aucune allergie dans les
 * ingrédients, pensée pour au moins tous ses profils santé, et qui répond à la
 * recherche s'il y en a une.
 */
export function recetteConvient(r: RecetteCommune, opts: { allergies: string[]; conditions: string[]; recherche?: string }): boolean {
  const ingredients = r.ingredients_structures.map((i) => normaliserNomRecette(i.nom)).join(' ')
  if (opts.allergies.some((a) => a.trim() && ingredients.includes(normaliserNomRecette(a)))) return false
  if (!opts.conditions.every((c) => r.conditions.includes(c))) return false
  const q = opts.recherche?.trim()
  if (q && !`${normaliserNomRecette(r.nom)} ${ingredients}`.includes(normaliserNomRecette(q))) return false
  return true
}

/** Tirage au hasard de `n` éléments, pour varier les propositions d'une fois sur l'autre. */
export function tirerAuHasard<T>(liste: T[], n: number): T[] {
  const copie = [...liste]
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie.slice(0, n)
}
