import { calculerMacrosJour, calculerMacrosJourSansCycle } from '@/lib/nutrition'
import type { TotauxConsommesJour } from '@/lib/recapManuel'
import { designPhaseAffichage } from '@/lib/cycle'
import type { Phase, TypeJournee } from '@/types'
import { cn } from '@/lib/utils'

const CARD =
  'rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900'

const BARRES = [
  { cle: 'calories' as const, label: 'Calories', couleur: 'bg-amber-500' },
  { cle: 'proteines' as const, label: 'Protéines', couleur: 'bg-blue-500' },
  { cle: 'glucides' as const, label: 'Glucides', couleur: 'bg-orange-500' },
  { cle: 'lipides' as const, label: 'Lipides', couleur: 'bg-emerald-500' },
]

export interface MacrosCiblesProps {
  phase: Phase | null
  typeJournee: TypeJournee
  sansCycle?: boolean
  /** Totaux du récap du jour — les barres = consommé / cible (max 100 %). */
  conso?: TotauxConsommesJour | null
}

function pctRemplissage(cible: number, consomme: number): number {
  if (cible <= 0) return 0
  return Math.min(100, Math.round((consomme / cible) * 100))
}

export function MacrosCibles({ phase, typeJournee, sansCycle, conso }: MacrosCiblesProps) {
  const d = designPhaseAffichage(phase, { sansCycle })
  const macros =
    sansCycle || !phase
      ? calculerMacrosJourSansCycle(typeJournee)
      : calculerMacrosJour(phase, typeJournee)
  const c = conso ?? { calories: 0, proteines: 0, glucides: 0, lipides: 0 }

  return (
    <div className={cn(CARD)} style={{ borderColor: `${d.accent}44` }}>
      <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
        Macros cibles
      </p>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{macros.message}</p>
      <div className="flex flex-col gap-2">
        {BARRES.map(({ cle, label, couleur }) => {
          const cible = macros[cle]
          const pris = c[cle]
          const pct = pctRemplissage(cible, pris)
          return (
            <div key={cle}>
              <div className="mb-0.5 flex justify-between text-xs text-gray-600 dark:text-gray-300">
                <span>{label}</span>
                <span className="tabular-nums font-medium">
                  <span className="text-gray-800 dark:text-gray-100">{pris}</span>
                  <span className="mx-0.5 text-gray-400">/</span>
                  <span>{cible}</span>
                  {cle === 'calories' ? ' kcal' : ' g'}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className={cn('h-full rounded-full transition-all', couleur)} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
