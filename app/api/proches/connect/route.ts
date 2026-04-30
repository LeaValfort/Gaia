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

  let body: { code?: string }
  try {
    body = (await request.json()) as { code?: string }
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }
  const code = typeof body.code === 'string' ? body.code.trim() : ''
  if (!code) {
    return NextResponse.json({ error: 'code requis' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('fn_proches_connect_partner', { p_code: code })
  if (error) {
    console.error('fn_proches_connect_partner', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  const j = data as { ok?: boolean; error?: string; already?: boolean } | null
  if (j?.ok === false) {
    if (j.error === 'own_link') {
      return NextResponse.json({ error: 'own_link' }, { status: 400 })
    }
    if (j.error === 'not_found') {
      return NextResponse.json({ error: 'Lien introuvable' }, { status: 404 })
    }
    if (j.error === 'already_linked') {
      return NextResponse.json({ error: 'Déjà lié à un autre compte' }, { status: 409 })
    }
    return NextResponse.json({ error: j.error ?? 'refus' }, { status: 400 })
  }

  return NextResponse.json({ success: true, already: j?.already === true })
}
