import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

/**
 * Client Supabase pour les Server Components et les Route Handlers.
 * Contrairement à lib/supabase.ts (côté navigateur), celui-ci lit
 * les cookies HTTP pour récupérer la session de l'utilisatrice.
 */
export async function creerClientServeur() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll peut échouer dans les Server Components (lecture seule)
            // Le middleware s'en charge dans ce cas
          }
        },
      },
    }
  )
}

/**
 * Client Supabase pour la route GET `/auth/callback` uniquement.
 * Les cookies PKCE doivent être lus depuis la requête et la session
 * écrite sur la même {@link NextResponse} que la redirection, sinon
 * `exchangeCodeForSession` échoue avec `bad_oauth_state`.
 */
export function creerClientSupabaseAuthCallback(
  request: NextRequest,
  response: NextResponse,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )
}
