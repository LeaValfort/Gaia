'use client'

import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Nav } from '@/components/shared/Nav'
import { PageHeader } from '@/components/shared/PageHeader'
import { SidebarProches } from '@/components/proches/SidebarProches'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
  vuePartageRecu,
}: {
  phase: Phase | null
  sansCycle: boolean
  prenom: string | null
  connections: ProcheConnection[]
  procheActif: string | null
  onSelectProche: (id: string) => void
  onInviter: () => void
  onRefresh: () => void
  vuePartageRecu?: ReactNode
}) {
  const navPhase: Phase | null = sansCycle ? null : phase

  const colonnePartageRecu = (
    <div className="min-w-0 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Partagé avec moi</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Ici : ce que d’autres personnes choisissent de te montrer (pas l’aperçu de ce que tu partages).
      </p>
      {vuePartageRecu ?? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 py-2">Chargement…</p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav phase={navPhase} sansCycle={sansCycle} prenom={prenom} />
      <div className="mx-auto max-w-7xl px-6 py-6 pb-24">
        <PageHeader
          title="Proches"
          subtitle="À gauche : invitations et réglages. À droite : uniquement les partages que tu reçois."
          className="mb-6"
        />

        <div className="hidden md:grid md:grid-cols-[minmax(240px,280px)_1fr] gap-6 min-w-0 items-start">
          <div className="min-w-0 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mes invitations</h2>
            <SidebarProches
              connections={connections}
              procheActif={procheActif}
              onSelect={onSelectProche}
              onInviter={onInviter}
              onRefresh={onRefresh}
              onRevoqueList={onRefresh}
              prenomOwner={prenom}
            />
          </div>
          {colonnePartageRecu}
        </div>

        <div className="md:hidden flex flex-col gap-4">
          <Collapsible defaultOpen className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/50">
            <CollapsibleTrigger
              className={cn(
                'flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium',
                'text-neutral-800 dark:text-neutral-100'
              )}
            >
              <span>Mes invitations ({connections.length})</span>
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
                  prenomOwner={prenom}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
          {colonnePartageRecu}
        </div>
      </div>
    </div>
  )
}
