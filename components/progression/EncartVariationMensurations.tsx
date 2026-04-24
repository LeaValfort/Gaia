import { calculerVariation } from '@/lib/progression'
import type { PointGraphique } from '@/types'

function ligne(titre: string, points: PointGraphique[]) {
  const v = calculerVariation(points)
  if (v.debut == null || v.fin == null) return null
  const fl = v.variation != null && v.variation < 0 ? '📉' : v.variation != null && v.variation > 0 ? '📈' : '➖'
  const pct = v.pourcentage != null ? ` (${v.pourcentage > 0 ? '+' : ''}${v.pourcentage}%)` : ''
  return (
    <p className="text-sm text-neutral-700 dark:text-neutral-200">
      <span className="font-medium text-neutral-900 dark:text-neutral-50">{titre}</span>{' '}
      {v.debut} → {v.fin}
      {v.variation != null ? ` (${v.variation > 0 ? '+' : ''}${v.variation})` : ''}
      {pct} {fl}
    </p>
  )
}

interface EncartProps {
  poids: PointGraphique[]
  taille: PointGraphique[]
  hanches: PointGraphique[]
}

export function EncartVariationMensurations({ poids, taille, hanches }: EncartProps) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4 space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Depuis le début</p>
      {ligne('Poids', poids)}
      {ligne('Taille', taille)}
      {ligne('Hanches', hanches)}
    </div>
  )
}
