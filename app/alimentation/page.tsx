import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { startOfWeek, endOfWeek } from 'date-fns'
import { Header } from '@/components/shared/Header'
import { PhaseCard } from '@/components/cycle/PhaseCard'
import { ChecklistHebdo } from '@/components/alimentation/ChecklistHebdo'
import { getPreferencesUtilisateur } from '@/lib/db/cycle'
import { getNutritionLogSemaine } from '@/lib/db/nutrition'
import { getCycleDay, getPhaseForDay, getInfosPhase } from '@/lib/cycle'
import { getRecommandationAlim, creerChecklistVide } from '@/lib/nutrition'
import { CheckCircle2 } from 'lucide-react'
import { SuggestionsPlats } from '@/components/alimentation/SuggestionsPlats'
import type { Phase } from '@/types'

export default async function PageAlimentation() {
  const aujourdhui = new Date()
  const lundiSemaine = startOfWeek(aujourdhui, { weekStartsOn: 1 })
  const dimancheSemaine = endOfWeek(aujourdhui, { weekStartsOn: 1 })
  const weekStart = format(lundiSemaine, 'yyyy-MM-dd')
  const labelSemaine = `${format(lundiSemaine, 'd MMM', { locale: fr })} – ${format(dimancheSemaine, 'd MMM', { locale: fr })}`

  const [prefs, logSemaine] = await Promise.all([
    getPreferencesUtilisateur(),
    getNutritionLogSemaine(weekStart),
  ])

  let phase: Phase | null = null
  let jourDuCycle: number | null = null
  if (prefs?.last_cycle_start) {
    jourDuCycle = getCycleDay(new Date(prefs.last_cycle_start), aujourdhui, prefs.cycle_length)
    phase = getPhaseForDay(jourDuCycle, prefs.cycle_length)
  }

  const checklist = (logSemaine?.checklist as Record<string, boolean>) ?? creerChecklistVide()
  const batchDone = logSemaine?.batch_done ?? false

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">

        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Alimentation</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Semaine du {labelSemaine}
          </p>
        </div>

        {/* Phase du jour */}
        {phase && jourDuCycle && (
          <PhaseCard phase={phase} jourDuCycle={jourDuCycle} infos={getInfosPhase(phase)} />
        )}

        {/* Recommandations selon la phase */}
        {phase && (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-3">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              {getRecommandationAlim(phase).titre}
            </h2>
            <ul className="flex flex-col gap-2">
              {getRecommandationAlim(phase).details.map((detail, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-neutral-400" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions IA — uniquement si la phase est connue */}
        {phase && (
          <SuggestionsPlats
            phase={phase}
            conseilAlim={getRecommandationAlim(phase).details.join('. ')}
            likes={prefs?.food_likes ?? []}
            dislikes={prefs?.food_dislikes ?? []}
            allergies={prefs?.food_allergies ?? []}
            tempsCuisine={prefs?.cook_time_minutes ?? 30}
          />
        )}

        {/* Checklist hebdomadaire + batch cooking */}
        <ChecklistHebdo
          weekStart={weekStart}
          checklistInitiale={checklist}
          batchDoneInitial={batchDone}
        />

      </main>
    </>
  )
}
