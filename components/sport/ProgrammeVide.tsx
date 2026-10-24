'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ProgrammeVideProps {
  /** Ex. « muscu Full body », « natation », « yoga ». */
  sport: string
  onCreer: (nom: string) => void
}

/** Aucun programme pour ce sport : Gaia n'en impose pas, on crée le sien à partir de zéro. */
export function ProgrammeVide({ sport, onCreer }: ProgrammeVideProps) {
  const [nom, setNom] = useState('')
  const valider = () => {
    if (nom.trim()) onCreer(nom.trim())
  }

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-neutral-300 bg-white/60 p-4 dark:border-neutral-700 dark:bg-neutral-900/40">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Pas encore de programme {sport}</p>
        <p className="text-xs text-muted-foreground">Donne-lui un nom, puis ajoute ce que tu fais : il reviendra à chaque séance et dans ton planning.</p>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          valider()
        }}
      >
        <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. Haut du corps, Séance piscine…" className="h-9" />
        <Button type="submit" size="sm" disabled={!nom.trim()} className="h-9 shrink-0">
          <Plus className="mr-1 size-3.5" /> Créer
        </Button>
      </form>
    </div>
  )
}
