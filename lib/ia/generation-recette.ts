// Génération de recettes via l'API Claude : l'IA invente le plat (nom, ingrédients, étapes),
// mais plus aucune macro — celles-ci viennent uniquement de CIQUAL (lib/nutrition/calcul-recette.ts).
// L'IA reçoit l'objectif macro du créneau (typeRepas) pour proposer des proportions réalistes ;
// les quantités finales sont ensuite ajustées précisément sur les calories cibles.

import Anthropic from '@anthropic-ai/sdk'
import { SYNONYMES_CIQUAL } from '@/lib/data/ciqual-synonymes'
import { versRecetteBase, type RecetteBase, type RecetteBrute } from '@/lib/ia/recette-brute'
import { ALIMENTS_STARS } from '@/lib/nutrition'
import type { Phase, TypeJournee, TypeRepas } from '@/types'

export interface ObjectifMacros {
  calories: number
  proteines: number
  glucides: number
  lipides: number
}

export interface ParametresGeneration {
  phase: Phase
  typeJournee: TypeJournee
  typeRepas: TypeRepas
  objectif: ObjectifMacros
  allergies: string[]
  tempsMax: number
  /** Recherche libre optionnelle (ingrédient, mot-clé) — oriente sans forcer strictement. */
  recherche?: string
  nombre?: number
}

const LABEL_REPAS: Record<TypeRepas, string> = {
  'petit-dej': 'petit-déjeuner',
  dejeuner: 'déjeuner',
  collation: 'collation',
  diner: 'dîner',
}

// Liste indicative d'ingrédients courants dont les macros sont précisément connues (CIQUAL) —
// à privilégier pour que la recette puisse être chiffrée, sans s'y limiter strictement.
const INGREDIENTS_CONNUS = Array.from(
  new Set(SYNONYMES_CIQUAL.map((s) => s.motsCles.join(' ')))
).join(', ')

function construirePrompt(params: ParametresGeneration): string {
  const nombre = params.nombre ?? 6
  const allergies = params.allergies.length > 0 ? params.allergies.join(', ') : 'aucune'
  const alimentsStars = ALIMENTS_STARS[params.phase].map((a) => a.replace(/\s*[\p{Emoji}]/gu, '')).join(', ')
  const recherche = params.recherche?.trim()
  const o = params.objectif

  return `Tu es une nutritionniste spécialisée en alimentation anti-inflammatoire et cycle menstruel.

Phase actuelle : ${params.phase}
Type de journée (sportive) : ${params.typeJournee}
Créneau visé : ${LABEL_REPAS[params.typeRepas]}
Objectif nutritionnel approximatif pour UNE portion de ce repas : ${o.calories} kcal, ${o.proteines} g de protéines, ${o.glucides} g de glucides, ${o.lipides} g de lipides
Aliments particulièrement adaptés à cette phase : ${alimentsStars}
Allergies / intolérances à éviter absolument : ${allergies}
Temps de préparation maximum : ${params.tempsMax} minutes
${recherche ? `Doit inclure ou s'inspirer de : "${recherche}"` : ''}

Propose exactement ${nombre} recettes complètes, adaptées à ce créneau, cette phase et cet objectif.
Choisis des proportions d'ingrédients réalistes pour t'approcher de l'objectif donné (ce n'est pas toi
qui calcules les macros finales, elles seront calculées à partir d'une base nutritionnelle officielle).

Pour chaque ingrédient, donne un nom simple et générique (pas de marque) et son poids en grammes tel
qu'il est acheté / avant cuisson (cru pour viande, poisson, riz, pâtes, légumineuses ; tel quel pour
légumes, fruits, produits laitiers). Jamais d'unité comme "1 boîte", "1 cuillère" ou "1 pincée" :
convertis toujours en grammes, y compris pour une petite quantité d'épice (par exemple 1 g).
Ingrédients dont les macros sont précisément connues, à privilégier (liste non exhaustive) :
${INGREDIENTS_CONNUS}.

Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ni après, au format exact :
[
  {
    "nom": "nom du plat",
    "temps_min": 20,
    "portions": 1,
    "ingredients": [{ "nom": "poulet", "grammes": 120 }, { "nom": "riz", "grammes": 60 }],
    "instructions": "Étape 1...\\nÉtape 2...\\nÉtape 3...",
    "raison": "pourquoi ce plat est adapté à cette phase et ce créneau (1-2 phrases)"
  }
]`
}

/** Génère N recettes (structure seule, sans macros) adaptées au créneau / à la phase / au profil.
 *  Ne lève jamais : retourne [] en cas d'échec. */
export async function genererRecettes(params: ParametresGeneration): Promise<RecetteBase[]> {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: construirePrompt(params) }],
    })

    const contenu = message.content[0]
    if (contenu.type !== 'text') throw new Error('Type de réponse inattendu')

    const jsonMatch = contenu.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('Pas de JSON dans la réponse')

    const brutes = JSON.parse(jsonMatch[0]) as RecetteBrute[]
    return brutes
      .map((b) => versRecetteBase(b, params.phase))
      .filter((r): r is RecetteBase => r !== null)
  } catch (erreur) {
    console.error('Erreur genererRecettes:', erreur)
    return []
  }
}
