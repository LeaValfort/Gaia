'use client'

import { useEffect, useState } from 'react'
import { parseISO } from 'date-fns'
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
import { getCycleDay, getPhaseForDay } from '@/lib/cycle'
import { BADGE_PHASE_CYCLE } from '@/lib/cycle-affichage'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import { PLANNING_DEFAUT } from '@/lib/planning-sport'
import { type SportLoggerId } from '@/lib/sport-page'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Phase, PlanningSport, SeanceProfil } from '@/types'

type FormSport = SportLoggerId | 'autre'

function planningComplet(p: PlanningSport | null | undefined): PlanningSport {
  const d = PLANNING_DEFAUT
  if (!p) return d
  return {
    lundi: p.lundi ?? d.lundi,
    mardi: p.mardi ?? d.mardi,
    mercredi: p.mercredi ?? d.mercredi,
    jeudi: p.jeudi ?? d.jeudi,
    vendredi: p.vendredi ?? d.vendredi,
    samedi: p.samedi ?? d.samedi,
    dimanche: p.dimanche ?? d.dimanche,
  }
}

export default function SportPage() {
  const [phaseAffichee, setPhaseAffichee] = useState<Phase | null>(null)
  const [sansCycle, setSansCycle] = useState(false)
  const [jourDuCycle, setJourDuCycle] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)
  const [planning, setPlanning] = useState<PlanningSport>(PLANNING_DEFAUT)
  const [seanceProfils, setSeanceProfils] = useState<SeanceProfil[]>([])
  const [prenom, setPrenom] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)
  const [formOuvert, setFormOuvert] = useState<FormSport | null>(null)

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

        const [{ data: prefs, error: errPrefs }, { data: profils, error: errProfils }] =
          await Promise.all([
            supabase
              .from('user_preferences')
              .select('last_cycle_start, cycle_length, planning_sport, mode_utilisateur')
              .eq('user_id', user.id)
              .maybeSingle(),
            supabase.from('seance_profils').select('*').eq('user_id', user.id),
          ])

        if (errPrefs) throw new Error(errPrefs.message)
        if (errProfils) throw new Error(errProfils.message)

        const sc = prefs?.mode_utilisateur === 'sans_cycle'
        setSansCycle(sc)

        if (sc) {
          setPhaseAffichee(null)
          setJourDuCycle(1)
        } else if (prefs?.last_cycle_start) {
          const cycleLength = prefs.cycle_length ?? 28
          const jour = getCycleDay(parseISO(prefs.last_cycle_start), new Date(), cycleLength)
          setJourDuCycle(jour)
          setPhaseAffichee(getPhaseForDay(jour, cycleLength))
        } else {
          setPhaseAffichee(null)
        }

        const pMerge = planningComplet(prefs?.planning_sport as PlanningSport | undefined)
        setPlanning(pMerge)
        setSeanceProfils((profils ?? []) as SeanceProfil[])
      } catch (e) {
        setErreur(e instanceof Error ? e.message : 'Erreur de chargement.')
      } finally {
        setLoading(false)
      }
    }

    void chargerDonnees()
  }, [])

  const today = new Date().toISOString().split('T')[0] ?? ''
  const navPhase: Phase | null = sansCycle ? null : phaseAffichee

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

        <PlanningSemaineStrip planning={planning} />

        <ListeLoggerSeance
          planning={planning}
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
            {formOuvert === 'muscu' ? (
              <OngletMuscu phase={navPhase} userId={userId} date={today} planning={planning} />
            ) : null}
            {formOuvert === 'natation' ? (
              <OngletNatation phase={navPhase} userId={userId} date={today} />
            ) : null}
            {formOuvert === 'yoga' ? (
              <OngletYoga phase={navPhase} userId={userId} date={today} />
            ) : null}
            {formOuvert === 'autre' ? (
              <OngletAutreSport userId={userId} date={today} />
            ) : null}
          </div>
        ) : null}

        <DernieresSeances userId={userId} />
      </div>
    </div>
  )
}
