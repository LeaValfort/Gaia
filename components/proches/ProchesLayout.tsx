'use client'

import { ChevronDown } from 'lucide-react'
import { Nav } from '@/components/shared/Nav'
import { SidebarProches } from '@/components/proches/SidebarProches'
import { VueProche } from '@/components/proches/VueProche'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { JournalAujourdhui } from '@/lib/proches-page-client'
import type { Phase, ProcheConnection } from '@/types'
import { cn } from '@/lib/utils'

export function ProchesLayout({
  phase,
  sansCycle,
  prenom,
  connections,
  procheActif,
  onSelectProche,
  onInviter,
  onRefresh,
  journal,
  jourDuCycle,
  prochaineCyclePredite,
}: {
  phase: Phase | null
  sansCycle: boolean
  prenom: string | null
  connections: ProcheConnection[]
  procheActif: string | null
  onSelectProche: (id: string) => void
  onInviter: () => void
  onRefresh: () => void
  journal: JournalAujourdhui
  jourDuCycle: number
  prochaineCyclePredite: string | null
}) {
  const navPhase: Phase | null = sansCycle ? null : phase
  const actif = connections.find((c) => c.id === procheActif) ?? null
  const phaseVue: Phase = phase ?? 'folliculaire'

  const droite = (
    <VueProche
      connection={actif}
      connections={connections}
      phase={phaseVue}
      jourDuCycle={jourDuCycle}
      journal={journal}
      sansCycle={sansCycle}
      prochaineCyclePredite={prochaineCyclePredite}
      onSelectConnection={onSelectProche}
    />
  )

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav phase={navPhase} sansCycle={sansCycle} prenom={prenom} />
      <div className="mx-auto max-w-7xl px-6 py-6 pb-24">
        <header className="rounded-2xl p-6 mb-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">👥 Proches</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Partage ce que tu choisis avec un proche — phase, énergie, humeur, conseils.
          </p>
        </header>

        <div className="hidden md:grid md:grid-cols-[200px_1fr] gap-6 min-w-0">
          <SidebarProches
            connections={connections}
            procheActif={procheActif}
            onSelect={onSelectProche}
            onInviter={onInviter}
            onRefresh={onRefresh}
            onRevoqueList={onRefresh}
          />
          <div className="min-w-0">{droite}</div>
        </div>

        <div className="md:hidden flex flex-col gap-4">
          <Collapsible defaultOpen className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/50">
            <CollapsibleTrigger
              className={cn(
                'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium',
                'text-neutral-800 dark:text-neutral-100'
              )}
            >
              <span>Proches ({connections.length})</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t border-neutral-200 dark:border-neutral-800 px-2 py-2">
                <SidebarProches
                  connections={connections}
                  procheActif={procheActif}
                  onSelect={onSelectProche}
                  onInviter={onInviter}
                  onRefresh={onRefresh}
                  onRevoqueList={onRefresh}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
          {droite}
        </div>
      </div>
    </div>
  )
}
