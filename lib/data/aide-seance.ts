import type { SportAide } from '@/types'

/** Choix proposés par l'assistant de création de séance (libellés envoyés tels quels à l'IA). */

export const OBJECTIFS_AIDE: Record<SportAide, string[]> = {
  muscu: ['Recomposition (tonifier + perdre du gras)', 'Force', 'Fessiers / bas du corps', 'Renforcement général'],
  natation: ['Endurance', 'Technique', 'Vitesse', 'Récupération active'],
  yoga: ['Souplesse', 'Mobilité', 'Détente / sommeil', 'Renforcement', 'Douleurs de règles'],
  libre: ['Endurance', 'Cardio / brûler des calories', 'Renforcement', 'Technique', 'Plaisir / découverte'],
}

export const NIVEAUX_AIDE = ['Débutante', 'Intermédiaire', 'Avancée'] as const

export const DUREES_AIDE = [20, 30, 45, 60] as const

export const MATERIEL_AIDE = ['Poids du corps', 'Haltères', 'Élastiques', 'Kettlebell', 'Barre et machines (salle)', 'Tapis', 'Banc / chaise', 'Barre de traction / parc'] as const

export const ZONES_AIDE: Record<SportAide, string[]> = {
  muscu: ['Fessiers', 'Jambes', 'Haut du corps', 'Dos', 'Bras', 'Abdos / gainage'],
  natation: ['Bras', 'Jambes (battements)', 'Respiration', 'Cardio'],
  yoga: ['Hanches', 'Dos', 'Épaules / nuque', 'Jambes', 'Ventre / bas-ventre', 'Équilibre'],
  libre: ['Cardio', 'Jambes', 'Haut du corps', 'Abdos / gainage', 'Mobilité'],
}

/** Le matériel n'a de sens que pour ces familles. */
export const SPORTS_AVEC_MATERIEL: SportAide[] = ['muscu', 'libre']
