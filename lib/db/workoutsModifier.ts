'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import type { Lieu } from '@/types'

interface ExerciceData {
  nom: string
  series: number | null
  reps: number | null
  poids: number | null
}

/**
 * Met à jour une séance de musculation.
 * Supprime et recrée les séries (workout_sets) pour refléter les changements.
 */
export async function modifierSeanceMuscu(id: string, params: {
  location: Lieu
  feeling: number | null
  notes: string | null
  exercices: ExerciceData[]
}): Promise<void> {
  const supabase = await creerClientServeur()

  const { error: errW } = await supabase.from('workouts')
    .update({ location: params.location, feeling: params.feeling, notes: params.notes })
    .eq('id', id)
  if (errW) throw errW

  const { error: errDel } = await supabase.from('workout_sets').delete().eq('workout_id', id)
  if (errDel) throw errDel

  const sets = params.exercices
    .filter((e) => e.nom.trim())
    .map((e) => ({ workout_id: id, exercise_name: e.nom, sets: e.series, reps: e.reps, weight_kg: e.poids }))

  if (sets.length > 0) {
    const { error } = await supabase.from('workout_sets').insert(sets)
    if (error) throw error
  }
}

/**
 * Met à jour une séance de natation (workout + swim_log).
 */
export async function modifierSeanceNatation(id: string, params: {
  feeling: number | null
  notes: string | null
  level: number
  totalDistance: number
  crawlM: number
  breaststrokeM: number
  blockStructure: string
}): Promise<void> {
  const supabase = await creerClientServeur()

  const { error: errW } = await supabase.from('workouts')
    .update({ feeling: params.feeling, notes: params.notes })
    .eq('id', id)
  if (errW) throw errW

  const { error } = await supabase.from('swim_logs').update({
    level: params.level,
    total_distance_m: params.totalDistance,
    crawl_m: params.crawlM,
    breaststroke_m: params.breaststrokeM,
    block_structure: params.blockStructure,
  }).eq('workout_id', id)
  if (error) throw error
}

/**
 * Met à jour une séance de yoga.
 */
export async function modifierSeanceYoga(id: string, params: {
  type: string
  dureeMin: number
  feeling: number | null
  notes: string | null
}): Promise<void> {
  const supabase = await creerClientServeur()

  const { error } = await supabase.from('workouts').update({
    duration_min: params.dureeMin,
    notes: `[${params.type}] ${params.notes ?? ''}`.trim(),
    feeling: params.feeling,
  }).eq('id', id)
  if (error) throw error
}
