'use client'

import { useState } from 'react'
import { MACROS_JOURNEE, LABELS_JOURNEE } from '@/lib/nutrition'
import type { TypeJournee, Phase } from '@/types'

const TYPES_JOURNEE: TypeJournee[] = ['sport', 'yoga', 'repos', 'regles']

interface MacrosJourProps {
  phase: Phase | null
  onTypeChange?: (type: TypeJournee) => void
}

export function MacrosJour({ phase, onTypeChange }: MacrosJourProps) {
  const typeDefaut: TypeJournee = phase === 'menstruation' ? 'regles' : 'repos'
  const [typeJournee, setTypeJournee] = useState<TypeJournee>(typeDefaut)

  const macros = MACROS_JOURNEE[typeJournee]

  function selectionner(type: TypeJournee) {
    setTypeJournee(type)
    onTypeChange?.(type)
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-3">
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Macros du jour</p>

      {/* Sélection du type de journée */}
      <div className="flex flex-wrap gap-2">
        {TYPES_JOURNEE.map((type) => (
          <button
            key={type}
            onClick={() => selectionner(type)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              typeJournee === type
                ? 'bg-violet-600 text-white border-violet-600 dark:bg-violet-500'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-violet-400'
            }`}
          >
            {LABELS_JOURNEE[type]}
          </button>
        ))}
      </div>

      {/* Affichage des macros */}
      <div className="grid grid-cols-4 gap-2">
        <MacroTuile valeur={macros.kcal}      unite="kcal"  couleur="text-amber-600 dark:text-amber-400" />
        <MacroTuile valeur={macros.proteines} unite="P"     couleur="text-blue-600 dark:text-blue-400"   />
        <MacroTuile valeur={macros.glucides}  unite="G"     couleur="text-green-600 dark:text-green-400" />
        <MacroTuile valeur={macros.lipides}   unite="L"     couleur="text-orange-600 dark:text-orange-400" />
      </div>
    </div>
  )
}

// Sous-composant interne — tuile pour une macro
function MacroTuile({ valeur, unite, couleur }: { valeur: number; unite: string; couleur: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-neutral-50 dark:bg-neutral-800/50 p-2">
      <span className={`text-lg font-bold ${couleur}`}>{valeur}</span>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{unite}</span>
    </div>
  )
}
