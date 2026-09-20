'use client'

import type { TypeRepas } from '@/types'

interface SelecteurRepasRecettesProps {
  repasSelectionne: TypeRepas
  onChange: (repas: TypeRepas) => void
}

const REPAS_OPTIONS: { id: TypeRepas; label: string }[] = [
  { id: 'petit-dej', label: '🌅 Petit-déj' },
  { id: 'dejeuner', label: '☀️ Déjeuner' },
  { id: 'collation', label: '🍎 Collation' },
  { id: 'diner', label: '🌙 Dîner' },
]

/** Sélection du créneau visé par les recettes générées : détermine l'objectif macro de l'IA. */
export function SelecteurRepasRecettes({ repasSelectionne, onChange }: SelecteurRepasRecettesProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-neutral-400">Pour quel repas ?</p>
      <div className="flex flex-wrap gap-2">
        {REPAS_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
              repasSelectionne === opt.id
                ? 'bg-violet-100 border-violet-400 text-violet-800 dark:bg-violet-900/40 dark:border-violet-500 dark:text-violet-200'
                : 'border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300 bg-transparent hover:opacity-80'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
