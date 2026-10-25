import type { SupabaseClient } from '@supabase/supabase-js'
import type { ReglagesPilule } from '@/types'

/** Suivi de la pilule : réglage du rappel et prises cochées. Les écritures renvoient leur erreur. */

export const REGLAGES_PILULE_DEFAUT: ReglagesPilule = { rappel_actif: false, heure: '21:00' }

export async function getReglagesPilule(supabase: SupabaseClient, userId: string): Promise<ReglagesPilule> {
  const { data, error } = await supabase.from('pilule_reglages').select('rappel_actif, heure').eq('user_id', userId).maybeSingle()
  if (error) console.error('getReglagesPilule', JSON.stringify({ message: error.message }))
  return data ? { rappel_actif: data.rappel_actif === true, heure: String(data.heure ?? '21:00') } : REGLAGES_PILULE_DEFAUT
}

export async function enregistrerReglagesPilule(supabase: SupabaseClient, userId: string, r: ReglagesPilule): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase
    .from('pilule_reglages')
    .upsert({ user_id: userId, rappel_actif: r.rappel_actif, heure: r.heure, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  return error ? { ok: false, message: error.message } : { ok: true }
}

/** Dates (yyyy-MM-dd) des prises depuis `depuis` inclus, avec l'heure de prise. */
export async function getPrisesPilule(supabase: SupabaseClient, userId: string, depuis: string): Promise<Map<string, string>> {
  const { data, error } = await supabase.from('prises_pilule').select('date, prise_at').eq('user_id', userId).gte('date', depuis)
  if (error) console.error('getPrisesPilule', JSON.stringify({ message: error.message }))
  return new Map((data ?? []).map((p) => [String(p.date), String(p.prise_at)]))
}

export async function marquerPrisePilule(supabase: SupabaseClient, userId: string, date: string, prise: boolean): Promise<{ ok: boolean; message?: string }> {
  const { error } = prise
    ? await supabase.from('prises_pilule').upsert({ user_id: userId, date, prise_at: new Date().toISOString() }, { onConflict: 'user_id,date' })
    : await supabase.from('prises_pilule').delete().eq('user_id', userId).eq('date', date)
  return error ? { ok: false, message: error.message } : { ok: true }
}
