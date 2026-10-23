import { NextResponse, type NextRequest } from 'next/server'
import { creerClientServeur } from '@/lib/supabase-server'

interface CorpsAbonnement {
  endpoint?: unknown
  keys?: { p256dh?: unknown; auth?: unknown }
}

/** POST : enregistre l'abonnement push de cet appareil. DELETE : le retire. */
export async function POST(request: NextRequest) {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erreur: 'Non authentifiée' }, { status: 401 })
  const c = (await request.json().catch(() => ({}))) as CorpsAbonnement
  if (typeof c.endpoint !== 'string' || typeof c.keys?.p256dh !== 'string' || typeof c.keys?.auth !== 'string') {
    return NextResponse.json({ erreur: 'Abonnement invalide' }, { status: 400 })
  }
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: user.id, endpoint: c.endpoint, p256dh: c.keys.p256dh, auth: c.keys.auth }, { onConflict: 'endpoint' })
  if (error) return NextResponse.json({ erreur: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const supabase = await creerClientServeur()
  const c = (await request.json().catch(() => ({}))) as CorpsAbonnement
  if (typeof c.endpoint === 'string') await supabase.from('push_subscriptions').delete().eq('endpoint', c.endpoint)
  return NextResponse.json({ ok: true })
}
