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
  /** Dernier jour du cycle précédent (jour avant le début suivant), si cycle clos */
  end_date: string | null
  cycle_length: number        // estimation / longueur de référence au moment de l’enregistrement
  /** Durée des règles pour ce cycle (jours), saisie ou mise à jour par l’utilisatrice */
  period_length: number | null
  notes: string | null
  created_at: string
}

/** Agrégats appris sur l’historique des cycles (une ligne par utilisatrice) */
export interface CycleStats {
  user_id: string
  cycle_length_moyen: number | null
  period_length_moyen: number | null
  phase_menstruation_j: number | null
  phase_folliculaire_j: number | null
  phase_ovulation_j: number | null
  phase_luteale_j: number | null
  nb_cycles_utilise: number
  fiabilite: 'haute' | 'moyenne' | 'faible'
  derniere_maj: string
}

/** Phase affichée pour un jour du calendrier (passé confirmé / futur prédit) */
export interface PredictionPhase {
  phase: Phase
  jourDuCycle: number
  estPrediction: boolean
  fiabilite: 'haute' | 'moyenne' | 'faible'
}

/** Un événement Google Calendar (API → UI) */
export interface GoogleCalendarEvent {
  id: string
  titre: string
  debut: string
  fin: string
  lieu: string | null
  description: string | null
  lienMeet: string | null
  couleur: string | null
  estToutJournee: boolean
}

/** Données pour créer un événement dans Google Calendar */
export interface NouvelEvenement {
  titre: string
  date: string
  heureDebut: string
  heureFin: string
  lieu: string
  description: string
  estToutJournee: boolean
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

// ------------------------------------------------------------
// Progression — mensurations & graphiques
// ------------------------------------------------------------

/** Une entrée de mensuration hebdomadaire */
export interface Mensuration {
  id: string
  user_id: string
  date: string
  poids_kg: number | null
  tour_taille: number | null
  tour_hanches: number | null
  tour_bras_g: number | null
  tour_bras_d: number | null
  tour_cuisse_g: number | null
  tour_cuisse_d: number | null
  notes: string | null
  created_at: string
}

/** Point de données pour un graphique (axe ou tooltip) */
export interface PointGraphique {
  date: string
  valeur: number | null
  label?: string
  douleur?: number | null
  phase?: Phase | null
  humeur?: string | null
}

/** Semaine agrégée pour le graphique sport */
export interface PointSportHebdo {
  cle: string
  label: string
  seances: number
  objectif: number
  typeDominant: TypeSeance | null
  detail: string
}

/** Stats résumées progression (cartes du haut) */
export interface StatsResume {
  seancesCeMois: number
  energieMoyenne: number | null
  douleurMoyenne: number | null
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

/** Un ingrédient avec quantité précise (page détail recette) */
export interface IngredientDetail {
  nom: string
  quantite: string  // ex: "200 g", "2 cuillères à soupe"
}

/** Une étape de préparation (page détail recette) */
export interface EtapeRecette {
  numero: number
  instruction: string
}

/** Détail complet d'une recette Spoonacular */
export interface RecetteDetail {
  id: number
  titre: string
  image: string
  tempsMin: number
  portions: number
  calories: number
  proteines: number
  glucides: number
  lipides: number
  ingredients: IngredientDetail[]
  etapes: EtapeRecette[]
  urlOriginale: string
  regimes: string[]  // ex: ["gluten free", "dairy free"]
}

/** Un ingrédient dans la liste de la carte recette (suggestions) */
export interface IngredientCarte {
  nom: string
  quantite: string | null  // quantité en métrique, null si inconnue
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
  ingredients: IngredientCarte[]
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
  spoonacular_id: number | null
  calories: number | null
  proteines: number | null
  glucides: number | null
  lipides: number | null
  /** Étapes de préparation (saisie libre), absent si migration non appliquée */
  instructions?: string | null
  created_at: string
}

/** Saisie journalière d’un créneau repas (macros manuelles, hors recette du planning) */
export interface DailyMealIntake {
  id: string
  user_id: string
  date: string
  type_repas: TypeRepas
  quantite_realisee: number
  quantite_cible: number
  calories: number
  proteines: number
  glucides: number
  lipides: number
  /** Objectifs par nutriment pour ce créneau (absent ou null = répartition auto du jour) */
  objectif_calories?: number | null
  objectif_proteines?: number | null
  objectif_glucides?: number | null
  objectif_lipides?: number | null
  nom_personnalise: string | null
  source_recipe_id: string | null
  created_at: string
}

/** Option de petit-déjeuner fixe (pas stockée en BDD, données statiques) */
export interface OptionPetitDej {
  id: string
  nom: string
  emoji: string
  tempsMin: number
  ingredients: string[]
  calories: number
  proteines: number
  glucides: number
  lipides: number
  phasesRecommandees: Phase[]
  batchCookable: boolean
}

/** Un repas planifié dans le meal plan */
export interface MealPlan {
  id: string
  user_id: string
  week_start: string
  date: string
  type_repas: TypeRepas
  recette_id: string | null
  petit_dej_id: string | null
  portions: number
  notes: string | null
  created_at: string
}

/** Un repas planifié avec sa recette résolue */
export interface MealPlanComplet extends MealPlan {
  recette: Recipe | null
  petitDej: OptionPetitDej | null
}

/** Budget macro d'un jour après déduction du petit-déj */
export interface BudgetMacroJour {
  date: string
  phase: Phase
  typeJournee: TypeJournee
  totalCalories: number
  totalProteines: number
  totalGlucides: number
  totalLipides: number
  resteCalories: number
  resteProteines: number
  resteGlucides: number
  resteLipides: number
  pourcentageAtteint: number
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
// Proches — partage cycle avec un·e proche
// ------------------------------------------------------------

export type ProcheStatus = 'pending' | 'active' | 'revoked'

/** Connexion invitation / lien partagé */
export interface ProcheConnection {
  id: string
  owner_id: string
  partner_id: string | null
  invite_code: string
  invite_email: string | null
  status: ProcheStatus
  partner_name: string | null
  /** Prénom / pseudo propriétaire (dérivé du profil auth côté app ou RPC). */
  owner_display_name: string | null
  notif_debut_regles: boolean
  notif_energie_basse: boolean
  notif_douleur_haute: boolean
  voir_phase: boolean
  voir_energie: boolean
  voir_douleur: boolean
  voir_humeur: boolean
  voir_conseils: boolean
  voir_libido: boolean
  voir_symptomes: boolean
  created_at: string
  accepted_at: string | null
  /** Optionnel (future colonne SQL) — affichage libido conseils. */
  relation_type?: 'partenaire' | 'ami' | 'famille'
}

/** Ce que le lien public expose (contrôlé par la propriétaire). */
export interface VisibiliteProche {
  phase: boolean
  energie: boolean
  douleur: boolean
  humeur: boolean
  conseils: boolean
  libido: boolean
  symptomes: boolean
}

/** Conseil relationnel pour le/la partenaire selon la phase */
export interface ConseilPartenaire {
  titre: string
  emoji: string
  description: string
  idees: string[]
  aEviter: string[]
  humeurGenerale: string
  libido: 'haute' | 'moyenne' | 'basse' | 'variable'
}

/** Données du jour exposées sur la page proche (sans notes privées) */
export interface ProchePartageData {
  phase: Phase | null
  jourDuCycle: number | null
  energie: number | null
  douleur: number | null
  humeur: string | null
  /** Libido (journal) : exposée seulement si `visibilite.libido`. */
  libido: string | null
  /** Symptômes du jour (journal) : exposés seulement si `visibilite.symptomes`. */
  symptomes: string[] | null
  conseilPartenaire: ConseilPartenaire | null
  prochaineCyclePredite: string | null
  visibilite: VisibiliteProche
}

// ------------------------------------------------------------
// Paramètres utilisateur
// ------------------------------------------------------------

/** Thème de l'interface */
export type Theme = 'light' | 'dark' | 'system'

/** Préférences et paramètres de l'utilisatrice */
/** Mode d’affichage : suivi cycle complet ou nutrition générale sans cycle */
export type ModeUtilisateur = 'cycle' | 'sans_cycle'

export interface UserPreferences {
  id: string
  user_id: string
  mode_utilisateur: ModeUtilisateur
  cycle_length: number          // durée du cycle, défaut 26
  last_cycle_start: string | null
  food_likes: string[]
  food_dislikes: string[]
  food_allergies: string[]
  cook_time_minutes: number     // temps de cuisine dispo, défaut 30
  theme: Theme
  notifications: boolean
  /** Afficher / utiliser l’agenda Google intégré sur l’accueil (défaut true si absent en base) */
  google_calendar_enabled?: boolean
  /** Planning hebdo (lundi–dimanche), colonne `planning_sport` */
  planning_sport?: PlanningSport
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
export const DEFAULT_MODE_UTILISATEUR: ModeUtilisateur = 'cycle'

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

/** Type d’activité pour un jour du planning hebdo */
export type TypePlanningJour =
  | 'muscu_full'
  | 'muscu_upper'
  | 'yoga'
  | 'natation'
  | 'autre'
  | 'repos'

export interface PlanningSport {
  lundi: TypePlanningJour
  mardi: TypePlanningJour
  mercredi: TypePlanningJour
  jeudi: TypePlanningJour
  vendredi: TypePlanningJour
  samedi: TypePlanningJour
  dimanche: TypePlanningJour
}

/** Clé `type_seance` dans `seances_custom` (muscu uniquement) */
export type TypeSeanceMuscu = 'muscu_full' | 'muscu_upper'

/** Dernière charge enregistrée par exercice */
export interface DerniereCharge {
  id: string
  user_id: string
  exercise_name: string
  weight_kg: number
  reps: number | null
  sets: number | null
  date_seance: string
  updated_at: string
}

/** Exercice avec volumes / charge adaptés à la phase */
export interface ExerciceAdapte {
  nom: string
  muscles: string[]
  categorie: CategorieExercice
  seriesDefaut: number
  repsDefaut: number
  unite: UniteRep
  reposSecondes: number
  description: string
  conseil: string
  seriesAdaptees: number
  repsAdaptees: number
  chargeProposee: number | null
  chargeOriginale: number | null
  estAdapte: boolean
}

export interface SeanceAdaptee {
  exercices: ExerciceAdapte[]
  messageAdaptation: string
  typeAdaptation: 'normale' | 'reduite' | 'alternative'
}

/** Un exercice personnalisé dans une séance enregistrée */
export interface ExerciceCustom {
  nom: string
  seriesDefaut: number
  repsDefaut: number
  unite: UniteRep
  reposSecondes: number
  ordre: number
}

/** Ligne `seances_custom` */
export interface SeanceCustom {
  id: string
  user_id: string
  type_seance: TypeSeanceMuscu
  lieu: Lieu
  exercices: ExerciceCustom[]
  created_at: string
  updated_at: string
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
