'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import { format, parseISO } from 'date-fns'
import type { DailyLog, Mensuration, StatsResume, Workout } from '@/types'

export async function getDailyLogsProgression(): Promise<DailyLog[]> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (error) throw error
    return (data ?? []) as DailyLog[]
  } catch (erreur) {
    console.error('Erreur getDailyLogsProgression:', erreur)
    return []
  }
}

export async function getWorkoutsProgression(): Promise<Workout[]> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (error) throw error
    return (data ?? []) as Workout[]
  } catch (erreur) {
    console.error('Erreur getWorkoutsProgression:', erreur)
    return []
  }
}

function nombreDepuisDb(v: unknown): number | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  const n = Number.parseFloat(String(v))
  return Number.isNaN(n) ? null : n
}

function entierDepuisDb(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const n = typeof v === 'number' ? Math.round(v) : Number.parseInt(String(v), 10)
  return Number.isNaN(n) ? null : n
}

export async function getMensurations(): Promise<Mensuration[]> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('mensurations')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (error) throw error
    return (data ?? []).map((row) => ({
      id: row.id as string,
      user_id: row.user_id as string,
      date: row.date as string,
      poids_kg: nombreDepuisDb(row.poids_kg),
      tour_taille: entierDepuisDb(row.tour_taille),
      tour_hanches: entierDepuisDb(row.tour_hanches),
      tour_bras_g: entierDepuisDb(row.tour_bras_g),
      tour_bras_d: entierDepuisDb(row.tour_bras_d),
      tour_cuisse_g: entierDepuisDb(row.tour_cuisse_g),
      tour_cuisse_d: entierDepuisDb(row.tour_cuisse_d),
      notes: (row.notes as string | null) ?? null,
      created_at: row.created_at as string,
    }))
  } catch (erreur) {
    console.error('Erreur getMensurations:', erreur)
    return []
  }
}

export type MensurationSansMeta = Omit<Mensuration, 'id' | 'user_id' | 'created_at'>

export async function upsertMensuration(donnees: MensurationSansMeta): Promise<Mensuration | null> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non connectée')

    const { data, error } = await supabase
      .from('mensurations')
      .upsert(
        {
          user_id: user.id,
          date: donnees.date,
          poids_kg: donnees.poids_kg,
          tour_taille: donnees.tour_taille,
          tour_hanches: donnees.tour_hanches,
          tour_bras_g: donnees.tour_bras_g,
          tour_bras_d: donnees.tour_bras_d,
          tour_cuisse_g: donnees.tour_cuisse_g,
          tour_cuisse_d: donnees.tour_cuisse_d,
          notes: donnees.notes,
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single()

    if (error) throw error
    if (!data) return null
    return {
      id: data.id,
      user_id: data.user_id,
      date: data.date,
      poids_kg: nombreDepuisDb(data.poids_kg),
      tour_taille: entierDepuisDb(data.tour_taille),
      tour_hanches: entierDepuisDb(data.tour_hanches),
      tour_bras_g: entierDepuisDb(data.tour_bras_g),
      tour_bras_d: entierDepuisDb(data.tour_bras_d),
      tour_cuisse_g: entierDepuisDb(data.tour_cuisse_g),
      tour_cuisse_d: entierDepuisDb(data.tour_cuisse_d),
      notes: data.notes ?? null,
      created_at: data.created_at,
    }
  } catch (erreur) {
    console.error('Erreur upsertMensuration:', erreur)
    return null
  }
}

export async function getStatsResume(): Promise<StatsResume> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { seancesCeMois: 0, energieMoyenne: null, douleurMoyenne: null }

    const debutMois = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')

    const [{ count }, { data: logs }] = await Promise.all([
      supabase.from('workouts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('date', debutMois),
      supabase.from('daily_logs').select('energy, pain').eq('user_id', user.id).gte('date', debutMois),
    ])

    const logsValides = logs ?? []
    const energies = logsValides.map((l) => l.energy).filter((v): v is number => v !== null)
    const douleurs = logsValides.map((l) => l.pain).filter((v): v is number => v !== null)

    return {
      seancesCeMois: count ?? 0,
      energieMoyenne: energies.length ? Math.round((energies.reduce((a, b) => a + b, 0) / energies.length) * 10) / 10 : null,
      douleurMoyenne: douleurs.length ? Math.round((douleurs.reduce((a, b) => a + b, 0) / douleurs.length) * 10) / 10 : null,
    }
  } catch (erreur) {
    console.error('Erreur getStatsResume:', erreur)
    return { seancesCeMois: 0, energieMoyenne: null, douleurMoyenne: null }
  }
}
