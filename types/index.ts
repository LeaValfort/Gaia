// ============================================================
// Tous les types TypeScript du projet Gaia
// Ce fichier est la source de vérité pour tous les types partagés
// ============================================================

// ------------------------------------------------------------
// Cycle
// ------------------------------------------------------------

/** Les 4 phases du cycle menstruel */
export type Phase = 'menstruation' | 'folliculaire' | 'ovulation' | 'luteale'

/** Un cycle menstruel enregistré en base */
export interface Cycle {
  id: string
  user_id: string
  start_date: string        // format ISO : "2026-03-01"
  cycle_length: number      // durée en jours, défaut 26
  notes: string | null
  created_at: string
}

/** Le journal quotidien (énergie, douleur, humeur + champs enrichis) */
export interface DailyLog {
  id: string
  user_id: string
  date: string              // format ISO : "2026-03-25"
  cycle_day: number | null  // jour dans le cycle (1 à N)
  phase: Phase | null
  energy: number | null     // 1 à 5
  pain: number | null       // 0 à 10
  mood: string | null
  notes: string | null
  created_at: string
  // Champs journal enrichi
  emotions:      string[] | null
  symptoms:      string[] | null
  libido:        string | null
  sleep_quality: string | null
  sleep_hours:   number | null
  stress_level:  string | null
  appetite:      string[] | null
  flow_intensity: string | null
  free_note:     string | null
}

/**
 * Données du journal enrichi gérées dans DailyLogSectionEtendue.
 * Séparées du formulaire de base pour ne pas dépasser 150 lignes.
 */
export interface ExtendedLogData {
  emotions:      string[]
  symptoms:      string[]
  libido:        string | null
  sleep_quality: string | null
  sleep_hours:   string       // saisie texte, converti en number à la sauvegarde
  appetite:      string[]
  flow_intensity: string | null
  free_note:     string
}

// ------------------------------------------------------------
// Sport
// ------------------------------------------------------------

/** Types de séances de sport possibles */
export type TypeSeance = 'muscu' | 'natation' | 'yoga' | 'escalade' | 'autre'

/** Lieu d'entraînement */
export type Lieu = 'maison' | 'salle'

/** Une séance de sport */
export interface Workout {
  id: string
  user_id: string
  date: string
  type: TypeSeance
  duration_min: number | null
  location: Lieu | null
  feeling: number | null    // ressenti 1 à 5
  notes: string | null
  created_at: string
}

/** Une série d'exercice de musculation */
export interface WorkoutSet {
  id: string
  workout_id: string
  exercise_name: string
  sets: number | null
  reps: number | null
  weight_kg: number | null
}

/** Détail d'une séance de natation */
export interface SwimLog {
  id: string
  workout_id: string
  level: number | null          // niveau 1 à 4
  total_distance_m: number | null
  crawl_m: number | null
  breaststroke_m: number | null
  block_structure: string | null // ex: "5x(50B+150C)"
}

// ------------------------------------------------------------
// Alimentation — types enrichis
// ------------------------------------------------------------

/** Type de repas pour les suggestions et recettes */
export type TypeRepas = 'petit-dej' | 'dejeuner' | 'collation' | 'diner'

/** Type de journée pour les macros */
export type TypeJournee = 'sport' | 'yoga' | 'repos' | 'regles'

/** Enseigne de magasin (valeurs prédéfinies + libres) */
export type Enseigne = 'biocoop' | 'grand_frais' | 'boucherie' | 'grande_surface' | (string & {})

/** Rayon en magasin */
export type Rayon =
  | 'fruits_legumes'
  | 'poissons_viandes'
  | 'cremerie'
  | 'epicerie_seche'
  | 'surgeles'
  | 'hygiene_maison'
  | 'autre'

/** Article de liste de courses enrichi (avec enseigne + rayon) */
export interface ShoppingItemComplet extends ShoppingItem {
  enseigne: Enseigne | null
  rayon: Rayon | null
  source: 'manuel' | 'spoonacular'
}

/** Macros cibles calculées pour un jour donné */
export interface MacrosCiblesJour {
  calories: number
  proteines: number
  glucides: number
  lipides: number
  typeJournee: TypeJournee
  phase: Phase
  message: string
}

/** Recette retournée par l'API Spoonacular */
export interface RecetteSpoonacular {
  id: number
  titre: string
  image: string
  tempsMin: number
  calories: number
  proteines: number
  glucides: number
  lipides: number
  ingredients: string[]
  urlOriginale: string
}

/** Une recette sauvegardée */
export interface Recipe {
  id: string
  user_id: string
  nom: string
  ingredients: string[]
  temps_min: number | null
  phase: Phase | null
  type_repas: TypeRepas | null
  raison: string | null
  created_at: string
}

/** Un article de la liste de courses */
export interface ShoppingItem {
  id: string
  user_id: string
  week_start: string
  nom: string
  quantite: string | null
  categorie: string | null
  fait: boolean
  created_at: string
}

// ------------------------------------------------------------
// Autres activités sportives (escalade, vélo, course...)
// ------------------------------------------------------------

/** Type d'activité pour l'onglet "Autre sport" */
export type TypeActivite = 'escalade' | 'velo' | 'course' | 'pilates' | 'danse' | 'rando' | 'autre'

/** Une entrée dans activity_logs */
export interface ActivityLog {
  id: string
  user_id: string
  date: string
  sport_type: TypeActivite
  sport_name: string | null
  duration_min: number | null
  distance_km: number | null
  elevation_m: number | null
  speed_kmh: number | null
  pace_min_km: number | null
  calories: number | null
  heart_rate_avg: number | null
  heart_rate_max: number | null
  difficulty: string | null
  routes_completed: number | null
  sport_style: string | null
  repetitions: number | null
  feeling: string | null
  notes: string | null
  created_at: string
}

/** Données du formulaire (toutes en string, converties à la sauvegarde) */
export interface ActivityLogFormData {
  sport_type: TypeActivite | null
  sport_name: string
  duration_min: string
  distance_km: string
  elevation_m: string
  calories: string
  heart_rate_avg: string
  heart_rate_max: string
  difficulty: string
  routes_completed: string
  sport_style: string
  repetitions: string
  feeling: string
  notes: string
}

// Types pour la lecture et modification des séances existantes
export interface WorkoutMuscuComplet {
  id: string
  date: string
  location: Lieu | null
  feeling: number | null
  notes: string | null
  sets: WorkoutSet[]
}

export interface WorkoutNatationComplet {
  id: string
  date: string
  feeling: number | null
  notes: string | null
  swim: {
    level: number
    total_distance_m: number | null
    crawl_m: number | null
    breaststroke_m: number | null
    block_structure: string | null
  }
}

export interface WorkoutYogaComplet {
  id: string
  date: string
  duration_min: number | null
  feeling: number | null
  notes: string | null  // format : "[type] notes optionnel"
}

// ------------------------------------------------------------
// Alimentation
// ------------------------------------------------------------

/** Checklist anti-inflammatoire de la semaine */
export interface NutritionLog {
  id: string
  user_id: string
  week_start: string            // lundi de la semaine, format ISO
  checklist: Record<string, boolean>  // { "omega3": true, "legumes": false, ... }
  batch_done: boolean
  notes: string | null
  created_at: string
}

// ------------------------------------------------------------
// To-do
// ------------------------------------------------------------

/** Une tâche de la to-do liste quotidienne */
export interface Todo {
  id: string
  user_id: string
  date: string
  text: string
  done: boolean
  auto: boolean               // true = générée automatiquement par l'appli
  created_at: string
}

// ------------------------------------------------------------
// Paramètres utilisateur
// ------------------------------------------------------------

/** Thème de l'interface */
export type Theme = 'light' | 'dark' | 'system'

/** Préférences et paramètres de l'utilisatrice */
export interface UserPreferences {
  id: string
  user_id: string
  cycle_length: number          // durée du cycle, défaut 26
  last_cycle_start: string | null
  food_likes: string[]
  food_dislikes: string[]
  food_allergies: string[]
  cook_time_minutes: number     // temps de cuisine dispo, défaut 30
  theme: Theme
  notifications: boolean
}

// ------------------------------------------------------------
// Constantes métier
// ------------------------------------------------------------

/** Valeurs min/max pour les saisies utilisateur */
export const ENERGY_MIN = 1
export const ENERGY_MAX = 5
export const PAIN_MIN = 0
export const PAIN_MAX = 10
export const FEELING_MIN = 1
export const FEELING_MAX = 5
export const SWIM_LEVEL_MIN = 1
export const SWIM_LEVEL_MAX = 5
export const DEFAULT_CYCLE_LENGTH = 26
export const DEFAULT_COOK_TIME = 30

// ------------------------------------------------------------
// Sport — exercices muscu
// ------------------------------------------------------------

/** Lieu disponible pour un exercice (maison, salle, ou les deux) */
export type LieuDisponibilite = Lieu | 'both'

/** Type de séance de musculation */
export type TypeSeanceMuscle = 'full_body' | 'upper_lower'

/** Catégorie d'exercice */
export type CategorieExercice = 'compound' | 'isolation' | 'gainage'

/** Unité pour les répétitions (reps ou secondes pour le gainage) */
export type UniteRep = 'reps' | 'secondes'

/** Un exercice du catalogue */
export interface Exercice {
  nom: string
  muscles: string[]
  categorie: CategorieExercice
  seance: TypeSeanceMuscle
  lieu: LieuDisponibilite
  seriesDefaut: number
  repsDefaut: number
  unite: UniteRep
  reposSecondes: number
  description: string
  descriptionSalle?: string  // différente si l'équipement salle change
  conseil: string
  progression: string
}

// ------------------------------------------------------------
// Sport — natation détaillée
// ------------------------------------------------------------

/** Un niveau natation avec sa structure complète */
export interface NiveauNatationDetail {
  level: number
  nom: string
  description: string
  structure: string          // set principal uniquement
  exerciceTechnique: string  // drill spécifique au niveau
  distanceTotale: number     // échauffement + drill + set principal
  crawlM: number
  brasseM: number
  critere: string
}

/** Échauffement commun à tous les niveaux (150 m) */
export const ECHAUFFEMENT_NATATION = '2L brasse lente (50m) + 2L crawl lent (50m) + 2L dos (50m)'
export const ECHAUFFEMENT_M = 150

// ------------------------------------------------------------
// Sport — yoga
// ------------------------------------------------------------

/** Type de séance yoga */
export type TypeYoga = 'yin' | 'flow' | 'power'

/** Une posture dans une séance yoga */
export interface PostureYoga {
  nom: string
  dureeSec: number
  benefice: string
}

/** Une séance yoga complète avec ses postures */
export interface SeanceYoga {
  type: TypeYoga
  nom: string
  phaseCycle: Phase[]
  dureeMin: number
  description: string
  postures: PostureYoga[]
}
