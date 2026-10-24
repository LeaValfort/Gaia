import type { CriteresSeance, SeanceGeneree } from '@/types'

/** Appel navigateur → génération d'une séance par l'IA. Lève une erreur lisible. */
export async function demanderSeanceGeneree(criteres: CriteresSeance): Promise<SeanceGeneree> {
  const rep = await fetch('/api/sport/generer-seance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(criteres),
  })
  const data = (await rep.json().catch(() => ({}))) as { seance?: SeanceGeneree; erreur?: string }
  if (!rep.ok || !data.seance) throw new Error(data.erreur ?? 'Création impossible')
  return data.seance
}
