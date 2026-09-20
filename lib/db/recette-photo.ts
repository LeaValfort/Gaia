// Upload de la photo ajoutée à la main sur une recette, vers Supabase Storage
// (bucket "recipe-images" — voir migration SQL dans schema.sql).
import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'recipe-images'

/** Upload une photo pour une recette et renvoie son URL publique, ou null en cas d'échec.
 *  Le chemin (userId/...) doit correspondre à la politique RLS du bucket. */
export async function uploaderPhotoRecette(
  supabase: SupabaseClient,
  userId: string,
  recetteId: string,
  fichier: File
): Promise<string | null> {
  try {
    const extension = fichier.name.split('.').pop()?.toLowerCase() || 'jpg'
    const chemin = `${userId}/${recetteId}-${Date.now()}.${extension}`
    const { error } = await supabase.storage.from(BUCKET).upload(chemin, fichier, {
      upsert: true,
      contentType: fichier.type || undefined,
    })
    if (error) throw error
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(chemin)
    return data.publicUrl
  } catch (erreur) {
    console.error('Erreur uploaderPhotoRecette:', erreur)
    return null
  }
}
