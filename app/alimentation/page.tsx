import { redirect } from 'next/navigation'
import { creerClientServeur } from '@/lib/supabase-server'
import { getLundiSemaine } from '@/lib/nutrition'
import { getCycleDay, getPhaseForDay } from '@/lib/cycle'
import { getPreferencesUtilisateur } from '@/lib/db/cycle'
import { Header } from '@/components/shared/Header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChecklistHebdo } from '@/components/alimentation/ChecklistHebdo'
import { SemaineRepas } from '@/components/alimentation/SemaineRepas'
import type { Phase } from '@/types'

export default async function PageAlimentation() {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weekStart = getLundiSemaine(new Date())

  // Calcul de la phase du cycle
  const prefs = await getPreferencesUtilisateur()
  let phase: Phase | null = null
  if (prefs?.last_cycle_start) {
    const jourDuCycle = getCycleDay(
      new Date(prefs.last_cycle_start),
      new Date(),
      prefs.cycle_length
    )
    phase = getPhaseForDay(jourDuCycle, prefs.cycle_length)
  }

  // 0 = lundi, 6 = dimanche (getDay : 0=dim, 1=lun, ..., 6=sam → décalage +6 %7)
  const jourIndex = (new Date().getDay() + 6) % 7

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">

        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Alimentation</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Semaine du {weekStart}
          </p>
        </div>

        <Tabs defaultValue="checklist">
          <TabsList className="w-full grid grid-cols-4 text-xs">
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="semaine">Plan semaine</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions IA</TabsTrigger>
            <TabsTrigger value="recettes">Recettes</TabsTrigger>
          </TabsList>

          <div className="mt-6">

            <TabsContent value="checklist">
              <ChecklistHebdo userId={user.id} weekStart={weekStart} />
            </TabsContent>

            <TabsContent value="semaine">
              <SemaineRepas phase={phase} jourIndex={jourIndex} />
            </TabsContent>

            <TabsContent value="suggestions">
              <div className="text-center text-muted-foreground py-12">
                Bientôt disponible ✨
              </div>
            </TabsContent>

            <TabsContent value="recettes">
              <div className="text-center text-muted-foreground py-12">
                Bientôt disponible ✨
              </div>
            </TabsContent>

          </div>
        </Tabs>

      </main>
    </>
  )
}
