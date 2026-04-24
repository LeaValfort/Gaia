'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  format,
  isAfter,
  isBefore,
  isSameMonth,
  isToday,
  parseISO,
  startOfDay,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DailyLogForm } from '@/components/cycle/DailyLogForm'
import { BoutonDebutRegles } from '@/components/cycle/BoutonDebutRegles'
import { genererJoursCalendrier, getInfosJour } from '@/lib/cycle'
import {
  CALENDRIER_PREDICTION,
  CALENDRIER_RETARD,
  PHASES_CALENDRIER_CELL,
} from '@/lib/data/phases-design'
import type { Cycle, DailyLog, Phase, PredictionPhase } from '@/types'

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export interface CycleCalendarProps {
  annee: number
  mois: number
  phase: Phase
  jourDuCycle: number
  /** Dernier cycle en base (référence métier ; styles dérivés de l’ancre + prédictions). */
  dernierCycle: Cycle | null
  logsParDate: Record<string, DailyLog>
  anchorISO: string
  cycleLength: number
  predictionsParDate: Record<string, PredictionPhase>
  debutRetardISO: string | null
  retardJours: number | null
  onJourClick?: (date: string) => void
  onMoisChange?: (delta: number) => void
}

function jourDansPeriodeRetardAffichee(
  dateStr: string,
  debutRetardISO: string | null,
  retardJours: number | null
): boolean {
  if (retardJours == null || debutRetardISO == null) return false
  const d = startOfDay(parseISO(dateStr))
  const debut = startOfDay(parseISO(debutRetardISO))
  const fin = startOfDay(new Date())
  return !isBefore(d, debut) && !isAfter(d, fin)
}

export function CycleCalendar({
  annee,
  mois,
  phase,
  jourDuCycle,
  dernierCycle: _dernierCycle,
  logsParDate,
  anchorISO,
  cycleLength,
  predictionsParDate,
  debutRetardISO,
  retardJours,
  onJourClick,
  onMoisChange,
}: CycleCalendarProps) {
  void _dernierCycle
  const router = useRouter()
  const [jourSelectionne, setJourSelectionne] = useState<string | null>(null)

  const dateRef = new Date(annee, mois)
  const semaines = genererJoursCalendrier(annee, mois)
  const lastStartDate = parseISO(anchorISO)

  function naviguerMois(delta: number) {
    setJourSelectionne(null)
    if (onMoisChange) {
      onMoisChange(delta)
      return
    }
    const d = new Date(annee, mois + delta)
    router.push(`/cycle?mois=${format(d, 'yyyy-MM')}`)
  }

  function clicJour(dateStr: string) {
    setJourSelectionne((prev) => (prev === dateStr ? null : dateStr))
    onJourClick?.(dateStr)
  }

  const predSel = jourSelectionne ? predictionsParDate[jourSelectionne] : null
  const infosJourSel = jourSelectionne
    ? predSel
      ? { phase: predSel.phase, jourDuCycle: predSel.jourDuCycle }
      : getInfosJour(parseISO(jourSelectionne), lastStartDate, cycleLength)
    : null

  const designPhase = PHASES_CALENDRIER_CELL[phase]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="icon" onClick={() => naviguerMois(-1)} aria-label="Mois précédent">
          <ChevronLeft size={18} />
        </Button>
        <div className="text-center min-w-0">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-50 capitalize truncate">
            {format(dateRef, 'MMMM yyyy', { locale: fr })}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Aujourd’hui · jour {jourDuCycle}
            <span
              className="ml-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border"
              style={{
                backgroundColor: designPhase.bg,
                borderColor: designPhase.border,
                color: designPhase.texte,
              }}
            >
              {phase}
            </span>
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => naviguerMois(1)} aria-label="Mois suivant">
          <ChevronRight size={18} />
        </Button>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900">
        <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800">
          {JOURS_SEMAINE.map((j) => (
            <div key={j} className="text-center text-xs font-medium text-neutral-400 py-2.5 md:py-3">
              {j}
            </div>
          ))}
        </div>

        {semaines.map((semaine, si) => (
          <div key={si} className="grid grid-cols-7">
            {semaine.map((jour) => {
              const dateStr = format(jour, 'yyyy-MM-dd')
              const dansMois = isSameMonth(jour, dateRef)
              const estAujourdhui = isToday(jour)
              const selectionne = jourSelectionne === dateStr
              const aLog = Boolean(logsParDate[dateStr])
              const pred = predictionsParDate[dateStr]
              const retardVisuel = jourDansPeriodeRetardAffichee(dateStr, debutRetardISO, retardJours)
              const phaseJour = pred?.phase ?? getInfosJour(jour, lastStartDate, cycleLength).phase

              let bg = 'transparent'
              let bordureInset = 'transparent'
              let color = '#9CA3AF'

              if (dansMois) {
                if (retardVisuel) {
                  bg = CALENDRIER_RETARD.bg
                  bordureInset = CALENDRIER_RETARD.border
                  color = CALENDRIER_RETARD.texte
                } else if (pred?.estPrediction) {
                  bg = CALENDRIER_PREDICTION.bg
                  bordureInset = CALENDRIER_PREDICTION.border
                  color = CALENDRIER_PREDICTION.texte
                } else {
                  const cell = PHASES_CALENDRIER_CELL[phaseJour]
                  bg = cell.bg
                  bordureInset = cell.border
                  color = cell.texte
                }
              }

              const dotColor = dansMois
                ? retardVisuel
                  ? CALENDRIER_RETARD.border
                  : pred?.estPrediction
                    ? CALENDRIER_PREDICTION.border
                    : PHASES_CALENDRIER_CELL[phaseJour].border
                : '#D1D5DB'

              const ringPhase =
                dansMois && !pred?.estPrediction && !retardVisuel
                  ? `inset 0 0 0 1.5px ${bordureInset}`
                  : dansMois && pred?.estPrediction && !retardVisuel
                    ? `inset 0 0 0 1px ${CALENDRIER_PREDICTION.border}`
                    : dansMois && retardVisuel
                      ? `inset 0 0 0 2px ${CALENDRIER_RETARD.border}`
                      : undefined

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => dansMois && clicJour(dateStr)}
                  disabled={!dansMois}
                  style={{
                    backgroundColor: dansMois ? bg : 'transparent',
                    color: dansMois ? color : '#D1D5DB',
                    boxShadow: ringPhase,
                    outline: estAujourdhui && dansMois ? '2.5px solid #EF4444' : undefined,
                    outlineOffset: estAujourdhui && dansMois ? -2.5 : 0,
                  }}
                  className={`min-h-[3rem] md:min-h-[4.25rem] flex flex-col items-center justify-end pb-1.5 pt-1 transition-[filter] relative border-b border-r border-neutral-100 dark:border-neutral-800
                    ${dansMois ? 'cursor-pointer hover:brightness-[0.97] dark:hover:brightness-110' : 'cursor-default opacity-60'}
                    ${selectionne ? 'z-[1] ring-2 ring-inset ring-neutral-900 dark:ring-white' : ''}
                    ${retardVisuel && dansMois ? 'motion-safe:animate-pulse motion-reduce:animate-none' : ''}
                  `}
                >
                  {pred?.estPrediction && dansMois && !retardVisuel ? (
                    <span
                      className="pointer-events-none absolute inset-1 rounded-md border md:inset-1.5"
                      style={{
                        borderWidth: 1.5,
                        borderStyle: 'dashed',
                        borderColor: CALENDRIER_PREDICTION.border,
                      }}
                      aria-hidden
                    />
                  ) : null}
                  <span
                    className={`text-sm md:text-base leading-none font-medium relative z-[1]
                    ${estAujourdhui && dansMois ? 'font-bold' : ''}
                  `}
                  >
                    {format(jour, 'd')}
                  </span>
                  {aLog && dansMois ? (
                    <span
                      className="relative z-[1] mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: dotColor }}
                      aria-label="Journal ce jour"
                    />
                  ) : (
                    <span className="relative z-[1] mt-1 h-1.5 w-1.5 shrink-0" aria-hidden />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {(['menstruation', 'folliculaire', 'ovulation', 'luteale'] as const).map((p) => {
          const c = PHASES_CALENDRIER_CELL[p]
          return (
            <div key={p} className="flex items-center gap-1.5">
              <span
                className="h-3 w-3 shrink-0 rounded-sm border"
                style={{ backgroundColor: c.bg, borderColor: c.border }}
              />
              <span className="text-neutral-600 dark:text-neutral-300 capitalize">{p}</span>
            </div>
          )
        })}
        <div className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 shrink-0 rounded-sm border border-dashed"
            style={{
              backgroundColor: CALENDRIER_PREDICTION.bg,
              borderColor: CALENDRIER_PREDICTION.border,
            }}
          />
          <span className="text-neutral-600 dark:text-neutral-300">Prédit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 shrink-0 rounded-sm border motion-safe:animate-pulse"
            style={{
              backgroundColor: CALENDRIER_RETARD.bg,
              borderColor: CALENDRIER_RETARD.border,
            }}
          />
          <span className="text-neutral-600 dark:text-neutral-300">Retard</span>
        </div>
      </div>

      {jourSelectionne && infosJourSel ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {format(parseISO(jourSelectionne), 'EEEE d MMMM', { locale: fr })}
          </p>
          {predSel?.estPrediction ? (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Phase estimée (prédiction, fiabilité {predSel.fiabilite}).
            </p>
          ) : null}
          <DailyLogForm
            date={jourSelectionne}
            phase={infosJourSel.phase}
            jourDuCycle={infosJourSel.jourDuCycle}
            logInitial={logsParDate[jourSelectionne] ?? null}
          />
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">
              Ce jour correspond au début de tes règles ?
            </span>
            <BoutonDebutRegles dateInitiale={jourSelectionne} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
