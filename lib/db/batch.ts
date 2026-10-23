import type { SupabaseClient } from '@supabase/supabase-js'
import { parseDeroule } from '@/lib/ia/batch-cooking'
import type { DerouleBatch, SessionBatch } from '@/types'

/** Sessions de batch cooking (table batch_sessions, une par semaine). */

function log(fn: string, error: { message?: string; code?: string } | null) {
  if (error) console.error(fn, JSON.stringify({ message: error.message, code: error.code }))
}

function versSession(r: Record<string, unknown>): SessionBatch {
  return {
    id: r.id as string,
    user_id: r.user_id as string,
    week_start: r.week_start as string,
    recette_ids: (r.recette_ids as string[] | null) ?? [],
    deroule: parseDeroule(r.deroule),
    faits: (r.faits as string[] | null) ?? [],
    updated_at: (r.updated_at as string) ?? '',
  }
}

export async function getSessionBatch(supabase: SupabaseClient, userId: string, weekStart: string): Promise<SessionBatch | null> {
  const { data, error } = await supabase
    .from('batch_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()
  log('getSessionBatch', error)
  return data ? versSession(data as Record<string, unknown>) : null
}

/** Crée ou remplace la session de la semaine (nouveau déroulé = étapes décochées). */
export async function enregistrerSessionBatch(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string,
  recetteIds: string[],
  deroule: DerouleBatch
): Promise<{ session: SessionBatch | null; message?: string }> {
  const { data, error } = await supabase
    .from('batch_sessions')
    .upsert(
      { user_id: userId, week_start: weekStart, recette_ids: recetteIds, deroule, faits: [], updated_at: new Date().toISOString() },
      { onConflict: 'user_id,week_start' }
    )
    .select('*')
    .maybeSingle()
  log('enregistrerSessionBatch', error)
  return { session: data ? versSession(data as Record<string, unknown>) : null, message: error?.message }
}

export async function majEtapesFaites(supabase: SupabaseClient, sessionId: string, faits: string[]): Promise<boolean> {
  const { data, error } = await supabase
    .from('batch_sessions')
    .update({ faits, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select('id')
  log('majEtapesFaites', error)
  return !error && (data?.length ?? 0) > 0
}
