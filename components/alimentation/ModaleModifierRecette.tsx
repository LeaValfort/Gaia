'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { updateRecette } from '@/lib/db/recettes'
import { uploaderPhotoRecette } from '@/lib/db/recette-photo'
import type { Phase, Recipe, TypeRepas } from '@/types'

interface ModaleModifierRecetteProps {
  recette: Recipe
  userId: string
  ouvert: boolean
  onOuvertChange: (ouvert: boolean) => void
}

/** Formulaire d'édition complet d'une recette sauvegardée : tous les champs + une photo
 *  optionnelle (uploadée dans Supabase Storage). Sauvegarde via updateRecette puis
 *  rafraîchit la fiche recette (server component) via router.refresh(). */
export function ModaleModifierRecette({ recette, userId, ouvert, onOuvertChange }: ModaleModifierRecetteProps) {
  const router = useRouter()

  const [nom, setNom] = useState(recette.nom)
  const [typeRepas, setTypeRepas] = useState<TypeRepas>(recette.type_repas ?? 'dejeuner')
  const [phase, setPhase] = useState<Phase | ''>(recette.phase ?? '')
  const [notes, setNotes] = useState(recette.raison ?? '')
  const [ingredients, setIngredients] = useState(recette.ingredients.join('\n'))
  const [kcal, setKcal] = useState(String(recette.calories ?? 0))
  const [p, setP] = useState(String(recette.proteines ?? 0))
  const [g, setG] = useState(String(recette.glucides ?? 0))
  const [l, setL] = useState(String(recette.lipides ?? 0))
  const [temps, setTemps] = useState(recette.temps_min ? String(recette.temps_min) : '')
  const [etapes, setEtapes] = useState(recette.instructions ?? '')
  const [fichierPhoto, setFichierPhoto] = useState<File | null>(null)
  const [apercuPhoto, setApercuPhoto] = useState<string | null>(recette.image_url ?? null)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  function handlePhotoChange(fichier: File | null) {
    setFichierPhoto(fichier)
    if (fichier) setApercuPhoto(URL.createObjectURL(fichier))
  }

  async function enregistrer() {
    if (!nom.trim()) return
    setChargement(true)
    setErreur(null)
    try {
      let imageUrl = recette.image_url ?? null
      if (fichierPhoto) {
        const url = await uploaderPhotoRecette(supabase, userId, recette.id, fichierPhoto)
        if (!url) {
          setErreur("La photo n'a pas pu être envoyée, le reste a été enregistré sans elle.")
        } else {
          imageUrl = url
        }
      }
      const succes = await updateRecette(supabase, userId, recette.id, {
        nom: nom.trim(),
        ingredients: parseIngredientsMultiline(ingredients),
        temps_min: temps ? parseNombreEntier(temps) : null,
        phase: phase === '' ? null : phase,
        type_repas: typeRepas,
        calories: parseNombreEntier(kcal),
        proteines: parseNombreEntier(p),
        glucides: parseNombreEntier(g),
        lipides: parseNombreEntier(l),
        instructions: etapes.trim() || null,
        raison: notes.trim() || null,
        image_url: imageUrl,
      })
      if (!succes) {
        setErreur('Enregistrement impossible (droits Supabase ou colonnes manquantes).')
        return
      }
      onOuvertChange(false)
      router.refresh()
    } finally {
      setChargement(false)
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={onOuvertChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la recette</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <Label className="text-xs">Photo</Label>
            {apercuPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={apercuPhoto} alt="" className="h-32 w-full object-cover rounded-lg mb-1" />
            ) : null}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-neutral-600 dark:text-neutral-400 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:px-2 file:py-1 file:text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nom</Label>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} />
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
            <Label className="text-xs">Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ingrédients (ligne ou virgule)</Label>
            <Textarea rows={4} value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
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
              <Label className="text-xs">Lipides (g) / portion</Label>
              <Input inputMode="numeric" value={l} onChange={(e) => setL(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Étapes de préparation</Label>
            <Textarea rows={5} value={etapes} onChange={(e) => setEtapes(e.target.value)} />
          </div>
          {erreur ? <p className="text-xs text-red-600 dark:text-red-400">{erreur}</p> : null}
          <Button
            type="button"
            className="alimentation-btn-primaire w-full"
            onClick={() => void enregistrer()}
            disabled={!nom.trim() || chargement}
          >
            {chargement ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
