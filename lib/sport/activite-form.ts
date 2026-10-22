import { ACTIVITY_LOG_INITIAL } from '@/lib/data/sportsConfig'
import type { ActivityLog, ActivityLogFormData } from '@/types'

/** Pré-remplit le formulaire « autre sport » depuis une activité existante (modification). */
export function formDepuisActivite(a: ActivityLog | null | undefined): ActivityLogFormData {
  if (!a) return ACTIVITY_LOG_INITIAL
  const t = (v: number | string | null) => (v == null ? '' : String(v))
  return {
    sport_type: a.sport_type,
    sport_name: a.sport_name ?? '',
    duration_min: t(a.duration_min),
    distance_km: t(a.distance_km),
    elevation_m: t(a.elevation_m),
    calories: t(a.calories),
    heart_rate_avg: t(a.heart_rate_avg),
    heart_rate_max: t(a.heart_rate_max),
    difficulty: a.difficulty ?? '',
    routes_completed: t(a.routes_completed),
    sport_style: a.sport_style ?? '',
    repetitions: t(a.repetitions),
    feeling: a.feeling ?? '',
    notes: a.notes ?? '',
  }
}
