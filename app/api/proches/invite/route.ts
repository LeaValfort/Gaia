import { NextResponse } from 'next/server'
import { genererLienInvitation } from '@/lib/proches'
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
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const code = typeof body.code === 'string' ? body.code.trim() : ''
  if (!code) {
    return NextResponse.json({ error: 'code requis' }, { status: 400 })
  }

  const codeNorm = code.trim().toUpperCase()
  const url = genererLienInvitation(codeNorm)
  const { data: rows, error } = await supabase
    .from('proches_connections')
    .select('id')
    .eq('invite_code', codeNorm)
    .eq('owner_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Validation du code impossible.' }, { status: 500 })
  }

  if (!rows?.length) {
    return NextResponse.json({ error: 'Invitation introuvable.' }, { status: 404 })
  }

  return NextResponse.json({ success: true, lien: url, code: codeNorm })
}
