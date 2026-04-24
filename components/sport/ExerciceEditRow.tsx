'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ExerciceCustom } from '@/types'
import { cn } from '@/lib/utils'

function num(s: string, d: number) {
  const n = Number(s.replace(/,/g, '.'))
  return Number.isFinite(n) && n >= 0 ? n : d
}

export interface ExerciceEditRowProps {
  exercice: ExerciceCustom
  onModifier: (updates: Partial<ExerciceCustom>) => void
  onSupprimer: () => void
  className?: string
}

export function ExerciceEditRow({ exercice: ex, onModifier, onSupprimer, className }: ExerciceEditRowProps) {
  return (
    <div className={cn('flex flex-wrap items-end gap-1 rounded border border-neutral-200/80 p-2 dark:border-neutral-700', className)}>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{ex.nom}</span>
      <label className="text-[10px] text-neutral-500">
        s
        <Input
          className="h-7 w-[50px] px-1 text-center text-sm"
          inputMode="numeric"
          value={ex.seriesDefaut}
          onChange={(e) => onModifier({ seriesDefaut: Math.max(1, num(e.target.value, ex.seriesDefaut)) })}
        />
      </label>
      <label className="text-[10px] text-neutral-500">
        r
        <Input
          className="h-7 w-[50px] px-1 text-center text-sm"
          inputMode="numeric"
          value={ex.repsDefaut}
          onChange={(e) => onModifier({ repsDefaut: Math.max(1, num(e.target.value, ex.repsDefaut)) })}
        />
      </label>
      <label className="text-[10px] text-neutral-500">
        repos
        <Input
          className="h-7 w-[50px] px-1 text-center text-sm"
          inputMode="numeric"
          value={ex.reposSecondes}
          onChange={(e) => onModifier({ reposSecondes: Math.max(0, num(e.target.value, ex.reposSecondes)) })}
        />
      </label>
      <Button type="button" size="icon-sm" variant="ghost" onClick={onSupprimer} aria-label="Supprimer" className="h-7 w-7 text-neutral-500">
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  )
}
