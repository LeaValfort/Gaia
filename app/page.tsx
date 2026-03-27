import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { creerClientServeur } from '@/lib/supabase-server'
import { getPreferencesUtilisateur } from '@/lib/db/cycle'
import { getDailyLogParDate } from '@/lib/db/dailyLog'
import { getTodosParDate } from '@/lib/db/todo'
import { getCycleDay, getPhaseForDay, getInfosPhase } from '@/lib/cycle'
import { Header } from '@/components/shared/Header'
import { PhaseCard } from '@/components/cycle/PhaseCard'
import { DailyLogForm } from '@/components/cycle/DailyLogForm'
import { TodoList } from '@/components/todo/TodoList'
import { Button } from '@/components/ui/button'

export default async function PageAujourdhui({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  // Si l'URL contient encore ?code= (résidu du callback OAuth), on nettoie l'URL
  const params = await searchParams
  if (params.code) redirect('/')
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()

  const aujourdhui = new Date()
  const dateStr = format(aujourdhui, 'yyyy-MM-dd')
  const dateAffichee = format(aujourdhui, "EEEE d MMMM yyyy", { locale: fr })

  // Récupère tout en parallèle pour optimiser les performances
  const [prefs, logDuJour, todos] = await Promise.all([
    getPreferencesUtilisateur(),
    getDailyLogParDate(dateStr),
    getTodosParDate(dateStr),
  ])

  // Calcul de la phase du jour
  const cycleConfigured = prefs?.last_cycle_start != null
  const jourDuCycle = cycleConfigured
    ? getCycleDay(new Date(prefs!.last_cycle_start!), aujourdhui, prefs!.cycle_length)
    : null
  const phase = jourDuCycle
    ? getPhaseForDay(jourDuCycle, prefs!.cycle_length)
    : null
  const infosPhase = phase ? getInfosPhase(phase) : null

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Date du jour */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 capitalize">
            {dateAffichee}
          </h1>
          {user?.user_metadata?.full_name && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Bonjour {user.user_metadata.full_name.split(' ')[0]} 👋
            </p>
          )}
        </div>

        {/* Phase du cycle ou invitation à configurer */}
        {phase && infosPhase && jourDuCycle ? (
          <PhaseCard phase={phase} jourDuCycle={jourDuCycle} infos={infosPhase} />
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-neutral-900 dark:text-neutral-50">
                Configure ton cycle
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Renseigne la date de début de ton dernier cycle pour voir ta phase du jour et les conseils adaptés.
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

        {/* Journal du jour */}
        {phase && jourDuCycle && (
          <DailyLogForm
            date={dateStr}
            phase={phase}
            jourDuCycle={jourDuCycle}
            logInitial={logDuJour}
          />
        )}

        {/* To-do liste */}
        <TodoList todosInitiaux={todos} date={dateStr} />

      </main>
    </>
  )
}
