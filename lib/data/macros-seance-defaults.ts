import { MACROS_JOURNEE } from '@/lib/nutrition'
import type { TypeJournee, TypePlanningJour } from '@/types'

const VERS_TYPE_JOURNEE: Record<TypePlanningJour, 'sport' | 'yoga' | 'repos'> = {
  muscu_full: 'sport',
  muscu_upper: 'sport',
  natation: 'sport',
  yoga: 'yoga',
  autre: 'sport',
  repos: 'repos',
}

export function macrosDefautsTypeSeance(
  t: TypePlanningJour
): { calories: number; proteines: number; glucides: number; lipides: number } {
  const c = VERS_TYPE_JOURNEE[t]
  const m = MACROS_JOURNEE[c as TypeJournee]
  return {
    calories: m.kcal,
    proteines: m.proteines,
    glucides: m.glucides,
    lipides: m.lipides,
  }
}

export const LIBELLE_TYPE_SEANCE: Record<TypePlanningJour, string> = {
  muscu_full: 'Muscu (full body)',
  muscu_upper: 'Muscu (split)',
  natation: 'Natation',
  yoga: 'Yoga',
  autre: 'Autre activité',
  repos: 'Repos',
}
