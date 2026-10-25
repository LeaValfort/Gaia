import Anthropic from '@anthropic-ai/sdk'

/**
 * Point d'entrée unique vers l'IA, côté serveur uniquement.
 * 1. Groq (gratuit, modèle Llama) si GROQ_API_KEY est définie ;
 * 2. sinon, ou si Groq échoue (limite gratuite atteinte, panne, JSON illisible),
 *    Claude Haiku en secours si ANTHROPIC_API_KEY est définie.
 */

const MODELE_GROQ = 'llama-3.3-70b-versatile'
const MODELE_CLAUDE = 'claude-haiku-4-5-20251001'
const DELAI_GROQ_MS = 45_000

async function texteGroq(prompt: string, maxTokens: number): Promise<string> {
  const cle = process.env.GROQ_API_KEY
  if (!cle) throw new Error('GROQ_API_KEY absente')
  const rep = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODELE_GROQ,
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'Tu réponds en français. Quand on te demande du JSON, tu renvoies uniquement du JSON valide, sans texte autour ni balises Markdown.' },
        { role: 'user', content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(DELAI_GROQ_MS),
  })
  if (!rep.ok) throw new Error(`Groq ${rep.status} : ${(await rep.text()).slice(0, 200)}`)
  const data = (await rep.json()) as { choices?: { message?: { content?: string } }[] }
  const texte = data.choices?.[0]?.message?.content
  if (!texte) throw new Error('Groq : réponse vide')
  return texte
}

async function texteClaude(prompt: string, maxTokens: number): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY absente')
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({ model: MODELE_CLAUDE, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] })
  const contenu = message.content[0]
  if (contenu.type !== 'text') throw new Error('Claude : réponse inattendue')
  return contenu.text
}

/**
 * Demande une réponse à l'IA et la fait lire par `lire` (qui renvoie null si
 * elle est inutilisable, ex. JSON invalide). Groq d'abord, Claude en secours.
 * Lève une erreur si aucun fournisseur ne donne de réponse utilisable.
 */
export async function demanderIA<T>(prompt: string, maxTokens: number, lire: (texte: string) => T | null): Promise<T> {
  const fournisseurs: { nom: string; appel: () => Promise<string> }[] = [
    ...(process.env.GROQ_API_KEY ? [{ nom: 'groq', appel: () => texteGroq(prompt, maxTokens) }] : []),
    ...(process.env.ANTHROPIC_API_KEY ? [{ nom: 'claude', appel: () => texteClaude(prompt, maxTokens) }] : []),
  ]
  const erreurs: string[] = []
  for (const f of fournisseurs) {
    try {
      const resultat = lire(await f.appel())
      if (resultat != null) return resultat
      erreurs.push(`${f.nom} : réponse illisible`)
    } catch (e) {
      erreurs.push(`${f.nom} : ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  console.error('demanderIA', JSON.stringify(erreurs))
  throw new Error(fournisseurs.length ? 'IA indisponible' : 'Aucune clé IA configurée')
}

/** Extrait et parse le premier objet `{…}` ou tableau `[…]` JSON d'un texte (null si absent ou invalide). */
export function extraireJson(texte: string, forme: 'objet' | 'tableau'): unknown {
  const m = texte.match(forme === 'objet' ? /\{[\s\S]*\}/ : /\[[\s\S]*\]/)
  if (!m) return null
  try {
    return JSON.parse(m[0])
  } catch {
    return null
  }
}
