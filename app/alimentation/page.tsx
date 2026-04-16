import { redirect } from 'next/navigation'
import { creerClientServeur } from '@/lib/supabase-server'
import { getLundiSemaine, getTypeJournee, calculerMacrosJour } from '@/lib/nutrition'
import { getCycleDay, getPhaseForDay } from '@/lib/cycle'
import { getPreferencesUtilisateur } from '@/lib/db/cycle'
import { Header } from '@/components/shared/Header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MacrosCard } from '@/components/alimentation/MacrosCard'
import { ChecklistHebdo } from '@/components/alimentation/ChecklistHebdo'
import { SuggestionsRecettes } from '@/components/alimentation/SuggestionsRecettes'
import { ListeCourses } from '@/components/alimentation/ListeCourses'
import { RecettesSauvegardees } from '@/components/alimentation/RecettesSauvegardees'
import type { Phase } from '@/types'

export default async function PageAlimentation() {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today      = new Date()
  const weekStart  = getLundiSemaine(today)
  const typeJournee = getTypeJournee(today)

  const prefs = await getPreferencesUtilisateur()
  let phase: Phase = 'folliculaire'
  if (prefs?.last_cycle_start) {
    const jourDuCycle = getCycleDay(new Date(prefs.last_cycle_start), today, prefs.cycle_length)
    phase = getPhaseForDay(jourDuCycle, prefs.cycle_length)
  }

  const macros = calculerMacrosJour(phase, typeJournee)

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Alimentation</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Semaine du {weekStart}</p>
        </div>

        {/* Encart macros — toujours visible */}
        <MacrosCard phase={phase} typeJournee={macros.typeJournee} date={today.toISOString().slice(0, 10)} />

        <Tabs defaultValue="checklist">
          <TabsList className="w-full grid grid-cols-4 text-xs">
            <TabsTrigger value="checklist">✅ Checklist</TabsTrigger>
            <TabsTrigger value="suggestions">🍽️ Suggestions</TabsTrigger>
            <TabsTrigger value="courses">🛒 Courses</TabsTrigger>
            <TabsTrigger value="recettes">📖 Recettes</TabsTrigger>
          </TabsList>

          <div className="mt-5">

            <TabsContent value="checklist">
              <ChecklistHebdo userId={user.id} weekStart={weekStart} />
            </TabsContent>

            <TabsContent value="suggestions">
              <SuggestionsRecettes
                phase={phase}
                typeJournee={macros.typeJournee}
                allergies={prefs?.food_allergies ?? []}
                tempsMax={prefs?.cook_time_minutes ?? 30}
              />
            </TabsContent>

            <TabsContent value="courses">
              <ListeCourses userId={user.id} weekStart={weekStart} />
            </TabsContent>

            <TabsContent value="recettes">
              <RecettesSauvegardees userId={user.id} phase={phase} />
            </TabsContent>

          </div>
        </Tabs>

      </main>
    </>
  )
}
