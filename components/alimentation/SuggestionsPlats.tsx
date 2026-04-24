'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SuggestionCard } from './SuggestionCard'
import { MACROS_JOURNEE, LABELS_JOURNEE } from '@/lib/nutrition'
import type { Phase, TypeRepas, TypeJournee } from '@/types'

const FILTRES_REPAS: { id: TypeRepas; label: string }[] = [
  { id: 'petit-dej', label: '☀️ Petit-déj' },
  { id: 'dejeuner',  label: '🍽️ Déjeuner' },
  { id: 'collation', label: '🍎 Collation' },
  { id: 'diner',     label: '🌙 Dîner' },
]

const TYPES_JOURNEE: TypeJournee[] = ['sport', 'yoga', 'repos', 'regles']

interface SuggestionPlat { nom: string; ingredients: string[]; temps: number; raison: string }

interface SuggestionsPlatsProps {
  phase: Phase | null
  conseilAlim: string
  likes: string[]; dislikes: string[]; allergies: string[]
  tempsCuisine: number
}

export function SuggestionsPlats({ phase, conseilAlim, likes, dislikes, allergies, tempsCuisine }: SuggestionsPlatsProps) {
  const [suggestions, setSuggestions] = useState<SuggestionPlat[]>([])
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [typeRepas, setTypeRepas] = useState<TypeRepas>('dejeuner')
  const [typeJournee, setTypeJournee] = useState<TypeJournee>(phase === 'menstruation' ? 'regles' : 'repos')

  async function generer() {
    setChargement(true)
    setErreur(null)
    try {
      const macros = MACROS_JOURNEE[typeJournee]
      const reponse = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, conseilAlim, likes, dislikes, allergies, tempsCuisine, typeRepas, macros }),
      })
      if (!reponse.ok) throw new Error('Erreur serveur')
      const { suggestions: data } = await reponse.json()
      setSuggestions(data)
    } catch {
      setErreur('La génération a échoué. Réessaie dans quelques instants.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Filtres type de repas */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Type de repas</p>
        <div className="flex flex-wrap gap-2">
          {FILTRES_REPAS.map(({ id, label }) => (
            <button key={id} onClick={() => setTypeRepas(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${typeRepas === id ? 'bg-violet-600 text-white border-violet-600' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-violet-400'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtre type de journée (pour les macros) */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Type de journée (macros)</p>
        <div className="flex flex-wrap gap-2">
          {TYPES_JOURNEE.map((type) => (
            <button key={type} onClick={() => setTypeJournee(type)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${typeJournee === type ? 'bg-neutral-800 text-white border-neutral-800 dark:bg-neutral-200 dark:text-neutral-900 dark:border-neutral-200' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>
              {LABELS_JOURNEE[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Bouton générer */}
      <Button onClick={generer} disabled={chargement} className="alimentation-btn-primaire flex items-center gap-2 self-start">
        {suggestions.length > 0 ? <RefreshCw size={14} /> : <Sparkles size={14} />}
        {chargement ? 'Génération en cours...' : suggestions.length > 0 ? 'Régénérer' : 'Générer 3 suggestions'}
      </Button>

      {erreur && <p className="text-sm text-red-500 dark:text-red-400">{erreur}</p>}

      {/* Skeleton loader */}
      {chargement && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Cartes de suggestions */}
      {!chargement && suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          {suggestions.map((s, i) => (
            <SuggestionCard key={i} suggestion={s} index={i} phase={phase} typeRepas={typeRepas} />
          ))}
        </div>
      )}

      {!chargement && suggestions.length === 0 && (
        <p className="text-sm text-neutral-400 text-center py-6">
          Choisis un type de repas puis clique sur &ldquo;Générer&rdquo; pour obtenir des idées adaptées à ta phase.
        </p>
      )}
    </div>
  )
}
