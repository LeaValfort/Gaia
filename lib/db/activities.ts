'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import type { ActivityLogFormData, ActivityLog } from '@/types'

function parseDec(val: string): number | null {
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

function parseEnt(val: string): number | null {
  const n = parseInt(val)
  return isNaN(n) ? null : n
}

// Vitesse en km/h = distance / (durée en h)
function calculerVitesse(distKm: string, durMin: string): number | null {
  const d = parseDec(distKm)
  const t = parseDec(durMin)
  if (!d || !t) return null
  return Math.round((d / (t / 60)) * 10) / 10
}

// Allure en min/km décimal (ex: 5.5 = 5'30''/km)
function calculerAllure(distKm: string, durMin: string): number | null {
  const d = parseDec(distKm)
  const t = parseDec(durMin)
  if (!d || !t) return null
  return Math.round((t / d) * 10) / 10
}

/**
 * Enregistre une activité dans activity_logs.
 * La vitesse (vélo) et l'allure (course) sont calculées automatiquement.
 */
export async function loggerActivite(
  data: ActivityLogFormData & { date: string }
): Promise<void> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connectée')

  const { error } = await supabase.from('activity_logs').insert({
    user_id:         user.id,
    date:            data.date,
    sport_type:      data.sport_type,
    sport_name:      data.sport_name   || null,
    duration_min:    parseEnt(data.duration_min),
    distance_km:     parseDec(data.distance_km),
    elevation_m:     parseEnt(data.elevation_m),
    speed_kmh:       data.sport_type === 'velo'   ? calculerVitesse(data.distance_km, data.duration_min) : null,
    pace_min_km:     data.sport_type === 'course' ? calculerAllure(data.distance_km, data.duration_min)  : null,
    calories:        parseEnt(data.calories),
    heart_rate_avg:  parseEnt(data.heart_rate_avg),
    heart_rate_max:  parseEnt(data.heart_rate_max),
    difficulty:      data.difficulty        || null,
    routes_completed: parseEnt(data.routes_completed),
    sport_style:     data.sport_style       || null,
    repetitions:     parseEnt(data.repetitions),
    feeling:         data.feeling           || null,
    notes:           data.notes             || null,
  })
  if (error) throw error
}

/**
 * Retourne toutes les activités enregistrées à une date donnée.
 */
export async function getActivitesDuJour(date: string): Promise<ActivityLog[]> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}
