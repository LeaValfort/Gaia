import { clientAdmin } from '@/lib/supabase-admin'
import { envoyerAUtilisatrice } from '@/lib/push/envoi'

/** Date (yyyy-MM-dd) et heure (HH:MM) actuelles à Paris, quel que soit le fuseau du serveur. */
function maintenantParis(): { date: string; heure: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  )
  return { date: `${parts.year}-${parts.month}-${parts.day}`, heure: `${parts.hour}:${parts.minute}` }
}

/**
 * Rappel de pilule, appelé toutes les ~10 min : envoie une notification à
 * chaque utilisatrice dont l'heure est passée aujourd'hui, si la pilule n'est
 * pas encore cochée et que le rappel n'est pas déjà parti (une fois par jour).
 */
export async function envoyerRappelsPilule(): Promise<{ envoyes: number; raison?: string }> {
  const admin = clientAdmin()
  if (!admin) return { envoyes: 0, raison: 'SUPABASE_SERVICE_ROLE_KEY absente' }
  const { date, heure } = maintenantParis()

  const { data: reglages, error } = await admin.from('pilule_reglages').select('user_id, heure').eq('rappel_actif', true)
  if (error) return { envoyes: 0, raison: error.message }

  let envoyes = 0
  // Comparaison de chaînes « HH:MM » : fiable car toujours sur 2 chiffres.
  for (const r of (reglages ?? []).filter((x) => String(x.heure) <= heure)) {
    const userId = r.user_id as string
    const { data: prise } = await admin.from('prises_pilule').select('date').eq('user_id', userId).eq('date', date).maybeSingle()
    if (prise) continue
    const { error: dejaEnvoye } = await admin.from('rappels_pilule_envoyes').insert({ user_id: userId, date })
    if (dejaEnvoye) continue
    envoyes += await envoyerAUtilisatrice(admin, userId, { titre: '💊 Ta pilule', corps: 'C’est l’heure de ta pilule. Pense à la cocher dans Gaia.', url: '/cycle' })
  }
  return { envoyes }
}
