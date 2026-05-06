import { format } from 'date-fns'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/shared/Nav'
import { PageHeader } from '@/components/shared/PageHeader'
import { BoutonDebutRegles } from '@/components/cycle/BoutonDebutRegles'
import { ConseilsPhase } from '@/components/cycle/ConseilsPhase'
import { CycleCalendar } from '@/components/cycle/CycleCalendar'
import { SidebarCycle } from '@/components/cycle/SidebarCycle'
import { Button } from '@/components/ui/button'
import {
  detecterRetardDepuisAncre,
  genererPredictionsParIntervalle,
  getIntervalGrilleCalendrier,
  getPhaseEtConseilAvecApprentissage,
  premierJourAffichageRetardDepuisAncre,
} from '@/lib/cycle'
import { getDonneesCyclePourAffichage } from '@/lib/db/cycles'
import { getDailyLogsParMois } from '@/lib/db/dailyLog'
import { getUserPreferences } from '@/lib/db/parametres'
import { creerClientServeur } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ mois?: string }>
}

export default async function PageCycle({ searchParams }: PageProps) {
  const prefsMode = await getUserPreferences()
  if (prefsMode?.mode_utilisateur === 'sans_cycle') {
    redirect('/parametres?message=active-le-mode-cycle-pour-acceder-ici')
  }

  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const params = await searchParams
  const moisActuel = params.mois ?? format(new Date(), 'yyyy-MM')
  const [annee, mois] = moisActuel.split('-').map(Number)
  const moisIdx = mois - 1

  const [donnees, logsParDate] = await Promise.all([
    getDonneesCyclePourAffichage(),
    getDailyLogsParMois(annee, mois),
  ])

  const { prefs, effectiveStart, cycleLength, stats, cycles } = donnees
  const dernierCycle = cycles[0] ?? null

  const retardJours =
    effectiveStart != null
      ? detecterRetardDepuisAncre(effectiveStart, cycleLength, stats, new Date())
      : null
  const debutRetardISO =
    retardJours != null && effectiveStart != null
      ? premierJourAffichageRetardDepuisAncre(effectiveStart, cycleLength, stats)
      : null

  const { debut, fin } = getIntervalGrilleCalendrier(annee, moisIdx)
  const predictionsParDate =
    effectiveStart != null
      ? genererPredictionsParIntervalle(debut, fin, effectiveStart, cycleLength, stats)
      : {}

  const conseilAujourdhui = effectiveStart
    ? getPhaseEtConseilAvecApprentissage(prefs, stats, effectiveStart, cycleLength)
    : null

  const bandeauApprentissage =
    stats && stats.fiabilite !== 'haute' && (stats.nb_cycles_utilise ?? 0) < 5

  const prenom =
    user?.user_metadata?.full_name?.trim().split(/\s+/)[0] ??
    user?.user_metadata?.first_name?.trim() ??
    user?.email?.split('@')[0] ??
    'toi'
  const phaseNav = conseilAujourdhui?.phase ?? null

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav phase={phaseNav} prenom={prenom} />
      <div className="max-w-7xl mx-auto px-6 py-6 pb-24 flex flex-col gap-6">
        <PageHeader
          title="Mon cycle"
          subtitle="Calendrier des phases, prédictions en pointillés et suivi du retard. Clique sur un jour pour ton journal."
          phaseBadge={
            phaseNav ? (
              <span className="inline-flex rounded-full bg-violet-600 px-2.5 py-1 text-xs font-medium text-white">
                {phaseNav}
              </span>
            ) : undefined
          }
        />

        {effectiveStart ? (
          <>
            <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
              <div className="flex flex-col gap-6 min-w-0">
                {bandeauApprentissage ? (
                  <p className="text-sm rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100 px-4 py-3">
                    Plus tu enregistres le début de tes règles à chaque cycle, plus les phases
                    affichées se rapprochent de ton rythme réel. Actuellement :{' '}
                    <strong>{stats?.nb_cycles_utilise ?? 0}</strong> intervalle(s) pris en compte
                    pour les moyennes.
                  </p>
                ) : null}

                {conseilAujourdhui ? (
                  <CycleCalendar
                    annee={annee}
                    mois={moisIdx}
                    phase={conseilAujourdhui.phase}
                    jourDuCycle={conseilAujourdhui.jourDuCycle}
                    dernierCycle={dernierCycle}
                    logsParDate={logsParDate}
                    anchorISO={effectiveStart}
                    cycleLength={cycleLength}
                    predictionsParDate={predictionsParDate}
                    debutRetardISO={debutRetardISO}
                    retardJours={retardJours}
                  />
                ) : null}

                {conseilAujourdhui ? <ConseilsPhase phase={conseilAujourdhui.phase} /> : null}
              </div>

              {conseilAujourdhui ? (
                <SidebarCycle
                  cycleLength={cycleLength}
                  effectiveStartISO={effectiveStart}
                  stats={stats}
                  cycles={cycles}
                  retardJours={retardJours}
                  userId={user?.id ?? ''}
                />
              ) : null}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-neutral-900 dark:text-neutral-50">
                Date de cycle manquante
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Renseigne la date de début de ton dernier cycle dans les Paramètres, ou signale le
                début de tes règles ci-dessous pour démarrer l’historique.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <BoutonDebutRegles />
              <Link href="/parametres">
                <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                  <Settings size={15} />
                  Paramètres
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
