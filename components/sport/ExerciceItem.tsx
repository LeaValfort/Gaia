'use client'

import { exSansChargeDumbbell, pctAdapte } from '@/lib/sport/muscuExerciceAdapte'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import type { ExerciceAdapte, Phase } from '@/types'
import { cn } from '@/lib/utils'

export interface ExerciceItemProps {
  exercice: ExerciceAdapte
  fait: boolean
  charge: number | null
  onToggle: () => void
  onChargeChange: (charge: number) => void
  enCours?: boolean
  phase?: Phase | null
  domId?: string
}

export function ExerciceItem({
  exercice: ex,
  fait,
  charge,
  onToggle,
  onChargeChange,
  enCours,
  phase,
  domId,
}: ExerciceItemProps) {
  const sansBarre = exSansChargeDumbbell(ex.nom)
  const pct = pctAdapte(ex)
  const d = phase ? PHASES_DESIGN[phase] : null
  const u = ex.unite === 'secondes' ? 's' : 'reps'
  return (
    <div
      id={domId}
      className={cn(
        'flex flex-col gap-2 rounded-xl border p-3 text-sm',
        'border-neutral-200 dark:border-neutral-700',
        fait && 'opacity-50',
        enCours && !d && 'border-2 border-rose-500/80 bg-rose-50/50 dark:border-rose-500 dark:bg-rose-950/30'
      )}
      style={enCours && d ? { borderColor: d.accent, backgroundColor: `${d.bgCard}55` } : undefined}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2',
            fait ? 'border-rose-600 bg-rose-500 text-white' : 'border-neutral-300 dark:border-neutral-500'
          )}
        >
          {fait ? '✓' : ''}
        </button>
        <div className="min-w-0 flex-1">
          <p className={cn('font-medium text-neutral-900 dark:text-neutral-100', fait && 'line-through')}>
            {ex.nom}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {ex.muscles.map((m) => (
              <span key={m} className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">
                {m}
              </span>
            ))}
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {ex.seriesAdaptees} × {ex.repsAdaptees} {u} · repos {ex.reposSecondes}s
          </p>
        </div>
        {pct != null && ex.estAdapte ? (
          <span className="shrink-0 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
            {pct}%
          </span>
        ) : null}
      </div>
      {sansBarre ? null : (
        <div className="ml-8 flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
          <span>Charge (kg) :</span>
          <input
            type="number"
            step="0.5"
            className="w-20 rounded border border-neutral-200 bg-white px-1.5 py-1 dark:border-neutral-600 dark:bg-neutral-900"
            value={charge ?? ''}
            onChange={(e) => onChargeChange(Number(e.target.value))}
          />
          {ex.chargeOriginale != null && ex.chargeOriginale > 0 ? (
            <span className="text-neutral-400">Dernière : {ex.chargeOriginale} kg</span>
          ) : null}
        </div>
      )}
    </div>
  )
}
