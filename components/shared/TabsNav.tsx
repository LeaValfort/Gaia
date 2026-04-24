'use client'

import { designPhaseAffichage } from '@/lib/data/phases-design'
import type { Phase } from '@/types'
import { cn } from '@/lib/utils'

export interface OngletNav {
  id: string
  label: string
  emoji?: string
}

export interface TabsNavProps {
  onglets: OngletNav[]
  actif: string
  onChange: (id: string) => void
  /** Phase actuelle (null = sans cycle, palette neutre) */
  phase: Phase | null
  /** Sous une carte parente : pas de bordure / fond autour de la rangée d’onglets. */
  variant?: 'default' | 'embedded'
}

const CONTAINER =
  'grid w-full min-w-0 max-w-full gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 dark:border-gray-800 dark:bg-gray-900 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
const CONTAINER_EMBEDDED =
  'grid w-full min-w-0 max-w-full gap-1 p-0'
const BTN =
  'inline-flex w-full min-w-0 items-center justify-center gap-0.5 cursor-pointer rounded-lg px-1.5 py-2 text-xs font-medium transition-all duration-200 sm:px-2.5 sm:text-sm'
const BTN_LAB = 'min-w-0 truncate'
const INACTIF =
  'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'

export function TabsNav({ onglets, actif, onChange, phase, variant = 'default' }: TabsNavProps) {
  const d = designPhaseAffichage(phase, { sansCycle: !phase })
  const shell = variant === 'embedded' ? CONTAINER_EMBEDDED : CONTAINER
  return (
    <div
      className={shell}
      role="tablist"
      style={{ gridTemplateColumns: `repeat(${onglets.length}, minmax(0, 1fr))` }}
    >
      {onglets.map((o) => {
        const isActif = actif === o.id
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={isActif}
            title={o.label}
            onClick={() => onChange(o.id)}
            className={cn(BTN, isActif ? '' : INACTIF)}
            style={
              isActif
                ? { background: d.bgCard, color: d.accent, boxShadow: `0 0 0 1px ${d.accent}25` }
                : undefined
            }
          >
            {o.emoji ? (
              <span className="shrink-0" aria-hidden>
                {o.emoji}
              </span>
            ) : null}
            <span className={BTN_LAB}>{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
