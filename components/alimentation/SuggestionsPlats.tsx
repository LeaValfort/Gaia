'use client'

import { useState } from 'react'
import { Sparkles, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SuggestionPlat } from '@/app/api/suggestions/route'
import type { Phase } from '@/types'
import { getInfosPhase } from '@/lib/cycle'

interface SuggestionsPlatsProps {
  phase: Phase
  conseilAlim: string
  likes: string[]
  dislikes: string[]
  allergies: string[]
  tempsCuisine: number
}

export function SuggestionsPlats({
  phase, conseilAlim, likes, dislikes, allergies, tempsCuisine,
}: SuggestionsPlatsProps) {
  const [suggestions, setSuggestions] = useState<SuggestionPlat[]>([])
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [ouvert, setOuvert] = useState<number | null>(null)

  const infos = getInfosPhase(phase)

  async function generer() {
    setChargement(true)
    setErreur(null)
    try {
      const reponse = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, conseilAlim, likes, dislikes, allergies, tempsCuisine }),
      })
      if (!reponse.ok) throw new Error('Erreur serveur')
      const { suggestions: data } = await reponse.json()
      setSuggestions(data)
      setOuvert(null)
    } catch {
      setErreur('La génération a échoué. Réessaie dans quelques instants.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <Sparkles size={16} className={infos.couleurTexte} />
            Suggestions de plats IA
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Générées par Claude · ~0,003€ par génération
          </p>
        </div>
        <Button onClick={generer} disabled={chargement} size="sm" className="flex items-center gap-2">
          <Sparkles size={14} />
          {chargement ? 'Génération...' : suggestions.length > 0 ? 'Régénérer' : 'Générer 3 suggestions'}
        </Button>
      </div>

      {erreur && (
        <p className="text-sm text-red-500 dark:text-red-400">{erreur}</p>
      )}

      {chargement && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      )}

      {!chargement && suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          {suggestions.map((suggestion, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all cursor-pointer
                ${ouvert === i
                  ? 'border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
            >
              {/* En-tête cliquable */}
              <button
                onClick={() => setOuvert(ouvert === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg shrink-0">
                    {i === 0 ? '🥗' : i === 1 ? '🍳' : '🍲'}
                  </span>
                  <span className="font-medium text-sm text-neutral-900 dark:text-neutral-50 truncate">
                    {suggestion.nom}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-xs text-neutral-400">
                    <Clock size={12} />
                    {suggestion.temps} min
                  </span>
                  {ouvert === i ? <ChevronUp size={14} className="text-neutral-400" /> : <ChevronDown size={14} className="text-neutral-400" />}
                </div>
              </button>

              {/* Détails */}
              {ouvert === i && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1.5">Ingrédients</p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestion.ingredients.map((ing, j) => (
                        <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Pourquoi ce plat ?</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 italic">{suggestion.raison}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!chargement && suggestions.length === 0 && (
        <p className="text-sm text-neutral-400 text-center py-4">
          Clique sur "Générer" pour obtenir des suggestions adaptées à ta phase et tes préférences.
        </p>
      )}
    </div>
  )
}
