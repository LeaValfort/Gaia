import { calculerMacrosJour } from '@/lib/nutrition'
import { PHASE_STYLES } from '@/lib/nutrition'
import type { Phase, TypeJournee } from '@/types'

const PHASE_NOM: Record<Phase, string> = {
  menstruation: '🩸 Règles',
  folliculaire: '🌱 Folliculaire',
  ovulation:    '🌸 Ovulation',
  luteale:      '🍂 Lutéale',
}

const JAUGES = [
  { cle: 'calories'  as const, label: 'Calories',  unite: 'kcal', max: 2200, couleur: 'bg-orange-500' },
  { cle: 'proteines' as const, label: 'Protéines', unite: 'g',    max: 160,  couleur: 'bg-blue-500' },
  { cle: 'glucides'  as const, label: 'Glucides',  unite: 'g',    max: 250,  couleur: 'bg-amber-500' },
  { cle: 'lipides'   as const, label: 'Lipides',   unite: 'g',    max: 80,   couleur: 'bg-green-500' },
]

interface MacrosCardProps {
  phase: Phase
  typeJournee: TypeJournee
  date: string  // ISO
}

export function MacrosCard({ phase, typeJournee }: MacrosCardProps) {
  const macros = calculerMacrosJour(phase, typeJournee)
  const styles = PHASE_STYLES[phase]

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 ${styles.border} ${styles.bg}`}>

      {/* En-tête */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Tes besoins du jour</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{macros.message}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${styles.pill}`}>
          {PHASE_NOM[phase]}
        </span>
      </div>

      {/* Jauges macros */}
      <div className="flex flex-col gap-2">
        {JAUGES.map(({ cle, label, unite, max, couleur }) => (
          <div key={cle} className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 w-20 shrink-0">{label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
              <div
                className={`h-full rounded-full ${couleur}`}
                style={{ width: `${Math.min((macros[cle] / max) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 w-16 text-right shrink-0">
              {macros[cle]} {unite}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}
