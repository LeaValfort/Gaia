'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import {
  parseIngredientsMultiline,
  parseNombreEntier,
  PHASE_OPTIONS,
  TYPE_REPAS_OPTIONS,
} from '@/lib/alimentation/recette-perso-form'
import { insertRecetteManuelle } from '@/lib/db/recettes'
import type { Phase, TypeRepas } from '@/types'

interface FormRecettePersoRapideProps {
  userId: string
  onCree: () => void
  /** Pré-remplit la phase du cycle (ex. filtre actuel de l’onglet Recettes) */
  phaseInitiale?: Phase | null
}

export function FormRecettePersoRapide({ userId, onCree, phaseInitiale }: FormRecettePersoRapideProps) {
  const [erreur, setErreur] = useState<string | null>(null)
  const [ouvert, setOuvert] = useState(false)
  const [nom, setNom] = useState('')
  const [typeRepas, setTypeRepas] = useState<TypeRepas>('dejeuner')
  const [phase, setPhase] = useState<Phase | ''>(phaseInitiale ?? '')
  const [notes, setNotes] = useState('')
  const [ingredients, setIngredients] = useState('')

  useEffect(() => {
    setPhase(phaseInitiale ?? '')
  }, [phaseInitiale])
  const [kcal, setKcal] = useState('0')
  const [p, setP] = useState('0')
  const [g, setG] = useState('0')
  const [l, setL] = useState('0')
  const [temps, setTemps] = useState('')
  const [etapes, setEtapes] = useState('')

  const creer = async () => {
    setErreur(null)
    if (!nom.trim()) return
    const id = await insertRecetteManuelle(supabase, userId, {
      nom: nom.trim(),
      temps_min: temps ? parseNombreEntier(temps) : null,
      phase: phase === '' ? null : phase,
      type_repas: typeRepas,
      ingredients: parseIngredientsMultiline(ingredients),
      calories: parseNombreEntier(kcal),
      proteines: parseNombreEntier(p),
      glucides: parseNombreEntier(g),
      lipides: parseNombreEntier(l),
      instructions: etapes.trim() || null,
      raison: notes.trim() || null,
    })
    if (id) {
      setOuvert(false)
      setNom('')
      setIngredients('')
      setKcal('0')
      setP('0')
      setG('0')
      setL('0')
      setTemps('')
      setEtapes('')
      setNotes('')
      setPhase(phaseInitiale ?? '')
      onCree()
    } else {
      setErreur('Enregistrement impossible (droits Supabase ou colonnes manquantes).')
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={(o) => { setOuvert(o); if (o) setErreur(null) }}>
      <DialogTrigger
        type="button"
        className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-sm font-medium"
      >
        Nouvelle recette perso
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une recette</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Colle les infos depuis Yazio (ou ailleurs) : une portion = les macros ci-dessous ; ingrédients et étapes tels qu’affichés dans ton appli.
          </p>
          <div className="space-y-1">
            <Label className="text-xs">Nom</Label>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Bowl quinoa" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Type de repas</Label>
            <select
              className="w-full h-9 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm px-2"
              value={typeRepas}
              onChange={(e) => setTypeRepas(e.target.value as TypeRepas)}
            >
              {TYPE_REPAS_OPTIONS.map(({ v, l }) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Phase du cycle (optionnel)</Label>
            <select
              className="w-full h-9 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm px-2"
              value={phase}
              onChange={(e) => setPhase(e.target.value === '' ? '' : (e.target.value as Phase))}
            >
              <option value="">— Aucune —</option>
              {PHASE_OPTIONS.map(({ v, l }) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notes (ex. « Yazio », lien, date)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optionnel" className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ingrédients (ligne ou virgule) · macros ci-dessous = 1 portion</Label>
            <Textarea rows={4} value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder={'200 g quinoa cuit\n1 avocat'} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Calories (kcal) / portion</Label>
              <Input inputMode="numeric" value={kcal} onChange={(e) => setKcal(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Temps (min)</Label>
              <Input inputMode="numeric" value={temps} onChange={(e) => setTemps(e.target.value)} placeholder="—" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Protéines (g) / portion</Label>
              <Input inputMode="numeric" value={p} onChange={(e) => setP(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Glucides (g) / portion</Label>
              <Input inputMode="numeric" value={g} onChange={(e) => setG(e.target.value)} />
            </div>
            <div className="space-y-1 col-span-2">
              <Label className="text-xs">Lipides / matières grasses (g) / portion</Label>
              <Input inputMode="numeric" value={l} onChange={(e) => setL(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Étapes de préparation</Label>
            <Textarea rows={5} value={etapes} onChange={(e) => setEtapes(e.target.value)} placeholder={'1. …\n2. …'} />
          </div>
          {erreur ? <p className="text-xs text-red-600 dark:text-red-400">{erreur}</p> : null}
          <Button type="button" className="alimentation-btn-primaire w-full" onClick={() => void creer()} disabled={!nom.trim()}>
            Enregistrer la recette
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
