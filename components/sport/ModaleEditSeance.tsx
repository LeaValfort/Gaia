'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ExerciceEditRow } from '@/components/sport/ExerciceEditRow'
import { getExercicesParSeance } from '@/lib/data/exercises'
import { actionResetSeanceCustom, actionSaveSeanceCustom } from '@/lib/db/seances-custom-actions'
import { exerciceVersCustom, planningVersTypeMuscu, exercicesToCustom } from '@/lib/sport/muscuCustomMap'
import type { Exercice, ExerciceCustom, Lieu, TypeSeanceMuscu } from '@/types'

function reindex(list: ExerciceCustom[]): ExerciceCustom[] {
  return list.map((e, i) => ({ ...e, ordre: i }))
}

export interface ModaleEditSeanceProps {
  typeSeance: string
  lieu: Lieu
  userId: string
  exercicesActuels: ExerciceCustom[]
  exercicesCatalogue: Exercice[]
  onSauvegarde: (exercices: ExerciceCustom[]) => void
  onFermer: () => void
  onReinitialise?: () => void
}

function filtre(ex: Exercice, seance: ReturnType<typeof planningVersTypeMuscu>, lieu: Lieu) {
  return ex.seance === seance && (ex.lieu === 'both' || ex.lieu === lieu)
}

export function ModaleEditSeance({
  typeSeance: ts,
  lieu,
  userId: _u,
  exercicesActuels,
  exercicesCatalogue,
  onSauvegarde,
  onFermer,
  onReinitialise,
}: ModaleEditSeanceProps) {
  const typeSeance = ts as TypeSeanceMuscu
  const sm = useMemo(() => planningVersTypeMuscu(typeSeance), [typeSeance])
  const def = useMemo(() => reindex(exercicesToCustom(getExercicesParSeance(sm, lieu))), [sm, lieu])
  const [exo, setExo] = useState(() => reindex(exercicesActuels))
  const [q, setQ] = useState('')
  const [ch, setCh] = useState(false)
  const [chD, setChD] = useState(false)
  useEffect(() => setExo(reindex(exercicesActuels)), [exercicesActuels, typeSeance, lieu])
  const res = useMemo(() => {
    const t = q.trim().toLowerCase()
    const pris = new Set(exo.map((e) => e.nom))
    return exercicesCatalogue
      .filter((e) => filtre(e, sm, lieu))
      .filter((e) => !pris.has(e.nom))
      .filter((e) => !t || e.nom.toLowerCase().includes(t))
      .slice(0, 30)
  }, [q, exo, exercicesCatalogue, sm, lieu])
  const maj = useCallback((i: number, u: Partial<ExerciceCustom>) => {
    setExo((p) => {
      const n = [...p]
      n[i] = { ...n[i], ...u } as ExerciceCustom
      return n
    })
  }, [])
  const sup = useCallback((i: number) => setExo((p) => reindex(p.filter((_, j) => j !== i))), [])
  const aj = useCallback(
    (e: Exercice) => setExo((p) => reindex([...p, exerciceVersCustom(e, p.length)])),
    []
  )
  async function defaut() {
    setChD(true)
    try {
      await actionResetSeanceCustom(typeSeance, lieu)
      setExo([...def])
      onReinitialise?.()
    } finally {
      setChD(false)
    }
  }
  async function save() {
    if (!exo.length) return
    setCh(true)
    try {
      const fin = reindex(exo)
      await actionSaveSeanceCustom(typeSeance, lieu, fin)
      onSauvegarde(fin)
      onFermer()
    } finally {
      setCh(false)
    }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="flex max-h-[min(90vh,560px)] flex-col gap-0 p-0 sm:max-w-lg" showCloseButton>
        <div className="p-4 pb-2">
          <DialogHeader>
            <DialogTitle>Modifier la séance</DialogTitle>
            <DialogDescription>Ordre, volumes, ajout depuis le catalogue.</DialogDescription>
          </DialogHeader>
        </div>
        <div className="max-h-[36vh] space-y-2 overflow-y-auto border-y px-4 py-2">
          {exo.map((e, i) => (
            <ExerciceEditRow key={`${e.nom}-${i}`} exercice={e} onModifier={(u) => maj(i, u)} onSupprimer={() => sup(i)} />
          ))}
        </div>
        <div className="px-4 py-2">
          <div className="relative mb-2">
            <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-neutral-400" />
            <Input className="h-9 pl-8" placeholder="Recherche…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <ul className="max-h-28 space-y-1 overflow-y-auto rounded border border-neutral-200 p-2 dark:border-neutral-700">
            {res.map((e) => (
              <li key={e.nom} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{e.nom}</span>
                <Button type="button" size="icon-sm" variant="secondary" className="h-7 w-7" onClick={() => aj(e)}>
                  <Plus className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter className="flex-col gap-2 p-4 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" disabled={ch || chD} onClick={() => void defaut()}>
            <RefreshCw className="mr-1 size-4" />
            {chD ? '…' : 'Remettre par défaut'}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onFermer} disabled={ch}>
              Annuler
            </Button>
            <Button type="button" className="bg-rose-600 text-white" disabled={ch || !exo.length} onClick={() => void save()}>
              {ch ? '…' : 'Sauvegarder'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
