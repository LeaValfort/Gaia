'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PostureYoga } from '@/types'

const DUREE_DEFAUT_SEC = 30

/** Ajoute une posture au nom libre (absente du catalogue), avec sa durée. */
export function AjoutPostureLibre({ onAjouter }: { onAjouter: (posture: PostureYoga) => void }) {
  const [nom, setNom] = useState('')
  const [duree, setDuree] = useState(String(DUREE_DEFAUT_SEC))

  function ajouter() {
    const n = nom.trim()
    if (!n) return
    const sec = Number(duree)
    onAjouter({ nom: n, dureeSec: Number.isFinite(sec) && sec > 0 ? sec : DUREE_DEFAUT_SEC, benefice: 'Posture perso' })
    setNom('')
  }

  return (
    <div className="mt-3">
      <p className="mb-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">Posture perso (hors catalogue)</p>
      <div className="flex gap-2">
        <Input className="h-9" placeholder="Ex. Headstand" value={nom} onChange={(e) => setNom(e.target.value)} />
        <Input
          className="h-9 w-20"
          inputMode="numeric"
          aria-label="Durée en secondes"
          value={duree}
          onChange={(e) => setDuree(e.target.value)}
        />
        <span className="self-center text-xs text-neutral-500">s</span>
        <Button type="button" size="icon-sm" variant="secondary" className="h-9 w-9 shrink-0" disabled={!nom.trim()} onClick={ajouter} aria-label="Ajouter la posture">
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  )
}
