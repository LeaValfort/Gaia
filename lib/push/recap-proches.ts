import { formatInTimeZone } from 'date-fns-tz'
import { clientAdmin } from '@/lib/supabase-admin'
import { envoyerAUtilisatrice } from '@/lib/push/envoi'
import { prenomDe } from '@/lib/push/notifier-proches'
import { energieBasse, humeurDifficile } from '@/lib/push/alertes'
import { CONSEILS_PHASE_DETAILS } from '@/lib/data/conseils-phase-cycle'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import type { DailyLog, Phase } from '@/types'

/**
 * Récap quotidien (une fois par jour, Vercel Cron) : pour chaque proche qui
 * reçoit et n'a pas désactivé le récap, une notification qui résume les
 * personnes suivies ayant noté une énergie basse ou une humeur difficile,
 * dans la limite de ce qu'elles partagent (voir_*), avec un conseil de phase.
 */
export async function envoyerRecapsProches(): Promise<{ envoyes: number }> {
  const admin = clientAdmin()
  if (!admin) return { envoyes: 0 }
  const date = formatInTimeZone(new Date(), 'Europe/Paris', 'yyyy-MM-dd')

  const { data: connexions } = await admin
    .from('proches_connections')
    .select('id, owner_id, partner_id, notif_energie_basse, notif_humeur_difficile, voir_energie, voir_humeur, voir_phase, voir_conseils')
    .eq('status', 'active')
    .not('partner_id', 'is', null)
  if (!connexions?.length) return { envoyes: 0 }

  const { data: prefs } = await admin.from('proches_notif_prefs').select('user_id, recap_actif')
  const desactives = new Set((prefs ?? []).filter((p) => p.recap_actif === false).map((p) => p.user_id as string))
  const ownerIds = [...new Set(connexions.map((c) => c.owner_id as string))]
  const { data: logs } = await admin.from('daily_logs').select('*').in('user_id', ownerIds).eq('date', date)
  const logParOwner = new Map((logs ?? []).map((l) => [l.user_id as string, l as DailyLog]))

  const prenoms = new Map<string, string>()
  for (const id of ownerIds) if (logParOwner.has(id)) prenoms.set(id, await prenomDe(admin, id))

  // Lignes du récap regroupées par proche qui reçoit.
  const lignes = new Map<string, string[]>()
  for (const c of connexions) {
    const partner = c.partner_id as string
    const log = logParOwner.get(c.owner_id as string)
    if (desactives.has(partner) || !log) continue
    const faits: string[] = []
    if (c.notif_energie_basse && c.voir_energie && energieBasse(log)) faits.push('énergie basse')
    if (c.notif_humeur_difficile !== false && c.voir_humeur && humeurDifficile(log)) faits.push('humeur difficile')
    if (!faits.length) continue
    const phase = c.voir_phase && log.phase ? (log.phase as Phase) : null
    const nom = prenoms.get(c.owner_id as string) ?? 'Ta proche'
    let texte = `${nom} : ${faits.join(', ')}${phase ? ` (${PHASES_DESIGN[phase]?.label ?? phase})` : ''}.`
    if (phase && c.voir_conseils) texte += ` ${CONSEILS_PHASE_DETAILS[phase]?.bienEtre ?? ''}`
    lignes.set(partner, [...(lignes.get(partner) ?? []), texte.trim()])
  }

  let envoyes = 0
  for (const [partner, l] of lignes) {
    envoyes += await envoyerAUtilisatrice(admin, partner, { titre: '💜 Récap de tes proches', corps: l.join('\n') })
  }
  return { envoyes }
}
