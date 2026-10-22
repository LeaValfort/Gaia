'use client'

import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { LigneSeanceLibre } from '@/types'

interface LigneSeanceLibreEditeurProps {
  ligne: LigneSeanceLibre
  /** Dernière charge connue pour ce nom d'exercice (placeholder gris clair). */
  derniereCharge: number | null
  onChange: (ligne: LigneSeanceLibre) => void
  onMonter: () => void
  onDescendre: () => void
  onSupprimer: () => void
}

function num(v: string): number | null {
  if (v.trim() === '') return null
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

const CHAMP = 'h-8 px-2 text-sm placeholder:text-neutral-300 dark:placeholder:text-neutral-600'

export function LigneSeanceLibreEditeur({
  ligne,
  derniereCharge,
  onChange,
  onMonter,
  onDescendre,
  onSupprimer,
}: LigneSeanceLibreEditeurProps) {
  const estExo = ligne.type === 'exercice'
  return (
    <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900/60">
      <div className="flex items-center gap-1">
        <span className="shrink-0 text-base" aria-hidden>
          {estExo ? '💪' : '⏱️'}
        </span>
        <Input
          className={CHAMP}
          value={ligne.nom}
          placeholder={estExo ? 'Ex. Pompes, Headstand…' : 'Ex. Course rapide, Crawl…'}
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

      {ligne.type === 'exercice' ? (
        <div className="flex flex-wrap items-center gap-2 pl-7 text-xs text-neutral-600 dark:text-neutral-300">
          <Input className={`${CHAMP} w-14`} inputMode="numeric" aria-label="Séries" value={ligne.series ?? ''} onChange={(e) => onChange({ ...ligne, series: num(e.target.value) })} />
          <span>×</span>
          <Input className={`${CHAMP} w-16`} inputMode="numeric" aria-label="Répétitions" value={ligne.reps ?? ''} onChange={(e) => onChange({ ...ligne, reps: num(e.target.value) })} />
          <button
            type="button"
            onClick={() => onChange({ ...ligne, unite: ligne.unite === 'reps' ? 'secondes' : 'reps' })}
            className="rounded-full border border-neutral-200 px-2 py-1 dark:border-neutral-600"
          >
            {ligne.unite === 'reps' ? 'reps' : 'sec'}
          </button>
          <Input
            className={`${CHAMP} w-20`}
            inputMode="decimal"
            aria-label="Charge en kg"
            value={ligne.charge_kg ?? ''}
            placeholder={derniereCharge != null ? String(derniereCharge) : 'kg'}
            onChange={(e) => onChange({ ...ligne, charge_kg: num(e.target.value) })}
          />
          <span>kg</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 pl-7 text-xs text-neutral-600 dark:text-neutral-300">
          <Input className={`${CHAMP} w-16`} inputMode="decimal" aria-label="Durée en minutes" value={ligne.duree_min ?? ''} onChange={(e) => onChange({ ...ligne, duree_min: num(e.target.value) })} />
          <span>min</span>
          <Input className={`${CHAMP} w-20`} inputMode="numeric" aria-label="Distance en mètres" value={ligne.distance_m ?? ''} onChange={(e) => onChange({ ...ligne, distance_m: num(e.target.value) })} />
          <span>m</span>
        </div>
      )}
    </div>
  )
}
