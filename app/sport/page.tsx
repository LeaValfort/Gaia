import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Header } from '@/components/shared/Header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OngletMuscu } from '@/components/sport/OngletMuscu'
import { OngletNatation } from '@/components/sport/OngletNatation'
import { OngletYoga } from '@/components/sport/OngletYoga'
import { getPreferencesUtilisateur } from '@/lib/db/cycle'
import { getCycleDay, getPhaseForDay, getInfosPhase } from '@/lib/cycle'
import { PhaseCard } from '@/components/cycle/PhaseCard'
import type { Phase } from '@/types'

export default async function PageSport() {
  const prefs = await getPreferencesUtilisateur()

  const aujourdhui = new Date()
  const dateAffichee = format(aujourdhui, "EEEE d MMMM", { locale: fr })

  let phase: Phase | null = null
  let jourDuCycle: number | null = null
  if (prefs?.last_cycle_start) {
    jourDuCycle = getCycleDay(new Date(prefs.last_cycle_start), aujourdhui, prefs.cycle_length)
    phase = getPhaseForDay(jourDuCycle, prefs.cycle_length)
  }

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">

        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Sport</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 capitalize">{dateAffichee}</p>
        </div>

        {/* Rappel de la phase si disponible */}
        {phase && jourDuCycle && (
          <PhaseCard phase={phase} jourDuCycle={jourDuCycle} infos={getInfosPhase(phase)} />
        )}

        {/* Onglets */}
        <Tabs defaultValue="muscu">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="muscu" className="flex-1 sm:flex-none">Muscu</TabsTrigger>
            <TabsTrigger value="natation" className="flex-1 sm:flex-none">Natation</TabsTrigger>
            <TabsTrigger value="yoga" className="flex-1 sm:flex-none">Yoga</TabsTrigger>
          </TabsList>

          <div className="mt-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
            <TabsContent value="muscu">
              <OngletMuscu />
            </TabsContent>
            <TabsContent value="natation">
              <OngletNatation />
            </TabsContent>
            <TabsContent value="yoga">
              <OngletYoga phase={phase} />
            </TabsContent>
          </div>
        </Tabs>

      </main>
    </>
  )
}
