'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { SelecteurCataloguePostures } from '@/components/sport/yoga/SelecteurCataloguePostures'
import type { PostureYoga } from '@/types'

function deplacer<T>(liste: T[], i: number, sens: -1 | 1): T[] {
  const j = i + sens
  if (j < 0 || j >= liste.length) return liste
  const copie = [...liste]
  ;[copie[i], copie[j]] = [copie[j], copie[i]]
  return copie
}

export interface ModaleEditPosturesYogaProps {
  posturesActuelles: PostureYoga[]
  posturesDefaut: PostureYoga[]
  onSauvegarde: (postures: PostureYoga[]) => Promise<void>
  onFermer: () => void
}

/**
 * Éditeur de postures yoga (ordre, sélection, ajout depuis le catalogue),
 * purement contrôlé : la persistance est déléguée au parent.
 */
export function ModaleEditPosturesYoga({
  posturesActuelles,
  posturesDefaut,
  onSauvegarde,
  onFermer,
}: ModaleEditPosturesYogaProps) {
  const [postures, setPostures] = useState<PostureYoga[]>(posturesActuelles)
  const [ch, setCh] = useState(false)

  const sup = (i: number) => setPostures((p) => p.filter((_, j) => j !== i))
  const monter = (i: number) => setPostures((p) => deplacer(p, i, -1))
  const descendre = (i: number) => setPostures((p) => deplacer(p, i, 1))
  const majDuree = (i: number, sec: number) =>
    setPostures((p) => p.map((post, j) => (j === i ? { ...post, dureeSec: sec } : post)))
  const ajouter = (p: PostureYoga) => setPostures((prev) => [...prev, p])
  const defaut = () => setPostures([...posturesDefaut])

  const nomsExclus = useMemo(() => new Set(postures.map((p) => p.nom)), [postures])

  async function save() {
    if (!postures.length) return
    setCh(true)
    try {
      await onSauvegarde(postures)
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
            <DialogTitle>Modifier les postures</DialogTitle>
            <DialogDescription>Ordre, durées, ajout depuis le catalogue.</DialogDescription>
          </DialogHeader>
        </div>
        <div className="max-h-[36vh] space-y-2 overflow-y-auto border-y px-4 py-2">
          {postures.map((p, i) => (
            <div key={`${p.nom}-${i}`} className="flex items-center gap-2 rounded-lg border border-neutral-200 p-2 dark:border-neutral-700">
              <div className="flex flex-col gap-0.5">
                <Button type="button" size="icon-sm" variant="ghost" className="h-6 w-6" disabled={i === 0} onClick={() => monter(i)}>
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button type="button" size="icon-sm" variant="ghost" className="h-6 w-6" disabled={i === postures.length - 1} onClick={() => descendre(i)}>
                  <ArrowDown className="size-3.5" />
                </Button>
              </div>
              <span className="min-w-0 flex-1 truncate text-sm">{p.nom}</span>
              <Input
                type="number"
                min={0}
                step={15}
                value={p.dureeSec}
                onChange={(e) => majDuree(i, parseInt(e.target.value, 10) || 0)}
                className="h-9 w-20"
              />
              <span className="text-xs text-neutral-400">s</span>
              <Button type="button" size="icon-sm" variant="secondary" className="h-8 w-8 shrink-0" onClick={() => sup(i)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="px-4 py-2">
          <SelecteurCataloguePostures nomsExclus={nomsExclus} onAjouter={ajouter} />
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
            <Button type="button" className="bg-rose-600 text-white" disabled={ch || !postures.length} onClick={() => void save()}>
              {ch ? '…' : 'Sauvegarder'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
