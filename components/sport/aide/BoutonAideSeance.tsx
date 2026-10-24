'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Petit bouton « Nouveau programme avec Gaia » sous les onglets de programmes. */
export function BoutonAideSeance({ onClick, libelle = 'Nouveau programme avec Gaia' }: { onClick: () => void; libelle?: string }) {
  return (
    <Button type="button" size="sm" variant="ghost" onClick={onClick} className="self-start text-amber-700 hover:text-amber-800 dark:text-amber-300">
      <Sparkles className="mr-1.5 size-3.5" /> {libelle}
    </Button>
  )
}
