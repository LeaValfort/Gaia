'use client'

import { Input } from '@/components/ui/input'
import { ChampNombre } from '@/components/sport/libre/ChampNombre'
import { ChampsCircuit } from '@/components/sport/libre/ChampsCircuit'
import { cn } from '@/lib/utils'
import type { LigneSeanceLibre } from '@/types'

interface ChampsLigneProps {
  ligne: LigneSeanceLibre
  derniereCharge: number | null
  onChange: (ligne: LigneSeanceLibre) => void
}

const LIGNE = 'flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300'

/** Champs propres à chaque type de ligne (sous le nom). */
export function ChampsLigne({ ligne: l, derniereCharge, onChange }: ChampsLigneProps) {
  switch (l.type) {
    case 'exercice':
      return (
        <div className={LIGNE}>
          <ChampNombre label="Séries" valeur={l.series} onChange={(v) => onChange({ ...l, series: v })} className="w-12" />
          <span>×</span>
          <ChampNombre label="Répétitions" valeur={l.reps} onChange={(v) => onChange({ ...l, reps: v })} />
          <button
            type="button"
            onClick={() => onChange({ ...l, unite: l.unite === 'reps' ? 'secondes' : 'reps' })}
            className="rounded-full border border-neutral-200 px-2 py-1 dark:border-neutral-600"
          >
            {l.unite === 'reps' ? 'reps' : 'sec'}
          </button>
          <ChampNombre
            label="Charge en kg"
            unite="kg"
            valeur={l.charge_kg}
            placeholder={derniereCharge != null ? String(derniereCharge) : '—'}
            onChange={(v) => onChange({ ...l, charge_kg: v })}
            className="w-20"
          />
        </div>
      )
    case 'bloc':
      return (
        <div className={LIGNE}>
          <ChampNombre label="Séries" valeur={l.series} onChange={(v) => onChange({ ...l, series: v })} className="w-12" />
          <span>×</span>
          <ChampNombre label="Durée en minutes" unite="min" valeur={l.duree_min} onChange={(v) => onChange({ ...l, duree_min: v })} />
          <ChampNombre label="Distance en mètres" unite="m" valeur={l.distance_m} onChange={(v) => onChange({ ...l, distance_m: v })} className="w-20" />
        </div>
      )
    case 'mouvement':
      return (
        <div className={LIGNE}>
          <ChampNombre label="Séries" valeur={l.series} onChange={(v) => onChange({ ...l, series: v })} className="w-12" />
          <span>×</span>
          <ChampNombre label="Temps en secondes" unite="s — optionnel" valeur={l.duree_sec} onChange={(v) => onChange({ ...l, duree_sec: v })} />
        </div>
      )
    case 'intervalles':
      return (
        <div className={LIGNE}>
          <ChampNombre label="Tours" valeur={l.tours} onChange={(v) => onChange({ ...l, tours: v })} className="w-12" />
          <span>× (</span>
          <ChampNombre label="Effort en secondes" unite="s effort" valeur={l.effort_sec} onChange={(v) => onChange({ ...l, effort_sec: v })} />
          <span>+</span>
          <ChampNombre label="Récupération en secondes" unite="s récup )" valeur={l.recup_sec} onChange={(v) => onChange({ ...l, recup_sec: v })} />
        </div>
      )
    case 'circuit':
      return <ChampsCircuit ligne={l} onChange={onChange} />
    case 'voie':
      return (
        <div className={LIGNE}>
          <Input
            className="h-8 w-20 px-2 text-sm"
            aria-label="Cotation"
            placeholder="6b+"
            value={l.cotation}
            onChange={(e) => onChange({ ...l, cotation: e.target.value })}
          />
          {([true, false] as const).map((r) => (
            <button
              key={String(r)}
              type="button"
              onClick={() => onChange({ ...l, reussie: r })}
              className={cn(
                'rounded-full border px-2.5 py-1',
                l.reussie === r ? 'border-[#D97706] bg-amber-100 font-medium dark:bg-amber-900/50' : 'border-neutral-200 dark:border-neutral-600'
              )}
            >
              {r ? '✅ Réussie' : '🔁 Pas encore'}
            </button>
          ))}
        </div>
      )
  }
}
