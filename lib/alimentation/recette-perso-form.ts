import type { Phase, TypeRepas } from '@/types'

export const TYPE_REPAS_OPTIONS: { v: TypeRepas; l: string }[] = [
  { v: 'petit-dej', l: 'Petit-déj' },
  { v: 'dejeuner', l: 'Déjeuner' },
  { v: 'collation', l: 'Collation' },
  { v: 'diner', l: 'Dîner' },
]

export const PHASE_OPTIONS: { v: Phase; l: string }[] = [
  { v: 'menstruation', l: 'Menstruation' },
  { v: 'folliculaire', l: 'Folliculaire' },
  { v: 'ovulation', l: 'Ovulation' },
  { v: 'luteale', l: 'Lutéale' },
]

export function parseNombreEntier(v: string): number {
  const n = Number.parseInt(v.replace(/\D/g, ''), 10)
  return Number.isNaN(n) ? 0 : n
}

export function parseIngredientsMultiline(brut: string): string[] {
  return brut
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
}
