import Anthropic from '@anthropic-ai/sdk'
import { EXERCICES } from '@/lib/data/exercises'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import { POSTURES_CATALOGUE } from '@/lib/data/postures-catalogue'
import { PRESETS_NAGE } from '@/lib/data/swimming'
import { parseContenuSeanceLibre } from '@/lib/sport/seance-libre'
import type { BlocNatation, CriteresSeance, ExerciceCustom, Phase, PostureYoga, SeanceGeneree } from '@/types'

/** Génération d'une séance par l'IA à partir des réponses de l'assistant. Côté serveur uniquement. */

const CONSIGNE_PHASE: Record<Phase, string> = {
  menstruation: 'intensité douce, pas de gros volume, privilégier mobilité et mouvements confortables',
  folliculaire: 'énergie en hausse : on peut progresser (volume ou intensité un peu plus élevés)',
  ovulation: 'pic d’énergie : intensité possible, bien s’échauffer (articulations plus laxes)',
  luteale: 'énergie en baisse : intensité modérée, récupérations un peu plus longues',
}

function formatSport(c: CriteresSeance): string {
  switch (c.sport) {
    case 'muscu': {
      const lieu = c.lieu ?? 'maison'
      const noms = EXERCICES.filter((e) => e.lieu === 'both' || e.lieu === lieu).map((e) => e.nom).join(', ')
      return `Séance de musculation (${c.type_muscu === 'upper_lower' ? 'upper / lower' : 'full body'}, à la ${lieu}).
Utilise de préférence ces exercices (noms exacts) : ${noms}. Tu peux en ajouter d'autres avec un nom clair en français.
Format : { "nom": "...", "conseil": "...", "exercices": [{ "nom": "Squat", "series": 3, "reps": 12, "unite": "reps", "repos_sec": 60 }] }
"unite" vaut "reps" ou "secondes" (gainage…). 4 à 8 exercices.`
    }
    case 'natation':
      return `Séance de natation en piscine (bassin de 25 m), en blocs successifs.
"nage" vaut l'une de : ${PRESETS_NAGE.join(', ')} — ou un libellé court (ex. "Éducatif rattrapé", "Battements avec planche").
Distances en multiples de 25 m. Commence par un échauffement, termine par une récupération.
Format : { "nom": "...", "conseil": "...", "blocs": [{ "nage": "echauffement", "distance_m": 200 }] }`
    case 'yoga':
      return `Séance de yoga.
Utilise de préférence ces postures (noms exacts) : ${POSTURES_CATALOGUE.map((p) => p.nom).join(', ')}.
Format : { "nom": "...", "conseil": "...", "postures": [{ "nom": "...", "duree_sec": 60, "benefice": "une courte phrase" }] }`
    case 'libre':
      return `Séance de ${c.sport_libre ?? 'sport'}, décrite en lignes. Types de lignes possibles :
- { "type": "exercice", "nom": "...", "series": 3, "reps": 12, "unite": "reps" | "secondes", "charge_kg": null }
- { "type": "bloc", "nom": "Footing", "series": 1, "duree_min": 10, "distance_m": null }
- { "type": "mouvement", "nom": "...", "series": 2, "duree_sec": 45 }
- { "type": "intervalles", "nom": "Fractionné", "tours": 6, "effort_sec": 60, "recup_sec": 90 }
- { "type": "circuit", "nom": "...", "tours": 3, "repos_sec": 60, "mouvements": [{ "nom": "...", "duree_sec": 30, "reps": null }] }
Format : { "nom": "...", "conseil": "...", "lignes": [ ... ] }`
  }
}

function construirePrompt(c: CriteresSeance): string {
  const criteres = [
    `Objectif : ${c.objectif || 'non précisé'}`,
    `Niveau : ${c.niveau || 'intermédiaire'}`,
    `Durée visée : environ ${c.duree_min} min (échauffement compris)`,
    c.materiel.length ? `Matériel disponible : ${c.materiel.join(', ')}` : null,
    c.zones.length ? `Zones à travailler : ${c.zones.join(', ')}` : null,
    c.envies.trim() ? `Envies / à éviter : ${c.envies.trim()}` : null,
    c.phase ? `Phase du cycle : ${PHASES_DESIGN[c.phase].label} — ${CONSIGNE_PHASE[c.phase]}` : null,
  ].filter(Boolean)

  return `Tu es une coach sportive bienveillante qui crée une séance pour une femme qui suit son cycle menstruel.

${criteres.join('\n')}

${formatSport(c)}

Le "nom" est court (2 à 4 mots). Le "conseil" tient en une phrase.
Réponds UNIQUEMENT avec l'objet JSON, sans texte avant ni après.`
}

const num = (v: unknown, min: number, max: number): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : null
const txt = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const liste = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object') : []

/** Lecture prudente de la réponse : seules les entrées valides sont gardées. */
export function parseSeanceGeneree(raw: unknown): SeanceGeneree | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const exercices: ExerciceCustom[] = liste(o.exercices).flatMap((x, i) => {
    const nom = txt(x.nom)
    if (!nom) return []
    const unite = x.unite === 'secondes' ? 'secondes' : 'reps'
    return [{ nom, seriesDefaut: num(x.series, 1, 10) ?? 3, repsDefaut: num(x.reps, 1, 300) ?? 10, unite, reposSecondes: num(x.repos_sec, 0, 600) ?? 60, ordre: i }]
  })
  const blocs: BlocNatation[] = liste(o.blocs).flatMap((x) => {
    const nage = txt(x.nage)
    const d = num(x.distance_m, 25, 3000)
    return nage && d ? [{ nage, distanceM: Math.round(d / 25) * 25 }] : []
  })
  const postures: PostureYoga[] = liste(o.postures).flatMap((x) => {
    const nom = txt(x.nom)
    if (!nom) return []
    const cat = POSTURES_CATALOGUE.find((p) => p.nom.toLowerCase() === nom.toLowerCase())
    return [{ nom: cat?.nom ?? nom, dureeSec: num(x.duree_sec, 10, 900) ?? 60, benefice: txt(x.benefice) || cat?.benefice || '', ...(cat?.categorie ? { categorie: cat.categorie } : {}) }]
  })
  const lignes = parseContenuSeanceLibre(o.lignes).filter((l) => l.nom)
  if (!exercices.length && !blocs.length && !postures.length && !lignes.length) return null
  return { nom: txt(o.nom) || 'Ma séance', conseil: txt(o.conseil), exercices, blocs, postures, lignes }
}

export async function genererSeance(c: CriteresSeance): Promise<SeanceGeneree | null> {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: construirePrompt(c) }],
    })
    const contenu = message.content[0]
    if (contenu.type !== 'text') throw new Error('Type de réponse inattendu')
    const json = contenu.text.match(/\{[\s\S]*\}/)
    if (!json) throw new Error('Pas de JSON dans la réponse')
    return parseSeanceGeneree(JSON.parse(json[0]))
  } catch (erreur) {
    const e = erreur as { status?: number; message?: string }
    console.error('Erreur genererSeance:', JSON.stringify({ status: e?.status, message: e?.message }))
    return null
  }
}
