'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import { recalculerCycleStats } from '@/lib/db/cycles'
import { updateUserPreferences } from '@/lib/db/parametres'

/**
 * Annule un début de règles signalé par erreur : supprime ce cycle, rouvre le
 * précédent et remet `last_cycle_start` sur lui. Renvoie l'erreur à l'appelant.
 */
export async function annulerDebutCycle(cycleId: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, message: 'Connexion requise.' }

    const { data: cible, error: errCible } = await supabase
      .from('cycles')
      .select('id, start_date')
      .eq('id', cycleId)
      .eq('user_id', user.id)
      .maybeSingle()
    if (errCible || !cible) return { ok: false, message: 'Cycle introuvable.' }

    // `.select` : une suppression bloquée par la RLS ne renvoie pas d'erreur, juste 0 ligne.
    const { data: supprimes, error: errSup } = await supabase.from('cycles').delete().eq('id', cycleId).select('id')
    if (errSup || !supprimes?.length) return { ok: false, message: errSup?.message ?? 'Suppression refusée.' }

    const { data: precedent } = await supabase
      .from('cycles')
      .select('id, start_date')
      .eq('user_id', user.id)
      .lt('start_date', cible.start_date as string)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (precedent?.id) {
      const { error: errRouvre } = await supabase.from('cycles').update({ end_date: null }).eq('id', precedent.id)
      if (errRouvre) return { ok: false, message: errRouvre.message }
    }
    await updateUserPreferences({ last_cycle_start: (precedent?.start_date as string | undefined) ?? null })
    await recalculerCycleStats()
    return { ok: true }
  } catch (e) {
    console.error('annulerDebutCycle:', e)
    return { ok: false, message: 'Erreur inattendue.' }
  }
}
