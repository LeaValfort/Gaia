'use client'

import { useState } from 'react'
import { EditeurSeanceLibre } from '@/components/sport/libre/EditeurSeanceLibre'
import { useLignesProgramme } from '@/hooks/useLignesProgramme'
import { useSeanceLibre } from '@/hooks/useSeanceLibre'
import { cleProgramme } from '@/lib/db/lignes-programme'
import { lignesRenseignees } from '@/lib/sport/seance-libre'
import type { LigneSeanceLibre, TypeActivite } from '@/types'

interface LignesProgrammeProps {
  userId: string
  typeSeance: string
  lieu: string
  varianteId: string | null
  /** Sport « équivalent » pour choisir les types de lignes proposés en premier. */
  sportSuggestions: TypeActivite
  /** Lignes cochées lors de la séance existante (modification), pour pré-cocher. */
  lignesSeance?: LigneSeanceLibre[] | null
  /** Remonte les lignes cochées, à enregistrer avec la séance. */
  onFaitesChange: (lignes: LigneSeanceLibre[]) => void
}

/**
 * « En plus dans ce programme » : lignes perso qui reviennent à chaque séance
 * de ce programme (sauvegarde automatique). On coche celles faites aujourd'hui.
 * Le parent remonte ce composant (key) quand le programme ou la séance change.
 */
export function LignesProgramme({
  userId,
  typeSeance,
  lieu,
  varianteId,
  sportSuggestions,
  lignesSeance,
  onFaitesChange,
}: LignesProgrammeProps) {
  const { lignes, setLignes, erreurSauvegarde } = useLignesProgramme(userId, cleProgramme(typeSeance, lieu, varianteId))
  const { dernieres } = useSeanceLibre(userId)
  const [faits, setFaits] = useState<Set<string>>(() => new Set((lignesSeance ?? []).map((l) => l.id)))

  const remonter = (l: LigneSeanceLibre[], f: Set<string>) => onFaitesChange(lignesRenseignees(l.filter((x) => f.has(x.id))))

  return (
    <div className="space-y-1 rounded-xl border border-dashed border-amber-300 p-3 dark:border-amber-800">
      <EditeurSeanceLibre
        titre="➕ En plus dans ce programme"
        aideVide="Ajoute tes propres lignes (gainage, mouvement, bloc…) : elles reviendront à chaque séance de ce programme. Coche celles que tu fais."
        lignes={lignes}
        dernieresCharges={dernieres}
        sport={sportSuggestions}
        faits={faits}
        onChange={(l) => {
          setLignes(l)
          remonter(l, faits)
        }}
        onToggleFait={(id) => {
          const f = new Set(faits)
          if (f.has(id)) f.delete(id)
          else f.add(id)
          setFaits(f)
          remonter(lignes, f)
        }}
      />
      {erreurSauvegarde ? (
        <p className="text-xs text-rose-600 dark:text-rose-400">Les lignes du programme n’ont pas pu être sauvegardées.</p>
      ) : null}
    </div>
  )
}
