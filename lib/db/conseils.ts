'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import { getConseilsPhase } from '@/lib/cycle'
import type { ConseilsPhaseDetail } from '@/lib/data/conseils-phase-cycle'
import type { CategorieConseil, Conseil, Phase } from '@/types'

const CATEGORIES: CategorieConseil[] = ['sport', 'nutrition', 'sommeil', 'bien_etre', 'astuce']

/** Tous les conseils enregistrés pour une phase (toutes catégories confondues). */
export async function getConseilsBrutsParPhase(phase: Phase): Promise<Conseil[]> {
  try {
    const supabase = await creerClientServeur()
    const { data, error } = await supabase.from('conseils').select('*').eq('phase', phase)
    if (error) throw error
    return data ?? []
  } catch (erreur) {
    console.error('Erreur getConseilsBrutsParPhase:', erreur)
    return []
  }
}

/** Tous les conseils, toutes phases confondues (utilisé pour éviter les doublons à la génération IA). */
export async function getTousLesConseils(): Promise<Conseil[]> {
  try {
    const supabase = await creerClientServeur()
    const { data, error } = await supabase.from('conseils').select('*')
    if (error) throw error
    return data ?? []
  } catch (erreur) {
    console.error('Erreur getTousLesConseils:', erreur)
    return []
  }
}

/** Insère en base de nouveaux conseils (générés par l'IA ou ajoutés manuellement). */
export async function insererConseils(
  lignes: { phase: Phase; categorie: CategorieConseil; texte: string; source_id: string | null; genere_ia: boolean }[]
): Promise<void> {
  if (lignes.length === 0) return
  try {
    const supabase = await creerClientServeur()
    const { error } = await supabase.from('conseils').insert(lignes)
    if (error) throw error
  } catch (erreur) {
    console.error('Erreur insererConseils:', erreur)
  }
}

/** Seed d'un jour stable (change chaque jour) pour faire tourner les conseils sans les changer à chaque rafraîchissement. */
function seedDuJour(date: Date): number {
  return Math.floor(date.getTime() / 86_400_000)
}

function choisirTexte(
  conseilsParCategorie: Record<string, Conseil[]>,
  categorie: CategorieConseil,
  seed: number,
  decalage: number,
  repli: string
): string {
  const liste = conseilsParCategorie[categorie]
  if (!liste || liste.length === 0) return repli
  const idx = Math.abs(seed + decalage) % liste.length
  return liste[idx]?.texte ?? repli
}

/**
 * Conseils du jour pour une phase, avec rotation stable sur la journée.
 * Si aucun conseil n'est en base pour une catégorie (ex. juste après un déploiement
 * sans migration exécutée), on retombe sur les conseils statiques d'origine.
 */
export async function getConseilsPhaseDuJour(phase: Phase, date: Date): Promise<ConseilsPhaseDetail> {
  const repli = getConseilsPhase(phase)
  const conseils = await getConseilsBrutsParPhase(phase)
  if (conseils.length === 0) return repli

  const parCategorie: Record<string, Conseil[]> = {}
  for (const c of conseils) {
    ;(parCategorie[c.categorie] ??= []).push(c)
  }

  const seed = seedDuJour(date)
  return {
    sport: choisirTexte(parCategorie, 'sport', seed, 0, repli.sport),
    nutrition: choisirTexte(parCategorie, 'nutrition', seed, 1, repli.nutrition),
    sommeil: choisirTexte(parCategorie, 'sommeil', seed, 2, repli.sommeil),
    bienEtre: choisirTexte(parCategorie, 'bien_etre', seed, 3, repli.bienEtre),
    astuce: repli.astuce,
    anecdote: choisirTexte(parCategorie, 'astuce', seed, 4, repli.anecdote),
  }
}

export { CATEGORIES }
