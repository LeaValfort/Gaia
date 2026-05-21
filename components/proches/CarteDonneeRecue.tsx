'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { ContenuVueProche } from '@/components/proches/ContenuVueProche'
import { PointsEnergie } from '@/components/proches/PointsEnergie'
import { labelDouleurVueCourte } from '@/components/proches/SmileyCouleur'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { BADGE_PHASE_CYCLE } from '@/lib/cycle-affichage'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import { humeurVersEmoji } from '@/lib/proches-vue-helpers'
import type { Phase, ProcheConnection, ProchePartageData } from '@/types'
import { DEFAULT_CYCLE_LENGTH } from '@/types'
import { cn } from '@/lib/utils'

function prenomProche(c: ProcheConnection): string {
  const n = c.owner_display_name?.trim()
  return n || 'Proche'
}

export function CarteDonneeRecue({
  connection,
  partage,
  detailEnChargement,
  onExpand,
}: {
  connection: ProcheConnection
  partage: ProchePartageData | null
  detailEnChargement: boolean
  onExpand: () => void
}) {
  const [ouvert, setOuvert] = useState(false)
  const vis = partage?.visibilite
  const phase = partage?.phase as Phase | null | undefined
  const design = phase ? PHASES_DESIGN[phase] : null

  return (
    <Collapsible
      open={ouvert}
      onOpenChange={(next) => {
        setOuvert(next)
        if (next) onExpand()
      }}
      className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
    >
      <CollapsibleTrigger
        className={cn(
          'w-full text-left p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors',
          'flex items-start justify-between gap-3'
        )}
      >
        <div className="min-w-0 space-y-2 flex-1">
          <p className="font-semibold text-neutral-900 dark:text-neutral-50">{prenomProche(connection)}</p>

          {partage ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {vis?.phase && design ? (
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium text-white',
                      BADGE_PHASE_CYCLE[phase!]
                    )}
                  >
                    {design.label}
                  </span>
                ) : null}
                {vis?.phase && partage.jourDuCycle != null ? (
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    Jour {partage.jourDuCycle} sur {DEFAULT_CYCLE_LENGTH}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                {vis?.energie && partage.energie != null ? (
                  <span className="inline-flex items-center gap-1.5">
                    <PointsEnergie niveau={partage.energie} />
                    <span>Énergie</span>
                  </span>
                ) : null}
                {vis?.douleur && partage.douleur != null ? (
                  <span>Douleur · {labelDouleurVueCourte(partage.douleur)}</span>
                ) : null}
                {vis?.humeur && partage.humeur?.trim() ? (
                  <span className="inline-flex items-center gap-1">
                    <span aria-hidden>{humeurVersEmoji(partage.humeur)}</span>
                    <span className="truncate max-w-[140px]">{partage.humeur}</span>
                  </span>
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Aperçu indisponible</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 mt-1 shrink-0 text-neutral-500 dark:text-neutral-400 transition-transform',
            ouvert && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t border-neutral-200 dark:border-neutral-800">
        {detailEnChargement ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 p-4">Chargement…</p>
        ) : partage ? (
          <ContenuVueProche connection={connection} partageData={partage} largeurContenu="plein" compact />
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 p-4">Aucune donnée partagée.</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
