'use client'

import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlerteRetard } from '@/components/cycle/AlerteRetard'
import { BoutonDebutRegles } from '@/components/cycle/BoutonDebutRegles'
import { datePrevueProchainesReglesDepuisAncre } from '@/lib/cycle'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import type { Cycle, CycleStats, Phase } from '@/types'

const LABEL_FIABILITE: Record<'haute' | 'moyenne' | 'faible', string> = {
  haute: 'Prédictions fiables',
  moyenne: 'Prédictions en cours d’affinage',
  faible: 'Encore peu de données — les prédictions gagneront en précision',
}

export interface SidebarCycleProps {
  phase: Phase
  jourDuCycle: number
  cycleLength: number
  /** Ancre d’affichage (identique au calendrier), pour prochain cycle + alerte retard. */
  effectiveStartISO: string
  stats: CycleStats | null
  cycles: Cycle[]
  retardJours: number | null
  userId: string
  /** Optionnel : utile si la page parente est un composant client. */
  onCycleDebute?: () => void
}

const ID_TRIGGER_DEBUT_REGLES = 'gaia-sidebar-debut-regles'

export function SidebarCycle({
  phase,
  jourDuCycle,
  cycleLength,
  effectiveStartISO,
  stats,
  cycles,
  retardJours,
  userId: _userId,
  onCycleDebute = undefined,
}: SidebarCycleProps) {
  const design = PHASES_DESIGN[phase]
  const fiabilite = stats?.fiabilite ?? 'faible'
  const datePrevue = datePrevueProchainesReglesDepuisAncre(
    effectiveStartISO,
    cycleLength,
    stats
  )
  const datePrevueISO = format(datePrevue, 'yyyy-MM-dd')
  const datePrevueLabel = format(datePrevue, 'd MMMM yyyy', { locale: fr })

  const historique = cycles.slice(0, 5)

  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
      <div
        className={`rounded-2xl border p-5 bg-gradient-to-br ${design.gradient} ${design.border}`}
      >
        <p className="text-4xl mb-2" aria-hidden>
          {design.emoji}
        </p>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={{ color: design.texteMuted }}>
          Phase actuelle
        </p>
        <h2 className="text-xl font-bold mt-1" style={{ color: design.texte }}>
          {design.label}
        </h2>
        <p className="text-sm mt-2 font-medium" style={{ color: design.texteMuted }}>
          Jour {jourDuCycle} sur {cycleLength}
        </p>
      </div>

      {retardJours != null ? (
        <AlerteRetard
          retardJours={retardJours}
          datePrevue={datePrevueISO}
          onConfirmer={() => document.getElementById(ID_TRIGGER_DEBUT_REGLES)?.click()}
        />
      ) : null}

      <BoutonDebutRegles
        idTrigger={ID_TRIGGER_DEBUT_REGLES}
        libelle="🩸 Mes règles ont commencé"
        onSucces={onCycleDebute}
      />

      <div className="rounded-2xl border border-rose-200 bg-rose-50/90 dark:bg-rose-950/30 dark:border-rose-900/50 p-4">
        <p className="text-xs font-semibold text-rose-800 dark:text-rose-200 uppercase tracking-wide mb-1">
          Prochain cycle
        </p>
        <p className="text-lg font-semibold text-rose-950 dark:text-rose-50">{datePrevueLabel}</p>
        <p className="text-xs text-rose-800/80 dark:text-rose-200/80 mt-1">
          Estimation à partir de ton dernier début et de la durée moyenne ({cycleLength} j.).
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 p-4 flex flex-col gap-3">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Statistiques</p>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400 text-xs">Durée moyenne</dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">
              {stats?.cycle_length_moyen != null ? `${Math.round(stats.cycle_length_moyen)} j.` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400 text-xs">Règles moyennes</dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">
              {stats?.period_length_moyen != null ? `${Math.round(stats.period_length_moyen)} j.` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400 text-xs">Cycles analysés</dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">
              {stats?.nb_cycles_utilise ?? 0}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400 text-xs">Régularité (données)</dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">
              {stats && stats.nb_cycles_utilise >= 5
                ? 'Historique suffisant'
                : stats && stats.nb_cycles_utilise >= 2
                  ? 'En cours'
                  : 'À compléter'}
            </dd>
          </div>
        </dl>
        <span className="text-xs rounded-full border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 w-fit text-neutral-600 dark:text-neutral-300">
          {LABEL_FIABILITE[fiabilite]}
        </span>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 p-4">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-3">
          Historique (5 derniers)
        </p>
        {historique.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Aucun cycle enregistré.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {historique.map((cy) => (
              <li
                key={cy.id}
                className="flex flex-wrap items-baseline justify-between gap-2 text-sm border-b border-neutral-100 dark:border-neutral-800 pb-2 last:border-0 last:pb-0"
              >
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {format(parseISO(cy.start_date), 'd MMM yyyy', { locale: fr })}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400 text-xs">
                  {cy.cycle_length} j. · règles {cy.period_length ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
