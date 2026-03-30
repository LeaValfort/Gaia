import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export interface SuggestionPlat {
  nom: string
  ingredients: string[]
  temps: number
  raison: string
}

interface CorpsRequete {
  phase: string
  conseilAlim: string
  likes: string[]
  dislikes: string[]
  allergies: string[]
  tempsCuisine: number
  typeRepas?: string
  macros?: { kcal: number; proteines: number; glucides: number; lipides: number }
}

const LABELS_REPAS: Record<string, string> = {
  'petit-dej': 'petit-déjeuner',
  'dejeuner': 'déjeuner',
  'collation': 'collation',
  'diner': 'dîner',
}

function construirePrompt(params: CorpsRequete): string {
  const likes = params.likes.length > 0 ? params.likes.join(', ') : 'pas de préférence particulière'
  const dislikes = params.dislikes.length > 0 ? params.dislikes.join(', ') : 'aucun'
  const allergies = params.allergies.length > 0 ? params.allergies.join(', ') : 'aucune'
  const typeRepasLabel = params.typeRepas ? LABELS_REPAS[params.typeRepas] ?? params.typeRepas : 'repas (type non précisé)'
  const macrosInfo = params.macros
    ? `Macros cibles du jour : ${params.macros.kcal} kcal · ${params.macros.proteines}g protéines · ${params.macros.glucides}g glucides · ${params.macros.lipides}g lipides`
    : ''

  return `Tu es une nutritionniste spécialisée en alimentation anti-inflammatoire et cycle menstruel.

Phase actuelle : ${params.phase}
Type de repas demandé : ${typeRepasLabel}
Conseil pour cette phase : ${params.conseilAlim}
${macrosInfo}

Profil alimentaire :
- J'aime : ${likes}
- Je n'aime pas : ${dislikes}
- Allergies / intolérances : ${allergies}
- Temps de cuisine disponible : ${params.tempsCuisine} minutes maximum

Propose exactement 3 idées de ${typeRepasLabel} adaptées à ma phase et mon profil.
ÉVITE absolument les allergies et ce que je n'aime pas.
Les suggestions doivent correspondre au type de repas demandé (${typeRepasLabel}).

Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ni après :
[
  {
    "nom": "nom du plat",
    "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
    "temps": 20,
    "raison": "pourquoi ce plat est idéal pour ta phase (1-2 phrases)"
  }
]`
}

export async function POST(request: Request) {
  try {
    const corps: CorpsRequete = await request.json()

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: construirePrompt(corps) }],
    })

    const contenu = message.content[0]
    if (contenu.type !== 'text') throw new Error('Type de réponse inattendu')

    // Extrait le JSON de la réponse (au cas où Claude ajoute du texte autour)
    const jsonMatch = contenu.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('Pas de JSON dans la réponse')

    const suggestions: SuggestionPlat[] = JSON.parse(jsonMatch[0])
    return NextResponse.json({ suggestions })
  } catch (erreur) {
    console.error('Erreur suggestions IA:', erreur)
    return NextResponse.json(
      { error: 'Erreur lors de la génération des suggestions' },
      { status: 500 }
    )
  }
}
