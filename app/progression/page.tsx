import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Activity, Zap, HeartPulse } from 'lucide-react'
import { Header } from '@/components/shared/Header'
import { GraphiqueEnergieDouleur } from '@/components/progression/GraphiqueEnergieDouleur'
import { GraphiqueSport } from '@/components/progression/GraphiqueSport'
import { getDataEnergieDouleur, getDataSportSemaines, getStatsResume } from '@/lib/db/progression'

export default async function PageProgression() {
  const moisActuel = format(new Date(), 'MMMM yyyy', { locale: fr })

  const [donneesEnergie, donneesSport, stats] = await Promise.all([
    getDataEnergieDouleur(60),
    getDataSportSemaines(8),
    getStatsResume(),
  ])

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">

        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Progression</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 capitalize">{moisActuel}</p>
        </div>

        {/* Stats résumées du mois */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 uppercase tracking-wide font-semibold">
              <Activity size={12} />
              Séances
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{stats.seancesCeMois}</p>
            <p className="text-xs text-neutral-400">ce mois</p>
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-amber-500 uppercase tracking-wide font-semibold">
              <Zap size={12} />
              Énergie
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              {stats.energieMoyenne ?? '—'}
            </p>
            <p className="text-xs text-neutral-400">moy. sur 5</p>
          </div>

          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-teal-500 uppercase tracking-wide font-semibold">
              <HeartPulse size={12} />
              Douleur
            </div>
            <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              {stats.douleurMoyenne ?? '—'}
            </p>
            <p className="text-xs text-neutral-400">moy. sur 10</p>
          </div>
        </div>

        {/* Graphique énergie / douleur */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-4">
          <div>
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Énergie & douleur</h2>
            <p className="text-xs text-neutral-400 mt-0.5">60 derniers jours</p>
          </div>
          <GraphiqueEnergieDouleur donnees={donneesEnergie} />
        </div>

        {/* Graphique régularité sport */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-4">
          <div>
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Régularité sport</h2>
            <p className="text-xs text-neutral-400 mt-0.5">8 dernières semaines</p>
          </div>
          <GraphiqueSport donnees={donneesSport} />
        </div>

      </main>
    </>
  )
}
