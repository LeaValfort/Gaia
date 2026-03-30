import { format, startOfWeek, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Header } from '@/components/shared/Header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SemaineRepas } from '@/components/alimentation/SemaineRepas'
import { ChecklistHebdo } from '@/components/alimentation/ChecklistHebdo'
import { SuggestionsPlats } from '@/components/alimentation/SuggestionsPlats'
import { RecettesCourses } from '@/components/alimentation/RecettesCourses'
import { getPreferencesUtilisateur } from '@/lib/db/cycle'
import { getNutritionLogSemaine } from '@/lib/db/nutrition'
import { getRecettes, getShoppingItems } from '@/lib/db/recipes'
import { getCycleDay, getPhaseForDay } from '@/lib/cycle'
import { creerChecklistVide } from '@/lib/nutrition'
import type { Phase } from '@/types'

export default async function PageAlimentation() {
  const aujourdhui = new Date()
  const lundiSemaine = startOfWeek(aujourdhui, { weekStartsOn: 1 })
  const dimancheSemaine = endOfWeek(aujourdhui, { weekStartsOn: 1 })
  const weekStart = format(lundiSemaine, 'yyyy-MM-dd')
  const labelSemaine = `${format(lundiSemaine, 'd MMM', { locale: fr })} – ${format(dimancheSemaine, 'd MMM', { locale: fr })}`

  const [prefs, logSemaine, recettes, articles] = await Promise.all([
    getPreferencesUtilisateur(),
    getNutritionLogSemaine(weekStart),
    getRecettes(),
    getShoppingItems(weekStart),
  ])

  let phase: Phase | null = null
  let jourDuCycle: number | null = null
  if (prefs?.last_cycle_start) {
    jourDuCycle = getCycleDay(new Date(prefs.last_cycle_start), aujourdhui, prefs.cycle_length)
    phase = getPhaseForDay(jourDuCycle, prefs.cycle_length)
  }

  const checklist = (logSemaine?.checklist as Record<string, boolean>) ?? creerChecklistVide()
  const batchDone = logSemaine?.batch_done ?? false
  const jourIndex = (aujourdhui.getDay() + 6) % 7 // 0=lundi, 6=dimanche

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

        <Tabs defaultValue="semaine">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="semaine">Cette semaine</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions IA</TabsTrigger>
            <TabsTrigger value="recettes">Recettes</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="semaine">
              <SemaineRepas
                phase={phase}
                jourIndex={jourIndex}
                batchDone={batchDone}
              />
            </TabsContent>

            <TabsContent value="checklist">
              <ChecklistHebdo
                weekStart={weekStart}
                checklistInitiale={checklist}
                batchDoneInitial={batchDone}
              />
            </TabsContent>

            <TabsContent value="suggestions">
              <SuggestionsPlats
                phase={phase}
                likes={prefs?.food_likes ?? []}
                dislikes={prefs?.food_dislikes ?? []}
                allergies={prefs?.food_allergies ?? []}
                tempsCuisine={prefs?.cook_time_minutes ?? 30}
                conseilAlim=""
              />
            </TabsContent>

            <TabsContent value="recettes">
              <RecettesCourses
                recettesInitiales={recettes}
                articlesInitiaux={articles}
                weekStart={weekStart}
                phase={phase}
              />
            </TabsContent>
          </div>
        </Tabs>

      </main>
    </>
  )
}
