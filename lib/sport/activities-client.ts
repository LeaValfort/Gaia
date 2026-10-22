import { supabase } from '@/lib/supabase'
import { updateChargesSeance } from '@/lib/db/charges'
import { chargesAMemoriser, dureeBlocsMin, lignesRenseignees } from '@/lib/sport/seance-libre'
import type { ActivityLogFormData, LigneSeanceLibre } from '@/types'

function parseDec(val: string): number | null {
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

function parseEnt(val: string): number | null {
  const n = parseInt(val, 10)
  return isNaN(n) ? null : n
}

function calculerVitesse(distKm: string, durMin: string): number | null {
  const d = parseDec(distKm)
  const t = parseDec(durMin)
  if (!d || !t) return null
  return Math.round((d / (t / 60)) * 10) / 10
}

function calculerAllure(distKm: string, durMin: string): number | null {
  const d = parseDec(distKm)
  const t = parseDec(durMin)
  if (!d || !t) return null
  return Math.round((t / d) * 10) / 10
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

function ligneActivite(data: ActivityLogFormData, contenu: LigneSeanceLibre[]) {
  // Durée : celle saisie, sinon la somme des blocs.
  const duree = parseEnt(data.duration_min) ?? dureeBlocsMin(contenu)
  const dureeTxt = duree != null ? String(duree) : data.duration_min
  return {
    sport_type: data.sport_type,
    sport_name: data.sport_name.trim() || null,
    duration_min: duree,
    distance_km: parseDec(data.distance_km),
    elevation_m: parseEnt(data.elevation_m),
    speed_kmh:
      data.sport_type === 'velo' ? calculerVitesse(data.distance_km, dureeTxt) : null,
    pace_min_km:
      data.sport_type === 'course' ? calculerAllure(data.distance_km, dureeTxt) : null,
    calories: parseEnt(data.calories),
    heart_rate_avg: parseEnt(data.heart_rate_avg),
    heart_rate_max: parseEnt(data.heart_rate_max),
    difficulty: data.difficulty || null,
    routes_completed: parseEnt(data.routes_completed),
    sport_style: data.sport_style || null,
    repetitions: parseEnt(data.repetitions),
    feeling: data.feeling || null,
    notes: data.notes || null,
    contenu: contenu.length ? contenu : null,
  }
}

/**
 * Enregistre (ou met à jour si `idExistant`) une activité « autre sport »,
 * avec ses lignes libres, puis mémorise les charges des exercices.
 */
export async function enregistrerActiviteClient(
  data: ActivityLogFormData & { date: string },
  lignes: LigneSeanceLibre[],
  idExistant?: string | null
): Promise<void> {
  if (!data.sport_type) throw new Error('Choisis un type d’activité.')
  const user = await userConnecte()
  const contenu = lignesRenseignees(lignes)
  const ligne = ligneActivite(data, contenu)

  if (idExistant) {
    const { data: maj, error } = await supabase
      .from('activity_logs')
      .update({ ...ligne, date: data.date })
      .eq('id', idExistant)
      .select('id')
    if (error) throw new Error(messageErreurSupabase(error))
    if (!maj?.length) throw new Error('La modification n’a pas été enregistrée.')
  } else {
    const { error } = await supabase.from('activity_logs').insert({ user_id: user.id, date: data.date, ...ligne })
    if (error) throw new Error(messageErreurSupabase(error))
  }

  const charges = chargesAMemoriser(contenu)
  if (charges.length) await updateChargesSeance(supabase, user.id, charges, data.date)
}
