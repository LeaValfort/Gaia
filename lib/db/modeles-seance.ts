import type { SupabaseClient } from '@supabase/supabase-js'
import { parseContenuSeanceLibre } from '@/lib/sport/seance-libre'
import type { ActivityLog, LigneSeanceLibre, ModeleSeance, TypeActivite } from '@/types'

/** Modèles de séance libre (table modeles_seance) + lecture d'une activité. */

function versModele(r: Record<string, unknown>): ModeleSeance {
  return {
    id: r.id as string,
    user_id: r.user_id as string,
    nom: r.nom as string,
    sport_type: r.sport_type as TypeActivite,
    sport_name: (r.sport_name as string | null) ?? null,
    contenu: parseContenuSeanceLibre(r.contenu),
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
  }
}

export async function getModelesSeance(supabase: SupabaseClient, userId: string): Promise<ModeleSeance[]> {
  const { data, error } = await supabase
    .from('modeles_seance')
    .select('*')
    .eq('user_id', userId)
    .order('nom')
  if (error) {
    console.error('getModelesSeance', JSON.stringify({ message: error.message, code: error.code }))
    return []
  }
  return (data ?? []).map((r) => versModele(r as Record<string, unknown>))
}

/** Crée ou remplace (même nom) un modèle. Renvoie le modèle enregistré, ou null. */
export async function enregistrerModeleSeance(
  supabase: SupabaseClient,
  userId: string,
  modele: { nom: string; sport_type: TypeActivite; sport_name: string | null; contenu: LigneSeanceLibre[] }
): Promise<ModeleSeance | null> {
  const { data, error } = await supabase
    .from('modeles_seance')
    .upsert(
      { user_id: userId, ...modele, nom: modele.nom.trim(), updated_at: new Date().toISOString() },
      { onConflict: 'user_id,nom' }
    )
    .select('*')
    .maybeSingle()
  if (error || !data) {
    console.error('enregistrerModeleSeance', JSON.stringify({ message: error?.message, code: error?.code }))
    return null
  }
  return versModele(data as Record<string, unknown>)
}

/** `.select('id')` : détecte une suppression bloquée silencieusement par RLS. */
export async function supprimerModeleSeance(supabase: SupabaseClient, id: string): Promise<boolean> {
  const { data, error } = await supabase.from('modeles_seance').delete().eq('id', id).select('id')
  return !error && (data?.length ?? 0) > 0
}

/** Une activité « autre sport », pour la rouvrir en modification. */
export async function getActiviteParId(supabase: SupabaseClient, id: string): Promise<ActivityLog | null> {
  const { data, error } = await supabase.from('activity_logs').select('*').eq('id', id).maybeSingle()
  if (error || !data) return null
  const r = data as Record<string, unknown>
  return { ...(r as unknown as ActivityLog), contenu: parseContenuSeanceLibre(r.contenu) }
}
