'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, isSameMonth, isToday, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DailyLogForm } from '@/components/cycle/DailyLogForm'
import { genererJoursCalendrier, getInfosJour } from '@/lib/cycle'
import type { UserPreferences, DailyLog } from '@/types'

const COULEURS_PHASE = {
  menstruation: 'bg-teal-100 dark:bg-teal-900/60',
  folliculaire:  'bg-amber-100 dark:bg-amber-900/60',
  ovulation:     'bg-red-100 dark:bg-red-900/60',
  luteale:       'bg-purple-100 dark:bg-purple-900/60',
}

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

interface CycleCalendarProps {
  prefs: UserPreferences
  logsParDate: Record<string, DailyLog>
  moisActuel: string // format 'yyyy-MM'
}

export function CycleCalendar({ prefs, logsParDate, moisActuel }: CycleCalendarProps) {
  const router = useRouter()
  const [jourSelectionne, setJourSelectionne] = useState<string | null>(null)

  const [annee, mois] = moisActuel.split('-').map(Number)
  const dateRef = new Date(annee, mois - 1)
  const semaines = genererJoursCalendrier(annee, mois - 1)
  const lastStartDate = prefs.last_cycle_start ? new Date(prefs.last_cycle_start) : null

  function naviguerMois(delta: number) {
    const d = new Date(annee, mois - 1 + delta)
    router.push(`/cycle?mois=${format(d, 'yyyy-MM')}`)
    setJourSelectionne(null)
  }

  function clicJour(dateStr: string) {
    setJourSelectionne(prev => prev === dateStr ? null : dateStr)
  }

  const infosJourSel = jourSelectionne && lastStartDate
    ? getInfosJour(parseISO(jourSelectionne), lastStartDate, prefs.cycle_length)
    : null

  return (
    <div className="flex flex-col gap-6">

      {/* Navigation mois */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => naviguerMois(-1)}>
          <ChevronLeft size={18} />
        </Button>
        <h2 className="font-semibold text-neutral-900 dark:text-neutral-50 capitalize">
          {format(dateRef, 'MMMM yyyy', { locale: fr })}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => naviguerMois(1)}>
          <ChevronRight size={18} />
        </Button>
      </div>

      {/* Grille */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900">
        {/* En-têtes jours */}
        <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800">
          {JOURS_SEMAINE.map((j) => (
            <div key={j} className="text-center text-xs font-medium text-neutral-400 py-2">{j}</div>
          ))}
        </div>

        {/* Semaines */}
        {semaines.map((semaine, si) => (
          <div key={si} className="grid grid-cols-7">
            {semaine.map((jour) => {
              const dateStr = format(jour, 'yyyy-MM-dd')
              const dansMois = isSameMonth(jour, dateRef)
              const estAujourdhui = isToday(jour)
              const selectionne = jourSelectionne === dateStr
              const aLog = Boolean(logsParDate[dateStr])
              const couleur = dansMois && lastStartDate
                ? COULEURS_PHASE[getInfosJour(jour, lastStartDate, prefs.cycle_length).phase]
                : ''

              return (
                <button
                  key={dateStr}
                  onClick={() => dansMois && clicJour(dateStr)}
                  disabled={!dansMois}
                  className={`h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5
                    border-b border-r border-neutral-100 dark:border-neutral-800 transition-all
                    ${dansMois ? `cursor-pointer hover:brightness-95 ${couleur}` : 'opacity-20 cursor-default'}
                    ${selectionne ? 'ring-2 ring-inset ring-neutral-900 dark:ring-white' : ''}
                  `}
                >
                  <span className={`text-sm leading-none
                    ${estAujourdhui ? 'font-bold underline text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'}
                  `}>
                    {format(jour, 'd')}
                  </span>
                  {aLog && dansMois && (
                    <span className="w-1 h-1 rounded-full bg-neutral-500 dark:bg-neutral-400" />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Légende des phases */}
      <div className="flex flex-wrap gap-3 text-xs text-neutral-500 dark:text-neutral-400">
        {(['menstruation', 'folliculaire', 'ovulation', 'luteale'] as const).map((p) => (
          <div key={p} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${COULEURS_PHASE[p]}`} />
            <span className="capitalize">{p}</span>
          </div>
        ))}
      </div>

      {/* Formulaire du jour sélectionné */}
      {jourSelectionne && infosJourSel && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {format(parseISO(jourSelectionne), "EEEE d MMMM", { locale: fr })}
          </p>
          <DailyLogForm
            date={jourSelectionne}
            phase={infosJourSel.phase}
            jourDuCycle={infosJourSel.jourDuCycle}
            logInitial={logsParDate[jourSelectionne] ?? null}
          />
        </div>
      )}

      {jourSelectionne && !infosJourSel && (
        <p className="text-sm text-neutral-400 text-center py-4">
          Configure ton cycle dans les Paramètres pour logger ce jour.
        </p>
      )}
    </div>
  )
}
