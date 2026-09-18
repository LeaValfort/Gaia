import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  JourSemaine,
  NouvellePlanningSportEntry,
  PlanningSportEntry,
  TypeActivite,
  TypeVarianteSport,
} from '@/types'

function parseEntree(row: Record<string, unknown>): PlanningSportEntry {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    jour_semaine: row.jour_semaine as JourSemaine,
    type_seance: row.type_seance as TypeVarianteSport | 'autre',
    variante_id: typeof row.variante_id === 'string' ? row.variante_id : null,
    activite_type: typeof row.activite_type === 'string' ? (row.activite_type as TypeActivite) : null,
    intervalle_semaines: typeof row.intervalle_semaines === 'number' ? row.intervalle_semaines : 1,
    decalage_semaine: typeof row.decalage_semaine === 'number' ? row.decalage_semaine : 0,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

/** Toutes les séances planifiées de l'utilisatrice, tous jours confondus. */
export async function getEntreesPlanning(
  supabase: SupabaseClient,
  userId: string
): Promise<PlanningSportEntry[]> {
  try {
    const { data, error } = await supabase
      .from('planning_sport_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map((r) => parseEntree(r as Record<string, unknown>))
  } catch (e) {
    console.error('getEntreesPlanning', e)
    return []
  }
}

/** Ajoute une nouvelle séance planifiée. */
export async function creerEntreePlanning(
  supabase: SupabaseClient,
  userId: string,
  entree: NouvellePlanningSportEntry
): Promise<PlanningSportEntry | null> {
  try {
    const { data, error } = await supabase
      .from('planning_sport_entries')
      .insert({
        user_id: userId,
        jour_semaine: entree.jour_semaine,
        type_seance: entree.type_seance,
        variante_id: entree.variante_id ?? null,
        activite_type: entree.activite_type ?? null,
        intervalle_semaines: entree.intervalle_semaines ?? 1,
        decalage_semaine: entree.decalage_semaine ?? 0,
      })
      .select('*')
      .single()
    if (error) throw error
    return parseEntree(data as Record<string, unknown>)
  } catch (e) {
    console.error('creerEntreePlanning', e)
    return null
  }
}

/** Modifie une séance planifiée existante (programme, activité ou récurrence). */
export async function modifierEntreePlanning(
  supabase: SupabaseClient,
  entreeId: string,
  updates: Partial<NouvellePlanningSportEntry>
): Promise<boolean> {
  try {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if ('variante_id' in updates) patch.variante_id = updates.variante_id ?? null
    if ('activite_type' in updates) patch.activite_type = updates.activite_type ?? null
    if (updates.intervalle_semaines != null) patch.intervalle_semaines = updates.intervalle_semaines
    if (updates.decalage_semaine != null) patch.decalage_semaine = updates.decalage_semaine
    const { error } = await supabase.from('planning_sport_entries').update(patch).eq('id', entreeId)
    if (error) throw error
    return true
  } catch (e) {
    console.error('modifierEntreePlanning', e)
    return false
  }
}

/** Supprime une séance planifiée. */
export async function supprimerEntreePlanning(
  supabase: SupabaseClient,
  entreeId: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from('planning_sport_entries').delete().eq('id', entreeId)
    if (error) throw error
    return true
  } catch (e) {
    console.error('supprimerEntreePlanning', e)
    return false
  }
}
