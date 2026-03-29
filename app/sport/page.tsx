import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Header } from '@/components/shared/Header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OngletMuscu } from '@/components/sport/OngletMuscu'
import { OngletNatation } from '@/components/sport/OngletNatation'
import { OngletYoga } from '@/components/sport/OngletYoga'
import { ActivityLog } from '@/components/sport/ActivityLog'
import { getPreferencesUtilisateur } from '@/lib/db/cycle'
import { getSeancesDuJour } from '@/lib/db/workouts'
import { getCycleDay, getPhaseForDay, getInfosPhase } from '@/lib/cycle'
import { PhaseCard } from '@/components/cycle/PhaseCard'
import type { Phase } from '@/types'

export default async function PageSport() {
  const prefs = await getPreferencesUtilisateur()

  const aujourdhui = new Date()
  const date = format(aujourdhui, 'yyyy-MM-dd')
  const dateAffichee = format(aujourdhui, 'EEEE d MMMM', { locale: fr })

  let phase: Phase | null = null
  let jourDuCycle: number | null = null
  if (prefs?.last_cycle_start) {
    jourDuCycle = getCycleDay(new Date(prefs.last_cycle_start), aujourdhui, prefs.cycle_length)
    phase = getPhaseForDay(jourDuCycle, prefs.cycle_length)
  }

  // Récupère les séances déjà enregistrées aujourd'hui (pour le mode édition)
  const seances = await getSeancesDuJour(date)

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">

        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Sport</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 capitalize">{dateAffichee}</p>
        </div>

        {phase && jourDuCycle && (
          <PhaseCard phase={phase} jourDuCycle={jourDuCycle} infos={getInfosPhase(phase)} />
        )}

        <Tabs defaultValue="muscu">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="muscu">Muscu {seances.muscu && '✏️'}</TabsTrigger>
            <TabsTrigger value="natation">Natation {seances.natation && '✏️'}</TabsTrigger>
            <TabsTrigger value="yoga">Yoga {seances.yoga && '✏️'}</TabsTrigger>
            <TabsTrigger value="autre">Autre sport</TabsTrigger>
          </TabsList>

          <div className="mt-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
            <TabsContent value="muscu">
              <OngletMuscu seanceExistante={seances.muscu} />
            </TabsContent>
            <TabsContent value="natation">
              <OngletNatation seanceExistante={seances.natation} />
            </TabsContent>
            <TabsContent value="yoga">
              <OngletYoga phase={phase} seanceExistante={seances.yoga} />
            </TabsContent>
            <TabsContent value="autre">
              <ActivityLog />
            </TabsContent>
          </div>
        </Tabs>

      </main>
    </>
  )
}
