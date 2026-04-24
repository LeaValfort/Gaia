'use client'

import { useState, useEffect } from 'react'
import { ChefHat, ExternalLink, Bookmark, ShoppingCart, Check, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  /** Sans filtre / affichage phase (mode sans cycle). */
  sansSuiviCycle?: boolean
}

const PHASES_OPTIONS: { id: Phase; label: string; style: string; styleActif: string }[] = [
  { id: 'menstruation', label: '🩸 Règles',      style: 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-300',           styleActif: 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900/40 dark:border-red-500 dark:text-red-200' },
  { id: 'folliculaire', label: '🌱 Folliculaire', style: 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300', styleActif: 'bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-900/40 dark:border-amber-500 dark:text-amber-200' },
  { id: 'ovulation',    label: '🌸 Ovulation',   style: 'border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-300', styleActif: 'bg-orange-100 border-orange-400 text-orange-800 dark:bg-orange-900/40 dark:border-orange-500 dark:text-orange-200' },
  { id: 'luteale',      label: '🍂 Lutéale',     style: 'border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300', styleActif: 'bg-purple-100 border-purple-400 text-purple-800 dark:bg-purple-900/40 dark:border-purple-500 dark:text-purple-200' },
]

// Sous-composant carte recette
function RecetteCard({ recette, userId, weekStart, phase }: {
  recette: RecetteSpoonacular; userId: string; weekStart: string; phase: Phase
}) {
  const [saved, setSaved] = useState(false)
  const [added, setAdded] = useState(false)

  async function handleSave() {
    await saveRecette(supabase, userId, {
      nom: recette.titre,
      ingredients: recette.ingredients.map((i) => `${i.quantite ?? ''} ${i.nom}`.trim()),
      temps_min: recette.tempsMin,
      phase,
      type_repas: null,
      raison: null,
      spoonacular_id: recette.id,
      calories:  recette.calories  ?? null,
      proteines: recette.proteines ?? null,
      glucides:  recette.glucides  ?? null,
      lipides:   recette.lipides   ?? null,
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
          <Badge variant="outline" className="text-xs text-orange-600 dark:text-orange-400">{recette.calories} kcal</Badge>
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

export function SuggestionsRecettes({
  phase: phaseInitiale,
  typeJournee,
  allergies,
  tempsMax,
  sansSuiviCycle,
}: SuggestionsRecettesProps) {
  const [phaseSelectee, setPhaseSelectee] = useState<Phase>(phaseInitiale)
  const [recettes, setRecettes] = useState<RecetteSpoonacular[]>([])
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [recherche, setRecherche] = useState('')
  const weekStart = getLundiSemaine(new Date())

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) setUserId(data.user.id) })
  }, [])

  async function chercher() {
    setChargement(true); setErreur(null)
    try {
      const offset = Math.floor(Math.random() * 80)
      const params = new URLSearchParams({
        typeJournee, allergies: allergies.join(','),
        tempsMax: String(tempsMax), offset: String(offset),
        phase: phaseSelectee,
      })
      if (recherche.trim()) params.set('query', recherche.trim())
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
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          <ChefHat size={16} />{' '}
          {sansSuiviCycle ? 'Recettes selon ton type de journée' : 'Recettes adaptées à ta phase'}
        </p>

        {!sansSuiviCycle ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-neutral-400">Phase du cycle · modifie si besoin</p>
            <div className="flex flex-wrap gap-2">
              {PHASES_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPhaseSelectee(opt.id)}
                  className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                    phaseSelectee === opt.id ? opt.styleActif : opt.style + ' bg-transparent hover:opacity-80'
                  }`}
                >
                  {opt.label}
                  {opt.id === phaseInitiale && phaseSelectee !== opt.id && (
                    <span className="ml-1 opacity-50">(auto)</span>
                  )}
                  {opt.id === phaseInitiale && phaseSelectee === opt.id && (
                    <span className="ml-1 opacity-60">✓ auto</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Filtre : type de journée ({typeJournee}), allergies, temps max {tempsMax} min.
          </p>
        )}

        <p className="text-xs text-neutral-400">Via Spoonacular · temps max {tempsMax} min</p>

        {/* Barre de recherche */}
        <div className="flex gap-2 mt-1">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Ingrédient ou mot-clé... (ex: salmon, lentils)"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && chercher()}
              className="pl-8 text-sm h-9"
            />
          </div>
          <Button onClick={chercher} disabled={chargement} size="sm" className="alimentation-btn-primaire shrink-0">
            {chargement ? 'Recherche...' : recettes.length ? 'Relancer' : 'Chercher'}
          </Button>
        </div>
      </div>

      {erreur && <p className="text-sm text-red-500 dark:text-red-400">{erreur}</p>}

      {chargement && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      )}

      {!chargement && recettes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {recettes.map((r) => (
            <RecetteCard
              key={r.id}
              recette={r}
              userId={userId}
              weekStart={weekStart}
              phase={sansSuiviCycle ? 'folliculaire' : phaseSelectee}
            />
          ))}
        </div>
      )}

      {!chargement && recettes.length === 0 && !erreur && (
        <p className="text-sm text-neutral-400 text-center py-8">
          Aucune recette trouvée pour ces critères. Essaie &ldquo;Nouvelles suggestions&rdquo; 🔄
        </p>
      )}
    </div>
  )
}
