'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AlimentationNav,
  type VueAlimentation,
} from '@/components/alimentation/AlimentationNav'
import { ChecklistHebdo } from '@/components/alimentation/ChecklistHebdo'
import { ListeCourses } from '@/components/alimentation/ListeCourses'
import { ListeRecettesPhase } from '@/components/alimentation/ListeRecettesPhase'
import { OngletAujourdhui } from '@/components/alimentation/OngletAujourdhui'
import PlanSemaine from '@/components/alimentation/PlanSemaine'
import { RecettesSauvegardees } from '@/components/alimentation/RecettesSauvegardees'
import type { TotauxConsommesJour } from '@/lib/recapManuel'
import type { CycleStats, MacrosCiblesJour, Phase, TypeJournee } from '@/types'

export interface AlimentationOngletsProps {
  userId: string
  weekStart: string
  todayIso: string
  typeJournee: TypeJournee
  phase: Phase
  sansSuivi: boolean
  sansSuiviCycle: boolean
  suiviCalorique: boolean
  effectiveStart: string | null
  cycleLength: number
  stats: CycleStats | null
  macrosTypeJournee: TypeJournee
  macrosCibles: MacrosCiblesJour
  consoJour: TotauxConsommesJour
  allergies: string[]
  cookTimeMinutes: number
}

const VUES_PLUS: VueAlimentation[] = ['checklist', 'courses', 'recettes-perso']

export function AlimentationOnglets(p: AlimentationOngletsProps) {
  const vueInitiale: VueAlimentation = p.suiviCalorique ? 'aujourdhui' : 'recettes'
  const [vue, setVue] = useState<VueAlimentation>(vueInitiale)
  const contenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (VUES_PLUS.includes(vue)) {
      contenuRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [vue])

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <AlimentationNav suiviCalorique={p.suiviCalorique} vue={vue} onChange={setVue} />

      <div ref={contenuRef} className="min-w-0 scroll-mt-4">
        {vue === 'aujourdhui' && p.suiviCalorique ? (
          <OngletAujourdhui
            userId={p.userId}
            todayIso={p.todayIso}
            typeJournee={p.macrosCibles.typeJournee}
            macrosCibles={p.macrosCibles}
            consoJour={p.consoJour}
            onVersRecettes={() => setVue('recettes')}
          />
        ) : null}

        {vue === 'recettes' ? (
          <ListeRecettesPhase
            phase={p.phase}
            typeJournee={p.macrosTypeJournee}
            allergies={p.allergies}
            tempsMax={p.cookTimeMinutes}
            sansSuiviCycle={p.sansSuiviCycle}
          />
        ) : null}

        {vue === 'semaine' ? (
          <PlanSemaine
            userId={p.userId}
            weekStart={p.weekStart}
            sansSuiviCycle={p.sansSuiviCycle}
            effectiveStart={p.effectiveStart}
            cycleLength={p.cycleLength}
            stats={p.stats}
          />
        ) : null}

        {vue === 'checklist' ? (
          <ChecklistHebdo userId={p.userId} weekStart={p.weekStart} />
        ) : null}

        {vue === 'courses' ? (
          <ListeCourses userId={p.userId} weekStart={p.weekStart} />
        ) : null}

        {vue === 'recettes-perso' ? (
          <RecettesSauvegardees
            userId={p.userId}
            phase={p.phase}
            masquerFiltrePhase={p.sansSuivi}
          />
        ) : null}
      </div>
    </div>
  )
}
