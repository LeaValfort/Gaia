'use client'

import { getConseilsPhase } from '@/lib/cycle'
import {
  ONGLET_CONSEIL_ACTIF,
  ONGLET_CONSEIL_INACTIF,
  TEXTE_CONSEIL_PHASE,
} from '@/lib/cycle-affichage'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import type { Phase } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface ConseilsPhaseProps {
  phase: Phase
}

const ONGLETS: { value: string; label: string; texte: (c: ReturnType<typeof getConseilsPhase>) => string }[] = [
  { value: 'sport', label: '💪 Sport', texte: (c) => c.sport },
  { value: 'nutrition', label: '🥗 Nutrition', texte: (c) => c.nutrition },
  { value: 'sommeil', label: '😴 Sommeil', texte: (c) => c.sommeil },
  { value: 'bienEtre', label: '🌿 Bien-être', texte: (c) => c.bienEtre },
  { value: 'astuce', label: '💡 Astuce', texte: (c) => c.anecdote },
]

export function ConseilsPhase({ phase }: ConseilsPhaseProps) {
  const design = PHASES_DESIGN[phase]
  const conseils = getConseilsPhase(phase)
  const accentOnglet = ONGLET_CONSEIL_ACTIF[phase]

  return (
    <section className="min-w-0">
      <h2 className="mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-50 sm:text-lg">
        Conseils · {design.emoji} {design.label}
      </h2>

      <div
        className={cn(
          'rounded-2xl border p-4',
          design.border,
          design.bg,
          'dark:border-neutral-800 dark:bg-neutral-900'
        )}
      >
        <Tabs defaultValue="sport" className="gap-4">
          <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
            <TabsList
              variant="line"
              className="h-auto w-max min-w-full flex-nowrap justify-start gap-0 bg-transparent p-0"
            >
              {ONGLETS.map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={cn(
                    'shrink-0 rounded-none px-3 py-2 text-xs font-medium sm:text-sm',
                    ONGLET_CONSEIL_INACTIF,
                    accentOnglet
                  )}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {ONGLETS.map(({ value, texte }) => (
            <TabsContent
              key={value}
              value={value}
              className={cn(
                'mt-0 pt-2 text-sm leading-relaxed sm:text-[0.9375rem]',
                TEXTE_CONSEIL_PHASE[phase]
              )}
            >
              {texte(conseils)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
