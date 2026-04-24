'use client'

import { useCallback, useEffect, useState } from 'react'
import { addDays, differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'
import { Calendar, Plus } from 'lucide-react'
import { designPhaseAffichage } from '@/lib/cycle'
import { fetchEvenementsJour } from '@/lib/calendar'
import type { GoogleCalendarEvent, Phase } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FormulaireEvenement } from '@/components/today/FormulaireEvenement'
import { AgendaLiensExternes } from '@/components/today/AgendaLiensExternes'
import { AgendaBlocProchainCycle } from '@/components/today/AgendaBlocProchainCycle'
import { AgendaListeEvenements } from '@/components/today/AgendaListeEvenements'

export interface AgendaDuJourProps {
  date: string
  jourLibelle: string
  phase: Phase | null
  sansCycle?: boolean
  effectiveStart: string | null
  cycleLength: number
  jourDuCycle: number | null
  googleCalendarEnabled?: boolean
}

export function AgendaDuJour({
  date,
  jourLibelle,
  phase,
  sansCycle,
  effectiveStart,
  cycleLength,
  jourDuCycle,
  googleCalendarEnabled = true,
}: AgendaDuJourProps) {
  const d = designPhaseAffichage(phase, { sansCycle })
  const [evenements, setEvenements] = useState<GoogleCalendarEvent[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<'token' | 'serveur' | null>(null)
  const [dialogOuvert, setDialogOuvert] = useState(false)

  const charger = useCallback(async () => {
    if (!googleCalendarEnabled) {
      setChargement(false)
      setEvenements([])
      setErreur(null)
      return
    }
    setChargement(true)
    setErreur(null)
    const r = await fetchEvenementsJour(date)
    setChargement(false)
    if (!r.ok) {
      setEvenements([])
      setErreur(r.erreur === 'token' || r.erreur === 'auth' ? 'token' : 'serveur')
      return
    }
    setEvenements(r.evenements)
  }, [date, googleCalendarEnabled])

  useEffect(() => {
    void charger()
  }, [charger])

  const prochain =
    effectiveStart && jourDuCycle != null ? addDays(parseISO(effectiveStart), cycleLength) : null
  const joursRestants =
    prochain != null ? differenceInCalendarDays(startOfDay(prochain), startOfDay(new Date())) : null

  return (
    <div className="flex flex-col gap-3">
      <Card className="border-gray-100 shadow-sm dark:border-gray-800" style={{ borderColor: `${d.accent}44` }}>
        <CardContent className="space-y-3 p-4">
          <div className="flex min-w-0 items-start gap-2">
            <Calendar className="size-5 shrink-0" style={{ color: d.accent }} aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Agenda
              </p>
              <p className="truncate text-sm font-semibold capitalize text-gray-900 dark:text-gray-50">
                {jourLibelle}
              </p>
            </div>
          </div>

          {!googleCalendarEnabled ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              L’agenda Google intégré est désactivé dans tes préférences.
            </p>
          ) : chargement ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : erreur ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
              {erreur === 'token'
                ? 'Reconnecte-toi pour accéder à ton agenda (autorisation Google Agenda).'
                : 'Impossible de charger l’agenda pour le moment.'}
            </p>
          ) : evenements.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Aucun événement aujourd’hui ✨
            </p>
          ) : (
            <AgendaListeEvenements evenements={evenements} accent={d.accent} />
          )}

          {googleCalendarEnabled ? (
            <Button
              type="button"
              className="w-full gap-2 font-medium text-white shadow-sm"
              style={{ backgroundColor: d.accent }}
              onClick={() => setDialogOuvert(true)}
            >
              <Plus className="size-4 shrink-0" aria-hidden />
              Créer un événement
            </Button>
          ) : null}

          <AgendaLiensExternes />
        </CardContent>
      </Card>

      {joursRestants != null && joursRestants >= 0 && prochain ? (
        <AgendaBlocProchainCycle
          joursRestants={joursRestants}
          prochain={prochain}
          accentBorder={`${d.accent}44`}
          texte={d.texte}
          cycleLength={cycleLength}
        />
      ) : null}

      <FormulaireEvenement
        open={dialogOuvert}
        onOpenChange={setDialogOuvert}
        date={date}
        phase={phase}
        sansCycle={sansCycle}
        onCree={() => void charger()}
      />
    </div>
  )
}
