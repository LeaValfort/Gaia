import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase **anon** sans persistance de session (ni cookies).
 * À utiliser pour les lectures publiques (ex. RPC `fn_proches_public_view`) afin
 * d’éviter qu’un JWT obsolète dans les cookies n’envoie une requête en rôle
 * `authenticated` et ne fasse échouer l’appel alors que le visiteur n’a pas de compte.
 */
export function creerClientSupabaseAnonServeur() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url?.trim() || !key?.trim()) {
    throw new Error(
      'Variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY requises (.env.local).'
    )
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
