'use client'

import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AjoutSeancePlanning } from '@/components/parametres/AjoutSeancePlanning'
import { CarteEntreePlanning } from '@/components/parametres/CarteEntreePlanning'
import { libelleEntreePlanning } from '@/lib/planning-sport-jour'
import { cn } from '@/lib/utils'
import type { ModeleSeance, NouvellePlanningSportEntry, PlanningSportEntry, SportVariante, TypeVarianteSport } from '@/types'

export interface JourPlanningCalendrierProps {
  label: string
  entrees: PlanningSportEntry[]
  variantesParType: Record<TypeVarianteSport, SportVariante[]>
  modeles: ModeleSeance[]
  /** Formulaire d'ajout ouvert pour ce jour. */
  ouvert: boolean
  ajoutEnCours: boolean
  entreeEnCours: string | null
  onToggleAjout: () => void
  onAjouter: (entree: Omit<NouvellePlanningSportEntry, 'jour_semaine'>) => void
  onModifier: (entreeId: string, updates: Partial<NouvellePlanningSportEntry>) => void
  onSupprimer: (entreeId: string) => void
}

/** Résumé court d'une séance : « 🧘 Yoga · Flow doux · 1 sem/2 ». */
function resume(e: PlanningSportEntry, variantesParType: Record<TypeVarianteSport, SportVariante[]>, modeles: ModeleSeance[]): string {
  const { label, emoji } = libelleEntreePlanning(e)
  const prog =
    e.type_seance === 'autre'
      ? modeles.find((m) => m.id === e.modele_id)?.nom
      : variantesParType[e.type_seance].find((v) => v.id === e.variante_id)?.nom
  const freq = e.intervalle_semaines > 1 ? `1 sem/${e.intervalle_semaines}` : null
  return [`${emoji} ${label}`, prog, freq].filter(Boolean).join(' · ')
}

/** Une journée du planning, compacte (une ligne) ; on la déplie pour modifier ses séances. */
export function JourPlanningCalendrier({
  label,
  entrees,
  variantesParType,
  modeles,
  ouvert,
  ajoutEnCours,
  entreeEnCours,
  onToggleAjout,
  onAjouter,
  onModifier,
  onSupprimer,
}: JourPlanningCalendrierProps) {
  const [deplie, setDeplie] = useState(false)

  return (
    <div className="space-y-2 rounded-xl border border-neutral-200 px-3 py-2 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!entrees.length}
          onClick={() => setDeplie((d) => !d)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-default"
          aria-expanded={deplie}
        >
          <span className="w-20 shrink-0 text-sm font-semibold text-neutral-800 dark:text-neutral-100">{label}</span>
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {entrees.length ? entrees.map((e) => resume(e, variantesParType, modeles)).join('  +  ') : 'Repos'}
          </span>
          {entrees.length ? (
            <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', deplie && 'rotate-180')} aria-hidden />
          ) : null}
        </button>
        <Button type="button" size="icon-sm" variant="ghost" onClick={onToggleAjout} aria-label={`Ajouter une séance le ${label}`}>
          <Plus className="size-4" />
        </Button>
      </div>

      {deplie && entrees.length ? (
        <div className="space-y-2">
          {entrees.map((entree) => (
            <CarteEntreePlanning
              key={entree.id}
              entree={entree}
              variantesDisponibles={entree.type_seance === 'autre' ? [] : variantesParType[entree.type_seance]}
              modelesDisponibles={entree.type_seance === 'autre' ? modeles.filter((m) => m.sport_type === entree.activite_type) : []}
              enChargement={entreeEnCours === entree.id}
              onModifier={(u) => onModifier(entree.id, u)}
              onSupprimer={() => onSupprimer(entree.id)}
            />
          ))}
        </div>
      ) : null}

      {ouvert ? (
        <AjoutSeancePlanning
          variantesParType={variantesParType}
          modeles={modeles}
          enCours={ajoutEnCours}
          onValider={onAjouter}
          onAnnuler={onToggleAjout}
        />
      ) : null}
    </div>
  )
}
