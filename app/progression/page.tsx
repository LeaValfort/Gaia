import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { redirect } from 'next/navigation'
import { designPhaseAffichage } from '@/lib/data/phases-design'
import { creerClientServeur } from '@/lib/supabase-server'
import { getCycleDay, getPhaseAvecStats } from '@/lib/cycle'
import { getDonneesCyclePourAffichage } from '@/lib/db/cycles'
import {
  getDailyLogsProgression,
  getMensurations,
  getStatsResume,
  getWorkoutsProgression,
} from '@/lib/db/progression'
import { ProgressionContenu } from '@/components/progression/ProgressionContenu'
import { Nav } from '@/components/shared/Nav'
import { DEFAULT_MODE_UTILISATEUR } from '@/types'
import type { Phase } from '@/types'

export const dynamic = 'force-dynamic'

export default async function PageProgression() {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const prenom =
    user.user_metadata?.full_name?.trim().split(/\s+/)[0] ??
    (user.user_metadata?.first_name as string | undefined)?.trim() ??
    user.email?.split('@')[0] ??
    'toi'

  const today = new Date()
  const [
    { prefs, stats: cycleStats, effectiveStart, cycleLength },
    dailyLogs,
    workouts,
    mensurations,
    stats,
  ] = await Promise.all([
    getDonneesCyclePourAffichage(),
    getDailyLogsProgression(),
    getWorkoutsProgression(),
    getMensurations(),
    getStatsResume(),
  ])

  const mode = prefs?.mode_utilisateur ?? DEFAULT_MODE_UTILISATEUR
  const sansSuivi = mode === 'sans_cycle'

  let phase: Phase = 'folliculaire'
  if (!sansSuivi && effectiveStart) {
    const jourDuCycle = getCycleDay(parseISO(effectiveStart), today, cycleLength)
    phase = getPhaseAvecStats(jourDuCycle, cycleStats, cycleLength)
  }

  const design = designPhaseAffichage(sansSuivi ? null : phase, { sansCycle: sansSuivi })
  const moisActuel = format(today, 'MMMM yyyy', { locale: fr })

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav phase={sansSuivi ? null : phase} sansCycle={sansSuivi} prenom={prenom} />
      <div className="max-w-7xl mx-auto px-6 py-6 pb-24">
        <ProgressionContenu
          userId={user.id}
          design={design}
          moisActuel={moisActuel}
          dailyLogs={dailyLogs}
          workouts={workouts}
          mensurations={mensurations}
          stats={stats}
          cycleLength={cycleLength}
        />
      </div>
    </div>
  )
}
