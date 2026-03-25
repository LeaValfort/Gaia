import { format } from 'date-fns'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/shared/Header'
import { CycleCalendar } from '@/components/cycle/CycleCalendar'
import { Button } from '@/components/ui/button'
import { getPreferencesUtilisateur } from '@/lib/db/cycle'
import { getDailyLogsParMois } from '@/lib/db/dailyLog'

interface PageProps {
  searchParams: Promise<{ mois?: string }>
}

export default async function PageCycle({ searchParams }: PageProps) {
  const params = await searchParams
  const moisActuel = params.mois ?? format(new Date(), 'yyyy-MM')
  const [annee, mois] = moisActuel.split('-').map(Number)

  const [prefs, logsParDate] = await Promise.all([
    getPreferencesUtilisateur(),
    getDailyLogsParMois(annee, mois),
  ])

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Mon cycle
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Clique sur un jour pour consulter ou saisir ton journal.
          </p>
        </div>

        {prefs?.last_cycle_start ? (
          <CycleCalendar
            prefs={prefs}
            logsParDate={logsParDate}
            moisActuel={moisActuel}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-neutral-900 dark:text-neutral-50">
                Date de cycle manquante
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Renseigne la date de début de ton dernier cycle dans les Paramètres pour afficher le calendrier.
              </p>
            </div>
            <Link href="/parametres">
              <Button variant="outline" className="flex items-center gap-2 shrink-0">
                <Settings size={15} />
                Paramètres
              </Button>
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
