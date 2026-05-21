import { redirect } from 'next/navigation'
import { parseISO } from 'date-fns'
import { creerClientServeur } from '@/lib/supabase-server'
import { designPhaseAffichage } from '@/lib/data/phases-design'
import { AlimentationLayout } from '@/components/alimentation/AlimentationLayout'
import { AlimentationOnglets } from '@/components/alimentation/AlimentationOnglets'
import { PageHeader } from '@/components/shared/PageHeader'
import { getLundiSemaine, getTypeJournee } from '@/lib/nutrition'
import { getMacroProfile } from '@/lib/db/macro-profiles'
import {
  macrosCiblesPourJour,
  planningEffectif,
  profilEffortPourJour,
} from '@/lib/macros-du-jour'
import { getCycleDay, getPhaseAvecStats } from '@/lib/cycle'
import { BADGE_PHASE_CYCLE } from '@/lib/cycle-affichage'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import { getDonneesCyclePourAffichage } from '@/lib/db/cycles'
import { getDailyMealIntakesJour } from '@/lib/db/dailyMealIntake'
import { fusionIntakesJour, totauxDepuisIntakes } from '@/lib/recapManuel'
import { Nav } from '@/components/shared/Nav'
import { cn } from '@/lib/utils'
import type { MacrosCiblesJour, Phase } from '@/types'
import { DEFAULT_MODE_UTILISATEUR } from '@/types'

export const dynamic = 'force-dynamic'

export default async function PageAlimentation() {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
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

  const { prefs, stats, effectiveStart, cycleLength } = await getDonneesCyclePourAffichage()
  const mode = prefs?.mode_utilisateur ?? DEFAULT_MODE_UTILISATEUR
  const sansSuivi = mode === 'sans_cycle'
  const suiviCalorique = prefs?.suivi_calorique !== false

  const [intakesJour, macroProfil] = await Promise.all([
    suiviCalorique
      ? getDailyMealIntakesJour(supabase, user.id, todayIso)
      : Promise.resolve([]),
    suiviCalorique ? getMacroProfile(user.id) : Promise.resolve(null),
  ])
  const consoJour = suiviCalorique
    ? totauxDepuisIntakes(fusionIntakesJour(todayIso, intakesJour))
    : { calories: 0, proteines: 0, glucides: 0, lipides: 0 }

  let phase: Phase = 'folliculaire'
  let jourDuCycle: number | null = null
  if (!sansSuivi && effectiveStart) {
    jourDuCycle = getCycleDay(parseISO(effectiveStart), today, cycleLength)
    phase = getPhaseAvecStats(jourDuCycle, stats, cycleLength)
  }

  const design = designPhaseAffichage(sansSuivi ? null : phase, { sansCycle: sansSuivi })
  const planningSport = planningEffectif(prefs?.planning_sport)
  const profilEffort = suiviCalorique
    ? await profilEffortPourJour(user.id, planningSport, today)
    : null

  const macrosCibles: MacrosCiblesJour = suiviCalorique
    ? macrosCiblesPourJour({
        profil: macroProfil,
        profilEffort,
        phase,
        planning: planningSport,
        date: today,
        sansSuiviCycle: sansSuivi,
        macrosMode: prefs?.macros_mode ?? 'auto',
      })
    : {
        calories: 0,
        proteines: 0,
        glucides: 0,
        lipides: 0,
        message: '',
        typeJournee,
        phase,
      }

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav phase={sansSuivi ? null : phase} sansCycle={sansSuivi} prenom={prenom} />
      <div className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:px-6">
        <AlimentationLayout design={design}>
          <PageHeader
            title="Manger"
            className="mb-4"
            phaseBadge={
              !sansSuivi && jourDuCycle != null ? (
                <span
                  className={cn(
                    'inline-flex rounded-full px-2.5 py-1 text-xs font-medium text-white',
                    BADGE_PHASE_CYCLE[phase]
                  )}
                >
                  {PHASES_DESIGN[phase].label} · J{jourDuCycle}
                </span>
              ) : undefined
            }
          />
          <AlimentationOnglets
            userId={user.id}
            weekStart={weekStart}
            todayIso={todayIso}
            typeJournee={typeJournee}
            phase={phase}
            sansSuivi={sansSuivi}
            sansSuiviCycle={sansSuivi}
            suiviCalorique={suiviCalorique}
            effectiveStart={effectiveStart}
            cycleLength={cycleLength}
            stats={stats}
            macrosTypeJournee={macrosCibles.typeJournee}
            macrosCibles={macrosCibles}
            consoJour={consoJour}
            allergies={prefs?.food_allergies ?? []}
            cookTimeMinutes={prefs?.cook_time_minutes ?? 30}
          />
        </AlimentationLayout>
      </div>
    </div>
  )
}
