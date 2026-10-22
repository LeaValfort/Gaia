'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LigneSeanceLibreEditeur } from '@/components/sport/libre/LigneSeanceLibreEditeur'
import { nouveauBloc, nouvelExercice } from '@/lib/sport/seance-libre'
import type { DerniereCharge, LigneSeanceLibre } from '@/types'

interface EditeurSeanceLibreProps {
  lignes: LigneSeanceLibre[]
  dernieresCharges: Map<string, DerniereCharge>
  onChange: (lignes: LigneSeanceLibre[]) => void
}

/**
 * Contenu d'une séance libre : exercices (séries × reps, charge) et blocs
 * (durée, distance), noms libres, réordonnables. Composant contrôlé.
 */
export function EditeurSeanceLibre({ lignes, dernieresCharges, onChange }: EditeurSeanceLibreProps) {
  const maj = (i: number, l: LigneSeanceLibre) => onChange(lignes.map((x, j) => (j === i ? l : x)))
  const sup = (i: number) => onChange(lignes.filter((_, j) => j !== i))
  const deplacer = (i: number, sens: -1 | 1) => {
    const j = i + sens
    if (j < 0 || j >= lignes.length) return
    const copie = [...lignes]
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
    onChange(copie)
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-amber-900/80 dark:text-amber-200/80">Contenu de la séance — optionnel</p>
      {lignes.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Ajoute des exercices (ex. pompes 3×12) ou des blocs (ex. 5 min rapide, 2 min lent).
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
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => onChange([...lignes, nouvelExercice()])}>
          <Plus className="mr-1 size-3.5" /> Exercice
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onChange([...lignes, nouveauBloc()])}>
          <Plus className="mr-1 size-3.5" /> Bloc durée / distance
        </Button>
      </div>
    </div>
  )
}
