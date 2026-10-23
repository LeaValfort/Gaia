import Anthropic from '@anthropic-ai/sdk'
import type { ConservationBatch, DerouleBatch, EtapeBatch, Recipe } from '@/types'

/**
 * Déroulé commun de batch cooking : l'IA organise la préparation de plusieurs
 * recettes en une seule session (bases communes, cuissons lancées en premier,
 * tâches en parallèle), puis donne la conservation. Côté serveur uniquement.
 */

function construirePrompt(recettes: Recipe[]): string {
  const liste = recettes
    .map((r, i) => `Recette ${i + 1} : ${r.nom}\nIngrédients : ${r.ingredients.join(', ')}\nÉtapes : ${(r.instructions ?? '').replace(/\n+/g, ' / ') || 'non précisées'}`)
    .join('\n\n')

  return `Tu es une cheffe qui organise une session de batch cooking à la maison (une seule personne, cuisine standard : 1 four, 4 feux).

Voici les recettes à préparer en une seule session :

${liste}

Organise UN déroulé commun, dans l'ordre chronologique :
- regroupe les préparations communes (ex. tout le riz ou tous les légumes à couper d'un coup) ;
- lance d'abord ce qui est long (four, cuissons longues), puis fais les tâches courtes pendant ce temps (marque-les "en_parallele": true) ;
- étapes courtes et concrètes (1 à 2 phrases), avec une durée en minutes quand il y a une attente ou une cuisson ;
- termine par le refroidissement et la mise en boîtes.

Puis, pour chaque recette, un conseil de conservation (frigo ou congélateur) et un nombre de jours raisonnable au réfrigérateur.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après :
{
  "etapes": [{ "titre": "Préchauffer le four", "detail": "...", "duree_min": 10, "en_parallele": false, "recettes": ["nom de la recette"] }],
  "conservation": [{ "recette": "nom de la recette", "conseil": "...", "jours": 3 }],
  "duree_totale_min": 90
}`
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v) : null)
const txt = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

/** Lecture prudente de la réponse JSON (et du jsonb relu depuis la base). */
export function parseDeroule(raw: unknown): DerouleBatch | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const etapes: EtapeBatch[] = (Array.isArray(o.etapes) ? o.etapes : []).flatMap((e, i) => {
    if (!e || typeof e !== 'object') return []
    const x = e as Record<string, unknown>
    const titre = txt(x.titre)
    if (!titre) return []
    return [{
      id: txt(x.id) || `e${i + 1}`,
      titre,
      detail: txt(x.detail),
      duree_min: num(x.duree_min),
      en_parallele: x.en_parallele === true,
      recettes: Array.isArray(x.recettes) ? x.recettes.filter((r): r is string => typeof r === 'string') : [],
    }]
  })
  if (!etapes.length) return null
  const conservation: ConservationBatch[] = (Array.isArray(o.conservation) ? o.conservation : []).flatMap((c) => {
    if (!c || typeof c !== 'object') return []
    const x = c as Record<string, unknown>
    return txt(x.recette) ? [{ recette: txt(x.recette), conseil: txt(x.conseil), jours: num(x.jours) }] : []
  })
  return { etapes, conservation, duree_totale_min: num(o.duree_totale_min) }
}

export async function genererDerouleBatch(recettes: Recipe[]): Promise<DerouleBatch | null> {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      // Jusqu'à 12 recettes : assez de place pour ne pas couper le JSON en route.
      max_tokens: 8192,
      messages: [{ role: 'user', content: construirePrompt(recettes) }],
    })
    const contenu = message.content[0]
    if (contenu.type !== 'text') throw new Error('Type de réponse inattendu')
    const json = contenu.text.match(/\{[\s\S]*\}/)
    if (!json) throw new Error('Pas de JSON dans la réponse')
    return parseDeroule(JSON.parse(json[0]))
  } catch (erreur) {
    const e = erreur as { status?: number; message?: string; error?: unknown }
    console.error('Erreur genererDerouleBatch:', JSON.stringify({ status: e?.status, message: e?.message, body: e?.error }))
    return null
  }
}

/** Consigne pour générer des recettes liées entre elles (bases communes). */
export const CONSIGNE_RECETTES_LIEES =
  "Batch cooking : les recettes doivent être LIÉES entre elles, en partageant 2 ou 3 préparations de base (ex. une céréale, des légumes rôtis, une protéine) cuisinées une seule fois, et se conserver 3 à 4 jours au réfrigérateur. Chaque recette fait 3 portions."
