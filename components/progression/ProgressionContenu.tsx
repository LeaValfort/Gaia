'use client'

import { FormulaireMensuration } from '@/components/progression/FormulaireMensuration'
import { GraphiqueDouleurs } from '@/components/progression/GraphiqueDouleurs'
import { GraphiqueEnergie } from '@/components/progression/GraphiqueEnergie'
import { GraphiqueMensurations } from '@/components/progression/GraphiqueMensurations'
import { GraphiqueSport } from '@/components/progression/GraphiqueSport'
import { ProgressionStatsCol, ProgressionStatsRow } from '@/components/progression/ProgressionStatsCards'
import type { PhaseDesign } from '@/lib/data/phases-design'
import type { DailyLog, Mensuration, StatsResume, Workout } from '@/types'
import { formaterDonneesSport } from '@/lib/progression'

const LEGENDE_DOULEURS: { label: string; color: string }[] = [
  { label: 'menstruation', color: '#FFD6DA' },
  { label: 'folliculaire', color: '#FEF08A' },
  { label: 'ovulation', color: '#BBF7D0' },
  { label: 'lutéale', color: '#DDD6FE' },
]

const SEC = 'rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-3'

export interface ProgressionContenuProps {
  userId: string
  design: PhaseDesign
  moisActuel: string
  dailyLogs: DailyLog[]
  workouts: Workout[]
  mensurations: Mensuration[]
  stats: StatsResume
  cycleLength: number
}

export function ProgressionContenu({
  userId,
  design,
  moisActuel,
  dailyLogs,
  workouts,
  mensurations,
  stats,
  cycleLength,
}: ProgressionContenuProps) {
  const donneesSport = formaterDonneesSport(workouts, 16)

  return (
    <div className="space-y-6">
      <div
        className={`rounded-2xl p-6 border bg-gradient-to-br ${design.border} ${design.gradient}`}
        style={{ borderColor: `${design.accent}33` }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: design.texte }}>
              Ma progression
            </h1>
            <p className="mt-1 text-sm capitalize" style={{ color: design.texteMuted }}>
              {moisActuel}
            </p>
          </div>
          <FormulaireMensuration
            userId={userId}
            triggerClassName="text-white border-0 shadow-sm hover:opacity-90"
            triggerStyle={{ background: design.accent }}
          />
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="flex min-w-0 flex-col gap-6">
          <section className={SEC}>
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Énergie &amp; bien-être</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Historique des journaux</p>
            <GraphiqueEnergie logs={dailyLogs} />
          </section>
          <section className={SEC}>
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Douleurs par cycle</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Jour du cycle (longueur {cycleLength} j.)</p>
            <GraphiqueDouleurs logs={dailyLogs} cycleLength={cycleLength} />
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 flex flex-wrap gap-3">
              {LEGENDE_DOULEURS.map((x) => (
                <span key={x.label} className="flex items-center gap-1">
                  <span className="size-2 rounded-sm" style={{ backgroundColor: x.color }} />
                  {x.label}
                </span>
              ))}
            </p>
          </section>
          <section className={SEC}>
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Sport</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">16 dernières semaines</p>
            <GraphiqueSport donnees={donneesSport} />
          </section>
        </div>
        <div className="flex min-w-0 w-full flex-col gap-4">
          <ProgressionStatsCol stats={stats} />
          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-50">Mensurations</h2>
            <GraphiqueMensurations mensurations={mensurations} compact />
          </section>
        </div>
      </div>

      <div className="lg:hidden flex flex-col gap-6">
        <ProgressionStatsRow stats={stats} />
        <section className={SEC}>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Énergie &amp; bien-être</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Historique des journaux</p>
          <GraphiqueEnergie logs={dailyLogs} />
        </section>
        <section className={SEC}>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Douleurs par cycle</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Jour du cycle (longueur {cycleLength} j.)</p>
          <GraphiqueDouleurs logs={dailyLogs} cycleLength={cycleLength} />
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 flex flex-wrap gap-3">
            {LEGENDE_DOULEURS.map((x) => (
              <span key={x.label} className="flex items-center gap-1">
                <span className="size-2 rounded-sm" style={{ backgroundColor: x.color }} />
                {x.label}
              </span>
            ))}
          </p>
        </section>
        <section className={SEC}>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Sport</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">16 dernières semaines</p>
          <GraphiqueSport donnees={donneesSport} />
        </section>
        <section className={SEC}>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">Mensurations</h2>
          <GraphiqueMensurations mensurations={mensurations} />
        </section>
      </div>
    </div>
  )
}
