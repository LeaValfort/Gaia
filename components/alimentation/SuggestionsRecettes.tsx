'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChefHat, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { getLundiSemaine } from '@/lib/nutrition'
import { repasParDefautSelonHeure } from '@/lib/repartitionRepas'
import { RecettePersoCard } from '@/components/alimentation/RecettePersoCard'
import { RecetteGenereeCard } from '@/components/alimentation/RecetteGenereeCard'
import { SelecteurPhaseRecettes } from '@/components/alimentation/SelecteurPhaseRecettes'
import { SelecteurRepasRecettes } from '@/components/alimentation/SelecteurRepasRecettes'
import type { Phase, TypeJournee, TypeRepas, Recipe, RecetteGeneree } from '@/types'

interface SuggestionsRecettesProps {
  phase: Phase
  typeJournee: TypeJournee
  allergies: string[]
  tempsMax: number
  /** Sans filtre / affichage phase (mode sans cycle). */
  sansSuiviCycle?: boolean
}

export function SuggestionsRecettes({
  phase: phaseInitiale,
  typeJournee,
  allergies,
  tempsMax,
  sansSuiviCycle,
}: SuggestionsRecettesProps) {
  const [phaseSelectee, setPhaseSelectee] = useState<Phase>(phaseInitiale)
  const [repasSelectionne, setRepasSelectionne] = useState<TypeRepas>(() => repasParDefautSelonHeure())
  const [avecIA, setAvecIA] = useState(true)
  const [perso, setPerso] = useState<Recipe[]>([])
  const [generees, setGenerees] = useState<RecetteGeneree[]>([])
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [recherche, setRecherche] = useState('')
  const rechercheRef = useRef(recherche)
  rechercheRef.current = recherche
  const weekStart = getLundiSemaine(new Date())

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) setUserId(data.user.id) })
  }, [])

  const chercher = useCallback(
    async (queryText?: string) => {
      setChargement(true)
      setErreur(null)
      try {
        const params = new URLSearchParams({
          typeJournee,
          typeRepas: repasSelectionne,
          allergies: allergies.join(','),
          tempsMax: String(tempsMax),
          phase: phaseSelectee,
          avecIA: String(avecIA),
        })
        const q = (queryText ?? rechercheRef.current).trim()
        if (q) params.set('query', q)
        const rep = await fetch(`/api/recettes/generer?${params}`)
        if (!rep.ok) throw new Error('Erreur serveur')
        const data = (await rep.json()) as { perso?: Recipe[]; generees?: RecetteGeneree[]; erreur?: string }
        if (data.erreur) throw new Error(data.erreur)
        setPerso(data.perso ?? [])
        setGenerees(data.generees ?? [])
      } catch (e) {
        setErreur(e instanceof Error ? e.message : 'Erreur lors de la recherche')
      } finally {
        setChargement(false)
      }
    },
    [typeJournee, allergies, tempsMax, phaseSelectee, repasSelectionne, avecIA]
  )

  useEffect(() => {
    void chercher('')
  }, [chercher])

  const total = perso.length + generees.length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          <ChefHat size={16} />{' '}
          {sansSuiviCycle ? 'Recettes selon ton type de journée' : 'Recettes adaptées à ta phase'}
        </p>

        {!sansSuiviCycle ? (
          <SelecteurPhaseRecettes phaseInitiale={phaseInitiale} phaseSelectee={phaseSelectee} onChange={setPhaseSelectee} />
        ) : (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Filtre : type de journée ({typeJournee}), allergies, temps max {tempsMax} min.
          </p>
        )}

        <SelecteurRepasRecettes repasSelectionne={repasSelectionne} onChange={setRepasSelectionne} />

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <Label htmlFor="avec-ia" className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">
            {avecIA
              ? 'Générer des recettes par IA · macros calculées via CIQUAL'
              : 'IA désactivée · recherche uniquement dans tes recettes'}
          </Label>
          <Switch id="avec-ia" size="sm" checked={avecIA} onCheckedChange={setAvecIA} />
        </div>

        <div className="flex gap-2 mt-1">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Ingrédient ou mot-clé… (ex. saumon, lentilles)"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void chercher()}
              className="pl-8 text-sm h-9"
              aria-label="Rechercher une recette par ingrédient ou mot-clé"
            />
          </div>
          <Button onClick={() => void chercher()} disabled={chargement} size="sm" className="alimentation-btn-primaire shrink-0">
            {chargement ? 'Recherche...' : total ? 'Relancer' : 'Chercher'}
          </Button>
        </div>
      </div>

      {erreur && <p className="text-sm text-red-500 dark:text-red-400">{erreur}</p>}

      {chargement && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      )}

      {!chargement && total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {perso.map((r) => <RecettePersoCard key={r.id} recette={r} />)}
          {generees.map((r, i) => (
            <RecetteGenereeCard key={`${r.nom}-${i}`} recette={r} userId={userId} weekStart={weekStart} />
          ))}
        </div>
      )}

      {!chargement && total === 0 && !erreur && (
        <p className="text-sm text-neutral-400 text-center py-8">
          Aucune recette trouvée pour ces critères. Essaie une autre recherche 🔄
        </p>
      )}
    </div>
  )
}
