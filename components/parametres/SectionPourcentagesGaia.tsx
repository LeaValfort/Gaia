'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import { POURCENTAGES_GAIA_DEFAUT } from '@/types'
import type { Phase, PourcentagesGaia, UserPreferences } from '@/types'

const PHASES_ORDRE: Phase[] = ['menstruation', 'folliculaire', 'ovulation', 'luteale']
const POURCENTAGE_MIN = -50
const POURCENTAGE_MAX = 50

export interface SectionPourcentagesGaiaProps {
  prefs: UserPreferences
  onUpdate: (updates: Partial<UserPreferences>) => Promise<boolean>
}

/**
 * Pourcentages d'ajustement par phase, appliqués à la charge en muscu et à la
 * distance en natation (bouton "Séance Gaia"). Réglable ici, pas figé en dur.
 */
export function SectionPourcentagesGaia({ prefs, onUpdate }: SectionPourcentagesGaiaProps) {
  const pourcentages: PourcentagesGaia = { ...POURCENTAGES_GAIA_DEFAUT, ...(prefs.pourcentages_gaia ?? {}) }
  const [valeurs, setValeurs] = useState<PourcentagesGaia>(pourcentages)
  const [enCours, setEnCours] = useState<Phase | null>(null)

  function borner(v: number): number {
    return Math.min(POURCENTAGE_MAX, Math.max(POURCENTAGE_MIN, v))
  }

  async function enregistrer(phase: Phase, valeur: number) {
    const bornee = borner(valeur)
    setEnCours(phase)
    await onUpdate({ pourcentages_gaia: { ...valeurs, [phase]: bornee } })
    setEnCours(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 rounded-lg border border-amber-200/70 bg-amber-50/70 p-2.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <p>
          Réglage de confort personnalisable, pas une prescription scientifique stricte — la
          littérature ne fixe pas de pourcentage précis (voir Bibliographie). Ces valeurs
          s&apos;appliquent à la charge en muscu et à la distance en natation via le bouton
          « Séance Gaia ».
        </p>
      </div>

      <ul className="space-y-2">
        {PHASES_ORDRE.map((phase) => {
          const d = PHASES_DESIGN[phase]
          const v = valeurs[phase]
          return (
            <li key={phase} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-sm text-neutral-800 dark:text-neutral-100">
                <span aria-hidden>{d.emoji}</span> {d.label}
              </span>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={POURCENTAGE_MIN}
                  max={POURCENTAGE_MAX}
                  step={1}
                  disabled={enCours === phase}
                  value={v}
                  aria-label={`Pourcentage ${d.label}`}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10)
                    if (Number.isFinite(n)) setValeurs((prev) => ({ ...prev, [phase]: n }))
                  }}
                  onBlur={(e) => {
                    const n = parseInt(e.target.value, 10)
                    if (Number.isFinite(n)) void enregistrer(phase, n)
                  }}
                  className="h-9 w-16 px-2 text-center text-sm tabular-nums dark:bg-neutral-950"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
