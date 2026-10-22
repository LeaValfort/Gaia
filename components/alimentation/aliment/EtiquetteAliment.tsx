'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { PortionAliment } from '@/components/alimentation/aliment/PortionAliment'
import type { Pour100g } from '@/lib/nutrition/portion'
import type { AlimentAjoute } from '@/types'

const CHAMPS: { cle: keyof Pour100g; label: string }[] = [
  { cle: 'kcal', label: 'kcal' },
  { cle: 'proteines', label: 'Protéines (g)' },
  { cle: 'glucides', label: 'Glucides (g)' },
  { cle: 'lipides', label: 'Lipides (g)' },
]

/** Saisie depuis l'étiquette du paquet : valeurs pour 100 g + quantité mangée. */
export function EtiquetteAliment({ onAjouter }: { onAjouter: (a: AlimentAjoute) => void }) {
  const [nom, setNom] = useState('')
  const [v, setV] = useState<Record<keyof Pour100g, string>>({ kcal: '', proteines: '', glucides: '', lipides: '' })
  const n = (s: string) => Number(s.replace(',', '.')) || 0
  const pour100g: Pour100g = { kcal: n(v.kcal), proteines: n(v.proteines), glucides: n(v.glucides), lipides: n(v.lipides) }

  return (
    <div className="space-y-3">
      <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom du produit (optionnel)" />
      <div>
        <p className="mb-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">Valeurs pour 100 g (sur le paquet)</p>
        <div className="grid grid-cols-2 gap-2">
          {CHAMPS.map(({ cle, label }) => (
            <label key={cle} className="space-y-0.5 text-xs text-muted-foreground">
              {label}
              <Input className="h-9" inputMode="decimal" value={v[cle]} onChange={(e) => setV((p) => ({ ...p, [cle]: e.target.value }))} />
            </label>
          ))}
        </div>
      </div>
      {pour100g.kcal > 0 ? (
        <PortionAliment nom={nom.trim() || 'Produit (étiquette)'} pour100g={pour100g} grammesInitial={100} onAjouter={onAjouter} />
      ) : null}
    </div>
  )
}
