import type { SupabaseClient } from '@supabase/supabase-js'

export type ActivitePlanifieeSport = 'muscu' | 'yoga' | 'natation' | 'repos' | 'autre'

const VALID = new Set<ActivitePlanifieeSport>(['muscu', 'yoga', 'natation', 'repos', 'autre'])

function parseJours(raw: unknown): Record<string, ActivitePlanifieeSport> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Record<string, ActivitePlanifieeSport> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === 'string' && VALID.has(v as ActivitePlanifieeSport)) {
      out[k] = v as ActivitePlanifieeSport
    }
  }
  return out
}

export interface PlanningSportSemaine {
  id: string
  user_id: string
  week_start: string
  jours: Record<string, ActivitePlanifieeSport>
  updated_at: string
}

export async function getPlanningSportSemaine(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string
): Promise<PlanningSportSemaine | null> {
  const { data, error } = await supabase
    .from('planning_sport_semaine')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()
  if (error || !data) return null
  const row = data as Record<string, unknown>
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    week_start: String(row.week_start).slice(0, 10),
    jours: parseJours(row.jours),
    updated_at: String(row.updated_at),
  }
}

export async function savePlanningSportSemaine(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string,
  jours: Record<string, ActivitePlanifieeSport>
): Promise<void> {
  const { error } = await supabase.from('planning_sport_semaine').upsert(
    {
      user_id: userId,
      week_start: weekStart,
      jours,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,week_start' }
  )
  if (error) throw error
}
