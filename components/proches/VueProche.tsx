'use client'

import { useMemo } from 'react'
import { Eye } from 'lucide-react'
import { ContenuVueProche } from '@/components/proches/ContenuVueProche'
import { getProchePartageData } from '@/lib/proches-partage-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { JournalAujourdhui } from '@/lib/proches-page-client'
import type { Phase, ProcheConnection } from '@/types'

export interface VueProcheProps {
  connection: ProcheConnection | null
  connections: ProcheConnection[]
  phase: Phase
  jourDuCycle: number
  journal: JournalAujourdhui
  sansCycle: boolean
  prochaineCyclePredite: string | null
  onSelectConnection: (id: string) => void
}

export function VueProche({
  connection,
  connections,
  phase,
  jourDuCycle,
  journal,
  sansCycle,
  prochaineCyclePredite,
  onSelectConnection,
}: VueProcheProps) {
  const actifs = connections.filter((c) => c.status === 'active')

  const partageData = useMemo(() => {
    if (!connection) return null
    return getProchePartageData(connection, {
      phase: sansCycle ? null : phase,
      jourDuCycle: sansCycle ? null : jourDuCycle,
      sansCycle,
      journal,
      prochaineCyclePredite,
    })
  }, [connection, phase, sansCycle, jourDuCycle, journal, prochaineCyclePredite])

  if (!connection) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900/50 p-6 text-center min-h-[200px] flex flex-col items-center justify-center">
        <p className="text-2xl mb-2" aria-hidden>
          👥
        </p>
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">Sélectionne un proche</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">pour voir ce qu’il voit, ou invite quelqu’un.</p>
      </div>
    )
  }

  if (connection.status === 'revoked') {
    return (
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/20 p-4 text-sm text-amber-900 dark:text-amber-100">
        Cette connexion est révoquée. Supprime l’entrée dans la colonne de gauche pour la retirer.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0 min-w-0">
      {actifs.length > 1 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {actifs.map((c) => (
            <Button
              key={c.id}
              type="button"
              size="sm"
              variant={connection.id === c.id ? 'default' : 'outline'}
              className={cn(
                'rounded-full text-xs h-8',
                connection.id === c.id && 'bg-violet-600 hover:bg-violet-700 text-white border-violet-600'
              )}
              onClick={() => onSelectConnection(c.id)}
            >
              <Eye className="h-3.5 w-3.5 mr-1 opacity-80" />
              Vue de {c.partner_name ?? 'Proche'}
            </Button>
          ))}
        </div>
      ) : null}
      {partageData ? (
        <ContenuVueProche connection={connection} partageData={partageData} largeurContenu="plein" />
      ) : null}
    </div>
  )
}
