import { PLAN_REPAS, JOURS_SEMAINE, TYPES_REPAS } from '@/lib/data/mealPlan'
import { ALIMENTS_STARS, PHASE_STYLES } from '@/lib/nutrition'
import { MacrosJour } from './MacrosJour'
import { Salad } from 'lucide-react'
import type { Phase } from '@/types'

const PHASE_NOM: Record<Phase, string> = {
  menstruation: 'Menstruation',
  folliculaire: 'Phase folliculaire',
  ovulation: 'Ovulation',
  luteale: 'Phase lutéale',
}

interface SemaineRepasProps {
  phase: Phase | null
  jourIndex: number   // 0 = lundi, 6 = dimanche
  batchDone: boolean
}

export function SemaineRepas({ phase, jourIndex, batchDone }: SemaineRepasProps) {
  const phaseCourante = phase ?? 'folliculaire'
  const plan = PLAN_REPAS[phaseCourante]
  const styles = PHASE_STYLES[phaseCourante]
  const stars = ALIMENTS_STARS[phaseCourante]

  return (
    <div className="flex flex-col gap-5">

      {/* Macros du jour */}
      <MacrosJour phase={phase} />

      {/* Aliments stars */}
      <div className={`rounded-xl border p-4 flex flex-col gap-3 ${styles.border} ${styles.bg}`}>
        <div className="flex items-center gap-2">
          <Salad size={16} className="shrink-0 text-neutral-500" />
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Aliments stars — {phase ? PHASE_NOM[phase] : 'cette semaine'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {stars.map((aliment) => (
            <span key={aliment} className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles.pill}`}>
              {aliment}
            </span>
          ))}
        </div>
      </div>

      {/* Plan de la semaine — tableau scrollable */}
      <div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Plan de la semaine</p>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[600px] text-xs">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/60">
                <th className="py-2 px-3 text-left font-medium text-neutral-500 w-24">Repas</th>
                {JOURS_SEMAINE.map((jour, i) => (
                  <th
                    key={jour}
                    className={`py-2 px-2 text-center font-medium ${
                      i === jourIndex
                        ? 'text-violet-600 dark:text-violet-400 font-bold'
                        : 'text-neutral-500'
                    }`}
                  >
                    {jour.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TYPES_REPAS.map(({ id, label, emoji }, rowIndex) => (
                <tr
                  key={id}
                  className={rowIndex % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-50 dark:bg-neutral-800/30'}
                >
                  <td className="py-2 px-3 font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                    {emoji} {label}
                  </td>
                  {plan[id].map((repas, i) => (
                    <td
                      key={i}
                      className={`py-2 px-2 text-center text-neutral-600 dark:text-neutral-300 leading-tight ${
                        i === jourIndex ? 'bg-violet-50 dark:bg-violet-900/20 font-medium' : ''
                      }`}
                    >
                      {repas}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-neutral-400 mt-1.5">* Colonne en violet = aujourd&apos;hui</p>
      </div>

      {/* Rappel batch cooking dimanche */}
      <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 flex flex-col gap-2">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">🍳 Batch cooking dimanche</p>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Prépare à l&apos;avance pour la semaine : <strong>Overnight oats</strong> (5 pots) et <strong>Egg muffins</strong> (6 portions).
          {batchDone
            ? ' ✅ Fait cette semaine !'
            : ' → Coche les cases dans l\'onglet Checklist.'}
        </p>
      </div>

    </div>
  )
}
