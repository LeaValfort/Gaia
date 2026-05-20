import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { redirect } from 'next/navigation'
import { creerClientServeur } from '@/lib/supabase-server'
import { getDonneesCyclePourAffichage } from '@/lib/db/cycles'
import { getDailyLogParDate } from '@/lib/db/dailyLog'
import { getTodosParDate } from '@/lib/db/todo'
import { getDailyMealIntakesJour } from '@/lib/db/dailyMealIntake'
import { fusionIntakesJour, totauxDepuisIntakes } from '@/lib/recapManuel'
import { getCycleDay, getPhaseAvecStats } from '@/lib/cycle'
import { getTypeJournee } from '@/lib/nutrition'
import { Nav } from '@/components/shared/Nav'
import { SeanceDuJour } from '@/components/today/SeanceDuJour'
import { JournalDuJour } from '@/components/today/JournalDuJour'
import { TodoDuJour } from '@/components/today/TodoDuJour'
import { AgendaDuJour } from '@/components/today/AgendaDuJour'
import { DEFAULT_MODE_UTILISATEUR, type Phase } from '@/types'

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
  const dateAffichee = format(aujourdhui, "EEEE d MMMM yyyy", { locale: fr })
  const typeJournee = getTypeJournee(aujourdhui)

  const userId = user?.id ?? ''

  const [donnees, logDuJour, todos, intakesJour] = await Promise.all([
    getDonneesCyclePourAffichage(),
    getDailyLogParDate(dateStr),
    getTodosParDate(dateStr),
    userId ? getDailyMealIntakesJour(supabase, userId, dateStr) : Promise.resolve([]),
  ])

  const consoJour = totauxDepuisIntakes(fusionIntakesJour(dateStr, intakesJour))

  const { prefs, stats, effectiveStart, cycleLength } = donnees
  const mode = prefs?.mode_utilisateur ?? DEFAULT_MODE_UTILISATEUR
  const sansSuivi = mode === 'sans_cycle'

  const prenom =
    user?.user_metadata?.full_name?.trim().split(/\s+/)[0] ??
    user?.user_metadata?.first_name?.trim() ??
    user?.email?.split('@')[0] ??
    'toi'
  const cycleOk = effectiveStart != null
  const jourDuCycle = cycleOk ? getCycleDay(parseISO(effectiveStart), aujourdhui, cycleLength) : null
  const phase = jourDuCycle != null ? getPhaseAvecStats(jourDuCycle, stats, cycleLength) : null
  void consoJour
  void typeJournee

  const phaseHeader: Phase | null = sansSuivi ? null : phase

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950 page-accueil">
      <Nav phase={phaseHeader} sansCycle={sansSuivi} prenom={prenom} />
      <div className="max-w-4xl mx-auto px-6 py-6 pb-24">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Bonjour {prenom}
            </h1>
            <p className="mt-0.5 text-sm capitalize text-gray-500 dark:text-gray-400">{dateAffichee}</p>
          </div>
          {phaseHeader && jourDuCycle != null ? (
            <span className="shrink-0 inline-flex rounded-full bg-amber-600 px-2.5 py-1 text-xs font-medium text-white">
              {phaseHeader} · J{jourDuCycle}
            </span>
          ) : null}
        </header>

        <div className="flex flex-col gap-4">
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
