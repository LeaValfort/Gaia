import type { SupabaseClient } from '@supabase/supabase-js'
import type { ExerciceCustom, LieuVariante, SportVariante, TypeVarianteSport } from '@/types'

/** Contenu initial ou mis à jour d'une variante (selon le sport concerné). */
export interface ContenuVariante {
  exercices?: ExerciceCustom[]
  niveauNatation?: number
}

function parseVariante(row: Record<string, unknown>): SportVariante {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    type_seance: row.type_seance as TypeVarianteSport,
    lieu: row.lieu as LieuVariante,
    nom: String(row.nom),
    est_active: row.est_active === true,
    exercices: Array.isArray(row.exercices) ? (row.exercices as ExerciceCustom[]) : null,
    niveau_natation: typeof row.niveau_natation === 'number' ? row.niveau_natation : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

/** Toutes les variantes enregistrées pour ce sport (et ce lieu pour la muscu). */
export async function getVariantes(
  supabase: SupabaseClient,
  userId: string,
  typeSeance: TypeVarianteSport,
  lieu: LieuVariante
): Promise<SportVariante[]> {
  try {
    const { data, error } = await supabase
      .from('sport_variantes')
      .select('*')
      .eq('user_id', userId)
      .eq('type_seance', typeSeance)
      .eq('lieu', lieu)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map((r) => parseVariante(r as Record<string, unknown>))
  } catch (e) {
    console.error('getVariantes', e)
    return []
  }
}

/** Crée une nouvelle variante nommée avec son contenu initial, et l'active aussitôt. */
export async function creerVariante(
  supabase: SupabaseClient,
  userId: string,
  typeSeance: TypeVarianteSport,
  lieu: LieuVariante,
  nom: string,
  contenu: ContenuVariante
): Promise<SportVariante | null> {
  try {
    await supabase
      .from('sport_variantes')
      .update({ est_active: false })
      .eq('user_id', userId)
      .eq('type_seance', typeSeance)
      .eq('lieu', lieu)
    const { data, error } = await supabase
      .from('sport_variantes')
      .insert({
        user_id: userId,
        type_seance: typeSeance,
        lieu,
        nom,
        est_active: true,
        exercices: contenu.exercices ?? null,
        niveau_natation: contenu.niveauNatation ?? null,
      })
      .select('*')
      .single()
    if (error) throw error
    return parseVariante(data as Record<string, unknown>)
  } catch (e) {
    console.error('creerVariante', e)
    return null
  }
}

/** Active une variante (bascule l'onglet) ; `varianteId` null = revenir aux réglages par défaut. */
export async function activerVariante(
  supabase: SupabaseClient,
  userId: string,
  typeSeance: TypeVarianteSport,
  lieu: LieuVariante,
  varianteId: string | null
): Promise<boolean> {
  try {
    await supabase
      .from('sport_variantes')
      .update({ est_active: false })
      .eq('user_id', userId)
      .eq('type_seance', typeSeance)
      .eq('lieu', lieu)
    if (varianteId) {
      const { error } = await supabase.from('sport_variantes').update({ est_active: true }).eq('id', varianteId)
      if (error) throw error
    }
    return true
  } catch (e) {
    console.error('activerVariante', e)
    return false
  }
}

export async function renommerVariante(
  supabase: SupabaseClient,
  varianteId: string,
  nom: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from('sport_variantes').update({ nom }).eq('id', varianteId)
    if (error) throw error
    return true
  } catch (e) {
    console.error('renommerVariante', e)
    return false
  }
}

export async function supprimerVariante(supabase: SupabaseClient, varianteId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('sport_variantes').delete().eq('id', varianteId)
    if (error) throw error
    return true
  } catch (e) {
    console.error('supprimerVariante', e)
    return false
  }
}

/** Met à jour le contenu d'une variante existante (exercices ou niveau natation). */
export async function mettreAJourContenuVariante(
  supabase: SupabaseClient,
  varianteId: string,
  contenu: ContenuVariante
): Promise<boolean> {
  try {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (contenu.exercices) patch.exercices = contenu.exercices
    if (contenu.niveauNatation != null) patch.niveau_natation = contenu.niveauNatation
    const { error } = await supabase.from('sport_variantes').update(patch).eq('id', varianteId)
    if (error) throw error
    return true
  } catch (e) {
    console.error('mettreAJourContenuVariante', e)
    return false
  }
}
