import { NextResponse, type NextRequest } from 'next/server'
import { creerClientSupabaseAuthCallback } from '@/lib/supabase-server'

function baseRedirection(request: NextRequest, origin: string) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocal = process.env.NODE_ENV === 'development'
  if (!isLocal && forwardedHost) {
    return `https://${forwardedHost}`
  }
  return origin
}

/**
 * Route de callback OAuth (Google, etc.).
 * PKCE : lire les cookies sur la requête et appliquer Set-Cookie sur la
 * réponse de redirection (obligatoire dans les Route Handlers Next.js).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const origin = url.origin
  const base = baseRedirection(request, origin)

  const oauthError = url.searchParams.get('error')
  if (oauthError) {
    const code = url.searchParams.get('error_code') ?? ''
    const msg = url.searchParams.get('error_description') ?? oauthError
    const q = new URLSearchParams({ erreur: 'oauth' })
    if (code) q.set('code', code)
    if (msg) q.set('msg', msg)
    return NextResponse.redirect(`${base}/login?${q.toString()}`)
  }

  const code = url.searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(`${base}/login?erreur=callback`)
  }

  let next = url.searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) next = '/'

  const response = NextResponse.redirect(`${base}${next}`)
  const supabase = creerClientSupabaseAuthCallback(request, response)
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const q = new URLSearchParams({
      erreur: 'callback',
      msg: error.message,
    })
    return NextResponse.redirect(`${base}/login?${q.toString()}`)
  }

  return response
}
