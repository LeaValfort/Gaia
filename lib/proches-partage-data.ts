import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formaterDonneesPartage } from '@/lib/proches'
import type { JournalAujourdhui } from '@/lib/proches-page-client'
import type { Phase, ProcheConnection, ProcheStatus, VisibiliteProche } from '@/types'

/** Même texte que sur la page lien public (date du prochain cycle). */
export function formaterProchaineCycleFr(iso: string | null): string | null {
  if (iso == null) return null
  try {
    return format(parseISO(iso), 'd MMMM yyyy', { locale: fr })
  } catch {
    return iso
  }
}

function visibiliteDepuisConnection(c: ProcheConnection): VisibiliteProche {
  return {
    phase: c.voir_phase,
    energie: c.voir_energie,
    douleur: c.voir_douleur,
    humeur: c.voir_humeur,
    conseils: c.voir_conseils,
    libido: c.voir_libido,
    symptomes: c.voir_symptomes,
  }
}

function logDepuisJournal(j: JournalAujourdhui) {
  return {
    energy: j.energie,
    pain: j.douleur,
    mood: j.humeur,
    libido: j.libido,
    symptoms: j.symptomes,
  }
}

export interface ProchePartageContext {
  phase: Phase | null
  jourDuCycle: number | null
  sansCycle: boolean
  journal: JournalAujourdhui
  prochaineCyclePredite: string | null
}

export function getProchePartageData(connection: ProcheConnection, ctx: ProchePartageContext) {
  const vis = visibiliteDepuisConnection(connection)
  const log = logDepuisJournal(ctx.journal)
  if (ctx.sansCycle) {
    return formaterDonneesPartage(null, null, log, null, vis)
  }
  if (ctx.phase == null || ctx.jourDuCycle == null) {
    return formaterDonneesPartage(null, null, log, ctx.prochaineCyclePredite, vis)
  }
  return formaterDonneesPartage(
    ctx.phase,
    ctx.jourDuCycle,
    log,
    ctx.prochaineCyclePredite,
    vis
  )
}

export function procheDepuisLienPublic(
  meta: { partnerName: string | null; ownerName: string | null; status: ProcheStatus },
  inviteCode: string,
  vis: VisibiliteProche
): ProcheConnection {
  return {
    id: 'lien',
    owner_id: '',
    partner_id: null,
    invite_code: inviteCode,
    invite_email: null,
    status: meta.status,
    partner_name: meta.partnerName,
    owner_display_name: meta.ownerName,
    notif_debut_regles: false,
    notif_energie_basse: false,
    notif_douleur_haute: false,
    voir_phase: true,
    voir_energie: true,
    voir_douleur: true,
    voir_humeur: true,
    voir_conseils: true,
    voir_libido: vis.libido,
    voir_symptomes: vis.symptomes,
    created_at: '',
    accepted_at: null,
  }
}
