import type { SupabaseClient } from '@supabase/supabase-js'
import { deleteSeanceProfil, upsertSeanceProfil } from '@/lib/db/seance-profils'
import {
  PROFILS_DEFAUT,
  type BlocNatation,
  type ExerciceCustom,
  type IntensiteEffort,
  type LieuVariante,
  type PostureYoga,
  type ProfilEffort,
  type SportVariante,
  type TypeEffort,
  type TypeVarianteSport,
} from '@/types'

/** Contenu initial ou mis à jour d'une variante (selon le sport concerné). */
export interface ContenuVariante {
  exercices?: ExerciceCustom[]
  niveauNatation?: number
  blocsNatation?: BlocNatation[]
  postures?: PostureYoga[]
  /** Intensité/effort/durée de ce programme (utilisés pour les macros). */
  profilEffort?: ProfilEffort
}

function parseVariante(row: Record<string, unknown>): SportVariante {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    type_seance: row.type_seance as TypeVarianteSport,
    lieu: row.lieu as LieuVariante,
    nom: String(row.nom),
    est_active: row.est_active === true,
    exercices: Array.isArray(row.exercices) ? (row.exercices as ExerciceCustom[]) : null,
    niveau_natation: typeof row.niveau_natation === 'number' ? row.niveau_natation : null,
    blocs_natation: Array.isArray(row.blocs_natation) ? (row.blocs_natation as BlocNatation[]) : null,
    postures: Array.isArray(row.postures) ? (row.postures as PostureYoga[]) : null,
    intensite: (row.intensite as IntensiteEffort) ?? 'moderee',
    type_effort: (row.type_effort as TypeEffort) ?? 'mixte',
    duree_min: typeof row.duree_min === 'number' ? row.duree_min : 45,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

/** Toutes les variantes enregistrées pour ce sport (et ce lieu pour la muscu). */
export async function getVariantes(
  supabase: SupabaseClient,
  userId: string,
  typeSeance: TypeVarianteSport,
  lieu: LieuVariante
): Promise<SportVariante[]> {
  try {
    const { data, error } = await supabase
      .from('sport_variantes')
      .select('*')
      .eq('user_id', userId)
      .eq('type_seance', typeSeance)
      .eq('lieu', lieu)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map((r) => parseVariante(r as Record<string, unknown>))
  } catch (e) {
    console.error('getVariantes', e)
    return []
  }
}

/**
 * Toutes les variantes d'un type de séance, tous lieux confondus (maison + salle
 * pour la muscu). Utilisé par le calendrier de planning pour proposer un programme
 * précis sans avoir à choisir le lieu au moment de la planification.
 */
export async function getToutesVariantesPourType(
  supabase: SupabaseClient,
  userId: string,
  typeSeance: TypeVarianteSport
): Promise<SportVariante[]> {
  try {
    const { data, error } = await supabase
      .from('sport_variantes')
      .select('*')
      .eq('user_id', userId)
      .eq('type_seance', typeSeance)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map((r) => parseVariante(r as Record<string, unknown>))
  } catch (e) {
    console.error('getToutesVariantesPourType', e)
    return []
  }
}

/** Crée une nouvelle variante nommée avec son contenu initial, et l'active aussitôt. */
export async function creerVariante(
  supabase: SupabaseClient,
  userId: string,
  typeSeance: TypeVarianteSport,
  lieu: LieuVariante,
  nom: string,
  contenu: ContenuVariante
): Promise<SportVariante | null> {
  try {
    await supabase
      .from('sport_variantes')
      .update({ est_active: false })
      .eq('user_id', userId)
      .eq('type_seance', typeSeance)
      .eq('lieu', lieu)
    const profil = contenu.profilEffort ?? PROFILS_DEFAUT[typeSeance]
    const { data, error } = await supabase
      .from('sport_variantes')
      .insert({
        user_id: userId,
        type_seance: typeSeance,
        lieu,
        nom,
        est_active: true,
        exercices: contenu.exercices ?? null,
        niveau_natation: contenu.niveauNatation ?? null,
        blocs_natation: contenu.blocsNatation ?? null,
        postures: contenu.postures ?? null,
        intensite: profil.intensite,
        type_effort: profil.type_effort,
        duree_min: profil.duree_min,
      })
      .select('*')
      .single()
    if (error) throw error
    // Cette variante devient tout de suite le programme actif : on resynchronise
    // seance_profils (encore utilisé pour le calcul des macros) avec son intensité.
    await upsertSeanceProfil(userId, typeSeance, profil).catch(() => {})
    return parseVariante(data as Record<string, unknown>)
  } catch (e) {
    console.error('creerVariante', e)
    return null
  }
}

/** Active une variante (bascule l'onglet) ; `varianteId` null = revenir aux réglages par défaut. */
export async function activerVariante(
  supabase: SupabaseClient,
  userId: string,
  typeSeance: TypeVarianteSport,
  lieu: LieuVariante,
  varianteId: string | null
): Promise<boolean> {
  try {
    await supabase
      .from('sport_variantes')
      .update({ est_active: false })
      .eq('user_id', userId)
      .eq('type_seance', typeSeance)
      .eq('lieu', lieu)
    if (varianteId) {
      const { data, error } = await supabase
        .from('sport_variantes')
        .update({ est_active: true })
        .eq('id', varianteId)
        .select('intensite, type_effort, duree_min')
        .single()
      if (error) throw error
      const row = data as Record<string, unknown>
      // Programme activé : seance_profils suit son intensité (macros à jour).
      await upsertSeanceProfil(userId, typeSeance, {
        intensite: row.intensite as IntensiteEffort,
        type_effort: row.type_effort as TypeEffort,
        duree_min: row.duree_min as number,
      }).catch(() => {})
    } else {
      // Retour à "Par défaut" : plus de réglage perso, seance_profils repasse
      // sur les valeurs génériques du catalogue.
      await deleteSeanceProfil(userId, typeSeance).catch(() => {})
    }
    return true
  } catch (e) {
    console.error('activerVariante', e)
    return false
  }
}

/** Modifie l'intensité/effort/durée d'une variante existante (et resynchronise les macros si elle est active). */
export async function mettreAJourProfilVariante(
  supabase: SupabaseClient,
  userId: string,
  typeSeance: TypeVarianteSport,
  varianteId: string,
  profil: ProfilEffort
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sport_variantes')
      .update({
        intensite: profil.intensite,
        type_effort: profil.type_effort,
        duree_min: profil.duree_min,
        updated_at: new Date().toISOString(),
      })
      .eq('id', varianteId)
    if (error) throw error
    // N'est appelé que depuis l'écran où cette variante est déjà la variante
    // active affichée : on peut resynchroniser seance_profils sans revérifier.
    await upsertSeanceProfil(userId, typeSeance, profil).catch(() => {})
    return true
  } catch (e) {
    console.error('mettreAJourProfilVariante', e)
    return false
  }
}

export async function renommerVariante(
  supabase: SupabaseClient,
  varianteId: string,
  nom: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from('sport_variantes').update({ nom }).eq('id', varianteId)
    if (error) throw error
    return true
  } catch (e) {
    console.error('renommerVariante', e)
    return false
  }
}

export async function supprimerVariante(supabase: SupabaseClient, varianteId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('sport_variantes').delete().eq('id', varianteId)
    if (error) throw error
    return true
  } catch (e) {
    console.error('supprimerVariante', e)
    return false
  }
}

/** Met à jour le contenu d'une variante existante (exercices, niveau/blocs natation, postures yoga). */
export async function mettreAJourContenuVariante(
  supabase: SupabaseClient,
  varianteId: string,
  contenu: ContenuVariante
): Promise<boolean> {
  try {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (contenu.exercices) patch.exercices = contenu.exercices
    if (contenu.niveauNatation != null) patch.niveau_natation = contenu.niveauNatation
    if (contenu.blocsNatation) patch.blocs_natation = contenu.blocsNatation
    if (contenu.postures) patch.postures = contenu.postures
    const { error } = await supabase.from('sport_variantes').update(patch).eq('id', varianteId)
    if (error) throw error
    return true
  } catch (e) {
    console.error('mettreAJourContenuVariante', e)
    return false
  }
}
