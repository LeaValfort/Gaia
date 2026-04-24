import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Settings } from 'lucide-react'
import { creerClientServeur } from '@/lib/supabase-server'
import { getDonneesCyclePourAffichage } from '@/lib/db/cycles'
import { getDailyLogParDate } from '@/lib/db/dailyLog'
import { getTodosParDate } from '@/lib/db/todo'
import { getDailyMealIntakesJour } from '@/lib/db/dailyMealIntake'
import { fusionIntakesJour, totauxDepuisIntakes } from '@/lib/recapManuel'
import { getCycleDay, getPhaseAvecStats } from '@/lib/cycle'
import { getTypeJournee } from '@/lib/nutrition'
import { PHASES_DESIGN, PHASE_DESIGN_ACCUEIL_NEUTRE } from '@/lib/data/phases-design'
import { Nav } from '@/components/shared/Nav'
import { HeroPhase } from '@/components/today/HeroPhase'
import { PhasesPreview } from '@/components/today/PhasesPreview'
import { ConseilsDuJour } from '@/components/today/ConseilsDuJour'
import { SeanceDuJour } from '@/components/today/SeanceDuJour'
import { MacrosCibles } from '@/components/today/MacrosCibles'
import { JournalDuJour } from '@/components/today/JournalDuJour'
import { TodoDuJour } from '@/components/today/TodoDuJour'
import { AgendaDuJour } from '@/components/today/AgendaDuJour'
import { buttonVariants } from '@/components/ui/button'
import { DEFAULT_MODE_UTILISATEUR, type Phase } from '@/types'
import { cn } from '@/lib/utils'

const CARD = 'rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900'

function EnTeteAujourdhui({
  phase,
  sansSuivi,
  dateLabel,
}: {
  phase: Phase | null
  sansSuivi: boolean
  dateLabel: string
}) {
  const d = sansSuivi || !phase ? PHASE_DESIGN_ACCUEIL_NEUTRE : PHASES_DESIGN[phase]
  return (
    <div
      className={cn('rounded-2xl p-6 mb-6 border bg-gradient-to-br', d.gradient, 'dark:border-gray-800/80')}
      style={{ borderColor: `${d.accent}33` }}
    >
      <h1 className="text-2xl font-semibold" style={{ color: d.texte }}>
        Aujourd&apos;hui
      </h1>
      <p className="text-sm mt-1" style={{ color: d.texteMuted }}>
        {dateLabel}
      </p>
    </div>
  )
}

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

  if (sansSuivi) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950 page-accueil">
        <Nav phase={null} sansCycle prenom={prenom} />
        <div className="max-w-7xl mx-auto px-6 py-6 pb-24">
          <EnTeteAujourdhui phase={null} sansSuivi dateLabel={dateAffichee} />
          <div className="hidden md:grid md:grid-cols-[1fr_280px] gap-6 items-start">
            <div className="min-w-0 flex flex-col gap-4">
              <JournalDuJour
                phase="folliculaire"
                sansCycle
                date={dateStr}
                jourDuCycle={1}
                logInitial={logDuJour}
              />
              <HeroPhase
                phase={null}
                sansCycle
                jourDuCycle={null}
                cycleLength={null}
                prenom={prenom}
                dateLabel={dateAffichee}
              />
              <ConseilsDuJour phase={null} sansCycle />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SeanceDuJour phase={null} sansCycle />
                <MacrosCibles phase={null} typeJournee={typeJournee} sansCycle conso={consoJour} />
              </div>
            </div>
            <aside className="min-w-0 flex flex-col gap-4">
              <AgendaDuJour
                date={dateStr}
                jourLibelle={dateAffichee}
                phase={null}
                sansCycle
                effectiveStart={null}
                cycleLength={cycleLength}
                jourDuCycle={null}
                googleCalendarEnabled={prefs?.google_calendar_enabled !== false}
              />
              <TodoDuJour userId={userId} date={dateStr} phase={null} sansCycle todosInitiaux={todos} />
            </aside>
          </div>
          <div className="md:hidden flex flex-col gap-4">
            <HeroPhase
              phase={null}
              sansCycle
              jourDuCycle={null}
              cycleLength={null}
              prenom={prenom}
              dateLabel={dateAffichee}
            />
            <ConseilsDuJour phase={null} sansCycle />
            <SeanceDuJour phase={null} sansCycle />
            <MacrosCibles phase={null} typeJournee={typeJournee} sansCycle conso={consoJour} />
            <JournalDuJour
              phase="folliculaire"
              sansCycle
              date={dateStr}
              jourDuCycle={1}
              logInitial={logDuJour}
            />
            <TodoDuJour userId={userId} date={dateStr} phase={null} sansCycle todosInitiaux={todos} />
            <AgendaDuJour
              date={dateStr}
              jourLibelle={dateAffichee}
              phase={null}
              sansCycle
              effectiveStart={null}
              cycleLength={cycleLength}
              jourDuCycle={null}
              googleCalendarEnabled={prefs?.google_calendar_enabled !== false}
            />
          </div>
        </div>
      </div>
    )
  }

  const cycleOk = effectiveStart != null
  const jourDuCycle = cycleOk ? getCycleDay(parseISO(effectiveStart), aujourdhui, cycleLength) : null
  const phase = jourDuCycle != null ? getPhaseAvecStats(jourDuCycle, stats, cycleLength) : null
  const previewVisible = cycleOk && phase != null

  const centreSuite = (
    <>
      <PhasesPreview phase={phase} cycleLength={cycleLength} visible={previewVisible} />
      <ConseilsDuJour phase={phase} sansCycle={false} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SeanceDuJour phase={phase} />
        <MacrosCibles phase={phase} typeJournee={typeJournee} conso={consoJour} />
      </div>
      {!cycleOk || !phase ? (
        <div className={cn(CARD, 'flex flex-col gap-3 sm:flex-row sm:items-center')}>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-gray-50">Configure ton cycle</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Renseigne la date de début pour voir phase, aperçu et conseils adaptés.
            </p>
          </div>
          <Link
            href="/parametres"
            className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex shrink-0 items-center gap-2')}
          >
            <Settings size={16} />
            Paramètres
          </Link>
        </div>
      ) : null}
    </>
  )

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950 page-accueil">
      <Nav phase={phase} prenom={prenom} />
      <div className="max-w-7xl mx-auto px-6 py-6 pb-24">
        <EnTeteAujourdhui phase={phase} sansSuivi={false} dateLabel={dateAffichee} />
        <div className="hidden md:grid md:grid-cols-[1fr_280px] gap-6 items-start">
          <div className="min-w-0 flex flex-col gap-4">
            {phase ? (
              <JournalDuJour
                phase={phase}
                date={dateStr}
                jourDuCycle={jourDuCycle!}
                logInitial={logDuJour}
              />
            ) : (
              <div className={cn(CARD, 'text-sm text-gray-500 dark:text-gray-400')}>
                Le journal sera disponible après configuration du cycle.
              </div>
            )}
            <HeroPhase
              phase={phase}
              jourDuCycle={jourDuCycle}
              cycleLength={cycleOk ? cycleLength : null}
              prenom={prenom}
              dateLabel={dateAffichee}
            />
            {centreSuite}
          </div>
          <aside className="min-w-0 flex flex-col gap-4">
            <AgendaDuJour
              date={dateStr}
              jourLibelle={dateAffichee}
              phase={phase}
              effectiveStart={effectiveStart}
              cycleLength={cycleLength}
              jourDuCycle={jourDuCycle}
              googleCalendarEnabled={prefs?.google_calendar_enabled !== false}
            />
            <TodoDuJour userId={userId} date={dateStr} phase={phase} todosInitiaux={todos} />
          </aside>
        </div>
        <div className="md:hidden flex flex-col gap-4">
          <HeroPhase
            phase={phase}
            jourDuCycle={jourDuCycle}
            cycleLength={cycleOk ? cycleLength : null}
            prenom={prenom}
            dateLabel={dateAffichee}
          />
          {centreSuite}
          {phase ? (
            <JournalDuJour
              phase={phase}
              date={dateStr}
              jourDuCycle={jourDuCycle!}
              logInitial={logDuJour}
            />
          ) : null}
          <TodoDuJour userId={userId} date={dateStr} phase={phase} todosInitiaux={todos} />
          <AgendaDuJour
            date={dateStr}
            jourLibelle={dateAffichee}
            phase={phase}
            effectiveStart={effectiveStart}
            cycleLength={cycleLength}
            jourDuCycle={jourDuCycle}
            googleCalendarEnabled={prefs?.google_calendar_enabled !== false}
          />
        </div>
      </div>
    </div>
  )
}
