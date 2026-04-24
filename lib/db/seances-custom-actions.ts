'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import {
  getSeanceCustom,
  resetSeanceCustom,
  saveSeanceCustom,
} from '@/lib/db/seances-custom'
import type { ExerciceCustom, Lieu, TypeSeanceMuscu } from '@/types'

export async function actionGetSeanceCustom(
  typeSeance: TypeSeanceMuscu,
  lieu: Lieu
): Promise<ExerciceCustom[] | null> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return getSeanceCustom(supabase, user.id, typeSeance, lieu)
}

export async function actionSaveSeanceCustom(
  typeSeance: TypeSeanceMuscu,
  lieu: Lieu,
  exercices: ExerciceCustom[]
): Promise<void> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Connexion requise')
  await saveSeanceCustom(supabase, user.id, typeSeance, lieu, exercices)
}

export async function actionResetSeanceCustom(
  typeSeance: TypeSeanceMuscu,
  lieu: Lieu
): Promise<void> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Connexion requise')
  await resetSeanceCustom(supabase, user.id, typeSeance, lieu)
}
