'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import { getUserPreferences } from '@/lib/db/parametres'

function echapperCsv(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function ligneCsv(cols: unknown[]): string {
  return cols.map(echapperCsv).join(',')
}

/** Export JSON : préférences, journaux, séances, mensurations, todos. */
export async function exporterDonneesJSON(): Promise<string> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connectée')

  const [prefs, dailyLogs, workouts, todos, mensRes] = await Promise.all([
    getUserPreferences(),
    supabase.from('daily_logs').select('*').eq('user_id', user.id).order('date', { ascending: true }),
    supabase.from('workouts').select('*').eq('user_id', user.id).order('date', { ascending: true }),
    supabase.from('todos').select('*').eq('user_id', user.id).order('date', { ascending: true }),
    supabase.from('mensurations').select('*').eq('user_id', user.id).order('date', { ascending: true }),
  ])

  const payload = {
    exporteLe: new Date().toISOString(),
    userId: user.id,
    preferences: prefs,
    daily_logs: dailyLogs.data ?? [],
    workouts: workouts.data ?? [],
    todos: todos.data ?? [],
    mensurations: mensRes.error ? [] : (mensRes.data ?? []),
  }

  return JSON.stringify(payload, null, 2)
}

/** Export CSV : blocs daily_logs puis workouts. */
export async function exporterDonneesCSV(): Promise<string> {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non connectée')

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  const { data: wos } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  const lignes: string[] = []
  lignes.push('# daily_logs')
  if (logs?.length) {
    const keys = Object.keys(logs[0])
    lignes.push(ligneCsv(keys))
    for (const row of logs) lignes.push(ligneCsv(keys.map((k) => (row as Record<string, unknown>)[k])))
  }
  lignes.push('')
  lignes.push('# workouts')
  if (wos?.length) {
    const keys = Object.keys(wos[0])
    lignes.push(ligneCsv(keys))
    for (const row of wos) lignes.push(ligneCsv(keys.map((k) => (row as Record<string, unknown>)[k])))
  }
  return lignes.join('\n')
}
