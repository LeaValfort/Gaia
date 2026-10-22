import type { SupabaseClient } from '@supabase/supabase-js'
import { getSportConfig } from '@/lib/data/sportsConfig'
import type { TypeActivite, TypeSeance } from '@/types'

/**
 * Historique des séances (muscu/natation/yoga dans `workouts` + autres sports
 * dans `activity_logs`), fusionné et trié du plus récent au plus ancien.
 */
export interface SeanceHistorique {
  id: string
  source: 'workout' | 'activite'
  date: string
  type: TypeSeance
  libelle: string
  duration_min: number | null
  created_at: string
}

const LIBELLE_WORKOUT: Record<string, string> = {
  muscu: 'Muscu',
  natation: 'Natation',
  yoga: 'Yoga',
}

export async function getDernieresSeances(
  supabase: SupabaseClient,
  userId: string,
  limite = 8
): Promise<SeanceHistorique[]> {
  const [w, a] = await Promise.all([
    supabase
      .from('workouts')
      .select('id, date, type, duration_min, created_at')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limite),
    supabase
      .from('activity_logs')
      .select('id, date, sport_type, sport_name, duration_min, created_at')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limite),
  ])
  if (w.error) throw new Error(w.error.message)
  if (a.error) throw new Error(a.error.message)

  const workouts: SeanceHistorique[] = (w.data ?? []).map((r) => ({
    id: r.id as string,
    source: 'workout',
    date: r.date as string,
    type: r.type as TypeSeance,
    libelle: LIBELLE_WORKOUT[r.type as string] ?? 'Autre',
    duration_min: (r.duration_min as number | null) ?? null,
    created_at: (r.created_at as string) ?? '',
  }))
  const activites: SeanceHistorique[] = (a.data ?? []).map((r) => ({
    id: r.id as string,
    source: 'activite',
    date: r.date as string,
    type: 'autre',
    libelle:
      (r.sport_name as string | null)?.trim() || getSportConfig(r.sport_type as TypeActivite).nom,
    duration_min: (r.duration_min as number | null) ?? null,
    created_at: (r.created_at as string) ?? '',
  }))

  // Tri par date puis par heure de création (deux séances le même jour).
  return [...workouts, ...activites]
    .sort((x, y) => (x.date === y.date ? y.created_at.localeCompare(x.created_at) : y.date.localeCompare(x.date)))
    .slice(0, limite)
}

/**
 * Supprime une séance. Les lignes enfants (séries, blocs natation) sont supprimées
 * explicitement avant la séance : on ne se fie pas au ON DELETE CASCADE, déjà vu
 * différent en base de ce qui est versionné. Le `.select('id')` détecte une
 * suppression bloquée silencieusement par une policy RLS (0 ligne touchée).
 */
export async function supprimerSeanceHistorique(
  supabase: SupabaseClient,
  seance: Pick<SeanceHistorique, 'id' | 'source'>
): Promise<boolean> {
  if (seance.source === 'activite') {
    const { data, error } = await supabase.from('activity_logs').delete().eq('id', seance.id).select('id')
    return !error && (data?.length ?? 0) > 0
  }
  const [sets, swims] = await Promise.all([
    supabase.from('workout_sets').delete().eq('workout_id', seance.id),
    supabase.from('swim_logs').delete().eq('workout_id', seance.id),
  ])
  if (sets.error || swims.error) return false
  const { data, error } = await supabase.from('workouts').delete().eq('id', seance.id).select('id')
  return !error && (data?.length ?? 0) > 0
}
