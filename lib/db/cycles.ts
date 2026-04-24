'use server'

import { format, parseISO, subDays } from 'date-fns'
import { calculerStatsCycles } from '@/lib/cycle'
import { creerClientServeur } from '@/lib/supabase-server'
import type { Cycle, CycleStats, UserPreferences } from '@/types'
import { DEFAULT_CYCLE_LENGTH } from '@/types'
import { getPreferencesUtilisateur } from '@/lib/db/cycle'
import { updateUserPreferences } from '@/lib/db/parametres'

function mapCycle(row: Record<string, unknown>): Cycle {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    start_date: row.start_date as string,
    end_date: (row.end_date as string | null | undefined) ?? null,
    cycle_length: (row.cycle_length as number) ?? DEFAULT_CYCLE_LENGTH,
    period_length:
      row.period_length === undefined || row.period_length === null
        ? null
        : (row.period_length as number),
    notes: (row.notes as string | null) ?? null,
    created_at: row.created_at as string,
  }
}

function normaliseDateDebutISO(dateDebutISO: string): string {
  const t = dateDebutISO.trim()
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(t)
  return m ? m[1] : t.slice(0, 10)
}

function cycleLengthInsertSafe(
  stats: CycleStats | null,
  prefs: UserPreferences | null
): number {
  const raw = Number(stats?.cycle_length_moyen ?? prefs?.cycle_length ?? DEFAULT_CYCLE_LENGTH)
  const n = Math.round(raw)
  if (!Number.isFinite(n) || n < 10 || n > 60) return DEFAULT_CYCLE_LENGTH
  return n
}

function messageErreurCycle(err: { code?: string; message?: string }): string {
  if (err.code === '23505') {
    return 'Une entrée existe déjà pour cette date. Rafraîchis la page ou choisis une autre date.'
  }
  if (err.code === '42501' || (err.message && /row-level security|RLS/i.test(err.message))) {
    return 'Écriture refusée par la base (droits). Déconnecte-toi puis reconnecte-toi. Si le problème continue, exécute la migration SQL « cycles RLS » du dossier supabase du projet.'
  }
  if (err.code === '42703') {
    return 'La base « cycles » n’a pas toutes les colonnes attendues (souvent end_date / period_length). Dans Supabase → SQL Editor, exécute le fichier supabase/migrations/20260416130000_cycles_columns_manquantes.sql puis réessaie.'
  }
  const code = err.code ? ` [${err.code}]` : ''
  return `Enregistrement impossible.${code}`
}

function mapStats(row: Record<string, unknown>): CycleStats {
  return {
    user_id: row.user_id as string,
    cycle_length_moyen: (row.cycle_length_moyen as number | null) ?? null,
    period_length_moyen: (row.period_length_moyen as number | null) ?? null,
    phase_menstruation_j: (row.phase_menstruation_j as number | null) ?? null,
    phase_folliculaire_j: (row.phase_folliculaire_j as number | null) ?? null,
    phase_ovulation_j: (row.phase_ovulation_j as number | null) ?? null,
    phase_luteale_j: (row.phase_luteale_j as number | null) ?? null,
    nb_cycles_utilise: (row.nb_cycles_utilise as number) ?? 0,
    fiabilite: (row.fiabilite as CycleStats['fiabilite']) ?? 'faible',
    derniere_maj: (row.derniere_maj as string) ?? new Date().toISOString(),
  }
}

/** Historique des cycles (plus récent en premier). */
export async function getCyclesHistorique(): Promise<Cycle[]> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })
      .limit(48)

    if (error) throw error
    return (data ?? []).map((r) => mapCycle(r as Record<string, unknown>))
  } catch (e) {
    console.error('getCyclesHistorique:', e)
    return []
  }
}

export async function getCycleStats(): Promise<CycleStats | null> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('cycle_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') throw error
    return data ? mapStats(data as Record<string, unknown>) : null
  } catch (e) {
    console.error('getCycleStats:', e)
    return null
  }
}

export async function recalculerCycleStats(): Promise<void> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: rows, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: true })

  if (error) {
    console.error('recalculerCycleStats fetch:', error)
    return
  }

  const cyclesAsc = (rows ?? []).map((r) => mapCycle(r as Record<string, unknown>))
  const computed = calculerStatsCycles(cyclesAsc)

  const { error: upErr } = await supabase.from('cycle_stats').upsert(
    {
      user_id: user.id,
      ...computed,
      derniere_maj: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (upErr) console.error('recalculerCycleStats upsert:', upErr)
}

/**
 * Ancre d’affichage : dernier cycle en base, sinon préférences.
 * Longueur : moyenne apprise si disponible, sinon préférence.
 */
export async function getDonneesCyclePourAffichage(): Promise<{
  prefs: UserPreferences | null
  cycles: Cycle[]
  stats: CycleStats | null
  effectiveStart: string | null
  cycleLength: number
}> {
  const [prefs, cyclesDesc, stats] = await Promise.all([
    getPreferencesUtilisateur(),
    getCyclesHistorique(),
    getCycleStats(),
  ])

  const latest = cyclesDesc[0]
  const effectiveStart = latest?.start_date ?? prefs?.last_cycle_start ?? null
  const cycleLength =
    stats?.cycle_length_moyen ?? prefs?.cycle_length ?? DEFAULT_CYCLE_LENGTH

  return { prefs, cycles: cyclesDesc, stats, effectiveStart, cycleLength }
}

/**
 * Enregistre le début des règles : ferme le cycle ouvert, crée la ligne,
 * synchronise `last_cycle_start` et recalcule les stats.
 */
export async function signalerDebutCycle(
  dateDebutISO: string,
  dureeRegles: number
): Promise<{ ok: boolean; message?: string }> {
  if (dureeRegles < 1 || dureeRegles > 14) {
    return { ok: false, message: 'Durée des règles entre 1 et 14 jours.' }
  }

  const d = normaliseDateDebutISO(dateDebutISO)

  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, message: 'Connexion requise.' }

    const prefs = await getPreferencesUtilisateur()
    const stats = await getCycleStats()
    const cycleLenSafe = cycleLengthInsertSafe(stats, prefs)

    const { data: existRows, error: existErr } = await supabase
      .from('cycles')
      .select('id')
      .eq('user_id', user.id)
      .eq('start_date', d)
      .limit(1)

    if (existErr) {
      console.error('signalerDebutCycle lecture existant:', existErr)
      return { ok: false, message: messageErreurCycle(existErr) }
    }

    const existId = existRows?.[0]?.id

    if (existId) {
      const { error: upExistErr } = await supabase
        .from('cycles')
        .update({ period_length: dureeRegles, cycle_length: cycleLenSafe })
        .eq('id', existId)

      if (upExistErr) {
        console.error('signalerDebutCycle mise à jour existant:', upExistErr)
        return { ok: false, message: messageErreurCycle(upExistErr) }
      }

      await updateUserPreferences({ last_cycle_start: d, cycle_length: cycleLenSafe })
      await recalculerCycleStats()
      return { ok: true }
    }

    const { data: ouvert, error: ouvertErr } = await supabase
      .from('cycles')
      .select('id, start_date')
      .eq('user_id', user.id)
      .is('end_date', null)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (ouvertErr) {
      console.error('signalerDebutCycle lecture ouvert:', ouvertErr)
      return { ok: false, message: messageErreurCycle(ouvertErr) }
    }

    if (ouvert?.id && ouvert.start_date === d) {
      const { error: upSameErr } = await supabase
        .from('cycles')
        .update({ period_length: dureeRegles, cycle_length: cycleLenSafe })
        .eq('id', ouvert.id)

      if (upSameErr) {
        console.error('signalerDebutCycle même date:', upSameErr)
        return { ok: false, message: messageErreurCycle(upSameErr) }
      }

      await updateUserPreferences({ last_cycle_start: d, cycle_length: cycleLenSafe })
      await recalculerCycleStats()
      return { ok: true }
    }

    if (ouvert?.id && d < ouvert.start_date) {
      const { error: corrErr } = await supabase
        .from('cycles')
        .update({
          start_date: d,
          period_length: dureeRegles,
          cycle_length: cycleLenSafe,
        })
        .eq('id', ouvert.id)

      if (corrErr) {
        console.error('signalerDebutCycle correction date:', corrErr)
        return { ok: false, message: messageErreurCycle(corrErr) }
      }

      await updateUserPreferences({
        last_cycle_start: d,
        cycle_length: cycleLenSafe,
      })
      await recalculerCycleStats()
      return { ok: true }
    }

    if (ouvert?.id && ouvert.start_date < d) {
      const fin = format(subDays(parseISO(d), 1), 'yyyy-MM-dd')
      const { error: closeErr } = await supabase
        .from('cycles')
        .update({ end_date: fin })
        .eq('id', ouvert.id)

      if (closeErr) {
        console.error('signalerDebutCycle fermeture cycle:', closeErr)
        return { ok: false, message: messageErreurCycle(closeErr) }
      }
    }

    const { error: insErr } = await supabase.from('cycles').insert({
      user_id: user.id,
      start_date: d,
      period_length: dureeRegles,
      cycle_length: cycleLenSafe,
    })

    if (insErr) {
      if (insErr.code === '23505') {
        const { data: dupRows } = await supabase
          .from('cycles')
          .select('id')
          .eq('user_id', user.id)
          .eq('start_date', d)
          .limit(1)
        const dupId = dupRows?.[0]?.id
        if (dupId) {
          const { error: mergeErr } = await supabase
            .from('cycles')
            .update({ period_length: dureeRegles, cycle_length: cycleLenSafe })
            .eq('id', dupId)
          if (!mergeErr) {
            await updateUserPreferences({
              last_cycle_start: d,
              cycle_length: cycleLenSafe,
            })
            await recalculerCycleStats()
            return { ok: true }
          }
        }
      }
      console.error('signalerDebutCycle insert:', insErr)
      return { ok: false, message: messageErreurCycle(insErr) }
    }

    await updateUserPreferences({
      last_cycle_start: d,
      cycle_length: cycleLenSafe,
    })
    await recalculerCycleStats()
    return { ok: true }
  } catch (e) {
    console.error('signalerDebutCycle:', e)
    return { ok: false, message: 'Erreur inattendue.' }
  }
}

export async function updatePeriodLength(
  cycleId: string,
  dureeRegles: number
): Promise<{ ok: boolean; message?: string }> {
  if (dureeRegles < 1 || dureeRegles > 14) {
    return { ok: false, message: 'Durée entre 1 et 14 jours.' }
  }
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, message: 'Connexion requise.' }

    const { error } = await supabase
      .from('cycles')
      .update({ period_length: dureeRegles })
      .eq('id', cycleId)
      .eq('user_id', user.id)

    if (error) {
      console.error('updatePeriodLength:', error)
      return { ok: false, message: 'Mise à jour impossible.' }
    }
    await recalculerCycleStats()
    return { ok: true }
  } catch (e) {
    console.error('updatePeriodLength:', e)
    return { ok: false, message: 'Erreur inattendue.' }
  }
}
