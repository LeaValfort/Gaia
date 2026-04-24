import { calculerMacrosJour, calculerMacrosJourSansCycle, PHASE_STYLES } from '@/lib/nutrition'
import type { TotauxConsommesJour } from '@/lib/recapManuel'
import type { Phase, TypeJournee } from '@/types'

const PHASE_NOM: Record<Phase, string> = {
  menstruation: '🩸 Règles',
  folliculaire: '🌱 Folliculaire',
  ovulation:    '🌸 Ovulation',
  luteale:      '🍂 Lutéale',
}

const JAUGES = [
  { cle: 'calories'  as const, label: 'Calories',  unite: 'kcal', couleur: 'bg-orange-500' },
  { cle: 'proteines' as const, label: 'Protéines', unite: 'g',    couleur: 'bg-blue-500' },
  { cle: 'glucides'  as const, label: 'Glucides',  unite: 'g',    couleur: 'bg-amber-500' },
  { cle: 'lipides'   as const, label: 'Lipides',   unite: 'g',    couleur: 'bg-green-500' },
]

function pctBarre(cible: number, consomme: number): number {
  if (cible <= 0) return 0
  return Math.min(100, (consomme / cible) * 100)
}

interface MacrosCardProps {
  phase: Phase
  typeJournee: TypeJournee
  date: string  // ISO
  sansSuiviCycle?: boolean
  conso?: TotauxConsommesJour | null
}

const STYLES_NEUTRE = {
  border: 'border-emerald-200 dark:border-emerald-800',
  bg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
  pill: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100',
}

export function MacrosCard({ phase, typeJournee, sansSuiviCycle, conso }: MacrosCardProps) {
  const macros = sansSuiviCycle ? calculerMacrosJourSansCycle(typeJournee) : calculerMacrosJour(phase, typeJournee)
  const styles = sansSuiviCycle ? STYLES_NEUTRE : PHASE_STYLES[phase]
  const c = conso ?? { calories: 0, proteines: 0, glucides: 0, lipides: 0 }

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 ${styles.border} ${styles.bg}`}>

      {/* En-tête */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Tes besoins du jour</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{macros.message}</p>
        </div>
        {sansSuiviCycle ? (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${styles.pill}`}>
            Anti-inflammatoire
          </span>
        ) : (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${styles.pill}`}>
            {PHASE_NOM[phase]}
          </span>
        )}
      </div>

      {/* Jauges macros */}
      <div className="flex flex-col gap-2">
        {JAUGES.map(({ cle, label, unite, couleur }) => {
          const cible = macros[cle]
          const pris = c[cle]
          return (
            <div key={cle} className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 w-20 shrink-0">{label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <div
                  className={`h-full rounded-full ${couleur}`}
                  style={{ width: `${pctBarre(cible, pris)}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 w-[4.5rem] text-right shrink-0 tabular-nums sm:text-xs sm:w-20">
                {pris}/{cible}
                {unite === 'kcal' ? ' kcal' : ' g'}
              </span>
            </div>
          )
        })}
      </div>

    </div>
  )
}
