'use client'

import { useState } from 'react'
import { TabsNav, type OngletNav } from '@/components/shared/TabsNav'
import { ChecklistHebdo } from '@/components/alimentation/ChecklistHebdo'
import { SuggestionsRecettes } from '@/components/alimentation/SuggestionsRecettes'
import { ListeCourses } from '@/components/alimentation/ListeCourses'
import { RecettesSauvegardees } from '@/components/alimentation/RecettesSauvegardees'
import { RecapMacrosJour } from '@/components/alimentation/RecapMacrosJour'
import PlanSemaine from '@/components/alimentation/PlanSemaine'
import type { CycleStats, Phase, TypeJournee } from '@/types'

const ONGL: OngletNav[] = [
  { id: 'semaine', label: 'Plan', emoji: '📅' },
  { id: 'jour', label: 'Jour', emoji: '📊' },
  { id: 'checklist', label: 'Checklist', emoji: '✅' },
  { id: 'suggestions', label: 'Suggestions', emoji: '🍽️' },
  { id: 'courses', label: 'Courses', emoji: '🛒' },
  { id: 'recettes', label: 'Recettes', emoji: '📖' },
]

export interface AlimentationOngletsProps {
  userId: string
  weekStart: string
  todayIso: string
  typeJournee: TypeJournee
  phase: Phase
  sansSuivi: boolean
  sansSuiviCycle: boolean
  effectiveStart: string | null
  cycleLength: number
  stats: CycleStats | null
  macrosTypeJournee: TypeJournee
  allergies: string[]
  cookTimeMinutes: number
}

export function AlimentationOnglets(p: AlimentationOngletsProps) {
  const [actif, setActif] = useState('semaine')
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/40">
      <div className="border-b border-gray-100 bg-gray-50/80 p-1 dark:border-gray-800 dark:bg-gray-900/50">
        <TabsNav
          variant="embedded"
          onglets={ONGL}
          actif={actif}
          onChange={setActif}
          phase={p.sansSuivi ? null : p.phase}
        />
      </div>
      <div className="min-h-0 w-full min-w-0 p-4 sm:p-5">
        {actif === 'semaine' && (
          <PlanSemaine
            userId={p.userId}
            weekStart={p.weekStart}
            sansSuiviCycle={p.sansSuiviCycle}
            effectiveStart={p.effectiveStart}
            cycleLength={p.cycleLength}
            stats={p.stats}
          />
        )}
        {actif === 'jour' && (
          <RecapMacrosJour
            userId={p.userId}
            date={p.todayIso}
            phase={p.phase}
            typeJournee={p.typeJournee}
            weekStart={p.weekStart}
            sansSuiviCycle={p.sansSuiviCycle}
          />
        )}
        {actif === 'checklist' && <ChecklistHebdo userId={p.userId} weekStart={p.weekStart} />}
        {actif === 'suggestions' && (
          <SuggestionsRecettes
            phase={p.phase}
            typeJournee={p.macrosTypeJournee}
            allergies={p.allergies}
            tempsMax={p.cookTimeMinutes}
            sansSuiviCycle={p.sansSuiviCycle}
          />
        )}
        {actif === 'courses' && <ListeCourses userId={p.userId} weekStart={p.weekStart} />}
        {actif === 'recettes' && (
          <RecettesSauvegardees userId={p.userId} phase={p.phase} masquerFiltrePhase={p.sansSuivi} />
        )}
      </div>
    </div>
  )
}
