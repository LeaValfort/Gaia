'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormulaireEnseigne } from '@/components/parametres/FormulaireEnseigne'
import { supabase } from '@/lib/supabase'
import { deleteEnseigne } from '@/lib/db/enseignes'
import type { EnseigneDB } from '@/types'

interface SectionEnseignesProps {
  userId: string
  enseignesInitiales: EnseigneDB[]
}

/** Gestion des enseignes de courses (par défaut + personnalisées) et de leurs règles de rangement. */
export function SectionEnseignes({ userId, enseignesInitiales }: SectionEnseignesProps) {
  const router = useRouter()
  const [enseignes, setEnseignes] = useState<EnseigneDB[]>(enseignesInitiales)
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [enseigneEnEdition, setEnseigneEnEdition] = useState<EnseigneDB | null>(null)

  const ordreActuelMax = enseignes.reduce((max, e) => Math.max(max, e.ordre), -1)

  function ouvrirCreation() {
    setEnseigneEnEdition(null)
    setFormulaireOuvert(true)
  }

  function ouvrirEdition(enseigne: EnseigneDB) {
    setEnseigneEnEdition(enseigne)
    setFormulaireOuvert(true)
  }

  function handleEnregistre(enseigne: EnseigneDB) {
    setEnseignes((prev) => {
      const existe = prev.some((e) => e.id === enseigne.id)
      return existe ? prev.map((e) => (e.id === enseigne.id ? enseigne : e)) : [...prev, enseigne]
    })
    setFormulaireOuvert(false)
    router.refresh()
  }

  async function supprimer(enseigne: EnseigneDB) {
    const ok = window.confirm(`Supprimer l'enseigne « ${enseigne.label} » ?`)
    if (!ok) return

    const resultat = await deleteEnseigne(supabase, userId, enseigne.id)
    if (resultat.ok) {
      setEnseignes((prev) => prev.filter((e) => e.id !== enseigne.id))
      toast.success('Enseigne supprimée')
      router.refresh()
    } else if (resultat.nbArticlesBloquants > 0) {
      toast.error(
        `Impossible de supprimer : ${resultat.nbArticlesBloquants} article${resultat.nbArticlesBloquants > 1 ? 's sont' : ' est'} encore rangé${resultat.nbArticlesBloquants > 1 ? 's' : ''} ici. Déplace-les d'abord.`
      )
    } else {
      toast.error('Impossible de supprimer l’enseigne. Réessaie.')
    }
  }

  return (
    <div className="space-y-4">
      {enseignes.length > 0 ? (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {enseignes.map((enseigne) => (
            <li key={enseigne.id} className="flex items-center gap-3 py-3 first:pt-0">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${enseigne.couleur}`}>
                {enseigne.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-50">{enseigne.label}</p>
                {enseigne.rayons.length > 0 || enseigne.mots_cles.length > 0 ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {enseigne.rayons.length} rayon{enseigne.rayons.length > 1 ? 's' : ''}
                    {enseigne.mots_cles.length > 0 ? ` · ${enseigne.mots_cles.join(', ')}` : ''}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => ouvrirEdition(enseigne)}
                aria-label="Modifier l'enseigne"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => void supprimer(enseigne)}
                aria-label="Supprimer l'enseigne"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <Button type="button" variant="outline" size="sm" onClick={ouvrirCreation} className="gap-1.5">
        <Plus className="size-4" />
        Ajouter une enseigne
      </Button>

      {formulaireOuvert ? (
        <FormulaireEnseigne
          enseigne={enseigneEnEdition}
          userId={userId}
          ordreActuelMax={ordreActuelMax}
          onEnregistre={handleEnregistre}
          onFermer={() => setFormulaireOuvert(false)}
        />
      ) : null}
    </div>
  )
}
