import { supabase } from '@/lib/supabase'

export async function updateWorkoutCibles(
  workoutId: string,
  c: {
    calories_cibles: number | null
    proteines_cibles: number | null
    glucides_cibles: number | null
    lipides_cibles: number | null
  }
): Promise<boolean> {
  const { error } = await supabase
    .from('workouts')
    .update({
      calories_cibles: c.calories_cibles,
      proteines_cibles: c.proteines_cibles,
      glucides_cibles: c.glucides_cibles,
      lipides_cibles: c.lipides_cibles,
    })
    .eq('id', workoutId)
  if (error) {
    console.error('updateWorkoutCibles', error)
    return false
  }
  return true
}
