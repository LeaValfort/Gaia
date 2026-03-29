'use client'

import { Textarea } from '@/components/ui/textarea'
import { PillsSelector } from './PillsSelector'
import {
  EMOTIONS, SYMPTOMES, LIBIDO_OPTIONS,
  SOMMEIL_OPTIONS, APPETIT_OPTIONS, FLOT_OPTIONS,
} from '@/lib/data/journalOptions'
import type { ExtendedLogData, Phase } from '@/types'

interface DailyLogSectionEtendueProps {
  data: ExtendedLogData
  onChange: (data: ExtendedLogData) => void
  phase: Phase
}

// Met à jour un seul champ de l'objet ExtendedLogData
function maj<K extends keyof ExtendedLogData>(
  data: ExtendedLogData,
  onChange: (d: ExtendedLogData) => void,
  champ: K,
  valeur: ExtendedLogData[K]
) {
  onChange({ ...data, [champ]: valeur })
}

// Pour les champs "choix unique", la pill renvoie string[] (0 ou 1 élément)
function depuisPillUnique(tableau: string[]): string | null {
  return tableau[0] ?? null
}

export function DailyLogSectionEtendue({
  data,
  onChange,
  phase,
}: DailyLogSectionEtendueProps) {
  return (
    <div className="flex flex-col gap-5">

      <PillsSelector
        label="Émotions"
        options={EMOTIONS}
        selected={data.emotions}
        onChange={(v) => maj(data, onChange, 'emotions', v)}
      />

      <PillsSelector
        label="Symptômes physiques"
        options={SYMPTOMES}
        selected={data.symptoms}
        onChange={(v) => maj(data, onChange, 'symptoms', v)}
      />

      <PillsSelector
        label="Libido (choix unique)"
        options={LIBIDO_OPTIONS}
        selected={data.libido ? [data.libido] : []}
        onChange={(v) => maj(data, onChange, 'libido', depuisPillUnique(v))}
        multiSelect={false}
      />

      {/* Sommeil — choix unique + champ heures optionnel */}
      <div className="flex flex-col gap-3">
        <PillsSelector
          label="Sommeil (choix unique)"
          options={SOMMEIL_OPTIONS}
          selected={data.sleep_quality ? [data.sleep_quality] : []}
          onChange={(v) => maj(data, onChange, 'sleep_quality', depuisPillUnique(v))}
          multiSelect={false}
        />
        {data.sleep_quality && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={data.sleep_hours}
              onChange={(e) => maj(data, onChange, 'sleep_hours', e.target.value)}
              placeholder="Heures dormies (optionnel)"
              className="w-48 px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">h</span>
          </div>
        )}
      </div>

      <PillsSelector
        label="Appétit"
        options={APPETIT_OPTIONS}
        selected={data.appetite}
        onChange={(v) => maj(data, onChange, 'appetite', v)}
      />

      {/* Flot des règles — visible seulement en phase menstruation */}
      {phase === 'menstruation' && (
        <PillsSelector
          label="Flot des règles (choix unique)"
          options={FLOT_OPTIONS}
          selected={data.flow_intensity ? [data.flow_intensity] : []}
          onChange={(v) => maj(data, onChange, 'flow_intensity', depuisPillUnique(v))}
          multiSelect={false}
        />
      )}

      {/* Note libre */}
      <div>
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
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
