import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Client Supabase « service_role » : contourne la RLS. Uniquement côté serveur,
 * pour les envois de notifications aux proches (abonnements d'une autre
 * utilisatrice) et le récap quotidien (aucune session). `null` si la clé manque
 * dans Vercel : les notifications sont alors simplement désactivées.
 */
export function clientAdmin(): SupabaseClient | null {
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!cle) return null
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, cle, { auth: { persistSession: false } })
}
