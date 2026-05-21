'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { DailyLogSectionEtendue } from '@/components/cycle/DailyLogSectionEtendue'
import {
  EXTENDED_LOG_INITIAL,
  extendedFromDailyLog,
  logAContenuEnrichi,
} from '@/lib/data/journalOptions'
import { upsertDailyLog } from '@/lib/db/dailyLog'
import { cn } from '@/lib/utils'
import type { DailyLog, ExtendedLogData, Phase } from '@/types'
import { ENERGY_MAX, ENERGY_MIN, PAIN_MAX, PAIN_MIN } from '@/types'

interface DailyLogFormProps {
  date: string
  phase: Phase
  jourDuCycle: number
  logInitial: DailyLog | null
  afficherDetailsEtendus?: boolean
  onSaved?: () => void
}

export function DailyLogForm({
  date,
  phase,
  jourDuCycle,
  logInitial,
  afficherDetailsEtendus = true,
  onSaved,
}: DailyLogFormProps) {
  const router = useRouter()
  const [energie, setEnergie] = useState<number>(logInitial?.energy ?? 0)
  const [douleur, setDouleur] = useState<number>(logInitial?.pain ?? 0)
  const [humeur, setHumeur] = useState<string>(logInitial?.mood ?? '')
  const [extended, setExtended] = useState<ExtendedLogData>(
    logInitial ? extendedFromDailyLog(logInitial) : EXTENDED_LOG_INITIAL
  )
  const [detailsOuvert, setDetailsOuvert] = useState(() => logAContenuEnrichi(logInitial))
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    setEnergie(logInitial?.energy ?? 0)
    setDouleur(logInitial?.pain ?? 0)
    setHumeur(logInitial?.mood ?? '')
    setExtended(logInitial ? extendedFromDailyLog(logInitial) : EXTENDED_LOG_INITIAL)
    setDetailsOuvert(logAContenuEnrichi(logInitial))
    setErreur(null)
  }, [date, logInitial])

  async function sauvegarder() {
    setChargement(true)
    setErreur(null)
    try {
      const heuresSommeil = extended.sleep_hours.trim()
      const sleepHoursParsed = heuresSommeil ? parseFloat(heuresSommeil) : null

      await upsertDailyLog({
        date,
        phase,
        cycle_day: jourDuCycle,
        energy: energie || null,
        pain: douleur,
        mood: humeur.trim() || null,
        notes: null,
        emotions: extended.emotions.length ? extended.emotions : null,
        symptoms: extended.symptoms.length ? extended.symptoms : null,
        libido: extended.libido,
        sleep_quality: extended.sleep_quality,
        sleep_hours:
          sleepHoursParsed != null && Number.isFinite(sleepHoursParsed) ? sleepHoursParsed : null,
        stress_level: extended.stress_level,
        appetite: extended.appetite.length ? extended.appetite : null,
        flow_intensity: extended.flow_intensity,
        free_note: extended.free_note.trim() || null,
      })
      router.refresh()
      onSaved?.()
    } catch {
      setErreur('Impossible de sauvegarder le journal. Réessaie.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Énergie
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: ENERGY_MAX }, (_, i) => i + ENERGY_MIN).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setEnergie(val)}
                className={cn(
                  'h-10 w-10 rounded-xl text-sm font-semibold transition-all',
                  energie === val
                    ? 'scale-110 bg-amber-600 text-white dark:bg-amber-600'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                )}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Douleur
            </p>
            <p className="text-sm font-semibold tabular-nums">
              {douleur} / {PAIN_MAX}
            </p>
          </div>
          <Slider
            min={PAIN_MIN}
            max={PAIN_MAX}
            value={douleur}
            onValueChange={setDouleur}
            aria-label="Niveau de douleur de 0 à 10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="humeur-jour">Humeur</Label>
        <Input
          id="humeur-jour"
          value={humeur}
          onChange={(e) => setHumeur(e.target.value)}
          placeholder="En un mot ou une phrase…"
          className="dark:bg-neutral-950"
        />
      </div>

      {afficherDetailsEtendus ? (
        <Collapsible open={detailsOuvert} onOpenChange={setDetailsOuvert}>
          <CollapsibleTrigger
            className={cn(
              'flex w-full items-center justify-between gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-medium',
              'text-neutral-800 dark:border-neutral-700 dark:text-neutral-200',
              'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors'
            )}
          >
            <span>Questionnaire du cycle</span>
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-neutral-500 transition-transform',
                detailsOuvert && 'rotate-180'
              )}
              aria-hidden
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <DailyLogSectionEtendue data={extended} onChange={setExtended} phase={phase} />
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="note-rapide">Note libre</Label>
          <Textarea
            id="note-rapide"
            value={extended.free_note}
            onChange={(e) => setExtended((prev) => ({ ...prev, free_note: e.target.value }))}
            placeholder="Observations du jour…"
            className="resize-none text-sm dark:bg-neutral-950"
            rows={3}
          />
        </div>
      )}

      {erreur ? (
        <p role="alert" className="text-sm text-destructive">
          {erreur}
        </p>
      ) : null}

      <Button
        type="button"
        onClick={() => void sauvegarder()}
        disabled={chargement}
        className="w-full bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
      >
        {chargement ? 'Sauvegarde…' : 'Sauvegarder'}
      </Button>
    </div>
  )
}
