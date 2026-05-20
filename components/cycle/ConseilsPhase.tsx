'use client'

import { getConseilsPhase } from '@/lib/cycle'
import { ONGLET_CONSEIL_ACTIF } from '@/lib/cycle-affichage'
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
          'rounded-2xl border bg-white p-4 dark:bg-neutral-900/80',
          design.border
        )}
        style={{ backgroundColor: design.bgCard }}
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
                    'shrink-0 rounded-none px-3 py-2 text-xs sm:text-sm',
                    'text-neutral-500 dark:text-neutral-400',
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
              className="mt-0 pt-1 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200"
            >
              {texte(conseils)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
