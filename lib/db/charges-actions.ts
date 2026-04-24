'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import {
  getDernieresCharges,
  updateChargesSeance,
  type SaisieChargeSeance,
} from '@/lib/db/charges'

export async function actionDernieresCharges() {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []
  return getDernieresCharges(supabase, user.id)
}

export async function actionUpdateChargesSeance(sets: SaisieChargeSeance[], date: string) {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Connexion requise')
  await updateChargesSeance(supabase, user.id, sets, date)
}
