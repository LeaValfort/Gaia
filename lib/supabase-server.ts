import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import type { NextRequest, NextResponse } from 'next/server'

async function creerClientBrut() {
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
            // Le proxy s'en charge dans ce cas
          }
        },
      },
    }
  )
}

/**
 * Vérification de l'utilisatrice, mémorisée pour toute la durée d'un rendu.
 * `auth.getUser()` interroge le serveur Supabase Auth à chaque appel : une page
 * l'appelait 3 à 5 fois (page + fonctions lib/db). `cache` de React garantit un
 * seul aller-retour par requête (hors rendu — routes API, actions — il appelle
 * simplement la fonction, sans mémoriser).
 */
const getUserParRequete = cache(async () => {
  const client = await creerClientBrut()
  return client.auth.getUser()
})

/**
 * Client Supabase pour les Server Components et les Route Handlers.
 * Contrairement à lib/supabase.ts (côté navigateur), celui-ci lit
 * les cookies HTTP pour récupérer la session de l'utilisatrice.
 * Un seul client par requête, et `auth.getUser()` sans argument passe
 * par la version mémorisée ci-dessus.
 */
export const creerClientServeur = cache(async () => {
  const client = await creerClientBrut()
  const getUserOriginal = client.auth.getUser.bind(client.auth)
  client.auth.getUser = (jwt?: string) => (jwt ? getUserOriginal(jwt) : getUserParRequete())
  return client
})

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
