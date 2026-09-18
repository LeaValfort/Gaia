'use client'

import { cn } from '@/lib/utils'

export interface SelecteurRecurrenceProps {
  intervalleSemaines: number
  decalageSemaine: number
  onChange: (intervalleSemaines: number, decalageSemaine: number) => void
  disabled?: boolean
}

const INTERVALLES = [
  { valeur: 1, label: 'Toutes les semaines' },
  { valeur: 2, label: '1 semaine sur 2' },
  { valeur: 3, label: '1 semaine sur 3' },
]

const PILL_ACTIVE = 'border-amber-600 bg-amber-600 text-white'
const PILL_INACTIF =
  'border-neutral-200 bg-transparent text-muted-foreground hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600'

/**
 * Choix de récurrence d'une séance planifiée : toutes les semaines, ou une
 * semaine sur N — avec, dans ce cas, le décalage indiquant à quelle semaine
 * du cycle la séance démarre (ex. "1/2" ou "2/2" pour une semaine sur deux).
 */
export function SelecteurRecurrence({
  intervalleSemaines,
  decalageSemaine,
  onChange,
  disabled,
}: SelecteurRecurrenceProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Récurrence">
        {INTERVALLES.map(({ valeur, label }) => (
          <button
            key={valeur}
            type="button"
            disabled={disabled}
            onClick={() => onChange(valeur, 0)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
              intervalleSemaines === valeur ? PILL_ACTIVE : PILL_INACTIF
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {intervalleSemaines > 1 ? (
        <div className="flex flex-wrap items-center gap-1.5 pl-1">
          <span className="text-[11px] text-muted-foreground">Commence semaine :</span>
          {Array.from({ length: intervalleSemaines }, (_, i) => i).map((i) => (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onChange(intervalleSemaines, i)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                decalageSemaine === i ? PILL_ACTIVE : PILL_INACTIF
              )}
            >
              {i + 1}/{intervalleSemaines}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
