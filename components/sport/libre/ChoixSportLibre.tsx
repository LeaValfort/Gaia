'use client'

import { Button } from '@/components/ui/button'
import { getSportConfig, SPORTS_CONFIG } from '@/lib/data/sportsConfig'
import type { TypeActivite } from '@/types'

interface ChoixSportLibreProps {
  sport: TypeActivite | null
  onChoisir: (sport: TypeActivite | null) => void
}

/**
 * Choix du sport : la liste complète tant que rien n'est choisi, puis seulement
 * le sport retenu, en grand, avec « Changer » (les autres disparaissent).
 */
export function ChoixSportLibre({ sport, onChoisir }: ChoixSportLibreProps) {
  if (sport) {
    const c = getSportConfig(sport)
    return (
      <div className="flex items-center gap-3 rounded-xl border border-[#D97706]/60 bg-amber-100/70 px-4 py-3 dark:bg-amber-900/40">
        <c.Icone className="size-7 shrink-0 text-[#D97706]" />
        <p className="min-w-0 flex-1 text-lg font-semibold text-amber-950 dark:text-amber-50">{c.nom}</p>
        <Button type="button" size="sm" variant="ghost" onClick={() => onChoisir(null)} className="text-amber-800 dark:text-amber-200">
          Changer
        </Button>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[#D97706]">Type d’activité</p>
      <div className="flex flex-wrap gap-2">
        {SPORTS_CONFIG.map((c) => (
          <button
            key={c.type}
            type="button"
            onClick={() => onChoisir(c.type)}
            className="flex items-center gap-1.5 rounded-full border border-amber-200/80 px-3 py-1.5 text-sm hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-900/40"
          >
            <c.Icone className="size-4" />
            {c.nom}
          </button>
        ))}
      </div>
    </div>
  )
}
