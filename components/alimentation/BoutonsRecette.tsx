'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { addShoppingItem } from '@/lib/db/courses'
import { getLundiSemaine } from '@/lib/nutrition'
import { devinerAssignation } from '@/lib/data/courses'
import { parserIngredientCourses } from '@/lib/db/shopping-items'
import type { Recipe } from '@/types'

interface BoutonsRecetteProps {
  /** La recette est déjà en base (cette fiche vient toujours de la table recipes) */
  recette: Recipe
  userId: string
}

export function BoutonsRecette({ recette, userId }: BoutonsRecetteProps) {
  const [ajoutee, setAjoutee] = useState(false)
  const [chargement, setChargement] = useState(false)

  async function handleAjouterCourses() {
    if (!userId) return
    setChargement(true)
    const weekStart = getLundiSemaine(new Date())
    try {
      await Promise.all(
        recette.ingredients.map((ligne) => {
          const { nom, quantite } = parserIngredientCourses(ligne)
          const { rayon, enseigne } = devinerAssignation(nom)
          return addShoppingItem(supabase, userId, {
            week_start: weekStart,
            nom,
            quantite,
            enseigne,
            rayon,
            source: 'manuel',
          })
        })
      )
      setAjoutee(true)
    } catch {
      // erreur déjà loggée dans addShoppingItem
    } finally {
      setChargement(false)
    }
  }

  return (
    <Button onClick={handleAjouterCourses} disabled={ajoutee || chargement || !userId} className="w-full">
      {ajoutee ? (
        <><Check size={16} className="mr-2" />Ingrédients ajoutés</>
      ) : (
        <><ShoppingCart size={16} className="mr-2" />{chargement ? 'Ajout...' : 'Ajouter aux courses'}</>
      )}
    </Button>
  )
}
