'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { IntensiteEffort, ProfilEffort, TypeEffort } from '@/types'
import { cn } from '@/lib/utils'

const INTENSITES: { id: IntensiteEffort; label: string }[] = [
  { id: 'legere', label: 'Légère' },
  { id: 'moderee', label: 'Modérée' },
  { id: 'intense', label: 'Intense' },
]

const EFFORTS: { id: Exclude<TypeEffort, 'aucun'>; label: string }[] = [
  { id: 'force', label: 'Force' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'mixte', label: 'Mixte' },
  { id: 'mobilite', label: 'Mobilité' },
]

const DUREE_MIN = 15
const DUREE_MAX = 240

export interface CarteIntensiteSeanceProps {
  label: string
  profil: ProfilEffort
  enChargement?: boolean
  onChangerIntensite: (v: IntensiteEffort) => void
  onChangerEffort: (v: Exclude<TypeEffort, 'aucun'>) => void
  onChangerDuree: (v: number) => void
}

/** Éditeur d'intensité / effort / durée pour un type de séance (alimente le calcul des macros). */
export function CarteIntensiteSeance({
  label,
  profil,
  enChargement,
  onChangerIntensite,
  onChangerEffort,
  onChangerDuree,
}: CarteIntensiteSeanceProps) {
  const [dureeLocale, setDureeLocale] = useState(profil.duree_min)

  useEffect(() => {
    setDureeLocale(profil.duree_min)
  }, [profil.duree_min])

  return (
    <li className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{label}</span>
        {enChargement ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden /> : null}
      </div>

      <div className="space-y-3 pl-2">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Intensité</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Intensité ${label}`}>
            {INTENSITES.map(({ id, label: lib }) => (
              <button
                key={id}
                type="button"
                disabled={enChargement}
                onClick={() => onChangerIntensite(id)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                  profil.intensite === id
                    ? 'border-amber-600 bg-amber-600 text-white'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600'
                )}
              >
                {lib}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Effort</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Type d'effort ${label}`}>
            {EFFORTS.map(({ id, label: lib }) => (
              <button
                key={id}
                type="button"
                disabled={enChargement}
                onClick={() => onChangerEffort(id)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                  profil.type_effort === id
                    ? 'border-amber-600 bg-amber-600 text-white'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600'
                )}
              >
                {lib}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={DUREE_MIN}
            max={DUREE_MAX}
            step={5}
            disabled={enChargement}
            value={dureeLocale}
            aria-label={`Durée ${label} en minutes`}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (Number.isFinite(v)) setDureeLocale(v)
            }}
            onBlur={() => onChangerDuree(Math.min(DUREE_MAX, Math.max(DUREE_MIN, dureeLocale)))}
            className="h-9 w-16 px-2 text-center text-sm tabular-nums dark:bg-neutral-950"
          />
          <span className="text-xs text-muted-foreground">min</span>
        </div>
      </div>
    </li>
  )
}
