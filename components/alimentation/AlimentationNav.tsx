'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type OngletAlimentationPrincipal = 'aujourdhui' | 'recettes' | 'semaine'
export type SectionAlimentationPlus = 'checklist' | 'courses' | 'recettes-perso'

export type VueAlimentation = OngletAlimentationPrincipal | SectionAlimentationPlus

interface AlimentationNavProps {
  suiviCalorique: boolean
  vue: VueAlimentation
  onChange: (vue: VueAlimentation) => void
}

const PLUS_OPTIONS: { id: SectionAlimentationPlus; label: string }[] = [
  { id: 'checklist', label: 'Checklist anti-inflammatoire' },
  { id: 'courses', label: 'Liste de courses' },
  { id: 'recettes-perso', label: 'Mes recettes perso' },
]

export function AlimentationNav({ suiviCalorique, vue, onChange }: AlimentationNavProps) {
  const [plusOuvert, setPlusOuvert] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const ongletPrincipal: OngletAlimentationPrincipal =
    vue === 'semaine'
      ? 'semaine'
      : vue === 'recettes'
        ? 'recettes'
        : vue === 'aujourdhui'
          ? 'aujourdhui'
          : suiviCalorique
            ? 'aujourdhui'
            : 'recettes'

  const plusActif = PLUS_OPTIONS.some((o) => o.id === vue)

  useEffect(() => {
    function fermer(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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
    ? [
        { id: 'aujourdhui', label: "Aujourd'hui" },
        { id: 'semaine', label: 'Semaine' },
      ]
    : [
        { id: 'recettes', label: 'Recettes' },
        { id: 'semaine', label: 'Semaine' },
      ]

  return (
    <nav className="relative flex items-center gap-1 overflow-x-auto border-b border-neutral-200 pb-px dark:border-neutral-800 [scrollbar-width:thin]">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
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

      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setPlusOuvert((o) => !o)}
          className={cn(
            'inline-flex items-center gap-0.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
            plusActif
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

        {plusOuvert ? (
          <div className="absolute left-0 top-full z-20 mt-1 min-w-[220px] rounded-lg border border-neutral-200 bg-white py-1 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
            {PLUS_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => selectPlus(id)}
                className={cn(
                  'block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800',
                  vue === id
                    ? 'font-medium text-neutral-900 dark:text-neutral-50'
                    : 'text-neutral-700 dark:text-neutral-300'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  )
}
