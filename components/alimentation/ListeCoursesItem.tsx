'use client'

import { Trash2, Check } from 'lucide-react'
import type { ShoppingItemComplet } from '@/types'
import { normaliserAffichageArticleCourses } from '@/lib/nutrition'

interface ListeCoursesItemProps {
  article: ShoppingItemComplet
  onToggle: (id: string, fait: boolean) => void
  onDelete: (id: string) => void
}

export function ListeCoursesItem({ article, onToggle, onDelete }: ListeCoursesItemProps) {
  const aff = normaliserAffichageArticleCourses(article.nom, article.quantite)
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group
        ${article.fait ? 'opacity-50' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}
    >
      {/* Checkbox personnalisée */}
      <button
        onClick={() => onToggle(article.id, article.fait)}
        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors
          ${article.fait
            ? 'bg-violet-600 border-violet-600'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-violet-400'}`}
      >
        {article.fait && <Check size={11} className="text-white" />}
      </button>

      {/* Nom + quantité */}
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${article.fait ? 'line-through text-neutral-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
          {aff.nom}
        </span>
        {aff.quantite && (
          <span className="ml-1.5 text-xs text-neutral-400">{aff.quantite}</span>
        )}
      </div>

      {/* Badge rayon (si présent) */}
      {article.rayon && (
        <span className="text-xs text-neutral-400 hidden sm:inline shrink-0">{article.rayon.replace('_', ' ')}</span>
      )}

      {/* Supprimer */}
      <button
        onClick={() => onDelete(article.id)}
        className="text-neutral-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
