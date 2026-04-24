'use client'

import { UserPlus } from 'lucide-react'
import { CarteProche } from '@/components/proches/CarteProche'
import type { ProcheConnection } from '@/types'

export interface SidebarProchesProps {
  connections: ProcheConnection[]
  procheActif: string | null
  onSelect: (id: string) => void
  onInviter: () => void
  onRefresh: () => void
  onRevoqueList: () => void
}

export function SidebarProches({
  connections,
  procheActif,
  onSelect,
  onInviter,
  onRefresh,
  onRevoqueList,
}: SidebarProchesProps) {
  return (
    <aside className="w-full min-w-0 space-y-3 md:w-[200px]">
      <button
        type="button"
        onClick={onInviter}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-2 py-2 text-xs font-medium text-white shadow-sm hover:bg-violet-700"
      >
        <UserPlus className="h-4 w-4 shrink-0" />
        <span>Inviter quelqu&apos;un</span>
      </button>

      {connections.length === 0 ? (
        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 py-2">Aucun proche invité</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {connections.map((c) => (
            <li key={c.id}>
              <CarteProche
                connection={c}
                estActif={procheActif === c.id}
                onSelect={() => onSelect(c.id)}
                onUpdate={() => {}}
                onRevoquer={onRevoqueList}
                onRefresh={onRefresh}
              />
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
