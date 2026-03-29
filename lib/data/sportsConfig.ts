// ============================================================
// Configuration adaptative de chaque sport pour l'onglet "Autre sport".
// Chaque sport définit les champs à afficher dans le formulaire.
// ============================================================

import { Mountain, Bike, Timer, Activity, Music, Map, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ActivityLogFormData, TypeActivite } from '@/types'

export type TypeChamp = 'nombre' | 'texte' | 'duree'

export interface ConfigChamp {
  cle: keyof ActivityLogFormData
  label: string
  type: TypeChamp
  unite?: string
  placeholder?: string
  optionnel?: boolean
}

export interface ConfigSport {
  type: TypeActivite
  nom: string
  Icone: LucideIcon
  champs: ConfigChamp[]
}

export const SPORTS_CONFIG: ConfigSport[] = [
  {
    type: 'escalade',
    nom: 'Escalade / Bloc',
    Icone: Mountain,
    champs: [
      { cle: 'duration_min',      label: 'Durée',              type: 'duree',  unite: 'min' },
      { cle: 'difficulty',        label: 'Difficulté',         type: 'texte',  placeholder: 'ex: 6b+', optionnel: true },
      { cle: 'routes_completed',  label: 'Voies réussies',     type: 'nombre', placeholder: '0',       optionnel: true },
    ],
  },
  {
    type: 'velo',
    nom: 'Vélo / Cyclisme',
    Icone: Bike,
    champs: [
      { cle: 'distance_km',   label: 'Distance',    type: 'nombre', unite: 'km' },
      { cle: 'duration_min',  label: 'Durée',       type: 'duree',  unite: 'min' },
      { cle: 'elevation_m',   label: 'Dénivelé',    type: 'nombre', unite: 'm',   optionnel: true },
      { cle: 'calories',      label: 'Calories',    type: 'nombre', unite: 'kcal', optionnel: true },
      { cle: 'heart_rate_avg', label: 'FC moyenne', type: 'nombre', unite: 'bpm', optionnel: true },
    ],
  },
  {
    type: 'course',
    nom: 'Course à pied',
    Icone: Timer,
    champs: [
      { cle: 'distance_km',    label: 'Distance',   type: 'nombre', unite: 'km' },
      { cle: 'duration_min',   label: 'Durée',      type: 'duree',  unite: 'min' },
      { cle: 'calories',       label: 'Calories',   type: 'nombre', unite: 'kcal', optionnel: true },
      { cle: 'heart_rate_avg', label: 'FC moyenne', type: 'nombre', unite: 'bpm',  optionnel: true },
      { cle: 'heart_rate_max', label: 'FC max',     type: 'nombre', unite: 'bpm',  optionnel: true },
    ],
  },
  {
    type: 'pilates',
    nom: 'Pilates',
    Icone: Activity,
    champs: [
      { cle: 'duration_min', label: 'Durée', type: 'duree', unite: 'min' },
      { cle: 'sport_style',  label: 'Type',  type: 'texte', placeholder: 'tapis, reformer, barre au sol...', optionnel: true },
    ],
  },
  {
    type: 'danse',
    nom: 'Danse / Zumba',
    Icone: Music,
    champs: [
      { cle: 'duration_min', label: 'Durée',    type: 'duree',  unite: 'min' },
      { cle: 'sport_style',  label: 'Style',    type: 'texte',  placeholder: 'zumba, hip-hop, salsa...', optionnel: true },
      { cle: 'calories',     label: 'Calories', type: 'nombre', unite: 'kcal', optionnel: true },
    ],
  },
  {
    type: 'rando',
    nom: 'Randonnée / Trail',
    Icone: Map,
    champs: [
      { cle: 'distance_km',    label: 'Distance',   type: 'nombre', unite: 'km' },
      { cle: 'duration_min',   label: 'Durée',      type: 'duree',  unite: 'min' },
      { cle: 'elevation_m',    label: 'Dénivelé +', type: 'nombre', unite: 'm',   optionnel: true },
      { cle: 'calories',       label: 'Calories',   type: 'nombre', unite: 'kcal', optionnel: true },
      { cle: 'heart_rate_avg', label: 'FC moyenne', type: 'nombre', unite: 'bpm',  optionnel: true },
    ],
  },
  {
    type: 'autre',
    nom: 'Autre',
    Icone: Plus,
    champs: [
      { cle: 'sport_name',   label: 'Nom du sport', type: 'texte',  placeholder: 'Boxe, Escalade libre...' },
      { cle: 'duration_min', label: 'Durée',        type: 'duree',  unite: 'min',  optionnel: true },
      { cle: 'distance_km',  label: 'Distance',     type: 'nombre', unite: 'km',   optionnel: true },
      { cle: 'repetitions',  label: 'Répétitions',  type: 'nombre', optionnel: true },
      { cle: 'calories',     label: 'Calories',     type: 'nombre', unite: 'kcal', optionnel: true },
    ],
  },
]

export const FEELINGS = ['Facile', 'Normal', 'Difficile', 'Épuisant'] as const

export const ACTIVITY_LOG_INITIAL: ActivityLogFormData = {
  sport_type: null, sport_name: '', duration_min: '', distance_km: '',
  elevation_m: '', calories: '', heart_rate_avg: '', heart_rate_max: '',
  difficulty: '', routes_completed: '', sport_style: '', repetitions: '',
  feeling: '', notes: '',
}

export function getSportConfig(type: TypeActivite): ConfigSport {
  return SPORTS_CONFIG.find((s) => s.type === type) ?? SPORTS_CONFIG[SPORTS_CONFIG.length - 1]
}
