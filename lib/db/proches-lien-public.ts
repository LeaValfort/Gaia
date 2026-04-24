import { creerClientSupabaseAnonServeur } from '@/lib/supabase-anon-server'

export type ErreurRpcConnexionParCode = {
  code?: string
  message: string
  details?: string
  hint?: string
}

export type ResultatConnexionParCode = {
  data: unknown
  rpcError: ErreurRpcConnexionParCode | null
}

function estErreurRpcFonctionIntrouvable(error: { code?: string; message?: string }): boolean {
  if (error.code === 'PGRST202' || error.code === '42883') return true
  const m = (error.message ?? '').toLowerCase()
  return m.includes('could not find') && m.includes('function')
}

function erreurRpcVersObjet(error: {
  code?: string
  message?: string
  details?: string
  hint?: string
}): ErreurRpcConnexionParCode {
  return {
    code: error.code,
    message: error.message ?? 'Erreur RPC',
    details: error.details ?? undefined,
    hint: error.hint ?? undefined,
  }
}

/**
 * Vue publique d’une invitation (sans session) : RPC `fn_proches_public_view`.
 * Repli sur `fn_duo_public_view` si la migration SQL Proches n’est pas à jour.
 * Fichier **sans** `'use server'` : lecture DB appelée depuis un Server Component
 * (évite les effets de bord Next.js autour des Server Actions).
 */
export async function getConnectionByCode(code: string): Promise<ResultatConnexionParCode> {
  const supabase = creerClientSupabaseAnonServeur()
  const trimmed = code.trim()
  const premier = await supabase.rpc('fn_proches_public_view', { p_code: trimmed })

  if (!premier.error) {
    return { data: premier.data ?? null, rpcError: null }
  }

  if (estErreurRpcFonctionIntrouvable(premier.error)) {
    const legacy = await supabase.rpc('fn_duo_public_view', { p_code: trimmed })
    if (!legacy.error) {
      console.warn(
        'getConnectionByCode: fn_proches_public_view absente — fn_duo_public_view utilisée. Applique supabase/schema.sql sur Supabase.'
      )
      return { data: legacy.data ?? null, rpcError: null }
    }
    if (!estErreurRpcFonctionIntrouvable(legacy.error)) {
      console.error('getConnectionByCode (fn_duo_public_view):', legacy.error)
      return { data: null, rpcError: erreurRpcVersObjet(legacy.error) }
    }
  }

  console.error(
    'getConnectionByCode:',
    premier.error.code,
    premier.error.message,
    premier.error.details,
    premier.error.hint
  )
  return { data: null, rpcError: erreurRpcVersObjet(premier.error) }
}
