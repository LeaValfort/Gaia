'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { JournalExpandableCategory } from './JournalExpandableCategory'
import { PillsSelector } from './PillsSelector'
import {
  EMOTIONS,
  SYMPTOMES,
  LIBIDO_OPTIONS,
  SOMMEIL_OPTIONS,
  APPETIT_OPTIONS,
  FLOT_OPTIONS,
} from '@/lib/data/journalOptions'
import type { ExtendedLogData, Phase } from '@/types'

interface DailyLogSectionEtendueProps {
  data: ExtendedLogData
  onChange: (data: ExtendedLogData) => void
  phase: Phase
}

const VIDE = 'Non renseigné'

function maj<K extends keyof ExtendedLogData>(
  data: ExtendedLogData,
  onChange: (d: ExtendedLogData) => void,
  champ: K,
  valeur: ExtendedLogData[K],
) {
  onChange({ ...data, [champ]: valeur })
}

function depuisPillUnique(tableau: string[]): string | null {
  return tableau[0] ?? null
}

function apercuMulti(selected: string[]): string {
  if (!selected.length) return VIDE
  if (selected.length <= 2) return selected.join(', ')
  return `${selected.slice(0, 2).join(', ')}… (+${selected.length - 2})`
}

export function DailyLogSectionEtendue({ data, onChange, phase }: DailyLogSectionEtendueProps) {
  const [ouverts, setOuverts] = useState<Record<string, boolean>>({})

  function basculer(cle: string) {
    setOuverts((o) => ({ ...o, [cle]: !o[cle] }))
  }

  const hintSommeil =
    data.sleep_quality != null
      ? [data.sleep_quality, data.sleep_hours ? `${data.sleep_hours} h` : null].filter(Boolean).join(' · ')
      : VIDE

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
        Détails du jour
      </p>

      <JournalExpandableCategory
        title="Émotions"
        hintReplie={apercuMulti(data.emotions)}
        ouvert={Boolean(ouverts.emotions)}
        onBasculer={() => basculer('emotions')}
      >
        <PillsSelector
          label="Émotions"
          options={EMOTIONS}
          selected={data.emotions}
          onChange={(v) => maj(data, onChange, 'emotions', v)}
          masquerLabel
        />
      </JournalExpandableCategory>

      <JournalExpandableCategory
        title="Symptômes physiques"
        hintReplie={apercuMulti(data.symptoms)}
        ouvert={Boolean(ouverts.symptoms)}
        onBasculer={() => basculer('symptoms')}
      >
        <PillsSelector
          label="Symptômes physiques"
          options={SYMPTOMES}
          selected={data.symptoms}
          onChange={(v) => maj(data, onChange, 'symptoms', v)}
          masquerLabel
        />
      </JournalExpandableCategory>

      <JournalExpandableCategory
        title="Libido"
        hintReplie={data.libido ?? VIDE}
        ouvert={Boolean(ouverts.libido)}
        onBasculer={() => basculer('libido')}
      >
        <PillsSelector
          label="Libido"
          options={LIBIDO_OPTIONS}
          selected={data.libido ? [data.libido] : []}
          onChange={(v) => maj(data, onChange, 'libido', depuisPillUnique(v))}
          multiSelect={false}
          masquerLabel
        />
      </JournalExpandableCategory>

      <JournalExpandableCategory
        title="Sommeil"
        hintReplie={hintSommeil}
        ouvert={Boolean(ouverts.sleep)}
        onBasculer={() => basculer('sleep')}
      >
        <div className="flex flex-col gap-3">
          <PillsSelector
            label="Qualité du sommeil"
            options={SOMMEIL_OPTIONS}
            selected={data.sleep_quality ? [data.sleep_quality] : []}
            onChange={(v) => maj(data, onChange, 'sleep_quality', depuisPillUnique(v))}
            multiSelect={false}
            masquerLabel
          />
          {data.sleep_quality ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={data.sleep_hours}
                onChange={(e) => maj(data, onChange, 'sleep_hours', e.target.value)}
                placeholder="Heures dormies (optionnel)"
                className="w-48 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder:text-neutral-500"
              />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">h</span>
            </div>
          ) : null}
        </div>
      </JournalExpandableCategory>

      <JournalExpandableCategory
        title="Appétit"
        hintReplie={apercuMulti(data.appetite)}
        ouvert={Boolean(ouverts.appetite)}
        onBasculer={() => basculer('appetite')}
      >
        <PillsSelector
          label="Appétit"
          options={APPETIT_OPTIONS}
          selected={data.appetite}
          onChange={(v) => maj(data, onChange, 'appetite', v)}
          masquerLabel
        />
      </JournalExpandableCategory>

      {phase === 'menstruation' ? (
        <JournalExpandableCategory
          title="Flot des règles"
          hintReplie={data.flow_intensity ?? VIDE}
          ouvert={Boolean(ouverts.flow)}
          onBasculer={() => basculer('flow')}
        >
          <PillsSelector
            label="Flot des règles"
            options={FLOT_OPTIONS}
            selected={data.flow_intensity ? [data.flow_intensity] : []}
            onChange={(v) => maj(data, onChange, 'flow_intensity', depuisPillUnique(v))}
            multiSelect={false}
            masquerLabel
          />
        </JournalExpandableCategory>
      ) : null}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Note libre
        </p>
        <Textarea
          value={data.free_note}
          onChange={(e) => maj(data, onChange, 'free_note', e.target.value)}
          placeholder="Observations, pensées du jour..."
          className="resize-none text-sm"
          rows={3}
        />
      </div>
    </div>
  )
}
