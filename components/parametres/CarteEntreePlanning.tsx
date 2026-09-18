'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SelecteurRecurrence } from '@/components/parametres/SelecteurRecurrence'
import { SPORTS_CONFIG } from '@/lib/data/sportsConfig'
import { LABELS_PLANNING } from '@/lib/planning-sport'
import type { PlanningSportEntry, SportVariante, TypeActivite } from '@/types'

const LIBRE_ID = '__libre__'

function labelVariante(v: SportVariante): string {
  if (v.lieu === 'maison') return `${v.nom} (maison)`
  if (v.lieu === 'salle') return `${v.nom} (salle)`
  return v.nom
}

export interface CarteEntreePlanningProps {
  entree: PlanningSportEntry
  variantesDisponibles: SportVariante[]
  enChargement?: boolean
  onChangerVariante: (varianteId: string | null) => void
  onChangerActivite: (activite: TypeActivite | null) => void
  onChangerRecurrence: (intervalleSemaines: number, decalageSemaine: number) => void
  onSupprimer: () => void
}

/** Une séance planifiée : type figé à la création, programme/activité et récurrence modifiables. */
export function CarteEntreePlanning({
  entree,
  variantesDisponibles,
  enChargement,
  onChangerVariante,
  onChangerActivite,
  onChangerRecurrence,
  onSupprimer,
}: CarteEntreePlanningProps) {
  const meta = LABELS_PLANNING[entree.type_seance]
  const estAutre = entree.type_seance === 'autre'

  return (
    <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
          {meta.emoji} {meta.label}
        </span>
        <div className="flex items-center gap-2">
          {enChargement ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />
          ) : null}
          <Button type="button" size="icon-sm" variant="ghost" disabled={enChargement} onClick={onSupprimer}>
            <Trash2 className="size-3.5 text-muted-foreground hover:text-rose-600" />
          </Button>
        </div>
      </div>

      {estAutre ? (
        <Select
          value={entree.activite_type ?? LIBRE_ID}
          onValueChange={(v) => v && onChangerActivite(v === LIBRE_ID ? null : (v as TypeActivite))}
          disabled={enChargement}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LIBRE_ID}>Libre (choisie au moment de la séance)</SelectItem>
            {SPORTS_CONFIG.map((s) => (
              <SelectItem key={s.type} value={s.type}>
                {s.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Select
          value={entree.variante_id ?? LIBRE_ID}
          onValueChange={(v) => v && onChangerVariante(v === LIBRE_ID ? null : v)}
          disabled={enChargement}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LIBRE_ID}>Libre (choisi au moment de la séance)</SelectItem>
            {variantesDisponibles.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {labelVariante(v)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <SelecteurRecurrence
        intervalleSemaines={entree.intervalle_semaines}
        decalageSemaine={entree.decalage_semaine}
        onChange={onChangerRecurrence}
        disabled={enChargement}
      />
    </div>
  )
}
