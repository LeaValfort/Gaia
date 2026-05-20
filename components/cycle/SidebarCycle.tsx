'use client'

import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlerteRetard } from '@/components/cycle/AlerteRetard'
import { BoutonDebutRegles } from '@/components/cycle/BoutonDebutRegles'
import { datePrevueProchainesReglesDepuisAncre } from '@/lib/cycle'
import {
  labelRegulariteCycle,
  statsCycleOntDesValeurs,
} from '@/lib/cycle-affichage'
import type { Cycle, CycleStats } from '@/types'

const LABEL_FIABILITE: Record<'haute' | 'moyenne' | 'faible', string> = {
  haute: 'Prédictions fiables',
  moyenne: 'Prédictions en cours d’affinage',
  faible: 'Encore peu de données — les prédictions gagneront en précision',
}

export interface SidebarCycleProps {
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
  cycleLength,
  effectiveStartISO,
  stats,
  cycles,
  retardJours,
  userId: _userId,
  onCycleDebute = undefined,
}: SidebarCycleProps) {
  const fiabilite = stats?.fiabilite ?? 'faible'
  const afficherStats = statsCycleOntDesValeurs(stats)
  const labelRegularite = labelRegulariteCycle(stats)

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
      {retardJours != null ? (
        <AlerteRetard
          retardJours={retardJours}
          datePrevue={datePrevueISO}
          onConfirmer={() => document.getElementById(ID_TRIGGER_DEBUT_REGLES)?.click()}
        />
      ) : null}

      <BoutonDebutRegles
        idTrigger={ID_TRIGGER_DEBUT_REGLES}
        libelle="Mes règles ont commencé"
        onSucces={onCycleDebute}
      />

      <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 dark:border-rose-900/50 dark:bg-rose-950/30">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rose-800 dark:text-rose-200">
          Prochain cycle
        </p>
        <p className="text-lg font-semibold text-rose-950 dark:text-rose-50">{datePrevueLabel}</p>
        <p className="mt-1 text-xs text-rose-800/80 dark:text-rose-200/80">
          Estimation à partir de ton dernier début et de la durée moyenne ({cycleLength} j.).
        </p>
      </div>

      {afficherStats ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            Statistiques
          </p>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-xs text-neutral-500 dark:text-neutral-400">Durée moyenne</dt>
              <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                {stats?.cycle_length_moyen != null && stats.cycle_length_moyen > 0
                  ? `${Math.round(stats.cycle_length_moyen)} j.`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500 dark:text-neutral-400">Règles moyennes</dt>
              <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                {stats?.period_length_moyen != null && stats.period_length_moyen > 0
                  ? `${Math.round(stats.period_length_moyen)} j.`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500 dark:text-neutral-400">Cycles analysés</dt>
              <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                {stats?.nb_cycles_utilise ?? 0}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500 dark:text-neutral-400">Régularité (données)</dt>
              <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                {labelRegularite}
              </dd>
            </div>
          </dl>
          <span className="w-fit rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
            {LABEL_FIABILITE[fiabilite]}
          </span>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Les statistiques apparaîtront après 3 cycles enregistrés.
        </p>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
        <p className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          Historique (5 derniers)
        </p>
        {historique.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Aucun cycle enregistré.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {historique.map((cy) => (
              <li
                key={cy.id}
                className="flex flex-col gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3 dark:border-neutral-800 dark:bg-neutral-950/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {format(parseISO(cy.start_date), 'd MMMM yyyy', { locale: fr })}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
                    {cy.cycle_length} j.
                  </span>
                  {cy.period_length != null && cy.period_length > 0 ? (
                    <span className="inline-flex rounded-full border border-teal-200/80 bg-teal-50/80 px-2 py-0.5 text-xs text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300">
                      règles {cy.period_length} j.
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
