'use client'

import type { TotauxConsommesJour } from '@/lib/recapManuel'
import type { MacrosCiblesJour } from '@/types'

const LIGNES = [
  { cle: 'calories' as const, label: 'Calories', unite: 'kcal', couleur: 'bg-orange-500' },
  { cle: 'proteines' as const, label: 'Protéines', unite: 'g', couleur: 'bg-blue-500' },
  { cle: 'glucides' as const, label: 'Glucides', unite: 'g', couleur: 'bg-amber-500' },
  { cle: 'lipides' as const, label: 'Lipides', unite: 'g', couleur: 'bg-emerald-500' },
]

function pct(cible: number, pris: number): number {
  if (cible <= 0) return 0
  return Math.min(100, (pris / cible) * 100)
}

interface MacrosDuJourCardProps {
  macrosCibles: MacrosCiblesJour
  conso: TotauxConsommesJour
}

export function MacrosDuJourCard({ macrosCibles, conso }: MacrosDuJourCardProps) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          Macros du jour
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{macrosCibles.message}</p>
        <p className="mt-1 text-xs font-medium text-neutral-700 dark:text-neutral-300">
          Cible : {macrosCibles.calories} kcal
        </p>
      </div>

      <ul className="flex flex-col gap-2.5">
        {LIGNES.map(({ cle, label, unite, couleur }) => {
          const cible = macrosCibles[cle]
          const pris = conso[cle]
          return (
            <li key={cle} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">{label}</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className={`h-full rounded-full ${couleur}`}
                  style={{ width: `${pct(cible, pris)}%` }}
                />
              </div>
              <span className="w-[4.5rem] shrink-0 text-right text-[10px] tabular-nums text-neutral-800 dark:text-neutral-200 sm:text-xs">
                {pris}/{cible}
                {unite === 'kcal' ? '' : ` ${unite}`}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
