// Recherche d'aliments dans CIQUAL pour la saisie rapide d'un repas (côté serveur
// uniquement : la table fait ~900 Ko, on ne l'envoie pas au navigateur).

import ciqualDataBrut from '@/lib/data/ciqual.json'
import { normaliser } from '@/lib/nutrition/ciqual'
import type { AlimentRecherche, EntreeCiqual } from '@/types'

const ciqual = (ciqualDataBrut as unknown as EntreeCiqual[]).filter(
  (e) => e.kcal != null && e.proteines != null && e.glucides != null && e.lipides != null
)
const NOMS = ciqual.map((e) => normaliser(e.nom))
const PAR_CODE = new Map(ciqual.map((e) => [e.code, e]))

const MAX_RESULTATS = 12

function versResultat(e: EntreeCiqual): AlimentRecherche {
  return { code: e.code, nom: e.nom, kcal: e.kcal!, proteines: e.proteines!, glucides: e.glucides!, lipides: e.lipides! }
}

/**
 * Classement simple : le nom commence par la recherche > le premier mot correspond >
 * tous les mots sont présents ; à égalité, le nom le plus court (le plus générique) gagne.
 */
export function rechercherAliments(q: string): AlimentRecherche[] {
  // « œuf » → « oeuf » : CIQUAL écrit sans ligature, et normaliser() la supprimerait.
  const req = normaliser(q.replace(/œ/gi, 'oe').replace(/æ/gi, 'ae'))
  if (req.length < 2) return []
  const mots = req.split(' ')
  const scores: { i: number; score: number }[] = []
  NOMS.forEach((nom, i) => {
    if (!mots.every((m) => nom.includes(m))) return
    const score = nom.startsWith(req) ? 0 : nom.split(' ')[0] === mots[0] ? 1 : 2
    scores.push({ i, score })
  })
  return scores
    .sort((a, b) => a.score - b.score || NOMS[a.i].length - NOMS[b.i].length)
    .slice(0, MAX_RESULTATS)
    .map(({ i }) => versResultat(ciqual[i]))
}

export function alimentsParCodes(codes: string[]): AlimentRecherche[] {
  return codes.flatMap((c) => {
    const e = PAR_CODE.get(c)
    return e ? [versResultat(e)] : []
  })
}
