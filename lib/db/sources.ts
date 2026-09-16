'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import type { Source } from '@/types'

/** Toutes les sources bibliographiques (onglet Bibliographie des paramètres). */
export async function getSources(): Promise<Source[]> {
  try {
    const supabase = await creerClientServeur()
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error
    return data ?? []
  } catch (erreur) {
    console.error('Erreur getSources:', erreur)
    return []
  }
}
