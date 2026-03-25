import { createBrowserClient } from '@supabase/ssr'

/**
 * Client Supabase côté navigateur.
 * Utilise createBrowserClient (@supabase/ssr) plutôt que createClient
 * pour stocker le code PKCE dans les cookies (et non localStorage),
 * ce qui permet au serveur de lire la session lors du callback OAuth.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
