'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { upsertDailyLog } from '@/lib/db/dailyLog'
import { DailyLogSectionEtendue } from './DailyLogSectionEtendue'
import { EXTENDED_LOG_INITIAL, extendedFromDailyLog } from '@/lib/data/journalOptions'
import type { DailyLog, Phase, ExtendedLogData } from '@/types'
import { ENERGY_MIN, ENERGY_MAX, PAIN_MIN, PAIN_MAX } from '@/types'

interface DailyLogFormProps {
  date: string
  phase: Phase
  jourDuCycle: number
  logInitial: DailyLog | null
}

export function DailyLogForm({ date, phase, jourDuCycle, logInitial }: DailyLogFormProps) {
  const router = useRouter()
  const [energie, setEnergie] = useState<number>(logInitial?.energy ?? 0)
  const [douleur, setDouleur] = useState<number>(logInitial?.pain ?? 0)
  const [extended, setExtended] = useState<ExtendedLogData>(
    logInitial ? extendedFromDailyLog(logInitial) : EXTENDED_LOG_INITIAL
  )
  const [chargement, setChargement] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)

  async function sauvegarder() {
    setChargement(true)
    try {
      await upsertDailyLog({
        date,
        phase,
        cycle_day:     jourDuCycle,
        energy:        energie || null,
        pain:          douleur,
        mood:          extended.emotions.length ? extended.emotions.join(', ') : null,
        notes:         null,
        emotions:      extended.emotions.length ? extended.emotions : null,
        symptoms:      extended.symptoms.length ? extended.symptoms : null,
        libido:        extended.libido,
        sleep_quality: extended.sleep_quality,
        sleep_hours:   extended.sleep_hours ? parseFloat(extended.sleep_hours) : null,
        stress_level:  null,
        appetite:      extended.appetite.length ? extended.appetite : null,
        flow_intensity: extended.flow_intensity,
        free_note:     extended.free_note || null,
      })
      setSauvegarde(true)
      setTimeout(() => setSauvegarde(false), 2000)
      router.refresh()
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-5">
      <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
        {logInitial ? '✏️ Modifier le journal' : 'Journal du jour'}
      </h2>

      {/* Énergie 1-5 */}
      <div>
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">Énergie</p>
        <div className="flex gap-2">
          {Array.from({ length: ENERGY_MAX }, (_, i) => i + ENERGY_MIN).map((val) => (
            <button key={val} type="button" onClick={() => setEnergie(val)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all
                ${energie === val
                  ? 'bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 scale-110'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}>{val}</button>
          ))}
        </div>
      </div>

      {/* Douleur 0-10 — curseur */}
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
            Douleur
          </p>
          <p className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
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
        <div className="mt-1 flex justify-between text-[10px] text-neutral-400 dark:text-neutral-500">
          <span>Aucune</span>
          <span>Max.</span>
        </div>
      </div>

      {/* Sections enrichies — émotions, symptômes, libido, sommeil, appétit, flot, note */}
      <DailyLogSectionEtendue data={extended} onChange={setExtended} phase={phase} />

      <Button onClick={sauvegarder} disabled={chargement} className="w-full sm:w-auto sm:self-end">
        {chargement ? 'Sauvegarde...' : sauvegarde ? '✓ Sauvegardé' : 'Sauvegarder'}
      </Button>
    </div>
  )
}
