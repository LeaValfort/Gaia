'use client'

import { useEffect, useState } from 'react'
import { parseISO } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { Nav } from '@/components/shared/Nav'
import { PHASES_DESIGN, PHASE_DESIGN_ACCUEIL_NEUTRE } from '@/lib/data/phases-design'
import { cn } from '@/lib/utils'
import { TabsSport } from '@/components/sport/TabsSport'
import { PhaseBannerSport } from '@/components/sport/PhaseBannerSport'
import { OngletPlanification } from '@/components/sport/OngletPlanification'
import { OngletMuscu } from '@/components/sport/OngletMuscu'
import { OngletNatation } from '@/components/sport/OngletNatation'
import { OngletYoga } from '@/components/sport/OngletYoga'
import { OngletAutreSport } from '@/components/sport/OngletAutreSport'
import { SportPageSidebar } from '@/components/sport/SportPageSidebar'
import { getCycleDay, getPhaseForDay } from '@/lib/cycle'
import { getActiviteduJour, PLANNING_DEFAUT } from '@/lib/planning-sport'
import type { Phase, PlanningSport } from '@/types'

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
  const [onglet, setOnglet] = useState('muscu')
  const [phaseAffichee, setPhaseAffichee] = useState<Phase | null>(null)
  const [sansCycle, setSansCycle] = useState(false)
  const [jourDuCycle, setJourDuCycle] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)
  const [planning, setPlanning] = useState<PlanningSport>(PLANNING_DEFAUT)
  const [prenom, setPrenom] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function chargerDonnees() {
      const { data: { user } } = await supabase.auth.getUser()
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

      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('last_cycle_start, cycle_length, planning_sport, mode_utilisateur')
        .eq('user_id', user.id)
        .maybeSingle()

      const sc = prefs?.mode_utilisateur === 'sans_cycle'
      setSansCycle(sc)

      if (sc) {
        setPhaseAffichee(null)
        setJourDuCycle(1)
      } else if (prefs?.last_cycle_start) {
        const cycleLength = prefs.cycle_length ?? 28
        const jour = getCycleDay(parseISO(prefs.last_cycle_start), new Date(), cycleLength)
        const ph = getPhaseForDay(jour, cycleLength)
        setJourDuCycle(jour)
        setPhaseAffichee(ph)
      } else {
        setPhaseAffichee(null)
      }

      const pMerge = planningComplet(prefs?.planning_sport as PlanningSport | undefined)
      setPlanning(pMerge)
      const act = getActiviteduJour(pMerge, new Date())
      if (act === 'muscu_full' || act === 'muscu_upper') setOnglet('muscu')
      else if (act === 'yoga') setOnglet('yoga')
      else if (act === 'natation') setOnglet('natation')
      else if (act === 'autre') setOnglet('autre')

      setLoading(false)
    }

    void chargerDonnees()
  }, [])

  const today = new Date().toISOString().split('T')[0] ?? ''
  const navPhase: Phase | null = sansCycle ? null : (phaseAffichee ?? null)
  const banniere =
    !sansCycle && phaseAffichee != null ? (
      <PhaseBannerSport phase={phaseAffichee} jourDuCycle={jourDuCycle} />
    ) : null

  const contenuOnglet = (
    <>
      {onglet === 'planification' && <OngletPlanification phase={navPhase} planning={planning} />}
      {onglet === 'muscu' && <OngletMuscu phase={navPhase} userId={userId!} date={today} planning={planning} />}
      {onglet === 'natation' && <OngletNatation phase={navPhase} userId={userId!} date={today} />}
      {onglet === 'yoga' && <OngletYoga phase={navPhase} userId={userId!} date={today} />}
      {onglet === 'autre' && <OngletAutreSport userId={userId!} date={today} />}
    </>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] dark:bg-neutral-950">
        <Nav phase={navPhase} sansCycle={sansCycle} prenom={prenom} />
        <div className="mx-auto max-w-7xl space-y-4 p-6 pb-24">
          <div className="h-12 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-14 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-96 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
    )
  }

  if (!userId) return null

  const dH =
    navPhase == null || sansCycle ? PHASE_DESIGN_ACCUEIL_NEUTRE : PHASES_DESIGN[navPhase]

  return (
    <div className="min-h-screen bg-[#F8F7FF] dark:bg-gray-950">
      <Nav phase={navPhase} sansCycle={sansCycle} prenom={prenom} />
      <div className="mx-auto max-w-7xl px-6 py-6 pb-24">
        <div
          className={cn('rounded-2xl p-6 mb-6 border bg-gradient-to-br', dH.gradient, 'dark:border-gray-800/80')}
          style={{ borderColor: `${dH.accent}33` }}
        >
          <h1 className="text-2xl font-semibold" style={{ color: dH.texte }}>
            Sport
          </h1>
          <p className="text-sm mt-1" style={{ color: dH.texteMuted }}>
            Musculation, natation, yoga : ton planning aligné sur ton cycle.
          </p>
        </div>
        <div className="grid min-w-0 grid-cols-1 items-start gap-6 md:grid-cols-[1fr_280px]">
          <div className="flex min-w-0 flex-col gap-4">
            <TabsSport onglet={onglet} onChange={setOnglet} phase={navPhase} />
            {banniere}
            {contenuOnglet}
          </div>
          <aside className="min-w-0 shrink-0 md:sticky md:top-4 md:self-start">
            <SportPageSidebar userId={userId} planning={planning} />
          </aside>
        </div>
      </div>
    </div>
  )
}
