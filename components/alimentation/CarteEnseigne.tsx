'use client'

import { useState } from 'react'
import { CheckCheck, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { RAYONS_CONFIG, getRayonsOrdonnes } from '@/lib/data/courses'
import type { EnseigneConfig } from '@/lib/data/courses'
import type { ShoppingItemComplet, Rayon } from '@/types'

interface CarteEnseigneProps {
  enseigne: EnseigneConfig
  articles: ShoppingItemComplet[]
  onToggle: (id: string, fait: boolean) => void
  onDelete: (id: string) => void
  onToutCocher: () => void
}

function SectionRayon({ rayon, articles, onToggle, onDelete }: {
  rayon: Rayon
  articles: ShoppingItemComplet[]
  onToggle: (id: string, fait: boolean) => void
  onDelete: (id: string) => void
}) {
  const config = RAYONS_CONFIG[rayon]
  const [ouvert, setOuvert] = useState(true)

  return (
    <Collapsible open={ouvert} onOpenChange={setOuvert}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
        <span>{config.emoji} {config.label} ({articles.length})</span>
        {ouvert ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="flex flex-col gap-1 mb-2">
          {articles.map((a) => (
            <li key={a.id} className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 group">
              <Checkbox
                checked={a.fait}
                onCheckedChange={() => onToggle(a.id, a.fait)}
                className="flex-shrink-0"
              />
              <span className={`flex-1 text-sm ${a.fait ? 'line-through text-neutral-400 dark:text-neutral-600' : 'text-neutral-800 dark:text-neutral-200'}`}>
                {a.nom}
                {a.quantite && <span className="text-neutral-400 dark:text-neutral-500 ml-1.5 text-xs">{a.quantite}</span>}
              </span>
              <button onClick={() => onDelete(a.id)} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all">
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function CarteEnseigne({ enseigne, articles, onToggle, onDelete, onToutCocher }: CarteEnseigneProps) {
  const nonCoches = articles.filter((a) => !a.fait)
  const coches    = articles.filter((a) => a.fait)

  // Grouper les articles non cochés par rayon, triés par ordre
  const parRayon = getRayonsOrdonnes()
    .map(({ rayon }) => ({
      rayon,
      items: nonCoches.filter((a) => (a.rayon ?? 'autre') === rayon),
    }))
    .filter(({ items }) => items.length > 0)

  return (
    <div className={`rounded-2xl p-4 ${enseigne.couleur}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-neutral-900 dark:text-neutral-50">
            {enseigne.emoji} {enseigne.label}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {nonCoches.length} article{nonCoches.length !== 1 ? 's' : ''} restant{nonCoches.length !== 1 ? 's' : ''}
          </p>
        </div>
        {nonCoches.length > 0 && (
          <Button size="sm" variant="outline" onClick={onToutCocher} className="text-xs h-7 gap-1 bg-white/60 dark:bg-black/20">
            <CheckCheck size={12} /> Tout cocher
          </Button>
        )}
      </div>

      {/* Articles par rayon */}
      {parRayon.length > 0 ? (
        <div className="bg-white/60 dark:bg-black/20 rounded-xl px-3 py-1">
          {parRayon.map(({ rayon, items }) => (
            <SectionRayon key={rayon} rayon={rayon as Rayon} articles={items} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-400 text-center py-4">Tous les articles sont dans le panier ✅</p>
      )}

      {/* Dans le panier */}
      {coches.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-200/50 dark:border-neutral-700/50">
          <p className="text-xs text-neutral-400 mb-1">✅ Dans le panier ({coches.length})</p>
          <ul className="flex flex-col gap-0.5">
            {coches.map((a) => (
              <li key={a.id} className="flex items-center gap-2 py-0.5 px-2 group">
                <Checkbox checked onCheckedChange={() => onToggle(a.id, a.fait)} className="flex-shrink-0" />
                <span className="flex-1 text-xs line-through text-neutral-400 dark:text-neutral-600">{a.nom}</span>
                <button onClick={() => onDelete(a.id)} className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-400 transition-all">
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
