'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { blocsDefautPourNiveau, LABELS_NAGE } from '@/lib/data/swimming'
import type { BlocNatation, TypeNage } from '@/types'

const NAGES: TypeNage[] = ['echauffement', 'crawl', 'brasse', 'recuperation']

function deplacer<T>(liste: T[], i: number, sens: -1 | 1): T[] {
  const j = i + sens
  if (j < 0 || j >= liste.length) return liste
  const copie = [...liste]
  ;[copie[i], copie[j]] = [copie[j], copie[i]]
  return copie
}

export interface ModaleEditBlocsNatationProps {
  niveauActuel: number
  blocsActuels: BlocNatation[]
  onSauvegarde: (blocs: BlocNatation[]) => Promise<void>
  onFermer: () => void
}

/**
 * Éditeur de blocs natation ordonnés (échauffement → nage → récupération…),
 * purement contrôlé : la persistance est déléguée au parent.
 */
export function ModaleEditBlocsNatation({
  niveauActuel,
  blocsActuels,
  onSauvegarde,
  onFermer,
}: ModaleEditBlocsNatationProps) {
  const [blocs, setBlocs] = useState<BlocNatation[]>(
    blocsActuels.length ? blocsActuels : blocsDefautPourNiveau(niveauActuel)
  )
  const [ch, setCh] = useState(false)

  const maj = (i: number, u: Partial<BlocNatation>) =>
    setBlocs((p) => p.map((b, j) => (j === i ? { ...b, ...u } : b)))
  const sup = (i: number) => setBlocs((p) => p.filter((_, j) => j !== i))
  const monter = (i: number) => setBlocs((p) => deplacer(p, i, -1))
  const descendre = (i: number) => setBlocs((p) => deplacer(p, i, 1))
  const ajouter = () => setBlocs((p) => [...p, { nage: 'crawl', distanceM: 100 }])
  const defaut = () => setBlocs(blocsDefautPourNiveau(niveauActuel))

  async function save() {
    if (!blocs.length) return
    setCh(true)
    try {
      await onSauvegarde(blocs)
      onFermer()
    } catch {
      // erreur déjà signalée par le parent (toast)
    } finally {
      setCh(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="flex max-h-[min(90vh,560px)] flex-col gap-0 p-0 sm:max-w-lg" showCloseButton>
        <div className="p-4 pb-2">
          <DialogHeader>
            <DialogTitle>Modifier les blocs</DialogTitle>
            <DialogDescription>Ordre et distances de la séance (échauffement, nages, récupération).</DialogDescription>
          </DialogHeader>
        </div>
        <div className="max-h-[50vh] space-y-2 overflow-y-auto border-y px-4 py-2">
          {blocs.map((b, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-neutral-200 p-2 dark:border-neutral-700">
              <div className="flex flex-col gap-0.5">
                <Button type="button" size="icon-sm" variant="ghost" className="h-6 w-6" disabled={i === 0} onClick={() => monter(i)}>
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button type="button" size="icon-sm" variant="ghost" className="h-6 w-6" disabled={i === blocs.length - 1} onClick={() => descendre(i)}>
                  <ArrowDown className="size-3.5" />
                </Button>
              </div>
              <select
                value={b.nage}
                onChange={(e) => maj(i, { nage: e.target.value as TypeNage })}
                className="h-9 flex-1 rounded-md border border-neutral-200 bg-transparent px-2 text-sm dark:border-neutral-700"
              >
                {NAGES.map((n) => (
                  <option key={n} value={n}>
                    {LABELS_NAGE[n]}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min={0}
                step={25}
                value={b.distanceM}
                onChange={(e) => maj(i, { distanceM: parseInt(e.target.value, 10) || 0 })}
                className="h-9 w-20"
              />
              <span className="text-xs text-neutral-400">m</span>
              <Button type="button" size="icon-sm" variant="secondary" className="h-8 w-8 shrink-0" onClick={() => sup(i)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={ajouter} className="w-full">
            <Plus className="mr-1 size-4" /> Ajouter un bloc
          </Button>
        </div>
        <DialogFooter className="flex-col gap-2 p-4 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" disabled={ch} onClick={defaut}>
            <RefreshCw className="mr-1 size-4" />
            Remettre par défaut
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onFermer} disabled={ch}>
              Annuler
            </Button>
            <Button type="button" className="bg-rose-600 text-white" disabled={ch || !blocs.length} onClick={() => void save()}>
              {ch ? '…' : 'Sauvegarder'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
