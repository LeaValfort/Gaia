'use client'

import { useState, useEffect } from 'react'
import { ChefHat, ExternalLink, Bookmark, ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { saveRecette } from '@/lib/db/nutrition'
import { addShoppingItem } from '@/lib/db/courses'
import { getLundiSemaine } from '@/lib/nutrition'
import { devinerAssignation } from '@/lib/data/courses'
import type { Phase, TypeJournee, RecetteSpoonacular } from '@/types'

interface SuggestionsRecettesProps {
  phase: Phase
  typeJournee: TypeJournee
  allergies: string[]
  tempsMax: number
}

// Sous-composant carte recette
function RecetteCard({ recette, userId, weekStart }: {
  recette: RecetteSpoonacular; userId: string; weekStart: string
}) {
  const [saved, setSaved] = useState(false)
  const [added, setAdded] = useState(false)

  async function handleSave() {
    await saveRecette(supabase, userId, {
      nom: recette.titre,
      ingredients: recette.ingredients.map((i) => `${i.quantite ?? ''} ${i.nom}`.trim()),
      temps_min: recette.tempsMin,
      phase: null,
      type_repas: null,
      raison: null,
      spoonacular_id: recette.id,
    })
    setSaved(true)
  }

  async function handleAddCourses() {
    await Promise.all(recette.ingredients.map((ing) => {
      const { rayon, enseigne } = devinerAssignation(ing.nom)
      return addShoppingItem(supabase, userId, { week_start: weekStart, nom: ing.nom, quantite: ing.quantite, enseigne, rayon, source: 'spoonacular' })
    }))
    setAdded(true)
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col">
      {recette.image && (
        <img src={recette.image} alt={recette.titre} className="w-full h-36 object-cover" />
      )}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-50 leading-snug">{recette.titre}</p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">{recette.tempsMin} min</Badge>
          <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400">{recette.proteines}g P</Badge>
          <Badge variant="outline" className="text-xs text-amber-600 dark:text-amber-400">{recette.glucides}g G</Badge>
          <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">{recette.lipides}g L</Badge>
        </div>
        <div className="flex gap-1.5 flex-wrap mt-auto pt-1">
          <Button size="sm" variant="outline" onClick={handleSave} disabled={saved} className="text-xs h-7 px-2">
            {saved ? <><Check size={11} className="mr-1" />Sauvée</> : <><Bookmark size={11} className="mr-1" />Sauvegarder</>}
          </Button>
          <Button size="sm" variant="outline" onClick={handleAddCourses} disabled={added} className="text-xs h-7 px-2">
            {added ? <><Check size={11} className="mr-1" />Ajoutés</> : <><ShoppingCart size={11} className="mr-1" />Courses</>}
          </Button>
          <a href={`/alimentation/recette/${recette.id}`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
              <ExternalLink size={11} className="mr-1" />Voir
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}

export function SuggestionsRecettes({ phase, typeJournee, allergies, tempsMax }: SuggestionsRecettesProps) {
  const [recettes, setRecettes] = useState<RecetteSpoonacular[]>([])
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const weekStart = getLundiSemaine(new Date())

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) setUserId(data.user.id) })
  }, [])

  async function chercher() {
    setChargement(true); setErreur(null)
    try {
      const params = new URLSearchParams({ typeJournee, allergies: allergies.join(','), tempsMax: String(tempsMax) })
      const rep = await fetch(`/api/spoonacular?${params}`)
      if (!rep.ok) throw new Error('Erreur serveur')
      const { recettes: data, erreur: err } = await rep.json()
      if (err) throw new Error(err)
      setRecettes(data ?? [])
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur lors de la recherche')
    } finally { setChargement(false) }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <ChefHat size={16} /> Recettes adaptées à ta phase
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">Via Spoonacular · temps max {tempsMax} min</p>
        </div>
        <Button onClick={chercher} disabled={chargement} size="sm">
          {chargement ? 'Recherche...' : recettes.length ? 'Relancer' : 'Trouver des recettes'}
        </Button>
      </div>

      {erreur && <p className="text-sm text-red-500 dark:text-red-400">{erreur}</p>}

      {chargement && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      )}

      {!chargement && recettes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {recettes.map((r) => <RecetteCard key={r.id} recette={r} userId={userId} weekStart={weekStart} />)}
        </div>
      )}

      {!chargement && recettes.length === 0 && (
        <p className="text-sm text-neutral-400 text-center py-8">
          Clique sur &ldquo;Trouver des recettes&rdquo; pour des idées adaptées à ta phase {phase}.
        </p>
      )}
    </div>
  )
}
