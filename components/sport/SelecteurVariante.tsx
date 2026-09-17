'use client'

import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SportVariante } from '@/types'
import { cn } from '@/lib/utils'

/** Onglet fixe (non supprimable) affiché avant les variantes, ex. les niveaux du catalogue natation. */
export interface OngletFixeVariante {
  id: string
  label: string
}

/** Id de l'onglet fixe "Par défaut" utilisé quand l'appelant ne fournit pas d'onglets personnalisés. */
export const ONGLET_DEFAUT_ID = '__defaut__'
const ONGLETS_DEFAUT: OngletFixeVariante[] = [{ id: ONGLET_DEFAUT_ID, label: 'Par défaut' }]

export interface SelecteurVarianteProps {
  variantes: SportVariante[]
  /** Id de l'onglet actif : soit l'id d'une variante, soit l'id d'un onglet fixe (ex. "niveau:3"). */
  activeId: string
  onSelect: (id: string) => void
  onCreer: (nom: string) => void
  onRenommer: (id: string, nom: string) => void
  onSupprimer: (id: string) => void
  /** Onglets fixes affichés avant les variantes (ex. niveaux 1-5). Par défaut un seul onglet "Par défaut". */
  onglets?: OngletFixeVariante[]
  couleurActif?: string
}

const COULEUR_DEFAUT = 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
const COULEUR_INACTIF = 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'

/**
 * Bande d'onglets pour choisir / créer / renommer / supprimer une variante
 * nommée d'une séance (muscu, natation, yoga), avec en plus d'éventuels
 * onglets fixes non supprimables (ex. les 5 niveaux du catalogue natation)
 * affichés dans la même rangée. Composant purement contrôlé : toute la
 * persistance est gérée par le parent, jamais ici (voir .cursorrules).
 */
export function SelecteurVariante({
  variantes,
  activeId,
  onSelect,
  onCreer,
  onRenommer,
  onSupprimer,
  onglets = ONGLETS_DEFAUT,
  couleurActif = COULEUR_DEFAUT,
}: SelecteurVarianteProps) {
  const [creation, setCreation] = useState(false)
  const [renommage, setRenommage] = useState<string | null>(null)
  const [texte, setTexte] = useState('')

  function validerCreation() {
    const nom = texte.trim()
    if (nom) onCreer(nom)
    setCreation(false)
    setTexte('')
  }

  function validerRenommage(id: string) {
    const nom = texte.trim()
    if (nom) onRenommer(id, nom)
    setRenommage(null)
    setTexte('')
  }

  const actif = variantes.find((v) => v.id === activeId) ?? null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {onglets.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onSelect(o.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              activeId === o.id ? couleurActif : COULEUR_INACTIF
            )}
          >
            {o.label}
          </button>
        ))}
        {variantes.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              activeId === v.id ? couleurActif : COULEUR_INACTIF
            )}
          >
            {v.nom}
          </button>
        ))}
        {!creation ? (
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="h-7 w-7 rounded-full"
            onClick={() => {
              setCreation(true)
              setTexte('')
            }}
          >
            <Plus className="size-3.5" />
          </Button>
        ) : null}
      </div>

      {creation ? (
        <div className="flex items-center gap-1.5">
          <Input
            autoFocus
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Nom de la variante…"
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && validerCreation()}
          />
          <Button type="button" size="icon-sm" className="h-8 w-8" onClick={validerCreation}>
            <Check className="size-4" />
          </Button>
          <Button type="button" size="icon-sm" variant="secondary" className="h-8 w-8" onClick={() => setCreation(false)}>
            <X className="size-4" />
          </Button>
        </div>
      ) : null}

      {actif && renommage !== actif.id ? (
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <button
            type="button"
            className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-200"
            onClick={() => {
              setRenommage(actif.id)
              setTexte(actif.nom)
            }}
          >
            <Pencil className="size-3" /> Renommer
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 hover:text-rose-600"
            onClick={() => onSupprimer(actif.id)}
          >
            <Trash2 className="size-3" /> Supprimer
          </button>
        </div>
      ) : null}

      {actif && renommage === actif.id ? (
        <div className="flex items-center gap-1.5">
          <Input
            autoFocus
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && validerRenommage(actif.id)}
          />
          <Button type="button" size="icon-sm" className="h-8 w-8" onClick={() => validerRenommage(actif.id)}>
            <Check className="size-4" />
          </Button>
          <Button type="button" size="icon-sm" variant="secondary" className="h-8 w-8" onClick={() => setRenommage(null)}>
            <X className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
