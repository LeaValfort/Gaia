'use client'

import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChampsLigne } from '@/components/sport/libre/ChampsLigne'
import { MinuteurLigne } from '@/components/sport/libre/MinuteurLigne'
import { TYPES_LIGNE } from '@/lib/data/lignes-seance'
import { cn } from '@/lib/utils'
import type { LigneSeanceLibre } from '@/types'

interface LigneSeanceLibreEditeurProps {
  ligne: LigneSeanceLibre
  /** Dernière charge connue pour ce nom d'exercice (placeholder gris clair). */
  derniereCharge: number | null
  onChange: (ligne: LigneSeanceLibre) => void
  onMonter: () => void
  onDescendre: () => void
  onSupprimer: () => void
  /** Mode « séance » (Muscu/Natation/Yoga) : case « fait » devant la ligne. */
  fait?: boolean
  onToggleFait?: () => void
}

const PLACEHOLDER_NOM: Record<LigneSeanceLibre['type'], string> = {
  exercice: 'Ex. Pompes, Squat bulgare…',
  bloc: 'Ex. Crawl, Course lente…',
  mouvement: 'Ex. Fireman spin, Hundred, Planche…',
  intervalles: 'Ex. Fractionné côte',
  circuit: 'Ex. Circuit cardio',
  voie: 'Nom de la voie (optionnel)',
}

/** Une ligne de séance libre : en-tête commun (nom, ordre, suppression) + champs du type + minuteur. */
export function LigneSeanceLibreEditeur({
  ligne,
  derniereCharge,
  onChange,
  onMonter,
  onDescendre,
  onSupprimer,
  fait,
  onToggleFait,
}: LigneSeanceLibreEditeurProps) {
  return (
    <div className={cn('space-y-2 rounded-lg border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900/60', fait && 'opacity-60')}>
      <div className="flex items-center gap-1">
        {onToggleFait ? (
          <button
            type="button"
            onClick={onToggleFait}
            aria-label={fait ? 'Marquer comme non fait' : 'Marquer comme fait'}
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs',
              fait ? 'border-rose-600 bg-rose-500 text-white' : 'border-neutral-300 dark:border-neutral-500'
            )}
          >
            {fait ? '✓' : ''}
          </button>
        ) : null}
        <span className="shrink-0 text-base" title={TYPES_LIGNE[ligne.type].label} aria-hidden>
          {TYPES_LIGNE[ligne.type].emoji}
        </span>
        <Input
          className="h-8 px-2 text-sm"
          value={ligne.nom}
          placeholder={PLACEHOLDER_NOM[ligne.type]}
          onChange={(e) => onChange({ ...ligne, nom: e.target.value })}
        />
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Monter" onClick={onMonter} className="h-8 w-8 shrink-0">
          <ArrowUp className="size-4" />
        </Button>
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Descendre" onClick={onDescendre} className="h-8 w-8 shrink-0">
          <ArrowDown className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Supprimer la ligne"
          onClick={onSupprimer}
          className="h-8 w-8 shrink-0 text-neutral-400 hover:text-rose-600"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <div className="space-y-1.5 pl-7">
        <ChampsLigne ligne={ligne} derniereCharge={derniereCharge} onChange={onChange} />
        <MinuteurLigne ligne={ligne} />
      </div>
    </div>
  )
}
