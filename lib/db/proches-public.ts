'use server'

import { getConnectionByCode } from '@/lib/db/proches-lien-public'

/** Données brutes renvoyées par la RPC `fn_proches_public_view` (accès anonyme autorisé). */
export async function chargerVuePubliqueProche(code: string): Promise<unknown> {
  const r = await getConnectionByCode(code)
  return r.data
}
