import { supabase } from '@/lib/supabase'
import type { ActivityLogFormData } from '@/types'

function parseDec(val: string): number | null {
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

function parseEnt(val: string): number | null {
  const n = parseInt(val, 10)
  return isNaN(n) ? null : n
}

function calculerVitesse(distKm: string, durMin: string): number | null {
  const d = parseDec(distKm)
  const t = parseDec(durMin)
  if (!d || !t) return null
  return Math.round((d / (t / 60)) * 10) / 10
}

function calculerAllure(distKm: string, durMin: string): number | null {
  const d = parseDec(distKm)
  const t = parseDec(durMin)
  if (!d || !t) return null
  return Math.round((t / d) * 10) / 10
}

function messageErreurSupabase(error: { message?: string; code?: string }): string {
  if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
    return 'Session expirée — reconnecte-toi.'
  }
  return error.message ?? 'Erreur lors de l’enregistrement.'
}

async function userConnecte() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw new Error(messageErreurSupabase(error))
  if (!user) throw new Error('Connecte-toi pour enregistrer.')
  return user
}

/** Enregistre une activité « autre sport » (activity_logs) côté client. */
export async function loggerActiviteClient(
  data: ActivityLogFormData & { date: string }
): Promise<void> {
  if (!data.sport_type) throw new Error('Choisis un type d’activité.')

  const user = await userConnecte()

  const { error } = await supabase.from('activity_logs').insert({
    user_id: user.id,
    date: data.date,
    sport_type: data.sport_type,
    sport_name: data.sport_name || null,
    duration_min: parseEnt(data.duration_min),
    distance_km: parseDec(data.distance_km),
    elevation_m: parseEnt(data.elevation_m),
    speed_kmh:
      data.sport_type === 'velo' ? calculerVitesse(data.distance_km, data.duration_min) : null,
    pace_min_km:
      data.sport_type === 'course' ? calculerAllure(data.distance_km, data.duration_min) : null,
    calories: parseEnt(data.calories),
    heart_rate_avg: parseEnt(data.heart_rate_avg),
    heart_rate_max: parseEnt(data.heart_rate_max),
    difficulty: data.difficulty || null,
    routes_completed: parseEnt(data.routes_completed),
    sport_style: data.sport_style || null,
    repetitions: parseEnt(data.repetitions),
    feeling: data.feeling || null,
    notes: data.notes || null,
  })

  if (error) throw new Error(messageErreurSupabase(error))
}
