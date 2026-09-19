'use client'

import type { Phase } from '@/types'

interface SelecteurPhaseRecettesProps {
  phaseInitiale: Phase
  phaseSelectee: Phase
  onChange: (phase: Phase) => void
}

const PHASES_OPTIONS: { id: Phase; label: string; style: string; styleActif: string }[] = [
  { id: 'menstruation', label: '🩸 Règles',      style: 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-300',           styleActif: 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900/40 dark:border-red-500 dark:text-red-200' },
  { id: 'folliculaire', label: '🌱 Folliculaire', style: 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300', styleActif: 'bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-900/40 dark:border-amber-500 dark:text-amber-200' },
  { id: 'ovulation',    label: '🌸 Ovulation',   style: 'border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-300', styleActif: 'bg-orange-100 border-orange-400 text-orange-800 dark:bg-orange-900/40 dark:border-orange-500 dark:text-orange-200' },
  { id: 'luteale',      label: '🍂 Lutéale',     style: 'border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300', styleActif: 'bg-purple-100 border-purple-400 text-purple-800 dark:bg-purple-900/40 dark:border-purple-500 dark:text-purple-200' },
]

/** Boutons de sélection manuelle de la phase pour les suggestions de recettes. */
export function SelecteurPhaseRecettes({ phaseInitiale, phaseSelectee, onChange }: SelecteurPhaseRecettesProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-neutral-400">Phase du cycle · modifie si besoin</p>
      <div className="flex flex-wrap gap-2">
        {PHASES_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
              phaseSelectee === opt.id ? opt.styleActif : opt.style + ' bg-transparent hover:opacity-80'
            }`}
          >
            {opt.label}
            {opt.id === phaseInitiale && phaseSelectee !== opt.id && <span className="ml-1 opacity-50">(auto)</span>}
            {opt.id === phaseInitiale && phaseSelectee === opt.id && <span className="ml-1 opacity-60">✓ auto</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
