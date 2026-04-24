// ============================================================
// Options des sélecteurs (pills) du journal quotidien enrichi
// Toutes les listes de choix centralisées ici.
// ============================================================

import type { DailyLog, ExtendedLogData } from '@/types'

export const EMOTIONS = [
  'Joyeuse', 'Énergisée', 'Calme', 'Fatiguée', 'Stressée', 'Triste',
  'Irritée', 'Anxieuse', 'Motivée', 'Mélancolique', 'En forme', 'Massacrante',
] as const

export const SYMPTOMES = [
  'Mal au ventre', 'Mal au dos', 'Mal de tête', 'Nausées',
  'Seins sensibles', 'Ballonnements', 'Crampes', 'Spotting',
  'Jambes lourdes', 'Acné', 'Insomnie', 'Aucun symptôme',
] as const

export const LIBIDO_OPTIONS = [
  'Absente', 'Faible', 'Normale', 'Élevée', 'Très élevée',
] as const

export const SOMMEIL_OPTIONS = [
  'Très mauvais', 'Mauvais', 'Moyen', 'Bon', 'Très bon',
] as const

export const APPETIT_OPTIONS = [
  'Pas faim', 'Faim normale', 'Très faim',
  'Envie de sucre', 'Envie de salé', 'Envie de gras',
] as const

export const FLOT_OPTIONS = [
  'Léger', 'Normal', 'Abondant', 'Très abondant', 'Spotting',
] as const

/** Valeur initiale vide pour DailyLogSectionEtendue */
export const EXTENDED_LOG_INITIAL: ExtendedLogData = {
  emotions:      [],
  symptoms:      [],
  libido:        null,
  sleep_quality: null,
  sleep_hours:   '',
  appetite:      [],
  flow_intensity: null,
  free_note:     '',
}

/** Construit un ExtendedLogData depuis un DailyLog existant (pour l'édition) */
export function extendedLogFromExisting(log: {
  emotions?: string[] | null
  symptoms?: string[] | null
  libido?: string | null
  sleep_quality?: string | null
  sleep_hours?: number | null
  appetite?: string[] | null
  flow_intensity?: string | null
  free_note?: string | null
}): ExtendedLogData {
  return {
    emotions:      log.emotions      ?? [],
    symptoms:      log.symptoms      ?? [],
    libido:        log.libido        ?? null,
    sleep_quality: log.sleep_quality ?? null,
    sleep_hours:   log.sleep_hours != null ? String(log.sleep_hours) : '',
    appetite:      log.appetite      ?? [],
    flow_intensity: log.flow_intensity ?? null,
    free_note:     log.free_note     ?? '',
  }
}

/** Journal enrichi + reprise des émotions depuis l’ancien champ texte `mood` si besoin. */
export function extendedFromDailyLog(log: DailyLog): ExtendedLogData {
  const base = extendedLogFromExisting(log)
  if (base.emotions.length) return base
  const mood = log.mood?.trim()
  if (!mood) return base
  const matched: string[] = []
  for (const part of mood.split(',').map((s) => s.trim()).filter(Boolean)) {
    const hit = EMOTIONS.find((e) => e.toLowerCase() === part.toLowerCase())
    if (hit && !matched.includes(hit)) matched.push(hit)
  }
  return matched.length ? { ...base, emotions: matched } : base
}
