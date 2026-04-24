'use server'

import { genererCodeInvitation, prenomAffichageDepuisUser } from '@/lib/proches'
import { procheFromRow } from '@/lib/proches-map'
import { creerClientServeur } from '@/lib/supabase-server'
import type { ProcheConnection } from '@/types'

function messageErreurInvitationSupabase(error: {
  code?: string
  message?: string
  details?: string
  hint?: string
}): string {
  const msg = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`.toLowerCase()
  if (msg.includes('relation') && msg.includes('does not exist')) {
    return 'La table Proches est absente : exécute la section « proches_connections » du fichier supabase/schema.sql.'
  }
  if (error.code === '42501' || msg.includes('row-level security') || msg.includes('permission denied')) {
    return 'Accès refusé par Supabase (RLS). Exécute les policies Proches du schema.sql ou la fonction fn_proches_create_invitation.'
  }
  if (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    (msg.includes('function') && (msg.includes('does not exist') || msg.includes('not found')))
  ) {
    return 'Fonction SQL manquante : dans Supabase → SQL, exécute fn_proches_create_invitation (voir supabase/schema.sql).'
  }
  return error.message?.trim() || 'Impossible de créer l’invitation.'
}

function mapConnexionDepuisRpc(j: Record<string, unknown>): ProcheConnection {
  return procheFromRow({ ...j } as Record<string, unknown>)
}

export async function getProchesConnections(): Promise<ProcheConnection[]> {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('proches_connections')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getProchesConnections:', error)
    return []
  }
  const label = prenomAffichageDepuisUser(user)
  return (data ?? []).map((r) => procheFromRow(r as Record<string, unknown>, label))
}

export async function creerInvitationProche(
  partnerName: string,
  inviteEmail: string | null
): Promise<{ ok: true; connection: ProcheConnection } | { ok: false; message: string }> {
  const nom = partnerName.trim()
  if (nom.length < 1) return { ok: false, message: 'Indique le prénom du partenaire.' }

  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'Connexion requise.' }

  const emailNorm = inviteEmail?.trim() || ''

  for (let t = 0; t < 12; t++) {
    const code = genererCodeInvitation()

    const rpc = await supabase.rpc('fn_proches_create_invitation', {
      p_partner_name: nom,
      p_invite_email: emailNorm,
      p_invite_code: code,
    })

    if (!rpc.error && rpc.data != null && typeof rpc.data === 'object') {
      const j = rpc.data as Record<string, unknown>
      if (j.ok === true && typeof j.invite_code === 'string') {
        const base = mapConnexionDepuisRpc(j)
        return {
          ok: true,
          connection: {
            ...base,
            owner_display_name:
              typeof j.owner_display_name === 'string' && j.owner_display_name.trim()
                ? j.owner_display_name
                : prenomAffichageDepuisUser(user),
          },
        }
      }
      if (j.ok === false && j.error === 'code_collision') {
        continue
      }
      if (j.ok === false && j.error === 'not_authenticated') {
        return { ok: false, message: 'Connexion requise.' }
      }
      if (j.ok === false && j.error === 'partner_name_required') {
        return { ok: false, message: 'Indique le prénom du partenaire.' }
      }
      if (j.ok === false && j.error === 'insert_failed' && typeof j.detail === 'string') {
        console.error('creerInvitationProche insert_failed:', j.detail)
        return {
          ok: false,
          message:
            process.env.NODE_ENV === 'development'
              ? `Base de données : ${j.detail}`
              : 'Impossible de créer l’invitation (vérifie la migration SQL sur Supabase).',
        }
      }
      if (j.ok === false) {
        console.error('creerInvitationProche rpc ok:false', j)
        return { ok: false, message: 'Impossible de créer l’invitation.' }
      }
    }

    const fnAbsente =
      rpc.error &&
      (rpc.error.code === 'PGRST202' ||
        rpc.error.code === '42883' ||
        /function.*not.*exist|could not find.*function/i.test(rpc.error.message ?? ''))

    if (rpc.error && !fnAbsente) {
      console.error('creerInvitationProche rpc:', rpc.error)
      return { ok: false, message: messageErreurInvitationSupabase(rpc.error) }
    }

    const { data, error } = await supabase
      .from('proches_connections')
      .insert({
        owner_id: user.id,
        partner_id: null,
        invite_code: code,
        invite_email: emailNorm || null,
        status: 'pending',
        partner_name: nom,
        notif_debut_regles: true,
        notif_energie_basse: true,
        notif_douleur_haute: true,
        voir_phase: true,
        voir_energie: true,
        voir_douleur: true,
        voir_humeur: true,
        voir_conseils: true,
        voir_libido: false,
        voir_symptomes: false,
      })
      .select('*')
      .single()

    if (!error && data) {
      return {
        ok: true,
        connection: procheFromRow(data as Record<string, unknown>, prenomAffichageDepuisUser(user)),
      }
    }
    if (error?.code !== '23505') {
      console.error('creerInvitationProche insert:', error)
      return { ok: false, message: messageErreurInvitationSupabase(error ?? { message: 'Erreur inconnue' }) }
    }
  }
  return { ok: false, message: 'Réessaie dans un instant (code en collision).' }
}

export async function revoquerConnexionProche(connectionId: string): Promise<boolean> {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('proches_connections')
    .update({ status: 'revoked' })
    .eq('id', connectionId)
    .eq('owner_id', user.id)

  if (error) {
    console.error('revoquerConnexionProche:', error)
    return false
  }
  return true
}

export async function supprimerConnexionProche(connectionId: string): Promise<boolean> {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('proches_connections')
    .delete()
    .eq('id', connectionId)
    .eq('owner_id', user.id)

  if (error) {
    console.error('supprimerConnexionProche:', error)
    return false
  }
  return true
}

export type PatchProcheConnection = Partial<{
  notif_debut_regles: boolean
  notif_energie_basse: boolean
  notif_douleur_haute: boolean
  voir_phase: boolean
  voir_energie: boolean
  voir_douleur: boolean
  voir_humeur: boolean
  voir_conseils: boolean
  voir_libido: boolean
  voir_symptomes: boolean
}>

export async function updateProcheConnection(
  connectionId: string,
  patch: PatchProcheConnection
): Promise<boolean> {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('proches_connections')
    .update(patch)
    .eq('id', connectionId)
    .eq('owner_id', user.id)

  if (error) {
    console.error('updateProcheConnection:', error)
    return false
  }
  return true
}
