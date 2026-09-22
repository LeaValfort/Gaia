'use client'

import { useState } from 'react'
import { CheckCheck, Trash2, ChevronDown, ChevronUp, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { RAYONS_CONFIG, getRayonsOrdonnes } from '@/lib/data/courses'
import { grouperArticlesCourses, type ArticleCourseGroupe } from '@/lib/courses-consolidation'
import type { EnseigneConfig } from '@/lib/data/courses'
import type { ShoppingItemComplet, Rayon } from '@/types'

interface CarteEnseigneProps {
  enseigne: EnseigneConfig
  articles: ShoppingItemComplet[]
  onToggleMany: (ids: string[], nouvelEtatFait: boolean) => void
  onToggleDejaEnStockMany: (ids: string[], nouvelEtat: boolean) => void
  onDeleteMany: (ids: string[]) => void
  onToutCocher: () => void
}

function SectionRayon({ rayon, groupes, onToggleMany, onToggleDejaEnStockMany, onDeleteMany }: {
  rayon: Rayon
  groupes: ArticleCourseGroupe[]
  onToggleMany: (ids: string[], nouvelEtatFait: boolean) => void
  onToggleDejaEnStockMany: (ids: string[], nouvelEtat: boolean) => void
  onDeleteMany: (ids: string[]) => void
}) {
  const config = RAYONS_CONFIG[rayon]
  const [ouvert, setOuvert] = useState(true)

  return (
    <Collapsible open={ouvert} onOpenChange={setOuvert}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
        <span>{config.emoji} {config.label} ({groupes.length})</span>
        {ouvert ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="flex flex-col gap-1 mb-2">
          {groupes.map((g) => (
            <li key={g.ids.join('-')} className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 group">
              <Checkbox
                checked={g.tousFaits}
                onCheckedChange={() => onToggleMany(g.ids, !g.tousFaits)}
                className="flex-shrink-0"
              />
              <span className={`flex-1 text-sm ${g.tousFaits ? 'line-through text-neutral-400 dark:text-neutral-600' : 'text-neutral-800 dark:text-neutral-200'}`}>
                {g.nomAffiche}
                {g.quantiteAffiche && (
                  <span className="text-neutral-400 dark:text-neutral-500 ml-1.5 text-xs">{g.quantiteAffiche}</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => onToggleDejaEnStockMany(g.ids, true)}
                className="text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shrink-0"
                aria-label="Déjà dans le placard ou le frigo"
                title="Déjà dans le placard ou le frigo"
              >
                <Archive size={15} />
              </button>
              <button
                type="button"
                onClick={() => onDeleteMany(g.ids)}
                className="text-neutral-400 hover:text-red-500 transition-colors shrink-0"
                aria-label="Supprimer"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function CarteEnseigne({ enseigne, articles, onToggleMany, onToggleDejaEnStockMany, onDeleteMany, onToutCocher }: CarteEnseigneProps) {
  const dejaEnStock = articles.filter((a) => a.deja_en_stock)
  const nonCoches   = articles.filter((a) => !a.fait && !a.deja_en_stock)
  const coches      = articles.filter((a) => a.fait && !a.deja_en_stock)

  const nbRestantsGroupes = grouperArticlesCourses(nonCoches).length

  const parRayon = getRayonsOrdonnes()
    .map(({ rayon }) => ({
      rayon,
      groupes: grouperArticlesCourses(nonCoches.filter((a) => (a.rayon ?? 'autre') === rayon)),
    }))
    .filter(({ groupes }) => groupes.length > 0)

  const groupesCoches = grouperArticlesCourses(coches)
  const groupesDejaEnStock = grouperArticlesCourses(dejaEnStock)

  return (
    <div className={`rounded-2xl p-4 ${enseigne.couleur}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-neutral-900 dark:text-neutral-50">
            {enseigne.emoji} {enseigne.label}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {nbRestantsGroupes} article{nbRestantsGroupes !== 1 ? 's' : ''} restant{nbRestantsGroupes !== 1 ? 's' : ''}
          </p>
        </div>
        {nonCoches.length > 0 && (
          <Button size="sm" variant="outline" onClick={onToutCocher} className="text-xs h-7 gap-1 bg-white/60 dark:bg-black/20">
            <CheckCheck size={12} /> Tout cocher
          </Button>
        )}
      </div>

      {parRayon.length > 0 ? (
        <div className="bg-white/60 dark:bg-black/20 rounded-xl px-3 py-1">
          {parRayon.map(({ rayon, groupes }) => (
            <SectionRayon
              key={rayon}
              rayon={rayon as Rayon}
              groupes={groupes}
              onToggleMany={onToggleMany}
              onToggleDejaEnStockMany={onToggleDejaEnStockMany}
              onDeleteMany={onDeleteMany}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-400 text-center py-4">Tous les articles sont dans le panier ✅</p>
      )}

      {groupesDejaEnStock.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-200/50 dark:border-neutral-700/50">
          <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">🧺 Déjà dans le placard/frigo ({groupesDejaEnStock.length})</p>
          <ul className="flex flex-col gap-0.5">
            {groupesDejaEnStock.map((g) => (
              <li key={g.ids.join('-')} className="flex items-center gap-2 py-0.5 px-2 group">
                <Checkbox checked onCheckedChange={() => onToggleDejaEnStockMany(g.ids, false)} className="flex-shrink-0" />
                <span className="flex-1 text-xs line-through text-neutral-400 dark:text-neutral-600">
                  {g.nomAffiche}{g.quantiteAffiche ? ` · ${g.quantiteAffiche}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteMany(g.ids)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-400 transition-all"
                  aria-label="Supprimer"
                >
                  <Trash2 size={11} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {groupesCoches.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-200/50 dark:border-neutral-700/50">
          <p className="text-xs text-neutral-400 mb-1">✅ Dans le panier ({groupesCoches.length})</p>
          <ul className="flex flex-col gap-0.5">
            {groupesCoches.map((g) => (
              <li key={g.ids.join('-')} className="flex items-center gap-2 py-0.5 px-2 group">
                <Checkbox checked onCheckedChange={() => onToggleMany(g.ids, false)} className="flex-shrink-0" />
                <span className="flex-1 text-xs line-through text-neutral-400 dark:text-neutral-600">
                  {g.nomAffiche}{g.quantiteAffiche ? ` · ${g.quantiteAffiche}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteMany(g.ids)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-400 transition-all"
                  aria-label="Supprimer"
                >
                  <Trash2 size={11} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
