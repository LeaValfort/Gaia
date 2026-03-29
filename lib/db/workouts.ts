'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import type { Lieu, WorkoutMuscuComplet, WorkoutNatationComplet, WorkoutYogaComplet } from '@/types'

interface ExerciceData {
  nom: string
  series: number | null
  reps: number | null
  poids: number | null
}

interface SeanceNatationData {
  level: number
  totalDistance: number
  crawlM: number
  breaststrokeM: number
  blockStructure: string
}

/**
 * Récupère les séances (muscu, natation, yoga) enregistrées à une date donnée.
 * Retourne null pour chaque type si aucune séance n'existe ce jour-là.
 */
export async function getSeancesDuJour(date: string): Promise<{
  muscu: WorkoutMuscuComplet | null
  natation: WorkoutNatationComplet | null
  yoga: WorkoutYogaComplet | null
}> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { muscu: null, natation: null, yoga: null }

  const [rMuscu, rNat, rYoga] = await Promise.all([
    supabase.from('workouts').select('*, workout_sets(*)').eq('user_id', user.id).eq('date', date).eq('type', 'muscu').order('created_at', { ascending: false }).limit(1),
    supabase.from('workouts').select('*, swim_logs(*)').eq('user_id', user.id).eq('date', date).eq('type', 'natation').order('created_at', { ascending: false }).limit(1),
    supabase.from('workouts').select('*').eq('user_id', user.id).eq('date', date).eq('type', 'yoga').order('created_at', { ascending: false }).limit(1),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (r: any) => r.data?.[0] ?? null

  const muscuRaw = raw(rMuscu)
  const natRaw = raw(rNat)
  const yogaRaw = raw(rYoga)

  return {
    muscu: muscuRaw ? { id: muscuRaw.id, date: muscuRaw.date, location: muscuRaw.location, feeling: muscuRaw.feeling, notes: muscuRaw.notes, sets: muscuRaw.workout_sets ?? [] } : null,
    natation: natRaw && natRaw.swim_logs?.[0] ? { id: natRaw.id, date: natRaw.date, feeling: natRaw.feeling, notes: natRaw.notes, swim: natRaw.swim_logs[0] } : null,
    yoga: yogaRaw ? { id: yogaRaw.id, date: yogaRaw.date, duration_min: yogaRaw.duration_min, feeling: yogaRaw.feeling, notes: yogaRaw.notes } : null,
  }
}

/**
 * Enregistre une séance de musculation avec tous ses exercices.
 */
export async function loggerSeanceMuscu(params: {
  date: string
  location: Lieu
  feeling: number | null
  notes: string | null
  exercices: ExerciceData[]
}): Promise<void> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connectée')

  const { data: workout, error: errWorkout } = await supabase
    .from('workouts')
    .insert({ user_id: user.id, date: params.date, type: 'muscu', location: params.location, feeling: params.feeling, notes: params.notes })
    .select()
    .single()
  if (errWorkout) throw errWorkout

  const sets = params.exercices
    .filter((e) => e.nom.trim())
    .map((e) => ({ workout_id: workout.id, exercise_name: e.nom, sets: e.series, reps: e.reps, weight_kg: e.poids }))

  if (sets.length > 0) {
    const { error } = await supabase.from('workout_sets').insert(sets)
    if (error) throw error
  }
}

/**
 * Enregistre une séance de natation.
 */
export async function loggerSeanceNatation(params: {
  date: string
  feeling: number | null
  notes: string | null
  natation: SeanceNatationData
}): Promise<void> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connectée')

  const { data: workout, error: errWorkout } = await supabase
    .from('workouts')
    .insert({ user_id: user.id, date: params.date, type: 'natation', feeling: params.feeling, notes: params.notes })
    .select()
    .single()
  if (errWorkout) throw errWorkout

  const n = params.natation
  const { error } = await supabase.from('swim_logs').insert({
    workout_id: workout.id,
    level: n.level,
    total_distance_m: n.totalDistance,
    crawl_m: n.crawlM,
    breaststroke_m: n.breaststrokeM,
    block_structure: n.blockStructure,
  })
  if (error) throw error
}

/**
 * Enregistre une séance de yoga.
 */
export async function loggerSeanceYoga(params: {
  date: string
  type: string
  dureeMin: number
  feeling: number | null
  notes: string | null
}): Promise<void> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connectée')

  const { error } = await supabase.from('workouts').insert({
    user_id: user.id,
    date: params.date,
    type: 'yoga',
    duration_min: params.dureeMin,
    notes: `[${params.type}] ${params.notes ?? ''}`.trim(),
    feeling: params.feeling,
  })
  if (error) throw error
}
