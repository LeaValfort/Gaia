'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SelecteurRecurrence } from '@/components/parametres/SelecteurRecurrence'
import { libelleEntreePlanning } from '@/lib/planning-sport-jour'
import { cn } from '@/lib/utils'
import type { ModeleSeance, NouvellePlanningSportEntry, PlanningSportEntry, SportVariante } from '@/types'

const PILL = 'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors'
const PILL_ACTIVE = 'border-amber-600 bg-amber-600 text-white'
const PILL_INACTIF = 'border-neutral-200 text-muted-foreground hover:border-neutral-300 dark:border-neutral-700'

export interface CarteEntreePlanningProps {
  entree: PlanningSportEntry
  /** Programmes (muscu / natation / yoga). */
  variantesDisponibles: SportVariante[]
  /** Modèles de séance enregistrés pour ce sport (autres sports). */
  modelesDisponibles: ModeleSeance[]
  enChargement?: boolean
  onModifier: (updates: Partial<NouvellePlanningSportEntry>) => void
  onSupprimer: () => void
}

/**
 * Une séance planifiée : le sport est figé à la création ; programme (ou modèle)
 * et récurrence restent modifiables. « Par défaut » = profil Gaia du sport,
 * suffisant pour le calcul des macros.
 */
export function CarteEntreePlanning({ entree, variantesDisponibles, modelesDisponibles, enChargement, onModifier, onSupprimer }: CarteEntreePlanningProps) {
  const { label, emoji } = libelleEntreePlanning(entree)
  const estAutre = entree.type_seance === 'autre'
  const options = estAutre
    ? modelesDisponibles.map((m) => ({ id: m.id, nom: m.nom }))
    : variantesDisponibles.map((v) => ({ id: v.id, nom: v.lieu === 'maison' || v.lieu === 'salle' ? `${v.nom} (${v.lieu})` : v.nom }))
  const actuel = estAutre ? entree.modele_id : entree.variante_id
  const changer = (id: string | null) => onModifier(estAutre ? { modele_id: id } : { variante_id: id })

  return (
    <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
          {emoji} {label}
        </span>
        <div className="flex items-center gap-2">
          {enChargement ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden /> : null}
          <Button type="button" size="icon-sm" variant="ghost" disabled={enChargement} onClick={onSupprimer} aria-label="Supprimer la séance">
            <Trash2 className="size-3.5 text-muted-foreground hover:text-rose-600" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button type="button" disabled={enChargement} onClick={() => changer(null)} className={cn(PILL, actuel == null ? PILL_ACTIVE : PILL_INACTIF)}>
          Séance libre (choisie le jour même)
        </button>
        {options.map((o) => (
          <button key={o.id} type="button" disabled={enChargement} onClick={() => changer(o.id)} className={cn(PILL, actuel === o.id ? PILL_ACTIVE : PILL_INACTIF)}>
            {o.nom}
          </button>
        ))}
      </div>

      <SelecteurRecurrence
        intervalleSemaines={entree.intervalle_semaines}
        decalageSemaine={entree.decalage_semaine}
        onChange={(i, d) => onModifier({ intervalle_semaines: i, decalage_semaine: d })}
        disabled={enChargement}
      />
    </div>
  )
}
