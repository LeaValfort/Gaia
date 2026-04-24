'use client'

import { useState } from 'react'
import { Bookmark, ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { saveRecette } from '@/lib/db/nutrition'
import { addShoppingItem } from '@/lib/db/courses'
import { getLundiSemaine } from '@/lib/nutrition'
import { devinerAssignation } from '@/lib/data/courses'
import type { RecetteDetail } from '@/types'

interface BoutonsRecetteProps {
  recette: RecetteDetail
  userId: string
}

export function BoutonsRecette({ recette, userId }: BoutonsRecetteProps) {
  const [sauvegardee, setSauvegardee] = useState(false)
  const [ajoutee, setAjoutee] = useState(false)
  const [chargementSave, setChargementSave] = useState(false)
  const [chargementCourses, setChargementCourses] = useState(false)

  async function handleSauvegarder() {
    if (!userId) return
    setChargementSave(true)
    try {
      await saveRecette(supabase, userId, {
        nom: recette.titre,
        ingredients: recette.ingredients.map((i) => `${i.quantite ?? ''} ${i.nom}`.trim()),
        temps_min: recette.tempsMin,
        phase: null,
        type_repas: null,
        raison: null,
        spoonacular_id: recette.id,
        calories:  recette.calories  || null,
        proteines: recette.proteines || null,
        glucides:  recette.glucides  || null,
        lipides:   recette.lipides   || null,
      })
      setSauvegardee(true)
    } catch {
      // erreur déjà loggée dans saveRecette
    } finally {
      setChargementSave(false)
    }
  }

  async function handleAjouterCourses() {
    if (!userId) return
    setChargementCourses(true)
    const weekStart = getLundiSemaine(new Date())
    try {
      await Promise.all(
        recette.ingredients.map((ing) => {
          const { rayon, enseigne } = devinerAssignation(ing.nom)
          return addShoppingItem(supabase, userId, {
            week_start: weekStart,
            nom: ing.nom,
            quantite: ing.quantite,
            enseigne,
            rayon,
            source: 'spoonacular',
          })
        })
      )
      setAjoutee(true)
    } catch {
      // erreur déjà loggée dans addShoppingItem
    } finally {
      setChargementCourses(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={handleSauvegarder}
        disabled={sauvegardee || chargementSave || !userId}
        className="flex-1"
      >
        {sauvegardee ? (
          <><Check size={16} className="mr-2" />Recette sauvegardée</>
        ) : (
          <><Bookmark size={16} className="mr-2" />{chargementSave ? 'Sauvegarde...' : 'Sauvegarder cette recette'}</>
        )}
      </Button>
      <Button
        variant="outline"
        onClick={handleAjouterCourses}
        disabled={ajoutee || chargementCourses || !userId}
        className="flex-1"
      >
        {ajoutee ? (
          <><Check size={16} className="mr-2" />Ingrédients ajoutés</>
        ) : (
          <><ShoppingCart size={16} className="mr-2" />{chargementCourses ? 'Ajout...' : 'Ajouter aux courses'}</>
        )}
      </Button>
    </div>
  )
}
