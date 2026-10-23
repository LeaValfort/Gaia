import { clientAdmin } from '@/lib/supabase-admin'
import { envoyerAUtilisatrice } from '@/lib/push/envoi'
import { messageAlerte } from '@/lib/push/alertes'

/** Colonne d'autorisation (côté personne qui partage) pour chaque alerte immédiate. */
const FLAG: Record<'debut_regles' | 'douleur_haute', string> = {
  debut_regles: 'notif_debut_regles',
  douleur_haute: 'notif_douleur_haute',
}

export async function prenomDe(admin: NonNullable<ReturnType<typeof clientAdmin>>, userId: string): Promise<string> {
  const { data } = await admin.auth.admin.getUserById(userId)
  const m = data.user?.user_metadata as { full_name?: string; first_name?: string } | undefined
  return m?.full_name?.trim().split(/\s+/)[0] ?? m?.first_name ?? data.user?.email?.split('@')[0] ?? 'Ta proche'
}

/**
 * Alerte immédiate aux proches qui suivent `ownerId` (connexions actives ayant
 * autorisé ce type), au plus une fois par jour et par type. Ne lève jamais :
 * une notification ratée ne doit pas empêcher d'enregistrer le journal.
 */
export async function notifierProches(ownerId: string, type: 'debut_regles' | 'douleur_haute', date: string): Promise<void> {
  try {
    const admin = clientAdmin()
    if (!admin) return
    const { data: connexions } = await admin
      .from('proches_connections')
      .select('id, partner_id')
      .eq('owner_id', ownerId)
      .eq('status', 'active')
      .eq(FLAG[type], true)
      .not('partner_id', 'is', null)
    if (!connexions?.length) return

    const prenom = await prenomDe(admin, ownerId)
    const contenu = messageAlerte(type, prenom)
    for (const c of connexions) {
      // Anti-doublon : l'insertion échoue si l'alerte a déjà été envoyée aujourd'hui.
      const { error } = await admin.from('proches_notifs_envoyees').insert({ connection_id: c.id, type, date })
      if (error) continue
      await envoyerAUtilisatrice(admin, c.partner_id as string, contenu)
    }
  } catch (e) {
    console.error('notifierProches', JSON.stringify({ message: (e as Error).message }))
  }
}
