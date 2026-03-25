import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Proxy Next.js 16 — s'exécute sur CHAQUE requête avant le rendu (Node.js runtime).
 * Deux rôles :
 * 1. Rafraîchir automatiquement la session Supabase (token JWT)
 * 2. Rediriger vers /login si l'utilisatrice n'est pas connectée
 */
export async function proxy(request: NextRequest) {
  let reponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Met à jour les cookies dans la requête et la réponse
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          reponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            reponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Récupère la session — rafraîchit le token si nécessaire
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirige vers /login si non connectée (sauf pour /login et /auth/*)
  const estPagePublique = pathname.startsWith('/login') || pathname.startsWith('/auth')
  if (!user && !estPagePublique) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirige vers l'accueil si déjà connectée et sur /login
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return reponse
}

// Le proxy s'applique à toutes les routes sauf les assets statiques
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
