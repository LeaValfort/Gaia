import type { Phase, RecetteGeneree, TypeRepas } from '@/types'

/**
 * Appelle le moteur de recettes (route /api/recettes/generer) depuis le navigateur :
 * suggestions IA à partir d'un ingrédient ou d'une envie (« saumon », « curry »…).
 */
export async function chercherRecettesIA(opts: {
  recherche: string
  typeRepas: TypeRepas
  phase: Phase
}): Promise<RecetteGeneree[]> {
  const params = new URLSearchParams({
    query: opts.recherche,
    typeRepas: opts.typeRepas,
    phase: opts.phase,
    typeJournee: 'repos',
    allergies: '',
    tempsMax: '45',
    avecIA: 'true',
  })
  const rep = await fetch(`/api/recettes/generer?${params}`)
  if (!rep.ok) throw new Error('Le moteur de recettes ne répond pas.')
  const data = (await rep.json()) as { generees?: RecetteGeneree[]; erreur?: string }
  if (data.erreur) throw new Error(data.erreur)
  return data.generees ?? []
}
