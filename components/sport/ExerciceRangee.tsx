'use client'

import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface ExerciceFormData {
  nom: string
  series: string
  reps: string
  poids: string
  inclus: boolean
  estCustom: boolean
}

interface ExerciceRangeeProps {
  data: ExerciceFormData
  muscles?: string[]
  onToggle: () => void
  onChange: (champ: 'nom' | 'series' | 'reps' | 'poids', val: string) => void
  onSupprimer: () => void
}

export function ExerciceRangee({ data, muscles, onToggle, onChange, onSupprimer }: ExerciceRangeeProps) {
  return (
    <div className={`flex flex-col gap-2 p-3 rounded-xl border transition-all
      ${data.inclus
        ? 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900'
        : 'border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 opacity-50'
      }`}
    >
      {/* En-tête : checkbox + nom + muscles */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={`w-5 h-5 rounded shrink-0 flex items-center justify-center border-2 transition-colors
            ${data.inclus
              ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-neutral-900'
              : 'border-neutral-300 dark:border-neutral-600'
            }`}
          aria-label={data.inclus ? 'Exclure cet exercice' : 'Inclure cet exercice'}
        >
          {data.inclus && <span className="text-[10px] font-bold">✓</span>}
        </button>

        {data.estCustom ? (
          <Input
            value={data.nom}
            onChange={(e) => onChange('nom', e.target.value)}
            placeholder="Nom de l'exercice"
            className="h-8 text-sm flex-1"
          />
        ) : (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50 truncate">{data.nom}</p>
            {muscles && muscles.length > 0 && (
              <p className="text-[11px] text-neutral-400 truncate">{muscles.join(', ')}</p>
            )}
          </div>
        )}

        <button
          onClick={onSupprimer}
          className="text-neutral-300 hover:text-red-500 transition-colors shrink-0"
          aria-label="Supprimer"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Inputs séries / reps / poids — uniquement si inclus */}
      {data.inclus && (
        <div className="grid grid-cols-3 gap-2 pl-8">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wide">Séries</span>
            <Input type="number" min={1} value={data.series} onChange={(e) => onChange('series', e.target.value)} className="h-8 text-sm text-center" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wide">Reps</span>
            <Input type="number" min={1} value={data.reps} onChange={(e) => onChange('reps', e.target.value)} className="h-8 text-sm text-center" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wide">Kg</span>
            <Input type="number" min={0} step={0.5} value={data.poids} onChange={(e) => onChange('poids', e.target.value)} className="h-8 text-sm text-center" placeholder="0" />
          </div>
        </div>
      )}
    </div>
  )
}
