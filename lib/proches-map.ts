import type { ProcheConnection } from '@/types'

function boolDef(v: unknown, def: boolean): boolean {
  if (typeof v === 'boolean') return v
  return def
}

function relationDepuisRow(row: Record<string, unknown>): 'partenaire' | 'ami' | 'famille' | undefined {
  const r = row.relation_type
  if (r === 'partenaire' || r === 'ami' || r === 'famille') return r
  return undefined
}

export function procheFromRow(row: Record<string, unknown>, ownerName?: string | null): ProcheConnection {
  const rel = relationDepuisRow(row)
  return {
    id: row.id as string,
    owner_id: row.owner_id as string,
    partner_id: (row.partner_id as string | null) ?? null,
    invite_code: row.invite_code as string,
    invite_email: (row.invite_email as string | null) ?? null,
    status: row.status as ProcheConnection['status'],
    partner_name: (row.partner_name as string | null) ?? null,
    owner_display_name: (row.owner_display_name as string | null | undefined) ?? ownerName ?? null,
    notif_debut_regles: Boolean(row.notif_debut_regles),
    notif_energie_basse: Boolean(row.notif_energie_basse),
    notif_douleur_haute: Boolean(row.notif_douleur_haute),
    voir_phase: row.voir_phase === undefined ? true : boolDef(row.voir_phase, true),
    voir_energie: row.voir_energie === undefined ? true : boolDef(row.voir_energie, true),
    voir_douleur: row.voir_douleur === undefined ? true : boolDef(row.voir_douleur, true),
    voir_humeur: row.voir_humeur === undefined ? true : boolDef(row.voir_humeur, true),
    voir_conseils: row.voir_conseils === undefined ? true : boolDef(row.voir_conseils, true),
    voir_libido: row.voir_libido === undefined ? false : boolDef(row.voir_libido, false),
    voir_symptomes: row.voir_symptomes === undefined ? false : boolDef(row.voir_symptomes, false),
    created_at: row.created_at as string,
    accepted_at: (row.accepted_at as string | null) ?? null,
    ...(rel ? { relation_type: rel } : {}),
  }
}
