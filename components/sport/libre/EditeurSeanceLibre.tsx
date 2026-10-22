'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LigneSeanceLibreEditeur } from '@/components/sport/libre/LigneSeanceLibreEditeur'
import { TYPES_LIGNE, typesLigneSuggeres } from '@/lib/data/lignes-seance'
import { dureeBlocsMin, nouvelleLigne } from '@/lib/sport/seance-libre'
import type { DerniereCharge, LigneSeanceLibre, TypeActivite, TypeLigneSeanceLibre } from '@/types'

interface EditeurSeanceLibreProps {
  lignes: LigneSeanceLibre[]
  dernieresCharges: Map<string, DerniereCharge>
  /** Sport choisi : décide quels types de lignes sont proposés en premier. */
  sport: TypeActivite | null
  titre?: string
  onChange: (lignes: LigneSeanceLibre[]) => void
}

/** Contenu d'une séance libre : lignes de types variés, noms libres, réordonnables. */
export function EditeurSeanceLibre({ lignes, dernieresCharges, sport, titre, onChange }: EditeurSeanceLibreProps) {
  const [plus, setPlus] = useState(false)
  const { suggeres, autres } = typesLigneSuggeres(sport)
  const duree = dureeBlocsMin(lignes)

  const maj = (i: number, l: LigneSeanceLibre) => onChange(lignes.map((x, j) => (j === i ? l : x)))
  const sup = (i: number) => onChange(lignes.filter((_, j) => j !== i))
  const deplacer = (i: number, sens: -1 | 1) => {
    const j = i + sens
    if (j < 0 || j >= lignes.length) return
    const copie = [...lignes]
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
    onChange(copie)
  }
  const ajouter = (t: TypeLigneSeanceLibre) => {
    onChange([...lignes, nouvelleLigne(t)])
    setPlus(false)
  }
  const bouton = (t: TypeLigneSeanceLibre) => (
    <Button key={t} type="button" size="sm" variant="outline" onClick={() => ajouter(t)} title={TYPES_LIGNE[t].aide}>
      <Plus className="mr-1 size-3.5" /> {TYPES_LIGNE[t].emoji} {TYPES_LIGNE[t].label}
    </Button>
  )

  return (
    <div className="space-y-2">
      <p className="flex items-baseline justify-between gap-2 text-xs font-semibold text-amber-900/80 dark:text-amber-200/80">
        <span>{titre ?? 'Contenu de la séance — optionnel'}</span>
        {duree ? <span className="font-normal text-muted-foreground">≈ {duree} min</span> : null}
      </p>
      {lignes.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Ajoute ce que tu fais : exercices, mouvements avec minuteur, blocs de distance, intervalles…
        </p>
      ) : (
        lignes.map((l, i) => (
          <LigneSeanceLibreEditeur
            key={l.id}
            ligne={l}
            derniereCharge={l.type === 'exercice' ? dernieresCharges.get(l.nom.trim())?.weight_kg ?? null : null}
            onChange={(n) => maj(i, n)}
            onMonter={() => deplacer(i, -1)}
            onDescendre={() => deplacer(i, 1)}
            onSupprimer={() => sup(i)}
          />
        ))
      )}
      <div className="flex flex-wrap gap-2">
        {suggeres.map(bouton)}
        {plus ? (
          autres.map(bouton)
        ) : (
          <Button type="button" size="sm" variant="ghost" onClick={() => setPlus(true)}>
            Plus…
          </Button>
        )}
      </div>
    </div>
  )
}
