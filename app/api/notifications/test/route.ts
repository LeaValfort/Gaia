import { NextResponse } from 'next/server'
import { creerClientServeur } from '@/lib/supabase-server'
import { clientAdmin } from '@/lib/supabase-admin'
import { envoyerAUtilisatrice } from '@/lib/push/envoi'

/**
 * POST : envoie une notification de test à l'utilisatrice connectée, sur tous
 * ses appareils. Renvoie la cause précise si un maillon manque (clé, abonnement).
 */
export async function POST() {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erreur: 'Non authentifiée' }, { status: 401 })

  const admin = clientAdmin()
  if (!admin) {
    // Diagnostic : noms des variables proches (jamais leurs valeurs) et si elles sont vides.
    const proches = Object.keys(process.env)
      .filter((k) => /SERVICE|ROLE|SECRET/i.test(k) && !k.startsWith('VERCEL'))
      .map((k) => `« ${k} »${process.env[k] ? '' : ' (vide)'}`)
    const detail = proches.length ? `Variables trouvées : ${proches.join(', ')}` : 'Aucune variable de ce type trouvée'
    return NextResponse.json({ erreur: `Clé SUPABASE_SERVICE_ROLE_KEY absente sur Vercel. ${detail}` }, { status: 500 })
  }
  if (!process.env.VAPID_PRIVATE_KEY) return NextResponse.json({ erreur: 'Clé VAPID_PRIVATE_KEY absente sur Vercel' }, { status: 500 })

  const { count, error } = await admin.from('push_subscriptions').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
  if (error) return NextResponse.json({ erreur: `Table des abonnements : ${error.message}` }, { status: 500 })
  if (!count) return NextResponse.json({ erreur: 'Aucun appareil abonné : désactive puis réactive les notifications' }, { status: 400 })

  const envoyes = await envoyerAUtilisatrice(admin, user.id, { titre: 'Gaia 🌸', corps: 'Notification de test : tout fonctionne !', url: '/proches' })
  if (!envoyes) return NextResponse.json({ erreur: 'Envoi refusé par le service de notifications (voir les logs Vercel)' }, { status: 502 })
  return NextResponse.json({ ok: true, envoyes })
}
