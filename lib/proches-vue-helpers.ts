import type { Phase } from '@/types'

const ENERGIE_EMOJIS: Record<number, string> = { 1: '😴', 2: '😕', 3: '😊', 4: '⚡', 5: '🚀' }

const HUMEUR_EMOJIS: Array<{ k: string; e: string }> = [
  { k: 'joye', e: '😄' },
  { k: 'serei', e: '😌' },
  { k: 'en paix', e: '☮️' },
  { k: 'confiant', e: '💪' },
  { k: 'détend', e: '🧘' },
  { k: 'calme', e: '😌' },
  { k: 'fatigu', e: '😴' },
  { k: 'triste', e: '😢' },
  { k: 'sensible', e: '🥺' },
  { k: 'sous pression', e: '😣' },
  { k: 'sous tension', e: '😬' },
  { k: 'tendu', e: '😬' },
  { k: 'tendue', e: '😬' },
  { k: 'surcharg', e: '😵' },
  { k: 'irrita', e: '😤' },
  { k: 'agac', e: '😣' },
  { k: 'fleur', e: '🌷' },
  { k: 'douce', e: '💮' },
  { k: 'douceur', e: '💮' },
  { k: 'envie d', e: '💫' },
  { k: 'joue', e: '😺' },
  { k: 'désir', e: '💫' },
  { k: 'désire', e: '✨' },
]

const LIBIDO_PTS: Record<string, number> = {
  Absente: 1,
  Faible: 2,
  Normale: 3,
  Élevée: 4,
  'Très élevée': 5,
}

export function energieGrandeFrappe(n: number | null | undefined): string {
  if (n == null || n < 1) return '—'
  return ENERGIE_EMOJIS[Math.min(5, Math.max(1, Math.round(n)))] ?? '😊'
}

export function humeurVersEmoji(phrase: string | null | undefined): string {
  if (phrase == null || phrase === '') return '—'
  const s = phrase.toLowerCase()
  for (const { k, e } of HUMEUR_EMOJIS) {
    if (s.includes(k)) return e
  }
  return '💬'
}

export function libidoVersPoints(n: string | null | undefined): number {
  if (n == null || n === '') return 0
  return LIBIDO_PTS[n.trim()] ?? 0
}

export const TITRE_HUMEUR_PHASE: Record<Phase, string> = {
  folliculaire: 'Elle est en pleine forme !',
  ovulation: 'Elle rayonne aujourd’hui !',
  menstruation: 'Elle a besoin de douceur 🌸',
  luteale: 'Elle est plus sensible ces jours-ci',
}
