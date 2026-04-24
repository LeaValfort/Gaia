import { redirect } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { creerClientServeur } from '@/lib/supabase-server'
import { designPhaseAffichage } from '@/lib/data/phases-design'
import { AlimentationLayout } from '@/components/alimentation/AlimentationLayout'
import { AlimentationOnglets } from '@/components/alimentation/AlimentationOnglets'
import {
  getLundiSemaine,
  getTypeJournee,
  calculerMacrosJour,
  calculerMacrosJourSansCycle,
} from '@/lib/nutrition'
import { getCycleDay, getPhaseAvecStats } from '@/lib/cycle'
import { getDonneesCyclePourAffichage } from '@/lib/db/cycles'
import { getDailyMealIntakesJour } from '@/lib/db/dailyMealIntake'
import { fusionIntakesJour, totauxDepuisIntakes } from '@/lib/recapManuel'
import { Nav } from '@/components/shared/Nav'
import type { Phase } from '@/types'
import { DEFAULT_MODE_UTILISATEUR } from '@/types'

export const dynamic = 'force-dynamic'

export default async function PageAlimentation() {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const prenom =
    user.user_metadata?.full_name?.trim().split(/\s+/)[0] ??
    (user.user_metadata?.first_name as string | undefined)?.trim() ??
    user.email?.split('@')[0] ??
    'toi'

  const today = new Date()
  const weekStart = getLundiSemaine(today)
  const typeJournee = getTypeJournee(today)
  const todayIso = today.toISOString().slice(0, 10)

  const [{ prefs, stats, effectiveStart, cycleLength }, intakesJour] = await Promise.all([
    getDonneesCyclePourAffichage(),
    getDailyMealIntakesJour(supabase, user.id, todayIso),
  ])
  const consoJour = totauxDepuisIntakes(fusionIntakesJour(todayIso, intakesJour))

  const mode = prefs?.mode_utilisateur ?? DEFAULT_MODE_UTILISATEUR
  const sansSuivi = mode === 'sans_cycle'

  let phase: Phase = 'folliculaire'
  if (!sansSuivi && effectiveStart) {
    const jourDuCycle = getCycleDay(parseISO(effectiveStart), today, cycleLength)
    phase = getPhaseAvecStats(jourDuCycle, stats, cycleLength)
  }

  const design = designPhaseAffichage(sansSuivi ? null : phase, { sansCycle: sansSuivi })
  const weekStartLabel = format(parseISO(`${weekStart}T12:00:00`), "'Semaine du' d MMMM yyyy", { locale: fr })
  const macros = sansSuivi ? calculerMacrosJourSansCycle(typeJournee) : calculerMacrosJour(phase, typeJournee)

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav
        phase={sansSuivi ? null : phase}
        sansCycle={sansSuivi}
        prenom={prenom}
      />
      <div className="max-w-7xl mx-auto px-6 py-6 pb-24">
        <AlimentationLayout
          design={design}
          weekStartLabel={weekStartLabel}
          todayIso={todayIso}
          typeJournee={typeJournee}
          phase={phase}
          sansSuiviCycle={sansSuivi}
          consoJour={consoJour}
        >
          <AlimentationOnglets
            userId={user.id}
            weekStart={weekStart}
            todayIso={todayIso}
            typeJournee={typeJournee}
            phase={phase}
            sansSuivi={sansSuivi}
            sansSuiviCycle={sansSuivi}
            effectiveStart={effectiveStart}
            cycleLength={cycleLength}
            stats={stats}
            macrosTypeJournee={macros.typeJournee}
            allergies={prefs?.food_allergies ?? []}
            cookTimeMinutes={prefs?.cook_time_minutes ?? 30}
          />
        </AlimentationLayout>
      </div>
    </div>
  )
}
