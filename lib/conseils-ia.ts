'use server'

import Anthropic from '@anthropic-ai/sdk'
import { getUserPreferences, updateUserPreferences } from '@/lib/db/parametres'
import { getSources } from '@/lib/db/sources'
import { getTousLesConseils, insererConseils } from '@/lib/db/conseils'
import type { CategorieConseil, Phase } from '@/types'

const PHASES: Phase[] = ['menstruation', 'folliculaire', 'ovulation', 'luteale']
const CATEGORIES: CategorieConseil[] = ['sport', 'nutrition', 'sommeil', 'bien_etre', 'astuce']
const INTERVALLE_JOURS = 14

interface ConseilGenere {
  phase: string
  categorie: string
  texte: string
  source_titre: string | null
}

function joursDepuis(dateISO: string | null | undefined): number {
  if (!dateISO) return Infinity
  return (Date.now() - new Date(dateISO).getTime()) / 86_400_000
}

function construirePrompt(
  sources: { titre: string; url: string }[],
  existantsParCle: Record<string, string[]>
): string {
  const sourcesTexte = sources.map((s) => `- "${s.titre}"`).join('\n')
  const existantsTexte =
    Object.entries(existantsParCle)
      .map(([cle, textes]) => `${cle} : ${textes.map((t) => `"${t}"`).join(' / ')}`)
      .join('\n') || '(aucun pour le moment)'

  return `Tu écris des conseils courts (1 à 2 phrases, en français, ton bienveillant et non médical) pour Gaia, une application personnelle de suivi de cycle menstruel, sport, nutrition et bien-être.

Pour CHACUNE des 4 phases (menstruation, folliculaire, ovulation, luteale) et CHACUNE des 5 catégories (sport, nutrition, sommeil, bien_etre, astuce), écris UN nouveau conseil, différent des conseils déjà existants listés ci-dessous (ne les répète pas, varie la formulation et l'angle abordé).

Conseils déjà existants (à ne pas reformuler à l'identique) :
${existantsTexte}

RÈGLE ABSOLUE sur les sources : si ton conseil contient une affirmation scientifique ou factuelle (effet d'une hormone, d'un nutriment, etc.), tu DOIS citer le titre EXACT d'une des sources listées ci-dessous en le recopiant mot pour mot dans "source_titre". N'invente JAMAIS une source, un titre ou une étude qui n'est pas dans cette liste. Si le conseil est pratique/subjectif et ne contient aucune affirmation à vérifier (ex: "bois une tisane"), mets "source_titre": null.

Sources disponibles (à recopier mot pour mot si utilisées, jamais reformulées) :
${sourcesTexte}

Réponds UNIQUEMENT avec un tableau JSON de exactement 20 objets (4 phases x 5 catégories), sans texte avant ni après :
[{"phase":"menstruation","categorie":"sport","texte":"...","source_titre":"..."}, ...]`
}

/**
 * Génère de nouveaux conseils via l'API Claude si la dernière génération remonte
 * à plus de 14 jours (ou n'a jamais eu lieu). Échoue silencieusement : un souci
 * réseau/JSON ne doit jamais casser l'affichage de la page.
 */
export async function genererNouveauxConseilsSiNecessaire(): Promise<void> {
  try {
    const prefs = await getUserPreferences()
    if (!prefs) return
    if (joursDepuis(prefs.conseils_generes_le) < INTERVALLE_JOURS) return

    const [sources, existants] = await Promise.all([getSources(), getTousLesConseils()])
    if (sources.length === 0) return // migration/seed pas encore exécutée : on attend

    const existantsParCle: Record<string, string[]> = {}
    for (const c of existants) {
      const cle = `${c.phase}/${c.categorie}`
      ;(existantsParCle[cle] ??= []).push(c.texte)
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: construirePrompt(sources, existantsParCle) }],
    })

    const contenu = message.content[0]
    if (contenu.type !== 'text') throw new Error('Réponse inattendue de Claude')
    const jsonMatch = contenu.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('Pas de JSON dans la réponse')

    const genes = JSON.parse(jsonMatch[0]) as ConseilGenere[]
    const sourceIdParTitre = new Map(sources.map((s) => [s.titre, s.id]))

    const lignes = genes
      .filter(
        (g): g is ConseilGenere =>
          PHASES.includes(g.phase as Phase) &&
          CATEGORIES.includes(g.categorie as CategorieConseil) &&
          typeof g.texte === 'string' &&
          g.texte.trim().length > 0
      )
      .map((g) => ({
        phase: g.phase as Phase,
        categorie: g.categorie as CategorieConseil,
        texte: g.texte.trim(),
        source_id: g.source_titre ? sourceIdParTitre.get(g.source_titre) ?? null : null,
        genere_ia: true,
      }))

    await insererConseils(lignes)
    await updateUserPreferences({ conseils_generes_le: new Date().toISOString().slice(0, 10) })
  } catch (erreur) {
    console.error('Erreur genererNouveauxConseilsSiNecessaire:', erreur)
  }
}
