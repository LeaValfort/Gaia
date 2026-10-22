'use client'

import { useState } from 'react'
import { BookmarkPlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ModeleSeance } from '@/types'
import { cn } from '@/lib/utils'

interface BarreModelesSeanceProps {
  modeles: ModeleSeance[]
  /** Nom proposé par défaut pour un nouveau modèle (nom de la séance). */
  nomSuggere: string
  peutEnregistrer: boolean
  onCharger: (m: ModeleSeance) => void
  onEnregistrer: (nom: string) => Promise<boolean>
  onSupprimer: (id: string) => Promise<boolean>
}

/** Charger un modèle de séance libre, enregistrer la séance actuelle comme modèle. */
export function BarreModelesSeance({
  modeles,
  nomSuggere,
  peutEnregistrer,
  onCharger,
  onEnregistrer,
  onSupprimer,
}: BarreModelesSeanceProps) {
  const [saisie, setSaisie] = useState<string | null>(null)
  const [ch, setCh] = useState(false)

  async function valider() {
    if (!saisie?.trim()) return
    setCh(true)
    const ok = await onEnregistrer(saisie)
    setCh(false)
    if (ok) setSaisie(null)
  }

  return (
    <div className="space-y-2">
      {modeles.length ? (
        <div>
          <p className="mb-1 text-xs font-semibold text-amber-900/80 dark:text-amber-200/80">Mes modèles</p>
          <div className="flex flex-wrap gap-1.5">
            {modeles.map((m) => (
              <span
                key={m.id}
                className={cn(
                  'inline-flex items-center rounded-full border border-amber-300 bg-white text-sm',
                  'dark:border-amber-800 dark:bg-neutral-900'
                )}
              >
                <button type="button" className="py-1 pr-1 pl-3" onClick={() => onCharger(m)}>
                  {m.nom}
                </button>
                <button
                  type="button"
                  aria-label={`Supprimer le modèle ${m.nom}`}
                  className="p-1.5 text-neutral-400 hover:text-rose-600"
                  onClick={() => void onSupprimer(m.id)}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {saisie === null ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={!peutEnregistrer}
          onClick={() => setSaisie(nomSuggere)}
          className="text-amber-800 dark:text-amber-200"
        >
          <BookmarkPlus className="mr-1 size-4" /> Enregistrer comme modèle
        </Button>
      ) : (
        <div className="flex gap-2">
          <Input className="h-8 text-sm" value={saisie} placeholder="Nom du modèle" onChange={(e) => setSaisie(e.target.value)} />
          <Button type="button" size="sm" disabled={ch || !saisie.trim()} onClick={() => void valider()}>
            {ch ? '…' : 'OK'}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setSaisie(null)}>
            Annuler
          </Button>
        </div>
      )}
    </div>
  )
}
