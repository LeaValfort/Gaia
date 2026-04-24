import { getConseilPartenaire } from '@/lib/data/conseils-partenaire'
import type { DailyLog, Phase, ProchePartageData, ProcheStatus, VisibiliteProche } from '@/types'

const ALPH = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

function segmentAleatoire(): string {
  let s = ''
  for (let i = 0; i < 4; i++) {
    s += ALPH[Math.floor(Math.random() * ALPH.length)]!
  }
  return s
}

/** Code unique type GAIA-XXXX (4 caractères alphanumériques). */
export function genererCodeInvitation(): string {
  return `GAIA-${segmentAleatoire()}`
}

/** Prénom / pseudo affiché (même logique que l’accueil Gaia) à partir du profil Supabase Auth. */
export function prenomAffichageDepuisUser(user: {
  email?: string | null
  user_metadata?: Record<string, unknown> | null
}): string {
  const meta = user.user_metadata
  if (meta && typeof meta.full_name === 'string' && meta.full_name.trim()) {
    return meta.full_name.trim().split(/\s+/)[0]!
  }
  if (meta && typeof meta.first_name === 'string' && meta.first_name.trim()) {
    return meta.first_name.trim()
  }
  const mail = user.email?.split('@')[0]
  return mail?.trim() || 'Ton partenaire'
}

const BASE_URL_DEFAUT = 'https://gaia-virid-alpha.vercel.app'

/** URL absolue vers la page « proche » (lien partagé). */
export function genererLienInvitation(code: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    BASE_URL_DEFAUT
  return `${base}/proches/${encodeURIComponent(code)}`
}

function visibiliteDepuisRpc(j: Record<string, unknown>): VisibiliteProche {
  return {
    phase: j.voir_phase !== false,
    energie: j.voir_energie !== false,
    douleur: j.voir_douleur !== false,
    humeur: j.voir_humeur !== false,
    conseils: j.voir_conseils !== false,
    libido: j.voir_libido === true,
    symptomes: j.voir_symptomes === true,
  }
}

type LogPartage = Pick<DailyLog, 'energy' | 'pain' | 'mood' | 'libido' | 'symptoms'>

function symptomesDepuisJson(j: Record<string, unknown>): string[] | null {
  const s = j.symptomes
  if (s == null) return null
  if (Array.isArray(s) && s.every((x) => typeof x === 'string')) return s as string[]
  return null
}

function logDepuisJsonRpc(j: Record<string, unknown>): LogPartage {
  return {
    energy: typeof j.energie === 'number' ? j.energie : null,
    pain: typeof j.douleur === 'number' ? j.douleur : null,
    mood: typeof j.humeur === 'string' ? j.humeur : null,
    libido: typeof j.libido === 'string' ? j.libido : null,
    symptoms: symptomesDepuisJson(j),
  }
}

export function formaterDonneesPartage(
  phase: Phase | null,
  jourDuCycle: number | null,
  log: LogPartage | null,
  prochaineCyclePredite: string | null,
  visibilite: VisibiliteProche
): ProchePartageData {
  const baseLib = log?.libido ?? null
  const baseSym = log?.symptoms ?? null
  return {
    phase,
    jourDuCycle,
    energie: log?.energy ?? null,
    douleur: log?.pain ?? null,
    humeur: log?.mood ?? null,
    libido: visibilite.libido ? (typeof baseLib === 'string' ? baseLib : null) : null,
    /** `null` = non partagé ; `[]` = partagé mais rien de saisi ce jour-là. */
    symptomes: visibilite.symptomes ? (baseSym ?? []) : null,
    conseilPartenaire: phase != null ? getConseilPartenaire(phase) : null,
    prochaineCyclePredite,
    visibilite,
  }
}

export interface ProcheRpcBrut {
  ok: boolean
  erreur?: string
  partner_name: string | null
  owner_display_name: string | null
  status: ProcheStatus
  phase: string | null
  jour_du_cycle: number | null
  energie: number | null
  douleur: number | null
  humeur: string | null
  prochaine_cycle_predite: string | null
}

function estPhase(v: string): v is Phase {
  return v === 'menstruation' || v === 'folliculaire' || v === 'ovulation' || v === 'luteale'
}

/** Normalise la valeur renvoyée par PostgREST pour une RPC `RETURNS jsonb` (objet, chaîne JSON, ou tableau). */
export function normaliserBrutRpcProche(raw: unknown): unknown {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as unknown
    } catch {
      return raw
    }
  }
  if (Array.isArray(raw) && raw.length === 1) {
    return normaliserBrutRpcProche(raw[0])
  }
  return raw
}

/** Interprète la réponse JSON de `fn_proches_public_view`. */
export function interpreterReponseRpcProche(
  raw: unknown
): {
  partage: ProchePartageData | null
  meta: { partnerName: string | null; ownerName: string | null; status: ProcheStatus }
  erreur?: string
} {
  const normalise = normaliserBrutRpcProche(raw)
  if (!normalise || typeof normalise !== 'object' || normalise === null) {
    return {
      partage: null,
      meta: { partnerName: null, ownerName: null, status: 'revoked' },
      erreur: 'Lien invalide ou expiré.',
    }
  }
  const j = normalise as Record<string, unknown>
  const vis: VisibiliteProche = visibiliteDepuisRpc(j)

  const okExplicitementFaux = j.ok === false || j.ok === 'false'
  if (okExplicitementFaux) {
    const msg =
      j.erreur === 'preferences_manquantes'
        ? 'Le cycle n’est pas encore configuré côté Gaia.'
        : 'Profil non disponible.'
    return {
      partage: null,
      meta: {
        partnerName: typeof j.partner_name === 'string' ? j.partner_name : null,
        ownerName: typeof j.owner_display_name === 'string' ? j.owner_display_name : null,
        status: 'revoked',
      },
      erreur: msg,
    }
  }
  const status = j.status === 'active' || j.status === 'pending' ? j.status : 'active'
  const meta = {
    partnerName: typeof j.partner_name === 'string' ? j.partner_name : null,
    ownerName: typeof j.owner_display_name === 'string' ? j.owner_display_name : null,
    status: status as ProcheStatus,
  }
  const ph = typeof j.phase === 'string' && estPhase(j.phase) ? j.phase : null
  const jour = typeof j.jour_du_cycle === 'number' ? j.jour_du_cycle : null
  const pred =
    typeof j.prochaine_cycle_predite === 'string' ? j.prochaine_cycle_predite : null
  if (!ph || jour === null) {
    return {
      partage: formaterDonneesPartage(null, null, logDepuisJsonRpc(j), pred, vis),
      meta,
      erreur: undefined,
    }
  }
  return {
    partage: formaterDonneesPartage(ph, jour, logDepuisJsonRpc(j), pred, vis),
    meta,
  }
}
