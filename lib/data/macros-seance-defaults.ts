import { MACROS_JOURNEE } from '@/lib/nutrition'
import type { TypeJournee, TypePlanningJour } from '@/types'

// ------------------------------------------------------------
// Ratios d'intensité par type de séance (par rapport au TDEE)
// ------------------------------------------------------------

const RATIOS_SEANCE: Record<
    TypePlanningJour,
{ kcal: number; proteines: number; glucides: number; lipides: number }
  > = {
    muscu_full:  { kcal: 1.15, proteines: 1.20, glucides: 1.15, lipides: 0.95 },
    muscu_upper: { kcal: 1.10, proteines: 1.15, glucides: 1.10, lipides: 0.95 },
    natation:    { kcal: 1.15, proteines: 1.05, glucides: 1.20, lipides: 0.90 },
    yoga:        { kcal: 0.95, proteines: 1.00, glucides: 0.90, lipides: 1.00 },
    autre:       { kcal: 1.10, proteines: 1.05, glucides: 1.10, lipides: 0.95 },
    repos:       { kcal: 0.90, proteines: 1.00, glucides: 0.85, lipides: 1.05 },
}

// ------------------------------------------------------------
// Profil nutritionnel depuis le calculateur (localStorage)
// ------------------------------------------------------------

export interface NutriProfile {
    age: number
    height: number
    weight: number
    lifestyle: number
    formula: string
    goal: string
    bmr: number
    tdee: number
    target: number
    protein: number
    carbs: number
    fat: number
    fatPct?: number
    steps?: number
}

export function getNutriProfile(): NutriProfile | null {
    if (typeof window === 'undefined') return null
    try {
          const raw = localStorage.getItem('gaia_nutri_profile')
          if (!raw) return null
          return JSON.parse(raw) as NutriProfile
    } catch {
          return null
    }
}

// ------------------------------------------------------------
// Macros par défaut pour un type de séance
// Utilise le calculateur si disponible, sinon les valeurs fixes
// ------------------------------------------------------------

const VERS_TYPE_JOURNEE: Record<TypePlanningJour, 'sport' | 'yoga' | 'repos'> = {
    muscu_full:  'sport',
    muscu_upper: 'sport',
    natation:    'sport',
    yoga:        'yoga',
    autre:       'sport',
    repos:       'repos',
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

/**
 * Calcule les macros pour un type de séance en appliquant
 * les ratios d'intensité aux valeurs du calculateur nutritionnel.
 * Retourne null si le profil n'est pas disponible.
 */
export function macrosCalculeesTypeSeance(
    t: TypePlanningJour
  ): { calories: number; proteines: number; glucides: number; lipides: number } | null {
    const profil = getNutriProfile()
    if (!profil?.target) return null

  const r = RATIOS_SEANCE[t]
    return {
          calories:  Math.round(profil.target   * r.kcal),
          proteines: Math.round(profil.protein  * r.proteines),
          glucides:  Math.round(profil.carbs    * r.glucides),
          lipides:   Math.round(profil.fat      * r.lipides),
    }
}

/**
 * Génère les macros calculées pour tous les types de séances.
 */
export function toutesLesmacrosCalculees(): Record<
    TypePlanningJour,
{ calories: number; proteines: number; glucides: number; lipides: number }
  > {
    const types: TypePlanningJour[] = ['muscu_full', 'muscu_upper', 'natation', 'yoga', 'autre', 'repos']
    return Object.fromEntries(
          types.map((t) => [t, macrosCalculeesTypeSeance(t) ?? macrosDefautsTypeSeance(t)])
        ) as Record<TypePlanningJour, { calories: number; proteines: number; glucides: number; lipides: number }>
}

export const LIBELLE_TYPE_SEANCE: Record<TypePlanningJour, string> = {
    muscu_full:  'Muscu (full body)',
    muscu_upper: 'Muscu (split)',
    natation:    'Natation',
    yoga:        'Yoga',
    autre:       'Autre activité',
    repos:       'Repos',
}
