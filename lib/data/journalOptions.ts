// ============================================================
// Options des sélecteurs (pills) du journal quotidien enrichi
// ============================================================

import type { DailyLog, ExtendedLogData } from '@/types'

export const EMOTIONS = [
  'Joie',
  'Fatigue',
  'Irritabilité',
  'Anxiété',
  'Sérénité',
  'Tristesse',
  'Confiance',
] as const

export const SYMPTOMES = [
  'Crampes',
  'Maux de tête',
  'Gonflement',
  'Acné',
  'Sensibilité poitrine',
  'Fatigue',
] as const

export const LIBIDO_OPTIONS = ['Faible', 'Normale', 'Élevée'] as const

export const SOMMEIL_OPTIONS = ['Mauvaise', 'Moyenne', 'Bonne'] as const

export const STRESS_OPTIONS = ['Bas', 'Moyen', 'Élevé'] as const

export const APPETIT_OPTIONS = [
  'Normal',
  'Fringales sucrées',
  'Fringales salées',
  'Pas faim',
] as const

export const FLOT_OPTIONS = ['Léger', 'Moyen', 'Abondant'] as const

export const EXTENDED_LOG_INITIAL: ExtendedLogData = {
  emotions: [],
  symptoms: [],
  libido: null,
  sleep_quality: null,
  sleep_hours: '',
  stress_level: null,
  appetite: [],
  flow_intensity: null,
  free_note: '',
}

export function extendedLogFromExisting(log: {
  emotions?: string[] | null
  symptoms?: string[] | null
  libido?: string | null
  sleep_quality?: string | null
  sleep_hours?: number | null
  stress_level?: string | null
  appetite?: string[] | null
  flow_intensity?: string | null
  free_note?: string | null
}): ExtendedLogData {
  return {
    emotions: log.emotions ?? [],
    symptoms: log.symptoms ?? [],
    libido: log.libido ?? null,
    sleep_quality: log.sleep_quality ?? null,
    sleep_hours: log.sleep_hours != null ? String(log.sleep_hours) : '',
    stress_level: log.stress_level ?? null,
    appetite: log.appetite ?? [],
    flow_intensity: log.flow_intensity ?? null,
    free_note: log.free_note ?? '',
  }
}

/** Journal enrichi depuis un DailyLog existant. */
export function extendedFromDailyLog(log: DailyLog): ExtendedLogData {
  return extendedLogFromExisting(log)
}

/** Indique si le log contient des données enrichies. */
export function logAContenuEnrichi(log: DailyLog | null): boolean {
  if (!log) return false
  return Boolean(
    log.emotions?.length ||
      log.symptoms?.length ||
      log.libido ||
      log.sleep_quality ||
      log.sleep_hours != null ||
      log.stress_level ||
      log.appetite?.length ||
      log.flow_intensity ||
      log.free_note?.trim()
  )
}
