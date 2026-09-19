// Génération de recettes complètes via l'API Claude.
// Remplace la recherche TheMealDB + traduction MyMemory + macros Open Food Facts
// (imprécises et sujettes à un quota de traduction gratuit qui casse silencieusement).

import Anthropic from '@anthropic-ai/sdk'
import { ALIMENTS_STARS } from '@/lib/nutrition'
import { versRecetteGeneree, type RecetteBrute } from '@/lib/ia/recette-brute'
import type { Phase, RecetteGeneree, TypeJournee } from '@/types'

export interface ParametresGeneration {
  phase: Phase
  typeJournee: TypeJournee
  allergies: string[]
  tempsMax: number
  /** Recherche libre optionnelle (ingrédient, mot-clé) — oriente sans forcer strictement. */
  recherche?: string
  nombre?: number
}

function construirePrompt(params: ParametresGeneration): string {
  const nombre = params.nombre ?? 6
  const allergies = params.allergies.length > 0 ? params.allergies.join(', ') : 'aucune'
  const alimentsStars = ALIMENTS_STARS[params.phase].map((a) => a.replace(/\s*[\p{Emoji}]/gu, '')).join(', ')
  const recherche = params.recherche?.trim()

  return `Tu es une nutritionniste spécialisée en alimentation anti-inflammatoire et cycle menstruel.

Phase actuelle : ${params.phase}
Type de journée (sportive) : ${params.typeJournee}
Aliments particulièrement adaptés à cette phase : ${alimentsStars}
Allergies / intolérances à éviter absolument : ${allergies}
Temps de préparation maximum : ${params.tempsMax} minutes
${recherche ? `Doit inclure ou s'inspirer de : "${recherche}"` : ''}

Propose exactement ${nombre} recettes complètes de plats français ou faciles à cuisiner en France,
adaptées à cette phase du cycle et à ce type de journée.

Pour chaque recette, estime le plus précisément possible (comme le ferait une base nutritionnelle) :
- le poids total du plat préparé en grammes (poids_total_g)
- les valeurs nutritionnelles TOTALES pour le plat entier (pas par portion, pas pour 100g) :
  calories, protéines (g), glucides (g) dont sucres (g), lipides (g) dont acides gras saturés (g),
  sel (g), fibres (g)
- le pourcentage approximatif de la masse du plat provenant de fruits, légumes, légumineuses
  ou fruits à coque (fruits_legumes_pct, 0 à 100)

Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ni après, au format exact :
[
  {
    "nom": "nom du plat",
    "temps_min": 20,
    "portions": 2,
    "poids_total_g": 600,
    "ingredients": ["200 g de poulet", "1 oignon", "..."],
    "instructions": "Étape 1...\\nÉtape 2...\\nÉtape 3...",
    "raison": "pourquoi ce plat est adapté à cette phase (1-2 phrases)",
    "total_calories": 750,
    "total_proteines": 60,
    "total_glucides": 80,
    "total_lipides": 20,
    "total_sucres": 10,
    "total_acides_gras_satures": 5,
    "total_sel": 4,
    "total_fibres": 12,
    "fruits_legumes_pct": 35
  }
]`
}

/** Génère N recettes complètes adaptées à la phase / au profil. Ne lève jamais : retourne [] en cas d'échec. */
export async function genererRecettes(params: ParametresGeneration): Promise<RecetteGeneree[]> {
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
      .map((b) => versRecetteGeneree(b, params.phase))
      .filter((r): r is RecetteGeneree => r !== null)
  } catch (erreur) {
    console.error('Erreur genererRecettes:', erreur)
    return []
  }
}
