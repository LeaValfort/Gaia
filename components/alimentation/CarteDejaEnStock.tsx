'use client'

import { Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { getRayonsOrdonnes } from '@/lib/data/courses'
import { grouperArticlesCourses } from '@/lib/courses-consolidation'
import type { ShoppingItemComplet } from '@/types'

interface CarteDejaEnStockProps {
  articles: ShoppingItemComplet[]
  onToggleDejaEnStockMany: (ids: string[], nouvelEtat: boolean) => void
  onDeleteMany: (ids: string[]) => void
}

/** Vue "Déjà en stock" : tous les articles marqués déjà dans le placard/frigo,
 *  toutes enseignes confondues, groupés par rayon. Décocher un article le fait
 *  revenir dans la liste "à acheter" de son enseigne d'origine. */
export function CarteDejaEnStock({ articles, onToggleDejaEnStockMany, onDeleteMany }: CarteDejaEnStockProps) {
  const parRayon = getRayonsOrdonnes()
    .map(({ rayon, config }) => ({
      config,
      groupes: grouperArticlesCourses(articles.filter((a) => (a.rayon ?? 'autre') === rayon)),
    }))
    .filter(({ groupes }) => groupes.length > 0)

  return (
    <div className="rounded-2xl p-4 bg-amber-50 dark:bg-amber-950/20">
      <p className="font-semibold text-neutral-900 dark:text-neutral-50 mb-3">🧺 Déjà en stock</p>

      {parRayon.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-4">
          Rien marqué &laquo;&nbsp;déjà en stock&nbsp;&raquo; pour l&apos;instant.
        </p>
      ) : (
        <div className="bg-white/60 dark:bg-black/20 rounded-xl px-3 py-1">
          {parRayon.map(({ config, groupes }) => (
            <div key={config.label} className="py-1.5">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                {config.emoji} {config.label}
              </p>
              <ul className="flex flex-col gap-0.5 mb-1">
                {groupes.map((g) => (
                  <li key={g.ids.join('-')} className="flex items-center gap-2 py-0.5 px-2 group">
                    <Checkbox
                      checked
                      onCheckedChange={() => onToggleDejaEnStockMany(g.ids, false)}
                      className="flex-shrink-0"
                    />
                    <span className="flex-1 text-xs line-through text-neutral-400 dark:text-neutral-600">
                      {g.nomAffiche}{g.quantiteAffiche ? ` · ${g.quantiteAffiche}` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteMany(g.ids)}
                      className="text-neutral-300 hover:text-red-400 transition-colors shrink-0"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
