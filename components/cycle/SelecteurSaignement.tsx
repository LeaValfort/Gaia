'use client'

import { PillsSelector } from '@/components/cycle/PillsSelector'
import { FLOT_OPTIONS, SAIGNEMENT_HORS_REGLES_OPTIONS } from '@/lib/data/journalOptions'
import type { Phase } from '@/types'

interface SelecteurSaignementProps {
  phase: Phase | null
  valeur: string | null
  onChange: (v: string | null) => void
}

/**
 * Flux pendant les règles, spotting le reste du temps (stocké dans `flow_intensity`).
 * Le spotting reste proposé pendant les règles prévues : la phase n'est qu'une prédiction.
 * Ne démarre jamais de cycle (seul « Mes règles ont commencé » le fait).
 */
export function SelecteurSaignement({ phase, valeur, onChange }: SelecteurSaignementProps) {
  const regles = phase === 'menstruation'
  return (
    <PillsSelector
      label={regles ? 'Flux / spotting' : 'Saignement / spotting'}
      options={regles ? ['Spotting', ...FLOT_OPTIONS] : SAIGNEMENT_HORS_REGLES_OPTIONS}
      selected={valeur ? [valeur] : []}
      onChange={(v) => onChange(v[0] ?? null)}
      multiSelect={false}
    />
  )
}
