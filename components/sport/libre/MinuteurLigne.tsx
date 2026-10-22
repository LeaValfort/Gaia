'use client'

import { useMemo, useState } from 'react'
import { Pause, Play, RotateCcw, Timer, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMinuteur } from '@/hooks/useMinuteur'
import { etapesMinuteur, formatSecondes } from '@/lib/sport/minuteur'
import type { LigneSeanceLibre } from '@/types'

/** Bouton minuteur d'une ligne : se déplie en compte à rebours avec bip à chaque étape. */
export function MinuteurLigne({ ligne }: { ligne: LigneSeanceLibre }) {
  const [ouvert, setOuvert] = useState(false)
  const etapes = useMemo(() => etapesMinuteur(ligne), [ligne])
  if (!etapes.length) return null
  if (!ouvert) {
    return (
      <Button type="button" size="sm" variant="ghost" onClick={() => setOuvert(true)} className="h-7 px-2 text-xs text-amber-800 dark:text-amber-200">
        <Timer className="mr-1 size-3.5" /> Minuteur
      </Button>
    )
  }
  return <MinuteurOuvert etapes={etapes} onFermer={() => setOuvert(false)} />
}

function MinuteurOuvert({ etapes, onFermer }: { etapes: ReturnType<typeof etapesMinuteur>; onFermer: () => void }) {
  const m = useMinuteur(etapes)
  return (
    <div className="flex items-center gap-2 rounded-lg bg-amber-100/80 px-2 py-1.5 dark:bg-amber-900/40">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-amber-900 dark:text-amber-100">
          {m.fini ? 'Terminé ✅' : m.etape?.label}
          {m.total > 1 && !m.fini ? <span className="ml-1 text-amber-700/70 dark:text-amber-300/70">({m.index + 1}/{m.total})</span> : null}
        </p>
        <p className="font-mono text-xl font-semibold tabular-nums text-amber-950 dark:text-amber-50">{formatSecondes(m.restant)}</p>
      </div>
      {m.actif ? (
        <Button type="button" size="icon-sm" className="h-9 w-9 bg-[#D97706] text-white" onClick={m.pause} aria-label="Pause">
          <Pause className="size-4" />
        </Button>
      ) : (
        <Button type="button" size="icon-sm" className="h-9 w-9 bg-[#D97706] text-white" onClick={m.demarrer} aria-label="Démarrer">
          <Play className="size-4" />
        </Button>
      )}
      <Button type="button" size="icon-sm" variant="ghost" className="h-9 w-9" onClick={m.reinitialiser} aria-label="Recommencer">
        <RotateCcw className="size-4" />
      </Button>
      <Button type="button" size="icon-sm" variant="ghost" className="h-9 w-9" onClick={onFermer} aria-label="Fermer le minuteur">
        <X className="size-4" />
      </Button>
    </div>
  )
}
