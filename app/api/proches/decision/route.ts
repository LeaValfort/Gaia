import { NextResponse } from 'next/server'
import { creerClientServeur } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  let body: { connectionId?: string; decision?: 'accept' | 'refuse' }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const connectionId = typeof body.connectionId === 'string' ? body.connectionId.trim() : ''
  const decision = body.decision
  if (!connectionId || (decision !== 'accept' && decision !== 'refuse')) {
    return NextResponse.json({ error: 'connectionId et decision requis' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('fn_proches_decide_access', {
    p_connection_id: connectionId,
    p_decision: decision,
  })

  if (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  const j = data as { ok?: boolean; error?: string; status?: string } | null
  if (j?.ok === false) {
    if (j.error === 'forbidden') return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    if (j.error === 'not_found') return NextResponse.json({ error: 'Connexion introuvable' }, { status: 404 })
    if (j.error === 'no_request') return NextResponse.json({ error: 'Aucune demande en attente' }, { status: 409 })
    return NextResponse.json({ error: j.error ?? 'refus' }, { status: 400 })
  }

  return NextResponse.json({ success: true, status: j?.status ?? null })
}
