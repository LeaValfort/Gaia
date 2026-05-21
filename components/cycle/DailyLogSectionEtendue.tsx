'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PillsSelector } from './PillsSelector'
import {
  APPETIT_OPTIONS,
  EMOTIONS,
  FLOT_OPTIONS,
  LIBIDO_OPTIONS,
  SOMMEIL_OPTIONS,
  STRESS_OPTIONS,
  SYMPTOMES,
} from '@/lib/data/journalOptions'
import type { ExtendedLogData, Phase } from '@/types'

interface DailyLogSectionEtendueProps {
  data: ExtendedLogData
  onChange: (data: ExtendedLogData) => void
  phase: Phase
}

function maj<K extends keyof ExtendedLogData>(
  data: ExtendedLogData,
  onChange: (d: ExtendedLogData) => void,
  champ: K,
  valeur: ExtendedLogData[K]
) {
  onChange({ ...data, [champ]: valeur })
}

function depuisPillUnique(tableau: string[]): string | null {
  return tableau[0] ?? null
}

export function DailyLogSectionEtendue({ data, onChange, phase }: DailyLogSectionEtendueProps) {
  return (
    <div className="flex flex-col gap-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
      <PillsSelector
        label="Émotions"
        options={EMOTIONS}
        selected={data.emotions}
        onChange={(v) => maj(data, onChange, 'emotions', v)}
      />

      <PillsSelector
        label="Symptômes"
        options={SYMPTOMES}
        selected={data.symptoms}
        onChange={(v) => maj(data, onChange, 'symptoms', v)}
      />

      {phase === 'menstruation' ? (
        <PillsSelector
          label="Flux"
          options={FLOT_OPTIONS}
          selected={data.flow_intensity ? [data.flow_intensity] : []}
          onChange={(v) => maj(data, onChange, 'flow_intensity', depuisPillUnique(v))}
          multiSelect={false}
        />
      ) : null}

      <PillsSelector
        label="Libido"
        options={LIBIDO_OPTIONS}
        selected={data.libido ? [data.libido] : []}
        onChange={(v) => maj(data, onChange, 'libido', depuisPillUnique(v))}
        multiSelect={false}
      />

      <PillsSelector
        label="Qualité sommeil"
        options={SOMMEIL_OPTIONS}
        selected={data.sleep_quality ? [data.sleep_quality] : []}
        onChange={(v) => maj(data, onChange, 'sleep_quality', depuisPillUnique(v))}
        multiSelect={false}
      />

      <div className="space-y-1.5">
        <Label htmlFor="sleep-hours">Heures de sommeil</Label>
        <Input
          id="sleep-hours"
          type="number"
          min={0}
          max={24}
          step={0.5}
          value={data.sleep_hours}
          onChange={(e) => maj(data, onChange, 'sleep_hours', e.target.value)}
          placeholder="Ex. 7.5"
          className="max-w-[8rem] dark:bg-neutral-950"
        />
      </div>

      <PillsSelector
        label="Niveau de stress"
        options={STRESS_OPTIONS}
        selected={data.stress_level ? [data.stress_level] : []}
        onChange={(v) => maj(data, onChange, 'stress_level', depuisPillUnique(v))}
        multiSelect={false}
      />

      <PillsSelector
        label="Appétit"
        options={APPETIT_OPTIONS}
        selected={data.appetite}
        onChange={(v) => maj(data, onChange, 'appetite', v)}
      />

      <div className="space-y-1.5">
        <Label htmlFor="free-note">Note libre</Label>
        <Textarea
          id="free-note"
          value={data.free_note}
          onChange={(e) => maj(data, onChange, 'free_note', e.target.value)}
          placeholder="Observations, pensées du jour…"
          className="resize-none text-sm dark:bg-neutral-950"
          rows={3}
        />
      </div>
    </div>
  )
}
