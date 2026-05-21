'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { BoutonInviterProche } from '@/components/proches/BoutonInviterProche'
import { LigneMesPartage } from '@/components/proches/LigneMesPartage'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { ProcheConnection } from '@/types'
import { cn } from '@/lib/utils'

export function MesPartagesSection({
  connections,
  onRefresh,
}: {
  connections: ProcheConnection[]
  onRefresh: () => void
}) {
  const [ouvert, setOuvert] = useState(false)
  const visibles = connections.filter((c) => c.status !== 'revoked')
  const count = visibles.length

  return (
    <section aria-labelledby="mes-partages-titre">
      <Collapsible open={ouvert} onOpenChange={setOuvert}>
        <CollapsibleTrigger
          id="mes-partages-titre"
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800',
            'bg-white dark:bg-neutral-900 px-4 py-3 text-left',
            'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors'
          )}
        >
          <span className="font-medium text-neutral-900 dark:text-neutral-50">Mes partages ({count})</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400 transition-transform',
              ouvert && 'rotate-180'
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-3 space-y-3">
          <BoutonInviterProche
            onInvite={() => {
              onRefresh()
              setOuvert(true)
            }}
          />

          {visibles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">Aucun proche invité pour l&apos;instant.</p>
          ) : (
            <div className="space-y-3">
              {visibles.map((c) => (
                <LigneMesPartage key={c.id} connection={c} onRefresh={onRefresh} onRevoque={onRefresh} />
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
