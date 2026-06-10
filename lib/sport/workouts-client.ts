import { supabase } from '@/lib/supabase'
import { updateChargesSeance, type SaisieChargeSeance } from '@/lib/db/charges'
import type {
  Lieu,
  WorkoutMuscuComplet,
  WorkoutNatationComplet,
  WorkoutYogaComplet,
} from '@/types'

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

export async function loggerSeanceMuscuClient(params: {
  date: string
  location: Lieu
  feeling: number | null
  notes: string | null
  exercices: ExerciceData[]
}): Promise<void> {
  const user = await userConnecte()

  const { data: workout, error: errWorkout } = await supabase
    .from('workouts')
    .insert({
      user_id: user.id,
      date: params.date,
      type: 'muscu',
      location: params.location,
      feeling: params.feeling,
      notes: params.notes,
    })
    .select()
    .single()

  if (errWorkout) throw new Error(messageErreurSupabase(errWorkout))

  const sets = params.exercices
    .filter((e) => e.nom.trim())
    .map((e) => ({
      workout_id: workout.id,
      exercise_name: e.nom,
      sets: e.series,
      reps: e.reps,
      weight_kg: e.poids,
    }))

  if (sets.length > 0) {
    const { error } = await supabase.from('workout_sets').insert(sets)
    if (error) throw new Error(messageErreurSupabase(error))
  }
}

export async function loggerSeanceNatationClient(params: {
  date: string
  feeling: number | null
  notes: string | null
  natation: SeanceNatationData
}): Promise<void> {
  const user = await userConnecte()

  const { data: workout, error: errWorkout } = await supabase
    .from('workouts')
    .insert({
      user_id: user.id,
      date: params.date,
      type: 'natation',
      feeling: params.feeling,
      notes: params.notes,
    })
    .select()
    .single()

  if (errWorkout) throw new Error(messageErreurSupabase(errWorkout))

  const n = params.natation
  const { error } = await supabase.from('swim_logs').insert({
    workout_id: workout.id,
    level: n.level,
    total_distance_m: n.totalDistance,
    crawl_m: n.crawlM,
    breaststroke_m: n.breaststrokeM,
    block_structure: n.blockStructure,
  })
  if (error) throw new Error(messageErreurSupabase(error))
}

export async function loggerSeanceYogaClient(params: {
  date: string
  type: string
  dureeMin: number
  feeling: number | null
  notes: string | null
}): Promise<void> {
  const user = await userConnecte()

  const { error } = await supabase.from('workouts').insert({
    user_id: user.id,
    date: params.date,
    type: 'yoga',
    duration_min: params.dureeMin,
    notes: `[${params.type}] ${params.notes ?? ''}`.trim(),
    feeling: params.feeling,
  })
  if (error) throw new Error(messageErreurSupabase(error))
}

export async function updateChargesSeanceClient(
  series: SaisieChargeSeance[],
  dateSeance: string
): Promise<void> {
  const user = await userConnecte()
  await updateChargesSeance(supabase, user.id, series, dateSeance)
}

function ciblesDepuisRow(w: Record<string, unknown>) {
  return {
    calories_cibles: (w.calories_cibles as number | null) ?? null,
    proteines_cibles: (w.proteines_cibles as number | null) ?? null,
    glucides_cibles: (w.glucides_cibles as number | null) ?? null,
    lipides_cibles: (w.lipides_cibles as number | null) ?? null,
  }
}

export async function getSeancesDuJourClient(date: string): Promise<{
  muscu: WorkoutMuscuComplet | null
  natation: WorkoutNatationComplet | null
  yoga: WorkoutYogaComplet | null
}> {
  const user = await userConnecte()

  const [rMuscu, rNat, rYoga] = await Promise.all([
    supabase
      .from('workouts')
      .select('*, workout_sets(*)')
      .eq('user_id', user.id)
      .eq('date', date)
      .eq('type', 'muscu')
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('workouts')
      .select('*, swim_logs(*)')
      .eq('user_id', user.id)
      .eq('date', date)
      .eq('type', 'natation')
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .eq('type', 'yoga')
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  if (rMuscu.error) throw new Error(messageErreurSupabase(rMuscu.error))
  if (rNat.error) throw new Error(messageErreurSupabase(rNat.error))
  if (rYoga.error) throw new Error(messageErreurSupabase(rYoga.error))

  const muscuRaw = rMuscu.data?.[0] as Record<string, unknown> | undefined
  const natRaw = rNat.data?.[0] as Record<string, unknown> | undefined
  const yogaRaw = rYoga.data?.[0] as Record<string, unknown> | undefined

  return {
    muscu: muscuRaw
      ? {
          id: muscuRaw.id as string,
          date: muscuRaw.date as string,
          location: muscuRaw.location as Lieu,
          feeling: (muscuRaw.feeling as number | null) ?? null,
          notes: (muscuRaw.notes as string | null) ?? null,
          sets: (muscuRaw.workout_sets as WorkoutMuscuComplet['sets']) ?? [],
          ...ciblesDepuisRow(muscuRaw),
        }
      : null,
    natation:
      natRaw && Array.isArray(natRaw.swim_logs) && natRaw.swim_logs[0]
        ? {
            id: natRaw.id as string,
            date: natRaw.date as string,
            feeling: (natRaw.feeling as number | null) ?? null,
            notes: (natRaw.notes as string | null) ?? null,
            swim: natRaw.swim_logs[0] as WorkoutNatationComplet['swim'],
            ...ciblesDepuisRow(natRaw),
          }
        : null,
    yoga: yogaRaw
      ? {
          id: yogaRaw.id as string,
          date: yogaRaw.date as string,
          duration_min: (yogaRaw.duration_min as number | null) ?? null,
          feeling: (yogaRaw.feeling as number | null) ?? null,
          notes: (yogaRaw.notes as string | null) ?? null,
          ...ciblesDepuisRow(yogaRaw),
        }
      : null,
  }
}

export async function modifierSeanceMuscuClient(
  id: string,
  params: {
    location: Lieu
    feeling: number | null
    notes: string | null
    exercices: ExerciceData[]
  }
): Promise<void> {
  await userConnecte()

  const { error: errW } = await supabase
    .from('workouts')
    .update({
      location: params.location,
      feeling: params.feeling,
      notes: params.notes,
    })
    .eq('id', id)
  if (errW) throw new Error(messageErreurSupabase(errW))

  const { error: errDel } = await supabase.from('workout_sets').delete().eq('workout_id', id)
  if (errDel) throw new Error(messageErreurSupabase(errDel))

  const sets = params.exercices
    .filter((e) => e.nom.trim())
    .map((e) => ({
      workout_id: id,
      exercise_name: e.nom,
      sets: e.series,
      reps: e.reps,
      weight_kg: e.poids,
    }))

  if (sets.length > 0) {
    const { error } = await supabase.from('workout_sets').insert(sets)
    if (error) throw new Error(messageErreurSupabase(error))
  }
}

export async function modifierSeanceNatationClient(
  id: string,
  params: {
    feeling: number | null
    notes: string | null
    level: number
    totalDistance: number
    crawlM: number
    breaststrokeM: number
    blockStructure: string
  }
): Promise<void> {
  await userConnecte()

  const { error: errW } = await supabase
    .from('workouts')
    .update({ feeling: params.feeling, notes: params.notes })
    .eq('id', id)
  if (errW) throw new Error(messageErreurSupabase(errW))

  const { error } = await supabase
    .from('swim_logs')
    .update({
      level: params.level,
      total_distance_m: params.totalDistance,
      crawl_m: params.crawlM,
      breaststroke_m: params.breaststrokeM,
      block_structure: params.blockStructure,
    })
    .eq('workout_id', id)
  if (error) throw new Error(messageErreurSupabase(error))
}

export async function modifierSeanceYogaClient(
  id: string,
  params: {
    type: string
    dureeMin: number
    feeling: number | null
    notes: string | null
  }
): Promise<void> {
  await userConnecte()

  const { error } = await supabase
    .from('workouts')
    .update({
      duration_min: params.dureeMin,
      notes: `[${params.type}] ${params.notes ?? ''}`.trim(),
      feeling: params.feeling,
    })
    .eq('id', id)
  if (error) throw new Error(messageErreurSupabase(error))
}
