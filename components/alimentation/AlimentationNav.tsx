'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type OngletAlimentationPrincipal = 'aujourdhui' | 'suggestions'
export type SectionAlimentationPlus = 'recettes' | 'semaine' | 'checklist' | 'courses'

export type VueAlimentation = OngletAlimentationPrincipal | SectionAlimentationPlus

interface AlimentationNavProps {
  suiviCalorique: boolean
  vue: VueAlimentation
  onChange: (vue: VueAlimentation) => void
}

const PLUS_OPTIONS: { id: SectionAlimentationPlus; label: string }[] = [
  { id: 'recettes', label: 'Recettes' },
  { id: 'semaine', label: 'Semaine' },
  { id: 'checklist', label: 'Checklist anti-inflammatoire' },
  { id: 'courses', label: 'Liste de courses' },
]

export function AlimentationNav({ suiviCalorique, vue, onChange }: AlimentationNavProps) {
  const [plusOuvert, setPlusOuvert] = useState(false)
  const conteneurRef = useRef<HTMLDivElement>(null)

  const plusActif = PLUS_OPTIONS.some((o) => o.id === vue)

  const ongletPrincipal: OngletAlimentationPrincipal =
    vue === 'suggestions'
      ? 'suggestions'
      : vue === 'aujourdhui'
        ? 'aujourdhui'
        : suiviCalorique
          ? 'aujourdhui'
          : 'suggestions'

  useEffect(() => {
    function fermer(e: MouseEvent) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) {
        setPlusOuvert(false)
      }
    }
    if (plusOuvert) document.addEventListener('mousedown', fermer)
    return () => document.removeEventListener('mousedown', fermer)
  }, [plusOuvert])

  function selectPrincipal(id: OngletAlimentationPrincipal) {
    setPlusOuvert(false)
    onChange(id)
  }

  function selectPlus(id: SectionAlimentationPlus) {
    setPlusOuvert(false)
    onChange(id)
  }

  const tabs: { id: OngletAlimentationPrincipal; label: string }[] = suiviCalorique
    ? [{ id: 'aujourdhui', label: "Aujourd'hui" }]
    : [{ id: 'suggestions', label: 'Recettes' }]

  return (
    <div ref={conteneurRef} className="w-full">
      <div
        role="tablist"
        className="flex items-center gap-1 overflow-x-auto border-b border-neutral-200 pb-px dark:border-neutral-800 [scrollbar-width:thin]"
      >
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={ongletPrincipal === id && !plusActif}
            onClick={() => selectPrincipal(id)}
            className={cn(
              'shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              ongletPrincipal === id && !plusActif
                ? 'border-amber-500 text-neutral-900 dark:text-neutral-50'
                : 'border-transparent text-muted-foreground hover:text-neutral-800 dark:hover:text-neutral-200'
            )}
          >
            {label}
          </button>
        ))}

        <button
          type="button"
          role="tab"
          aria-expanded={plusOuvert}
          aria-selected={plusActif}
          onClick={() => setPlusOuvert((o) => !o)}
          className={cn(
            'inline-flex shrink-0 items-center gap-0.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
            plusActif || plusOuvert
              ? 'border-amber-500 text-neutral-900 dark:text-neutral-50'
              : 'border-transparent text-muted-foreground hover:text-neutral-800 dark:hover:text-neutral-200'
          )}
        >
          Plus
          <ChevronDown
            className={cn('size-4 transition-transform', plusOuvert && 'rotate-180')}
            aria-hidden
          />
        </button>
      </div>

      {plusOuvert ? (
        <div
          className="flex flex-col border-b border-neutral-200 bg-neutral-50/90 dark:border-neutral-800 dark:bg-neutral-900/50"
          role="menu"
        >
          {PLUS_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="menuitem"
              onClick={() => selectPlus(id)}
              className={cn(
                'w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white dark:hover:bg-neutral-800/80',
                vue === id
                  ? 'font-medium text-amber-800 dark:text-amber-200'
                  : 'text-neutral-700 dark:text-neutral-300'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
