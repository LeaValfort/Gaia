'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { estIngredientBasique } from '@/lib/data/ingredients-basiques'

interface IngredientAConfirmer {
  nom: string
  quantite: string | null
}

interface DialogueAjoutCoursesProps<T extends IngredientAConfirmer> {
  ouvert: boolean
  onOuvertChange: (ouvert: boolean) => void
  ingredients: T[]
  /** Reçoit uniquement les ingrédients à ajouter (ceux décochés "déjà en stock" exclus). */
  onConfirmer: (aAjouter: T[]) => void
}

/** Avant d'ajouter les ingrédients d'une recette aux courses, propose de cocher
 *  rapidement ce qu'on a déjà : les basiques (épices, huile...) sont pré-cochés,
 *  mais tout ingrédient reste décochable/cochable, y compris ceux qui seraient
 *  sinon ajoutés automatiquement. Rien n'est mémorisé : la question est reposée
 *  à chaque ajout (choix de Léa, 20/09, Chantier 5). */
export function DialogueAjoutCourses<T extends IngredientAConfirmer>({
  ouvert,
  onOuvertChange,
  ingredients,
  onConfirmer,
}: DialogueAjoutCoursesProps<T>) {
  const basiques = ingredients.filter((ing) => estIngredientBasique(ing.nom))
  const autres = ingredients.filter((ing) => !estIngredientBasique(ing.nom))

  const [dejaEnStock, setDejaEnStock] = useState<Set<string>>(new Set())

  // Pré-coche les basiques détectés à chaque nouvelle ouverture de la modale.
  useEffect(() => {
    if (ouvert) setDejaEnStock(new Set(basiques.map((b) => b.nom)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouvert])

  function toggle(nom: string) {
    setDejaEnStock((prev) => {
      const next = new Set(prev)
      if (next.has(nom)) next.delete(nom)
      else next.add(nom)
      return next
    })
  }

  function toutCocher() {
    setDejaEnStock(new Set(ingredients.map((ing) => ing.nom)))
  }

  function toutDecocher() {
    setDejaEnStock(new Set())
  }

  function confirmer() {
    onOuvertChange(false)
    onConfirmer(ingredients.filter((ing) => !dejaEnStock.has(ing.nom)))
  }

  function ligneIngredient(ing: T, idPrefix: string, idx: number) {
    const id = `${idPrefix}-${idx}`
    return (
      <div key={ing.nom} className="flex items-center gap-2">
        <Checkbox id={id} checked={dejaEnStock.has(ing.nom)} onCheckedChange={() => toggle(ing.nom)} />
        <label htmlFor={id} className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
          {ing.nom}
        </label>
      </div>
    )
  }

  return (
    <Dialog open={ouvert} onOpenChange={onOuvertChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter aux courses</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 -mb-1">
          <button type="button" onClick={toutCocher} className="text-xs text-violet-600 dark:text-violet-400 hover:underline">
            Tout cocher (j&apos;ai déjà tout)
          </button>
          <button type="button" onClick={toutDecocher} className="text-xs text-neutral-400 hover:underline">
            Tout décocher
          </button>
        </div>

        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {basiques.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">Tu as sûrement déjà ça ?</p>
              <div className="flex flex-col gap-2">
                {basiques.map((ing, idx) => ligneIngredient(ing, 'basique', idx))}
              </div>
            </div>
          ) : null}

          {autres.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">Seront ajoutés à la liste</p>
              <div className="flex flex-col gap-2">
                {autres.map((ing, idx) => ligneIngredient(ing, 'autre', idx))}
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button onClick={confirmer} className="w-full">
            <ShoppingCart size={14} className="mr-1.5" />Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
