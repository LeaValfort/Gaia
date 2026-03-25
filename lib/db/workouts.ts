'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import type { Lieu } from '@/types'

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
