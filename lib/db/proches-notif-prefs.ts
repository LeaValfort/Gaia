import type { SupabaseClient } from '@supabase/supabase-js'

/** Récap quotidien des proches (côté personne qui reçoit) : actif par défaut. */
export async function getRecapActif(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase.from('proches_notif_prefs').select('recap_actif').eq('user_id', userId).maybeSingle()
  return (data as { recap_actif?: boolean } | null)?.recap_actif !== false
}

export async function setRecapActif(supabase: SupabaseClient, userId: string, actif: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('proches_notif_prefs')
    .upsert({ user_id: userId, recap_actif: actif, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) console.error('setRecapActif', JSON.stringify({ message: error.message, code: error.code }))
  return !error
}
