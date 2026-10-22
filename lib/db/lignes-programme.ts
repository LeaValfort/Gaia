import type { SupabaseClient } from '@supabase/supabase-js'
import { updateChargesSeance } from '@/lib/db/charges'
import { chargesAMemoriser, parseContenuSeanceLibre } from '@/lib/sport/seance-libre'
import type { LigneSeanceLibre, TypeSeance } from '@/types'

/**
 * Lignes perso des programmes Muscu/Natation/Yoga (table programme_lignes_libres)
 * et lignes cochées d'une séance (workouts.contenu_libre).
 */

/** Clé d'un programme : type de séance + lieu + variante active (ou « defaut »). */
export function cleProgramme(typeSeance: string, lieu: string, varianteId: string | null): string {
  return `${typeSeance}:${lieu}:${varianteId ?? 'defaut'}`
}

export async function getLignesProgramme(supabase: SupabaseClient, userId: string, cle: string): Promise<LigneSeanceLibre[]> {
  const { data, error } = await supabase
    .from('programme_lignes_libres')
    .select('lignes')
    .eq('user_id', userId)
    .eq('cle', cle)
    .maybeSingle()
  if (error) {
    console.error('getLignesProgramme', JSON.stringify({ message: error.message, code: error.code }))
    return []
  }
  return parseContenuSeanceLibre((data as { lignes?: unknown } | null)?.lignes)
}

export async function enregistrerLignesProgramme(
  supabase: SupabaseClient,
  userId: string,
  cle: string,
  lignes: LigneSeanceLibre[]
): Promise<boolean> {
  const { error } = await supabase
    .from('programme_lignes_libres')
    .upsert({ user_id: userId, cle, lignes, updated_at: new Date().toISOString() }, { onConflict: 'user_id,cle' })
  if (error) console.error('enregistrerLignesProgramme', JSON.stringify({ message: error.message, code: error.code }))
  return !error
}

/**
 * Après l'enregistrement d'une séance : y attache les lignes cochées et
 * mémorise les charges des exercices. Vise la séance du jour de ce type
 * (une par jour et par type, comme l'affiche la page Sport).
 */
export async function enregistrerContenuLibreSeance(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  type: TypeSeance,
  lignesFaites: LigneSeanceLibre[],
  avaitDuContenu = false
): Promise<void> {
  // Rien à écrire (aucune ligne cochée, rien à effacer) : on ne touche pas la séance.
  if (!lignesFaites.length && !avaitDuContenu) return
  const { error } = await supabase
    .from('workouts')
    .update({ contenu_libre: lignesFaites.length ? lignesFaites : null })
    .eq('user_id', userId)
    .eq('date', date)
    .eq('type', type)
  if (error) throw new Error('Séance enregistrée, mais les lignes perso n’ont pas pu être ajoutées.')
  const charges = chargesAMemoriser(lignesFaites)
  if (charges.length) await updateChargesSeance(supabase, userId, charges, date)
}
