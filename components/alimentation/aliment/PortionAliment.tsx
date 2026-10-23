'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { macrosPourGrammes, type Pour100g } from '@/lib/nutrition/portion'
import type { AlimentAjoute } from '@/types'

interface PortionAlimentProps {
  nom: string
  pour100g: Pour100g
  grammesInitial: number
  onAjouter: (a: AlimentAjoute) => void
  /** Valeurs pour 100 g pas encore saisies : quantité modifiable, ajout bloqué. */
  desactive?: boolean
}

/** Quantité mangée → aperçu des macros → ajout au repas. */
export function PortionAliment({ nom, pour100g, grammesInitial, onAjouter, desactive }: PortionAlimentProps) {
  const [g, setG] = useState(String(grammesInitial))
  const grammes = Number(g.replace(',', '.')) || 0
  const m = macrosPourGrammes(nom, pour100g, grammes)

  return (
    <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{nom}</p>
      <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
        Quantité mangée
        <Input className="h-9 w-24" inputMode="decimal" value={g} onChange={(e) => setG(e.target.value)} aria-label="Quantité en grammes" />
        g
      </label>
      <p className="text-xs text-muted-foreground">
        {m.calories} kcal · {m.proteines} g P · {m.glucides} g G · {m.lipides} g L
        <span className="ml-1 text-neutral-400">({pour100g.kcal} kcal / 100 g)</span>
      </p>
      <Button type="button" size="sm" disabled={grammes <= 0 || desactive} onClick={() => onAjouter(m)} className="bg-amber-600 text-white hover:bg-amber-700">
        <Plus className="mr-1 size-3.5" /> Ajouter au repas
      </Button>
    </div>
  )
}
