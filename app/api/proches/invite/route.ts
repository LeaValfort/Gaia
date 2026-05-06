import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { genererLienInvitation } from '@/lib/proches'
import { creerClientServeur } from '@/lib/supabase-server'

const FROM_DEFAUT = 'Gaia <onboarding@resend.dev>'

function messageErreurInconnue(e: unknown): string {
  if (e == null) return ''
  if (typeof e === 'string') return e
  if (Array.isArray(e)) return e.map(messageErreurInconnue).filter(Boolean).join(' ; ')
  if (typeof e === 'object' && 'message' in e) {
    const m = (e as { message: unknown }).message
    if (typeof m === 'string') return m
    if (Array.isArray(m)) {
      return m
        .map((item) => {
          if (item && typeof item === 'object' && 'message' in item) {
            return String((item as { message: unknown }).message ?? '')
          }
          return String(item ?? '')
        })
        .filter(Boolean)
        .join(' ; ')
    }
  }
  try {
    return JSON.stringify(e)
  } catch {
    return ''
  }
}

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
    return NextResponse.json(
      {
        error: 'RESEND_API_KEY absente sur le serveur.',
        detail:
          'Ajoute RESEND_API_KEY dans Vercel → Project → Settings → Environment Variables (Production), puis redéploie.',
      },
      { status: 500 }
    )
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

  const codeNorm = code.trim().toUpperCase()
  const url = genererLienInvitation(codeNorm)
  const fromHeader = FROM_DEFAUT
  const resend = new Resend(key)

  let sendErr: unknown
  try {
    const out = await resend.emails.send({
      from: fromHeader,
      to: email,
      subject: `${prenomOwner} partage son cycle avec toi (Gaia)`,
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
    sendErr = out.error
  } catch (err) {
    console.error('Resend exception:', err)
    sendErr = err
  }

  if (sendErr) {
    console.error('Resend erreur complète:', JSON.stringify(sendErr, null, 2))
    const detail = messageErreurInconnue(sendErr)
    return NextResponse.json(
      {
        error: "Impossible d'envoyer l'e-mail.",
        detail:
          detail ||
          'Vérifie RESEND_API_KEY sur Vercel (Production), redéploie. Sur Resend gratuit : envoie souvent seulement vers ton e-mail de compte ou des destinataires « vérifiés » tant que le domaine n’est pas validé.',
      },
      { status: 502 }
    )
  }

  const { data: updatedRows, error: upErr } = await supabase
    .from('proches_connections')
    .update({
      partner_email: email,
      email_sent_at: new Date().toISOString(),
    })
    .eq('invite_code', codeNorm)
    .eq('owner_id', user.id)
    .select('id')

  if (upErr) {
    console.error('update proches_connections', upErr)
    return NextResponse.json({
      success: true,
      warning:
        `E-mail envoyé, mais la base n’a pas pu être mise à jour : ${upErr.message}. Vérifie les colonnes partner_email et email_sent_at (migration SQL).`,
    })
  }

  if (!updatedRows?.length) {
    return NextResponse.json({
      success: true,
      warning:
        "E-mail envoyé, mais aucune ligne d’invitation trouvée avec ce code. Vérifie que le code correspond bien à celle créée (même compte).",
    })
  }

  return NextResponse.json({ success: true })
}
