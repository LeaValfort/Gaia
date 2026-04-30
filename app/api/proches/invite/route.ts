import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { genererLienInvitation } from '@/lib/proches'
import { creerClientServeur } from '@/lib/supabase-server'

const FROM = 'noreply@resend.dev'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function POST(request: Request) {
  console.log('RESEND_API_KEY présente:', !!process.env.RESEND_API_KEY)
  const key = process.env.RESEND_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'RESEND_API_KEY manquante' }, { status: 500 })
  }

  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  let body: { email?: string; prenomProche?: string; code?: string; prenomOwner?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const code = typeof body.code === 'string' ? body.code.trim() : ''
  console.log('Email destinataire:', email)
  console.log('Code:', code)
  const prenomProche = typeof body.prenomProche === 'string' ? body.prenomProche.trim() : ''
  const prenomOwner = typeof body.prenomOwner === 'string' ? body.prenomOwner.trim() : 'Gaia'
  if (!email || !code) {
    return NextResponse.json({ error: 'email et code requis' }, { status: 400 })
  }

  const url = genererLienInvitation(code)
  const resend = new Resend(key)
  const { error: sendErr } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${prenomOwner} partage son cycle avec toi 💚`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
      <h1 style="color:#1f2937">Un partage Gaia</h1>
      <p>${escapeHtml(prenomOwner)} t’invite à suivre un aperçu bienveillant de son cycle (phase, ressentis) dans <strong>Gaia</strong>.</p>
      <p>
        <a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 24px;background:#7C3AED;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
          Ouvrir le lien
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px">Ce lien est personnel. ${escapeHtml(
        prenomProche
      )}, si tu crées un compte Gaia tu retrouveras aussi ces infos dans l’onglet <strong>Proches</strong>.</p>
    </div>`,
  })

  if (sendErr) {
    console.error('Resend erreur complète:', JSON.stringify(sendErr, null, 2))
    return NextResponse.json({ error: "Impossible d'envoyer l'e-mail" }, { status: 500 })
  }

  const { error: upErr } = await supabase
    .from('proches_connections')
    .update({
      partner_email: email,
      email_sent_at: new Date().toISOString(),
    })
    .eq('invite_code', code)
    .eq('owner_id', user.id)

  if (upErr) {
    console.error('update proches_connections', upErr)
    return NextResponse.json({ error: 'E-mail envoyé mais mise à jour DB échouée' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
