import { addDays, format, parseISO } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { getCycleDay, getPhaseForDay } from '@/lib/cycle'
import { procheFromRow } from '@/lib/proches-map'
import { prenomAffichageDepuisUser } from '@/lib/proches'
import type { Phase, ProcheConnection } from '@/types'

const DEFAULT_CYCLE = 28

export async function fetchProchesConnectionsClient(): Promise<ProcheConnection[]> {
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
    console.error('fetchProchesConnectionsClient:', error)
    return []
  }
  const label = prenomAffichageDepuisUser(user)
  return (data ?? []).map((r) => procheFromRow(r as Record<string, unknown>, label))
}

export interface CycleContextProches {
  userId: string
  phase: Phase
  jourDuCycle: number
  sansCycle: boolean
  prenom: string | null
  /** Aligné sur `fn_proches_public_view` (anchor + longueur cycle). */
  prochaineCyclePredite: string | null
}

export async function fetchCycleContextProches(): Promise<CycleContextProches | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('last_cycle_start, cycle_length, mode_utilisateur')
    .eq('user_id', user.id)
    .maybeSingle()

  const sansCycle = prefs?.mode_utilisateur === 'sans_cycle'
  const prenom = prenomAffichageDepuisUser(user)
  if (sansCycle || !prefs?.last_cycle_start) {
    return {
      userId: user.id,
      phase: 'folliculaire',
      jourDuCycle: 1,
      sansCycle: true,
      prenom,
      prochaineCyclePredite: null,
    }
  }

  const cycleLength = prefs.cycle_length ?? DEFAULT_CYCLE
  const jourDuCycle = getCycleDay(parseISO(prefs.last_cycle_start), new Date(), cycleLength)
  const phase = getPhaseForDay(jourDuCycle, cycleLength)
  const prochaineCyclePredite = format(
    addDays(parseISO(prefs.last_cycle_start), cycleLength),
    'yyyy-MM-dd'
  )
  return {
    userId: user.id,
    phase,
    jourDuCycle,
    sansCycle: false,
    prenom,
    prochaineCyclePredite,
  }
}

export interface JournalAujourdhui {
  energie: number | null
  douleur: number | null
  humeur: string | null
  libido: string | null
  /** Aligné `daily_logs.symptoms` (text[]). */
  symptomes: string[] | null
}

export async function fetchJournalAujourdhui(userId: string): Promise<JournalAujourdhui> {
  const d = new Date().toISOString().slice(0, 10)
  const { data } = await supabase
    .from('daily_logs')
    .select('energy, pain, mood, libido, symptoms')
    .eq('user_id', userId)
    .eq('date', d)
    .maybeSingle()

  if (!data) {
    return { energie: null, douleur: null, humeur: null, libido: null, symptomes: null }
  }
  const sym = data.symptoms
  const symptomes = Array.isArray(sym) && sym.every((x) => typeof x === 'string') ? (sym as string[]) : null
  return {
    energie: data.energy ?? null,
    douleur: data.pain ?? null,
    humeur: typeof data.mood === 'string' ? data.mood : null,
    libido: typeof data.libido === 'string' ? data.libido : null,
    symptomes,
  }
}
