import type { SupabaseClient } from '@supabase/supabase-js'
import type { EnseigneDB, Rayon } from '@/types'

export interface EnseigneCreateData {
  label: string
  emoji: string
  couleur: string
  rayons: Rayon[]
  mots_cles: string[]
}

export type EnseigneUpdateData = Partial<EnseigneCreateData>

/** Génère un identifiant stable à partir du nom (slug + suffixe pour éviter les collisions). */
function genererIdEnseigne(label: string): string {
  const slug = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return `${slug || 'enseigne'}_${Date.now().toString(36)}`
}

/** Récupère les enseignes de courses de l'utilisatrice (défaut + perso), triées par ordre d'affichage. */
export async function getEnseignes(supabase: SupabaseClient, userId: string): Promise<EnseigneDB[]> {
  try {
    const { data, error } = await supabase
      .from('shopping_enseignes')
      .select('*')
      .eq('user_id', userId)
      .order('ordre', { ascending: true })

    if (error) throw error
    return (data ?? []) as EnseigneDB[]
  } catch (erreur) {
    console.error('Erreur getEnseignes:', erreur)
    return []
  }
}

/** Crée une nouvelle enseigne, ajoutée à la fin de l'ordre d'affichage. */
export async function createEnseigne(
  supabase: SupabaseClient,
  userId: string,
  data: EnseigneCreateData,
  ordreActuelMax: number
): Promise<EnseigneDB | null> {
  try {
    const id = genererIdEnseigne(data.label)
    const { data: row, error } = await supabase
      .from('shopping_enseignes')
      .insert({ id, user_id: userId, ordre: ordreActuelMax + 1, ...data })
      .select()
      .single()

    if (error) throw error
    return row as EnseigneDB
  } catch (erreur) {
    console.error('Erreur createEnseigne:', erreur)
    return null
  }
}

/** Modifie une enseigne existante (nom, emoji, couleur, rayons, mots-clés). */
export async function updateEnseigne(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  data: EnseigneUpdateData
): Promise<boolean> {
  try {
    const { data: rows, error } = await supabase
      .from('shopping_enseignes')
      .update(data)
      .eq('user_id', userId)
      .eq('id', id)
      .select('id')

    if (error) throw error
    return (rows?.length ?? 0) > 0
  } catch (erreur) {
    console.error('Erreur updateEnseigne:', erreur)
    return false
  }
}

export interface ResultatSuppressionEnseigne {
  ok: boolean
  /** Nombre d'articles de courses encore rangés dans cette enseigne, si la suppression a été bloquée. */
  nbArticlesBloquants: number
}

/**
 * Supprime une enseigne. Bloquée si des articles de courses (semaine en cours
 * ou passées) y sont encore rangés, pour ne jamais faire disparaître un article
 * silencieusement — il faut d'abord le déplacer vers une autre enseigne.
 */
export async function deleteEnseigne(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<ResultatSuppressionEnseigne> {
  try {
    // "grande_surface" est aussi le rayon de repli pour les articles sans enseigne
    // (enseigne = null, ex. ajoutés manuellement sans en choisir une) : sa suppression
    // doit être bloquée par ces articles-là aussi, sinon ils deviendraient invisibles.
    let requete = supabase
      .from('shopping_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    requete = id === 'grande_surface'
      ? requete.or(`enseigne.eq.${id},enseigne.is.null`)
      : requete.eq('enseigne', id)
    const { count, error: erreurComptage } = await requete

    if (erreurComptage) throw erreurComptage
    if ((count ?? 0) > 0) return { ok: false, nbArticlesBloquants: count ?? 0 }

    const { data: rows, error } = await supabase
      .from('shopping_enseignes')
      .delete()
      .eq('user_id', userId)
      .eq('id', id)
      .select('id')

    if (error) throw error
    return { ok: (rows?.length ?? 0) > 0, nbArticlesBloquants: 0 }
  } catch (erreur) {
    console.error('Erreur deleteEnseigne:', erreur)
    return { ok: false, nbArticlesBloquants: 0 }
  }
}
