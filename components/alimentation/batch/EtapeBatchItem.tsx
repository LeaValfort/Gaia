'use client'

import { useMemo, useState } from 'react'
import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMinuteur } from '@/hooks/useMinuteur'
import { formatSecondes } from '@/lib/sport/minuteur'
import { cn } from '@/lib/utils'
import type { EtapeBatch } from '@/types'

interface EtapeBatchItemProps {
  etape: EtapeBatch
  numero: number
  fait: boolean
  onBasculer: () => void
}

/** Étape du déroulé : case à cocher, détail, badge « en parallèle », minuteur si durée. */
export function EtapeBatchItem({ etape, numero, fait, onBasculer }: EtapeBatchItemProps) {
  const [minuteur, setMinuteur] = useState(false)
  return (
    <li className={cn('flex gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900', fait && 'opacity-55')}>
      <button
        type="button"
        onClick={onBasculer}
        aria-label={fait ? 'Marquer comme non faite' : 'Marquer comme faite'}
        className={cn(
          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
          fait ? 'border-green-600 bg-green-500 text-white' : 'border-amber-400 text-amber-700 dark:text-amber-300'
        )}
      >
        {fait ? '✓' : numero}
      </button>
      <div className="min-w-0 flex-1 space-y-1">
        <p className={cn('text-sm font-medium text-neutral-900 dark:text-neutral-50', fait && 'line-through')}>
          {etape.titre}
          {etape.en_parallele ? (
            <span className="ml-1.5 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-normal text-sky-800 dark:bg-sky-900/50 dark:text-sky-200">pendant ce temps</span>
          ) : null}
        </p>
        {etape.detail ? <p className="text-sm text-neutral-600 dark:text-neutral-300">{etape.detail}</p> : null}
        {etape.recettes.length ? <p className="text-xs text-muted-foreground">Pour : {etape.recettes.join(', ')}</p> : null}
        {etape.duree_min ? (
          minuteur ? (
            <MinuteurEtape titre={etape.titre} minutes={etape.duree_min} />
          ) : (
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs text-amber-800 dark:text-amber-200" onClick={() => setMinuteur(true)}>
              <Timer className="mr-1 size-3.5" /> {etape.duree_min} min
            </Button>
          )
        ) : null}
      </div>
    </li>
  )
}

function MinuteurEtape({ titre, minutes }: { titre: string; minutes: number }) {
  const etapes = useMemo(() => [{ label: titre, sec: minutes * 60 }], [titre, minutes])
  const m = useMinuteur(etapes)
  return (
    <div className="flex items-center gap-2 rounded-lg bg-amber-100/80 px-2 py-1.5 dark:bg-amber-900/40">
      <span className="flex-1 font-mono text-lg font-semibold tabular-nums text-amber-950 dark:text-amber-50">
        {m.fini ? 'Terminé ✅' : formatSecondes(m.restant)}
      </span>
      <Button type="button" size="icon-sm" className="h-8 w-8 bg-[#D97706] text-white" onClick={m.actif ? m.pause : m.demarrer} aria-label={m.actif ? 'Pause' : 'Démarrer'}>
        {m.actif ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>
      <Button type="button" size="icon-sm" variant="ghost" className="h-8 w-8" onClick={m.reinitialiser} aria-label="Recommencer">
        <RotateCcw className="size-4" />
      </Button>
    </div>
  )
}
