import { NextResponse } from 'next/server'
import { creerClientServeur } from '@/lib/supabase-server'

/**
 * Route de callback OAuth Google.
 * Après que Google a authentifié l'utilisatrice, il la renvoie ici
 * avec un code temporaire. On échange ce code contre une vraie session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await creerClientServeur()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Connexion réussie → redirige vers la page d'accueil
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // En cas d'erreur → redirige vers /login avec un message
  return NextResponse.redirect(`${origin}/login?erreur=callback`)
}
