import webpush from 'web-push'
import type { SupabaseClient } from '@supabase/supabase-js'

import { CLE_PUBLIQUE_VAPID } from '@/lib/push/cle-publique'

export interface ContenuPush {
  titre: string
  corps: string
  url?: string
}

let configure = false
function configurer(): boolean {
  const prive = process.env.VAPID_PRIVATE_KEY
  if (!prive) return false
  if (!configure) {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? 'mailto:gaia@example.com', CLE_PUBLIQUE_VAPID, prive)
    configure = true
  }
  return true
}

/**
 * Envoie une notification à tous les appareils d'une utilisatrice. Les
 * abonnements expirés (404/410) sont supprimés. Ne lève jamais : renvoie le
 * nombre d'envois réussis.
 */
export async function envoyerAUtilisatrice(admin: SupabaseClient, userId: string, contenu: ContenuPush): Promise<number> {
  if (!configurer()) {
    console.warn('push : VAPID_PRIVATE_KEY absente, envoi ignoré')
    return 0
  }
  const { data } = await admin.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('user_id', userId)
  let ok = 0
  for (const s of data ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint as string, keys: { p256dh: s.p256dh as string, auth: s.auth as string } },
        JSON.stringify({ title: contenu.titre, body: contenu.corps, url: contenu.url ?? '/proches' }),
        { TTL: 60 * 60 * 12 }
      )
      ok++
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode
      if (code === 404 || code === 410) await admin.from('push_subscriptions').delete().eq('id', s.id)
      else console.error('push envoi', JSON.stringify({ code, message: (e as Error).message }))
    }
  }
  return ok
}
