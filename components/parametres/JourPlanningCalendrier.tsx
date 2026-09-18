'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CarteEntreePlanning } from '@/components/parametres/CarteEntreePlanning'
import { LABELS_PLANNING } from '@/lib/planning-sport'
import type { PlanningSportEntry, SportVariante, TypeActivite, TypeVarianteSport } from '@/types'

const TYPES_AJOUT: { id: PlanningSportEntry['type_seance']; label: string }[] = [
  { id: 'muscu_full', label: LABELS_PLANNING.muscu_full.label },
  { id: 'muscu_upper', label: LABELS_PLANNING.muscu_upper.label },
  { id: 'yoga', label: LABELS_PLANNING.yoga.label },
  { id: 'natation', label: LABELS_PLANNING.natation.label },
  { id: 'autre', label: LABELS_PLANNING.autre.label },
]

export interface JourPlanningCalendrierProps {
  label: string
  entrees: PlanningSportEntry[]
  variantesParType: Record<TypeVarianteSport, SportVariante[]>
  ouvert: boolean
  entreeEnCours: string | null
  onToggleAjout: () => void
  onAjouter: (type: PlanningSportEntry['type_seance']) => void
  onChangerVariante: (entreeId: string, varianteId: string | null) => void
  onChangerActivite: (entreeId: string, activite: TypeActivite | null) => void
  onChangerRecurrence: (entreeId: string, intervalleSemaines: number, decalageSemaine: number) => void
  onSupprimer: (entreeId: string) => void
}

/** Une journée du calendrier : ses séances planifiées + le bouton pour en ajouter une. */
export function JourPlanningCalendrier({
  label,
  entrees,
  variantesParType,
  ouvert,
  entreeEnCours,
  onToggleAjout,
  onAjouter,
  onChangerVariante,
  onChangerActivite,
  onChangerRecurrence,
  onSupprimer,
}: JourPlanningCalendrierProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{label}</p>
        <Button type="button" size="sm" variant="ghost" onClick={onToggleAjout}>
          <Plus className="mr-1 size-3.5" /> Ajouter
        </Button>
      </div>

      {entrees.length === 0 ? (
        <p className="pl-1 text-xs text-muted-foreground">Repos</p>
      ) : (
        <div className="space-y-2">
          {entrees.map((entree) => (
            <CarteEntreePlanning
              key={entree.id}
              entree={entree}
              variantesDisponibles={
                entree.type_seance === 'autre' ? [] : variantesParType[entree.type_seance as TypeVarianteSport]
              }
              enChargement={entreeEnCours === entree.id}
              onChangerVariante={(id) => onChangerVariante(entree.id, id)}
              onChangerActivite={(a) => onChangerActivite(entree.id, a)}
              onChangerRecurrence={(i, d) => onChangerRecurrence(entree.id, i, d)}
              onSupprimer={() => onSupprimer(entree.id)}
            />
          ))}
        </div>
      )}

      {ouvert ? (
        <div className="flex flex-wrap gap-1.5 pl-1">
          {TYPES_AJOUT.map(({ id, label: lib }) => (
            <button
              key={id}
              type="button"
              onClick={() => onAjouter(id)}
              className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
            >
              {lib}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
