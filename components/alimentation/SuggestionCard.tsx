'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, Bookmark, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sauvegarderRecette } from '@/lib/db/recipes'
import type { Phase, TypeRepas } from '@/types'

export interface SuggestionPlat {
  nom: string
  ingredients: string[]
  temps: number
  raison: string
}

interface SuggestionCardProps {
  suggestion: SuggestionPlat
  index: number
  phase: Phase | null
  typeRepas: TypeRepas | null
}

export function SuggestionCard({ suggestion, index, phase, typeRepas }: SuggestionCardProps) {
  const [ouvert, setOuvert] = useState(index === 0)
  const [sauvegardee, setSauvegardee] = useState(false)
  const [enCours, setEnCours] = useState(false)

  async function handleSauvegarder() {
    setEnCours(true)
    try {
      await sauvegarderRecette({
        nom: suggestion.nom,
        ingredients: suggestion.ingredients,
        temps_min: suggestion.temps,
        phase,
        type_repas: typeRepas,
        raison: suggestion.raison,
      })
      setSauvegardee(true)
    } catch {
      // Silencieux — l'utilisatrice verra juste que le bouton n'a pas changé
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      {/* En-tête cliquable */}
      <button
        onClick={() => setOuvert((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-mono">#{index + 1}</span>
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{suggestion.nom}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <span className="flex items-center gap-1 text-xs text-neutral-500">
            <Clock size={12} />
            {suggestion.temps} min
          </span>
          {ouvert ? <ChevronUp size={14} className="text-neutral-400" /> : <ChevronDown size={14} className="text-neutral-400" />}
        </div>
      </button>

      {/* Détails */}
      {ouvert && (
        <div className="px-4 py-3 flex flex-col gap-3 bg-white dark:bg-neutral-900">
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Ingrédients</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestion.ingredients.map((ing) => (
                <span key={ing} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-xs text-neutral-700 dark:text-neutral-300">
                  {ing}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 italic leading-relaxed">
            ✨ {suggestion.raison}
          </p>

          <Button
            size="sm"
            variant={sauvegardee ? 'outline' : 'default'}
            onClick={handleSauvegarder}
            disabled={sauvegardee || enCours}
            className="self-start"
          >
            {sauvegardee ? (
              <><Check size={14} className="mr-1" /> Sauvegardée</>
            ) : (
              <><Bookmark size={14} className="mr-1" /> Sauvegarder</>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
