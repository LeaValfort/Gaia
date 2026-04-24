'use client'

import { useMemo } from 'react'
import { dureeFaitsSecondes } from '@/lib/sport/muscuExerciceAdapte'
import type { ExerciceAdapte, TypeSeanceMuscle } from '@/types'

const LABEL: Record<TypeSeanceMuscle, string> = { full_body: 'Full body', upper_lower: 'Upper / Lower' }

export interface BilanSeanceProps {
  exercices: ExerciceAdapte[]
  exercicesFaits: string[]
  typeSeance: TypeSeanceMuscle
}

export function BilanSeance({ exercices, exercicesFaits, typeSeance }: BilanSeanceProps) {
  const y = exercicesFaits.length
  const total = exercices.length
  const sec = useMemo(() => dureeFaitsSecondes(exercicesFaits, exercices), [exercices, exercicesFaits])
  const min = Math.max(1, Math.round(sec / 60))
  return (
    <div className="rounded-xl border border-[#86EFAC] bg-[#F0FDF4] p-3 text-sm text-emerald-950 dark:border-emerald-800/50 dark:bg-emerald-950/35 dark:text-emerald-50">
      <p className="font-semibold">
        ✓ {y} / {total} exercices · ~{min} min · {LABEL[typeSeance]}
      </p>
    </div>
  )
}
