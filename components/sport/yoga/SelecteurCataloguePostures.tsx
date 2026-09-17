'use client'

import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { CATEGORIES_POSTURE, LABELS_CATEGORIE_POSTURE, POSTURES_CATALOGUE } from '@/lib/data/postures-catalogue'
import type { CategoriePosture, PostureYoga } from '@/types'

export interface SelecteurCataloguePosturesProps {
  /** Noms déjà présents dans la séance en cours d'édition, à exclure de la liste. */
  nomsExclus: Set<string>
  onAjouter: (posture: PostureYoga) => void
}

/**
 * Recherche + filtre par catégorie dans la grande bibliothèque de postures,
 * pour ajouter une posture à une séance yoga personnalisée.
 */
export function SelecteurCataloguePostures({ nomsExclus, onAjouter }: SelecteurCataloguePosturesProps) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<CategoriePosture | null>(null)

  const resultats = useMemo(() => {
    const t = q.trim().toLowerCase()
    return POSTURES_CATALOGUE.filter((p) => !nomsExclus.has(p.nom))
      .filter((p) => !cat || p.categorie === cat)
      .filter((p) => !t || p.nom.toLowerCase().includes(t))
      .slice(0, 60)
  }, [q, cat, nomsExclus])

  return (
    <div>
      <div className="relative mb-2">
        <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-neutral-400" />
        <Input className="h-9 pl-8" placeholder="Recherche…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setCat(null)}
          className={cn(
            'rounded-full border px-2.5 py-1 text-xs',
            cat === null ? 'border-rose-500 bg-rose-50 font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'border-neutral-200 text-neutral-500 dark:border-neutral-700'
          )}
        >
          Toutes
        </button>
        {CATEGORIES_POSTURE.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat((prev) => (prev === c ? null : c))}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs',
              cat === c ? 'border-rose-500 bg-rose-50 font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'border-neutral-200 text-neutral-500 dark:border-neutral-700'
            )}
          >
            {LABELS_CATEGORIE_POSTURE[c]}
          </button>
        ))}
      </div>
      <ul className="max-h-40 space-y-1 overflow-y-auto rounded border border-neutral-200 p-2 dark:border-neutral-700">
        {resultats.length === 0 ? (
          <li className="py-2 text-center text-xs text-neutral-400">Aucune posture trouvée.</li>
        ) : (
          resultats.map((p) => (
            <li key={p.nom} className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 flex-1 truncate">
                {p.nom}
                <span className="ml-1.5 text-xs text-neutral-400">— {p.benefice}</span>
              </span>
              <Button type="button" size="icon-sm" variant="secondary" className="h-7 w-7 shrink-0" onClick={() => onAjouter(p)}>
                <Plus className="size-4" />
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
