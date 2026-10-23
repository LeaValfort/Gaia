import type { DerouleBatch, Phase, RecetteGeneree } from '@/types'

/** Appels navigateur → routes serveur du batch cooking. */

export async function demanderDerouleBatch(recetteIds: string[]): Promise<DerouleBatch> {
  const rep = await fetch('/api/batch/deroule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recetteIds }),
  })
  const data = (await rep.json().catch(() => ({}))) as { deroule?: DerouleBatch; erreur?: string }
  if (!rep.ok || !data.deroule) throw new Error(data.erreur ?? 'Génération impossible')
  return data.deroule
}

/** 4 recettes qui partagent des bases communes (déjeuner ou dîner). */
export async function demanderRecettesLiees(opts: { phase: Phase; envie: string }): Promise<RecetteGeneree[]> {
  const params = new URLSearchParams({
    query: opts.envie,
    phase: opts.phase,
    typeRepas: 'dejeuner',
    typeJournee: 'repos',
    allergies: '',
    tempsMax: '60',
    avecIA: 'true',
    liees: 'true',
  })
  const rep = await fetch(`/api/recettes/generer?${params}`)
  const data = (await rep.json().catch(() => ({}))) as { generees?: RecetteGeneree[]; erreur?: string }
  if (!rep.ok) throw new Error(data.erreur ?? 'Génération impossible')
  return data.generees ?? []
}
