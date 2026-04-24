'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import {
  getPlanningSportSemaine,
  savePlanningSportSemaine,
  type ActivitePlanifieeSport,
} from '@/lib/db/planning-sport'

export async function actionGetPlanningSportSemaine(weekStart: string) {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return getPlanningSportSemaine(supabase, user.id, weekStart)
}

export async function actionSavePlanningSportSemaine(
  weekStart: string,
  jours: Record<string, ActivitePlanifieeSport>
) {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Connexion requise')
  await savePlanningSportSemaine(supabase, user.id, weekStart, jours)
}
