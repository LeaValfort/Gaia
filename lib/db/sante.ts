import type { SupabaseClient } from '@supabase/supabase-js'
import { dateSuivante } from '@/lib/sante/rdv'
import type { ConditionSante, RdvSante, SanteProfil, TypeContraception } from '@/types'

/** Profil santé (sante_profil) et rendez-vous santé (rdv_sante). */

function log(fn: string, error: { message?: string; code?: string } | null) {
  if (error) console.error(fn, JSON.stringify({ message: error.message, code: error.code }))
}

export async function getSanteProfil(supabase: SupabaseClient, userId: string): Promise<SanteProfil | null> {
  const { data, error } = await supabase.from('sante_profil').select('*').eq('user_id', userId).maybeSingle()
  log('getSanteProfil', error)
  if (!data) return null
  const r = data as Record<string, unknown>
  return {
    user_id: userId,
    contraception: (r.contraception as TypeContraception) ?? 'aucune',
    date_pose: (r.date_pose as string | null) ?? null,
    duree_ans: (r.duree_ans as number | null) ?? null,
    dernier_controle: (r.dernier_controle as string | null) ?? null,
    conditions: Array.isArray(r.conditions) ? (r.conditions as ConditionSante[]) : [],
    updated_at: (r.updated_at as string) ?? '',
  }
}

export async function enregistrerSanteProfil(
  supabase: SupabaseClient,
  userId: string,
  maj: Partial<Omit<SanteProfil, 'user_id' | 'updated_at'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('sante_profil')
    .upsert({ user_id: userId, ...maj, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  log('enregistrerSanteProfil', error)
  return !error
}

export async function getRdvSante(supabase: SupabaseClient, userId: string): Promise<RdvSante[]> {
  const { data, error } = await supabase
    .from('rdv_sante')
    .select('*')
    .eq('user_id', userId)
    .eq('fait', false)
    .order('date')
  log('getRdvSante', error)
  return (data ?? []) as RdvSante[]
}

export async function creerRdvSante(
  supabase: SupabaseClient,
  userId: string,
  rdv: { titre: string; date: string; recurrence_mois: number | null; notes: string | null }
): Promise<RdvSante | null> {
  const { data, error } = await supabase
    .from('rdv_sante')
    .insert({ user_id: userId, ...rdv, titre: rdv.titre.trim() })
    .select('*')
    .maybeSingle()
  log('creerRdvSante', error)
  return (data as RdvSante | null) ?? null
}

/** `.select('id')` : détecte une suppression bloquée silencieusement par RLS. */
export async function supprimerRdvSante(supabase: SupabaseClient, id: string): Promise<boolean> {
  const { data, error } = await supabase.from('rdv_sante').delete().eq('id', id).select('id')
  log('supprimerRdvSante', error)
  return !error && (data?.length ?? 0) > 0
}

/**
 * RDV fait : s'il est récurrent, il est reporté à sa prochaine date ;
 * sinon il est marqué fait (et disparaît de la liste). Renvoie la ligne à jour.
 */
export async function marquerRdvFait(supabase: SupabaseClient, rdv: RdvSante): Promise<RdvSante | null> {
  const suivante = dateSuivante(rdv)
  const { data, error } = await supabase
    .from('rdv_sante')
    .update(suivante ? { date: suivante } : { fait: true })
    .eq('id', rdv.id)
    .select('*')
    .maybeSingle()
  log('marquerRdvFait', error)
  return (data as RdvSante | null) ?? null
}
