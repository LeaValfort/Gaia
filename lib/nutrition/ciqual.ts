// Recherche d'un ingrédient dans la table CIQUAL (ANSES, licence ouverte) — seule source
// de vérité pour les macros des recettes générées par l'IA (Chantier 5, refonte).
// Volontairement AUCUN matching approximatif ("fuzzy") : soit un ingrédient est reconnu avec
// certitude (dictionnaire vérifié ou nom identique à un intitulé CIQUAL), soit il est signalé
// comme non reconnu — jamais de macro devinée avec une fausse précision.

import ciqualDataBrut from '@/lib/data/ciqual.json'
import { SYNONYMES_CIQUAL, INGREDIENTS_NEGLIGEABLES } from '@/lib/data/ciqual-synonymes'
import type { EntreeCiqual } from '@/types'

const ciqualData = ciqualDataBrut as unknown as EntreeCiqual[]
const CIQUAL_PAR_CODE = new Map(ciqualData.map((e) => [e.code, e]))

/** Entrée synthétique pour un ingrédient considéré comme négligeable (sel, poivre, herbes...). */
const ENTREE_NEGLIGEABLE: EntreeCiqual = {
  code: 'NEGLIGEABLE',
  nom: 'Assaisonnement (négligeable)',
  groupe: '',
  sousGroupe: '',
  kcal: 0,
  proteines: 0,
  glucides: 0,
  lipides: 0,
  sucres: 0,
  ags: 0,
  fibres: 0,
  sel: 0,
}

/** Minuscules, sans accents, ponctuation réduite à des espaces — pour comparer sans piège. */
export function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function correspondTousLesMots(nomNormalise: string, motsCles: string[]): boolean {
  return motsCles.every((mot) => nomNormalise.includes(normaliser(mot)))
}

/**
 * Cherche l'ingrédient `nom` (donné par l'IA) dans CIQUAL.
 * Ordre de recherche : ingrédient négligeable > dictionnaire de synonymes vérifiés
 * (le plus spécifique gagne) > correspondance exacte avec un intitulé CIQUAL.
 * Retourne `null` si aucune correspondance fiable n'est trouvée.
 */
export function trouverAliment(nom: string): EntreeCiqual | null {
  const nomNormalise = normaliser(nom)
  if (!nomNormalise) return null

  if (INGREDIENTS_NEGLIGEABLES.some((mot) => nomNormalise.includes(normaliser(mot)))) {
    return ENTREE_NEGLIGEABLE
  }

  let meilleur: { code: string; specificite: number } | null = null
  for (const { motsCles, code } of SYNONYMES_CIQUAL) {
    if (!correspondTousLesMots(nomNormalise, motsCles)) continue
    const specificite = motsCles.join('').length
    if (!meilleur || specificite > meilleur.specificite) {
      meilleur = { code, specificite }
    }
  }
  if (meilleur) return CIQUAL_PAR_CODE.get(meilleur.code) ?? null

  const exact = ciqualData.find((e) => normaliser(e.nom) === nomNormalise)
  return exact ?? null
}
