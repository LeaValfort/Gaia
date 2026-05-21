import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Heart } from 'lucide-react'
import { redirect } from 'next/navigation'
import { creerClientServeur } from '@/lib/supabase-server'
import { getDonneesCyclePourAffichage } from '@/lib/db/cycles'
import { getDailyLogParDate } from '@/lib/db/dailyLog'
import { getDailyMealIntakesJour } from '@/lib/db/dailyMealIntake'
import { getMacroProfile } from '@/lib/db/macro-profiles'
import { getTodosParDatePourUtilisateur } from '@/lib/db/todo'
import { getCycleDay, getPhaseAvecStats } from '@/lib/cycle'
import {
  macrosCiblesPourJour,
  planningEffectif,
  profilEffortPourJour,
} from '@/lib/macros-du-jour'
import { getTypeJournee } from '@/lib/nutrition'
import { generateTodosForToday } from '@/lib/recurring'
import { fusionIntakesJour, totauxDepuisIntakes } from '@/lib/recapManuel'
import { Nav } from '@/components/shared/Nav'
import { SeanceDuJour } from '@/components/today/SeanceDuJour'
import { JournalDuJour } from '@/components/today/JournalDuJour'
import { TodoDuJour } from '@/components/today/TodoDuJour'
import { AgendaDuJour } from '@/components/today/AgendaDuJour'
import { MacrosCibles } from '@/components/today/MacrosCibles'
import { DEFAULT_MODE_UTILISATEUR, type MacrosCiblesJour, type Phase } from '@/types'

function premierParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined
  return typeof v === 'string' ? v : v[0]
}

export default async function PageAujourdhui({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams

  const oauthErr = premierParam(params.error)
  if (oauthErr) {
    const q = new URLSearchParams({ erreur: 'oauth' })
    const code = premierParam(params.error_code)
    const msg = premierParam(params.error_description)
    if (code) q.set('code', code)
    if (msg) q.set('msg', msg)
    redirect(`/login?${q.toString()}`)
  }

  const codeOauth = premierParam(params.code)
  if (codeOauth) {
    redirect(`/auth/callback?code=${encodeURIComponent(codeOauth)}`)
  }

  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const aujourdhui = new Date()
  const dateStr = format(aujourdhui, 'yyyy-MM-dd')
  const dateAffichee = format(aujourdhui, 'EEEE d MMMM yyyy', { locale: fr })
  const userId = user?.id ?? ''

  if (userId) {
    await generateTodosForToday(userId, aujourdhui)
  }

  const [donnees, logDuJour] = await Promise.all([
    getDonneesCyclePourAffichage(),
    getDailyLogParDate(dateStr),
  ])
  const todos = userId ? await getTodosParDatePourUtilisateur(userId, dateStr) : []

  const { prefs, stats, effectiveStart, cycleLength } = donnees
  const mode = prefs?.mode_utilisateur ?? DEFAULT_MODE_UTILISATEUR
  const sansSuivi = mode === 'sans_cycle'
  const suiviCalorique = prefs?.suivi_calorique !== false
  const typeJournee = getTypeJournee(aujourdhui)

  let phase: Phase = 'folliculaire'
  let jourDuCycle: number | null = null
  if (!sansSuivi && effectiveStart) {
    jourDuCycle = getCycleDay(parseISO(effectiveStart), aujourdhui, cycleLength)
    phase = getPhaseAvecStats(jourDuCycle, stats, cycleLength)
  }

  let consoJour = { calories: 0, proteines: 0, glucides: 0, lipides: 0 }
  let macrosCibles: MacrosCiblesJour | null = null

  if (suiviCalorique && userId) {
    const planningSport = planningEffectif(prefs?.planning_sport)
    const [intakesJour, macroProfil, profilEffort] = await Promise.all([
      getDailyMealIntakesJour(supabase, userId, dateStr),
      getMacroProfile(userId),
      profilEffortPourJour(userId, planningSport, aujourdhui),
    ])
    consoJour = totauxDepuisIntakes(fusionIntakesJour(dateStr, intakesJour))
    macrosCibles = macrosCiblesPourJour({
      profil: macroProfil,
      profilEffort,
      phase,
      planning: planningSport,
      date: aujourdhui,
      sansSuiviCycle: sansSuivi,
      macrosMode: prefs?.macros_mode ?? 'auto',
    })
  }

  const prenom =
    user?.user_metadata?.full_name?.trim().split(/\s+/)[0] ??
    user?.user_metadata?.first_name?.trim() ??
    user?.email?.split('@')[0] ??
    'toi'
  const phaseHeader: Phase | null = sansSuivi ? null : phase

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950 page-accueil">
      <Nav phase={phaseHeader} sansCycle={sansSuivi} prenom={prenom} />
      <div className="max-w-4xl mx-auto px-6 py-6 pb-24">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Bonjour {prenom}
              </h1>
              <Link
                href="/proches"
                title="Proches"
                aria-label="Proches"
                className="shrink-0 text-neutral-500 transition-colors hover:text-amber-600 dark:text-neutral-400 dark:hover:text-amber-500"
              >
                <Heart className="size-5" strokeWidth={2} aria-hidden />
              </Link>
            </div>
            <p className="mt-0.5 text-sm capitalize text-neutral-500 dark:text-neutral-400">
              {dateAffichee}
            </p>
            <Link
              href="/progression"
              className="mt-1.5 inline-block text-sm text-muted-foreground transition-colors hover:text-primary dark:text-neutral-400 dark:hover:text-amber-500"
            >
              Voir ma progression →
            </Link>
          </div>
          {phaseHeader && jourDuCycle != null ? (
            <span className="shrink-0 inline-flex rounded-full bg-amber-600 px-2.5 py-1 text-xs font-medium text-white">
              {phaseHeader} · J{jourDuCycle}
            </span>
          ) : null}
        </header>

        <div className="flex flex-col gap-4">
          {suiviCalorique && macrosCibles ? (
            <MacrosCibles
              phase={phaseHeader}
              typeJournee={typeJournee}
              sansCycle={sansSuivi}
              conso={consoJour}
              macrosCibles={macrosCibles}
            />
          ) : null}
          <SeanceDuJour phase={phaseHeader} sansCycle={sansSuivi} />
          <JournalDuJour
            phase={phaseHeader ?? 'folliculaire'}
            sansCycle={sansSuivi}
            date={dateStr}
            jourDuCycle={jourDuCycle ?? 1}
            logInitial={logDuJour}
          />
          <AgendaDuJour
            date={dateStr}
            jourLibelle={dateAffichee}
            phase={phaseHeader}
            sansCycle={sansSuivi}
            effectiveStart={effectiveStart}
            cycleLength={cycleLength}
            jourDuCycle={jourDuCycle}
            googleCalendarEnabled={prefs?.google_calendar_enabled !== false}
          />
          <TodoDuJour
            userId={userId}
            date={dateStr}
            phase={phaseHeader}
            sansCycle={sansSuivi}
            todosInitiaux={todos}
          />
        </div>
      </div>
    </div>
  )
}
