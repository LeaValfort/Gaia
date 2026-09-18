'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Nav } from '@/components/shared/Nav'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConseilPhaseSport } from '@/components/sport/ConseilPhaseSport'
import { DernieresSeances } from '@/components/sport/DernieresSeances'
import { ListeLoggerSeance } from '@/components/sport/ListeLoggerSeance'
import { OngletAutreSport } from '@/components/sport/OngletAutreSport'
import { OngletMuscu } from '@/components/sport/OngletMuscu'
import { OngletNatation } from '@/components/sport/OngletNatation'
import { OngletYoga } from '@/components/sport/OngletYoga'
import { PlanningSemaineStrip } from '@/components/sport/PlanningSemaineStrip'
import { SelecteurDateSeance } from '@/components/sport/SelecteurDateSeance'
import { SelecteurSeanceJour } from '@/components/sport/SelecteurSeanceJour'
import { getCycleDay, getPhaseForDay } from '@/lib/cycle'
import { getSeancesDuJourClient } from '@/lib/sport/workouts-client'
import { typeSeanceVersForm } from '@/lib/sport/type-seance-form'
import { cartesSubstitutionJour } from '@/lib/sport/substitution-jour'
import { BADGE_PHASE_CYCLE } from '@/lib/cycle-affichage'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import { getEntreesPlanning } from '@/lib/db/planning-sport-entries'
import { getOverridesJour, setOverrideJour, supprimerOverrideJour } from '@/lib/db/planning-overrides'
import { getToutesVariantesPourType } from '@/lib/db/sport-variantes'
import { seancesEffectivesJour, seancesResoluesPourDate } from '@/lib/planning-sport-jour'
import { type SportLoggerId } from '@/lib/sport-page'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { POURCENTAGES_GAIA_DEFAUT } from '@/types'
import type {
  Phase,
  PlanningOverride,
  PlanningSportEntry,
  PourcentagesGaia,
  SeanceProfil,
  SportVariante,
  TypePlanningJour,
  TypeSeance,
  TypeVarianteSport,
  WorkoutMuscuComplet,
  WorkoutNatationComplet,
  WorkoutYogaComplet,
} from '@/types'

const TYPES_VARIANTES_MACROS: TypeVarianteSport[] = ['muscu_full', 'muscu_upper', 'natation', 'yoga']

function pourcentagesEffectifs(p: PourcentagesGaia | null | undefined): PourcentagesGaia {
  return { ...POURCENTAGES_GAIA_DEFAUT, ...(p ?? {}) }
}

type FormSport = SportLoggerId | 'autre'

export default function SportPage() {
  const [phaseAffichee, setPhaseAffichee] = useState<Phase | null>(null)
  const [sansCycle, setSansCycle] = useState(false)
  const [jourDuCycle, setJourDuCycle] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)
  const [entreesPlanning, setEntreesPlanning] = useState<PlanningSportEntry[]>([])
  const [variantesMacros, setVariantesMacros] = useState<SportVariante[]>([])
  const [overridesAuj, setOverridesAuj] = useState<PlanningOverride[]>([])
  const [chOverride, setChOverride] = useState(false)
  const [pourcentages, setPourcentages] = useState<PourcentagesGaia>(POURCENTAGES_GAIA_DEFAUT)
  const [seanceProfils, setSeanceProfils] = useState<SeanceProfil[]>([])
  const [prenom, setPrenom] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)
  const [formOuvert, setFormOuvert] = useState<FormSport | null>(null)
  const [refreshSeances, setRefreshSeances] = useState(0)
  const [dateSeance, setDateSeance] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [effectiveStart, setEffectiveStart] = useState<string | null>(null)
  const [cycleLength, setCycleLength] = useState(28)
  const [seancesJour, setSeancesJour] = useState<{
    muscu: WorkoutMuscuComplet | null
    natation: WorkoutNatationComplet | null
    yoga: WorkoutYogaComplet | null
  }>({ muscu: null, natation: null, yoga: null })
  const [chargementSeances, setChargementSeances] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')

  const apresEnregistrement = useCallback(() => {
    setFormOuvert(null)
    setRefreshSeances((n) => n + 1)
  }, [])

  const chargerSeancesJour = useCallback(async (date: string) => {
    setChargementSeances(true)
    try {
      const s = await getSeancesDuJourClient(date)
      setSeancesJour(s)
    } catch {
      setSeancesJour({ muscu: null, natation: null, yoga: null })
    } finally {
      setChargementSeances(false)
    }
  }, [])

  function ouvrirModifier(date: string, type: TypeSeance) {
    const form = typeSeanceVersForm(type)
    if (!form || form === 'autre') return
    setDateSeance(date)
    setFormOuvert(form)
  }

  useEffect(() => {
    async function chargerDonnees() {
      setLoading(true)
      setErreur(null)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setUserId(null)
          setPrenom(null)
          setLoading(false)
          return
        }
        setUserId(user.id)
        setPrenom(
          (user.user_metadata?.full_name as string | undefined)?.trim().split(/\s+/)[0] ??
            (user.user_metadata?.first_name as string | undefined) ??
            user.email?.split('@')[0] ??
            'toi'
        )

        const [{ data: prefs, error: errPrefs }, { data: profils, error: errProfils }, entrees, ...variantesParType] =
          await Promise.all([
            supabase
              .from('user_preferences')
              .select('last_cycle_start, cycle_length, mode_utilisateur, pourcentages_gaia')
              .eq('user_id', user.id)
              .maybeSingle(),
            supabase.from('seance_profils').select('*').eq('user_id', user.id),
            getEntreesPlanning(supabase, user.id),
            ...TYPES_VARIANTES_MACROS.map((t) => getToutesVariantesPourType(supabase, user.id, t)),
          ])

        if (errPrefs) throw new Error(errPrefs.message)
        if (errProfils) {
          console.warn('seance_profils indisponible:', errProfils.message)
        }

        const sc = prefs?.mode_utilisateur === 'sans_cycle'
        setSansCycle(sc)

        if (sc) {
          setPhaseAffichee(null)
          setJourDuCycle(1)
        } else if (prefs?.last_cycle_start) {
          const cl = prefs.cycle_length ?? 28
          const jour = getCycleDay(parseISO(prefs.last_cycle_start), new Date(), cl)
          setJourDuCycle(jour)
          setPhaseAffichee(getPhaseForDay(jour, cl))
          setEffectiveStart(prefs.last_cycle_start)
          setCycleLength(cl)
        } else {
          setPhaseAffichee(null)
        }

        setPourcentages(pourcentagesEffectifs(prefs?.pourcentages_gaia as PourcentagesGaia | undefined))
        setSeanceProfils((profils ?? []) as SeanceProfil[])
        setEntreesPlanning(entrees)
        setVariantesMacros(variantesParType.flat())
        setOverridesAuj(await getOverridesJour(today))
      } catch (e) {
        setErreur(e instanceof Error ? e.message : 'Erreur de chargement.')
      } finally {
        setLoading(false)
      }
    }

    void chargerDonnees()
  }, [today])

  const entreesResolues = useMemo(
    () => seancesResoluesPourDate(entreesPlanning, variantesMacros, new Date()),
    [entreesPlanning, variantesMacros]
  )
  const seancesEffectives = useMemo(
    () => seancesEffectivesJour(entreesResolues, overridesAuj),
    [entreesResolues, overridesAuj]
  )
  const typesJourEffectifs = useMemo(() => seancesEffectives.map((s) => s.type), [seancesEffectives])
  const cartesSubstitution = useMemo(
    () => cartesSubstitutionJour(entreesResolues, overridesAuj),
    [entreesResolues, overridesAuj]
  )

  async function changerSeance(entreeId: string | null, type: TypePlanningJour) {
    setChOverride(true)
    const ok = await setOverrideJour(today, type, entreeId)
    if (ok) setOverridesAuj(await getOverridesJour(today))
    else toast.error('Impossible de changer la séance.')
    setChOverride(false)
  }

  async function revenirSeance(entreeId: string | null) {
    setChOverride(true)
    const ok = await supprimerOverrideJour(today, entreeId)
    if (ok) setOverridesAuj(await getOverridesJour(today))
    else toast.error('Impossible de revenir au planning.')
    setChOverride(false)
  }

  useEffect(() => {
    if (!userId || !formOuvert) return
    void chargerSeancesJour(dateSeance)
  }, [userId, formOuvert, dateSeance, refreshSeances, chargerSeancesJour])

  const phaseSeance = useMemo((): Phase | null => {
    if (sansCycle || !effectiveStart) return null
    const jour = getCycleDay(parseISO(effectiveStart), parseISO(`${dateSeance}T12:00:00`), cycleLength)
    return getPhaseForDay(jour, cycleLength)
  }, [sansCycle, effectiveStart, dateSeance, cycleLength])

  const navPhase: Phase | null = sansCycle ? null : phaseAffichee

  const seanceActive =
    formOuvert === 'muscu'
      ? seancesJour.muscu
      : formOuvert === 'natation'
        ? seancesJour.natation
        : formOuvert === 'yoga'
          ? seancesJour.yoga
          : null

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] dark:bg-neutral-950">
        <Nav phase={navPhase} sansCycle={sansCycle} prenom={prenom} />
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-6 pb-24 sm:px-6">
          <div className="h-14 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-8 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-16 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-40 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
    )
  }

  if (erreur) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
        <Nav phase={navPhase} sansCycle={sansCycle} prenom={prenom} />
        <div className="mx-auto max-w-lg px-4 py-12 text-center sm:px-6">
          <p className="text-sm text-muted-foreground">{erreur}</p>
          <Button type="button" className="mt-4" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  if (!userId) return null

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav phase={navPhase} sansCycle={sansCycle} prenom={prenom} />
      <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-6 pb-24 sm:px-6">
        <PageHeader
          title="Sport"
          phaseBadge={
            navPhase ? (
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-1 text-xs font-medium text-white',
                  BADGE_PHASE_CYCLE[navPhase]
                )}
              >
                {PHASES_DESIGN[navPhase].label} · J{jourDuCycle}
              </span>
            ) : undefined
          }
        />

        {!sansCycle && phaseAffichee ? <ConseilPhaseSport phase={phaseAffichee} /> : null}

        <PlanningSemaineStrip entrees={entreesPlanning} />

        <div className="flex flex-col gap-2">
          {cartesSubstitution.map((carte) => (
            <SelecteurSeanceJour
              key={carte.entreeId ?? 'libre'}
              carte={carte}
              onChanger={(t) => void changerSeance(carte.entreeId, t)}
              onRevenir={() => void revenirSeance(carte.entreeId)}
              chargement={chOverride}
            />
          ))}
        </div>

        <ListeLoggerSeance
          typesJour={typesJourEffectifs}
          seanceProfils={seanceProfils}
          formOuvert={formOuvert}
          onOuvrir={setFormOuvert}
        />

        {formOuvert ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
            <button
              type="button"
              onClick={() => setFormOuvert(null)}
              className="self-start text-sm text-muted-foreground transition-colors hover:text-neutral-900 dark:hover:text-neutral-200"
            >
              ← Retour aux séances
            </button>
            <SelecteurDateSeance date={dateSeance} max={today} onChange={setDateSeance} />
            {seanceActive ? (
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200 rounded-lg bg-amber-50 dark:bg-amber-950/40 px-3 py-2">
                Une séance existe déjà ce jour — tu peux la modifier ci-dessous.
              </p>
            ) : null}
            {chargementSeances ? (
              <p className="text-sm text-muted-foreground">Chargement de la séance…</p>
            ) : null}
            {formOuvert === 'muscu' && !chargementSeances ? (
              <OngletMuscu
                phase={phaseSeance ?? navPhase}
                userId={userId}
                date={dateSeance}
                seanceExistante={seancesJour.muscu}
                onEnregistre={apresEnregistrement}
                pourcentages={pourcentages}
              />
            ) : null}
            {formOuvert === 'natation' && !chargementSeances ? (
              <OngletNatation
                phase={phaseSeance ?? navPhase}
                userId={userId}
                date={dateSeance}
                seanceExistante={seancesJour.natation}
                onEnregistre={apresEnregistrement}
                pourcentages={pourcentages}
              />
            ) : null}
            {formOuvert === 'yoga' && !chargementSeances ? (
              <OngletYoga
                phase={phaseSeance ?? navPhase}
                userId={userId}
                date={dateSeance}
                seanceExistante={seancesJour.yoga}
                onEnregistre={apresEnregistrement}
              />
            ) : null}
            {formOuvert === 'autre' && !chargementSeances ? (
              <OngletAutreSport userId={userId} date={dateSeance} onEnregistre={apresEnregistrement} />
            ) : null}
          </div>
        ) : null}

        <DernieresSeances
          userId={userId}
          refreshToken={refreshSeances}
          onModifier={ouvrirModifier}
        />
      </div>
    </div>
  )
}
