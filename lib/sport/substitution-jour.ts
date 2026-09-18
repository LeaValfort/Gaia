import { LABELS_PLANNING } from '@/lib/planning-sport'
import { libelleEntreePlanning, type SeanceResolue } from '@/lib/planning-sport-jour'
import type { PlanningOverride, TypePlanningJour } from '@/types'

/**
 * Une carte "changer la séance" pour le widget de substitution ponctuelle sur
 * la page Sport : une par séance planifiée ce jour-là, ou une seule carte
 * "Repos" si aucune séance n'est prévue.
 */
export interface CarteSubstitution {
  entreeId: string | null
  typeEffectif: TypePlanningJour
  overrideActif: boolean
  label: string
  emoji: string
}

/**
 * Construit les cartes de substitution du jour à partir des séances
 * planifiées (avant substitution) et des substitutions actives. Une
 * substitution reste visible même si elle annule la séance visée (vers
 * "repos"), pour qu'on puisse toujours revenir en arrière.
 */
export function cartesSubstitutionJour(
  entreesResolues: SeanceResolue[],
  overrides: PlanningOverride[]
): CarteSubstitution[] {
  const parEntree = new Map(overrides.filter((o) => o.entree_id).map((o) => [o.entree_id as string, o]))

  if (entreesResolues.length === 0) {
    const libre = overrides.find((o) => o.entree_id == null) ?? null
    const typeEffectif = libre?.type_planning ?? 'repos'
    const meta = LABELS_PLANNING[typeEffectif]
    return [{ entreeId: null, typeEffectif, overrideActif: libre != null, label: meta.label, emoji: meta.emoji }]
  }

  return entreesResolues.map(({ entree }) => {
    const substitution = parEntree.get(entree.id)
    if (substitution) {
      const meta = LABELS_PLANNING[substitution.type_planning]
      return {
        entreeId: entree.id,
        typeEffectif: substitution.type_planning,
        overrideActif: true,
        label: meta.label,
        emoji: meta.emoji,
      }
    }
    const { label, emoji } = libelleEntreePlanning(entree)
    return { entreeId: entree.id, typeEffectif: entree.type_seance, overrideActif: false, label, emoji }
  })
}
