'use client'

import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChampNombre } from '@/components/sport/libre/ChampNombre'
import { nouveauMouvementCircuit } from '@/lib/sport/seance-libre'
import type { LigneSeanceLibre, MouvementCircuit } from '@/types'

type Circuit = Extract<LigneSeanceLibre, { type: 'circuit' }>

/** Tours, repos et liste des mouvements d'un circuit (durée ou répétitions chacun). */
export function ChampsCircuit({ ligne, onChange }: { ligne: Circuit; onChange: (l: LigneSeanceLibre) => void }) {
  const majMvt = (i: number, m: MouvementCircuit) =>
    onChange({ ...ligne, mouvements: ligne.mouvements.map((x, j) => (j === i ? m : x)) })
  const supMvt = (i: number) => onChange({ ...ligne, mouvements: ligne.mouvements.filter((_, j) => j !== i) })

  return (
    <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
      <div className="flex flex-wrap items-center gap-2">
        <ChampNombre label="Tours" unite="tours" valeur={ligne.tours} onChange={(v) => onChange({ ...ligne, tours: v })} className="w-12" />
        <ChampNombre label="Repos entre les tours en secondes" unite="s de repos entre les tours" valeur={ligne.repos_sec} onChange={(v) => onChange({ ...ligne, repos_sec: v })} />
      </div>
      <ol className="space-y-1.5 border-l-2 border-amber-200 pl-2 dark:border-amber-800">
        {ligne.mouvements.map((m, i) => (
          <li key={m.id} className="flex flex-wrap items-center gap-1.5">
            <Input
              className="h-8 min-w-0 flex-1 px-2 text-sm"
              placeholder={`Mouvement ${i + 1} (ex. Burpees)`}
              value={m.nom}
              onChange={(e) => majMvt(i, { ...m, nom: e.target.value })}
            />
            <ChampNombre label="Durée en secondes" unite="s" valeur={m.duree_sec} onChange={(v) => majMvt(i, { ...m, duree_sec: v })} className="w-14" />
            <span>ou</span>
            <ChampNombre label="Répétitions" unite="reps" valeur={m.reps} onChange={(v) => majMvt(i, { ...m, reps: v })} className="w-14" />
            <Button type="button" size="icon-sm" variant="ghost" aria-label="Retirer ce mouvement" className="h-8 w-8 text-neutral-400" onClick={() => supMvt(i)}>
              <X className="size-4" />
            </Button>
          </li>
        ))}
      </ol>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 px-2 text-xs"
        onClick={() => onChange({ ...ligne, mouvements: [...ligne.mouvements, nouveauMouvementCircuit()] })}
      >
        <Plus className="mr-1 size-3.5" /> Mouvement
      </Button>
    </div>
  )
}
