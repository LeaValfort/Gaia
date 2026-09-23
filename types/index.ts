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
  rapport:       boolean | null
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
  stress_level:  string | null
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
  source: 'manuel' | 'spoonacular' | 'open_food_facts' | 'themealdb'
}

/** Une enseigne de courses personnalisée (en base), avec ses règles de rangement automatique. */
export interface EnseigneDB {
  id: string
  user_id: string
  label: string
  emoji: string
  couleur: string       // classe Tailwind bg-
  rayons: Rayon[]        // rayons entiers cochés pour cette enseigne
  mots_cles: string[]    // mots-clés libres, prioritaires sur les rayons
  ordre: number
  created_at: string
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

/** Recette TheMealDB normalisée — encore utilisé par lib/db/shopping-items.ts pour parser
 *  les mesures d'ingrédients. Le reste de l'intégration TheMealDB/Spoonacular (détail
 *  recette, traduction, macros Open Food Facts) a été retiré au nettoyage Chantier 5, 5a-2 :
 *  remplacé par le moteur de recettes IA + CIQUAL (étape 5a-1). */
export interface MealDBResult {
  id: string
  nom: string
  categorie: string | null
  instructions: string | null
  image_url: string | null
  ingredients: string[]
  mesures: string[]
}

/**
 * Valeurs nutritionnelles pour 100 g de plat préparé.
 * Calculées une fois à la sauvegarde (jamais recalculées à l'affichage), uniquement
 * pour permettre le calcul du Nutri-score — pas affichées telles quelles à l'utilisatrice.
 */
export interface Nutrition100g {
  kcal: number
  proteines: number
  glucides: number
  sucres: number
  lipides: number
  acides_gras_satures: number
  sel: number
  fibres: number
  /** Proportion de fruits, légumes, légumineuses et fruits à coque, en % de la masse totale */
  fruits_legumes_pct: number
}

/** Lettre Nutri-score (A = meilleur profil nutritionnel, E = moins bon) */
export type NutriScoreLettre = 'A' | 'B' | 'C' | 'D' | 'E'

/**
 * Entrée de la table CIQUAL (ANSES) — composition nutritionnelle officielle et sourcée.
 * Valeurs pour 100 g d'aliment, `null` quand la donnée n'est pas mesurée dans la table.
 */
export interface EntreeCiqual {
  code: string
  nom: string
  groupe: string
  sousGroupe: string
  kcal: number | null
  proteines: number | null
  glucides: number | null
  lipides: number | null
  sucres: number | null
  ags: number | null
  fibres: number | null
  sel: number | null
}

/**
 * Catégorie alimentaire d'un ingrédient, dans un vocabulaire fixe que l'IA doit respecter.
 * Sert de repli quand l'ingrédient précis n'est pas reconnu dans CIQUAL : on utilise alors
 * la moyenne CIQUAL de sa catégorie plutôt que de bloquer les macros de toute la recette.
 * 'autre' = aucune catégorie ne convient (assaisonnement, condiment...) : pas d'approximation possible.
 */
export type CategorieIngredient =
  | 'legume'
  | 'fruit'
  | 'feculent'
  | 'legumineuse'
  | 'viande'
  | 'poisson'
  | 'oeuf'
  | 'produit_laitier'
  | 'fromage'
  | 'fruit_a_coque'
  | 'matiere_grasse'
  | 'sucre_sucrant'
  | 'autre'

/** Ingrédient d'une recette générée par l'IA : nom en français, quantité en grammes, catégorie. */
export interface IngredientRecette {
  nom: string
  grammes: number
  categorie: CategorieIngredient
}

/**
 * Résultat du calcul des macros d'une recette à partir de CIQUAL (lib/nutrition/calcul-recette.ts).
 * `macrosDisponibles` est faux uniquement si un ingrédient est resté totalement non identifiable
 * (catégorie 'autre' sans correspondance) : dans ce cas on préfère ne rien afficher plutôt que
 * d'inventer un chiffre. `ingredientsApproximes` liste les ingrédients dont les macros viennent
 * d'une moyenne de catégorie (toujours sourcée CIQUAL) plutôt que d'une correspondance exacte.
 */
export interface ResultatCalculRecette {
  macrosDisponibles: boolean
  ingredientsApproximes: string[]
  ingredientsNonReconnus: string[]
  poidsTotalG: number
  totalKcal: number
  totalProteines: number
  totalGlucides: number
  totalLipides: number
  totalSucres: number
  totalAgs: number
  totalFibres: number
  totalSel: number
  /** Masse totale (g) provenant d'ingrédients des catégories légume/fruit/légumineuse/fruit à coque */
  totalFruitsLegumesG: number
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
  /** @deprecated Ne sert plus qu'à identifier les recettes migrées depuis TheMealDB (Chantier 5) */
  spoonacular_id: number | null
  calories: number | null
  proteines: number | null
  glucides: number | null
  lipides: number | null
  /** Étapes de préparation (texte libre, une étape par ligne) */
  instructions?: string | null
  /** Nombre de portions du plat tel que préparé (défaut 1) */
  portions?: number
  /** Poids total estimé du plat préparé, en grammes — sert au calcul du Nutri-score */
  poids_total_g?: number | null
  /** Valeurs pour 100 g, présentes uniquement pour les recettes générées par l'IA (Chantier 5) */
  nutrition_100g?: Nutrition100g | null
  /** Photo ajoutée à la main via « Modifier » (URL publique Supabase Storage) */
  image_url?: string | null
  /** Recette marquée en favori (cœur sur la carte, Chantier 5b). Défaut false en base,
   *  optionnel ici car pas toujours renseigné à la création (comme portions, image_url...). */
  favori?: boolean
  created_at: string
}

/**
 * Recette complète générée par l'IA (remplace la recherche TheMealDB + traduction MyMemory).
 * Pas encore sauvegardée : pas d'id ni de user_id tant qu'elle n'est pas persistée dans `recipes`.
 */
export interface RecetteGeneree {
  nom: string
  phase: Phase | null
  type_repas: TypeRepas | null
  temps_min: number
  portions: number
  poids_total_g: number
  /** Ingrédients structurés (nom + grammes) tels que générés par l'IA, base du calcul CIQUAL */
  ingredients_structures: IngredientRecette[]
  /** Chaque élément au format "quantité nom", pour affichage et liste de courses */
  ingredients: string[]
  /** Étapes de préparation, une par ligne */
  instructions: string
  /**
   * Macros par portion, calculées à partir de CIQUAL (jamais inventées par l'IA).
   * `null` quand au moins un ingrédient n'a pas pu être reconnu dans CIQUAL —
   * la recette reste affichée, sans macros plutôt qu'avec des macros incomplètes.
   */
  calories: number | null
  proteines: number | null
  glucides: number | null
  lipides: number | null
  nutrition_100g: Nutrition100g | null
  /** Noms des ingrédients totalement non identifiables (vide si macrosDisponibles) */
  ingredients_non_reconnus: string[]
  /** Noms des ingrédients dont les macros viennent d'une moyenne de catégorie, pas d'un match exact */
  ingredients_approximes: string[]
  /** Pourquoi ce plat est adapté à la phase / au profil (1-2 phrases) */
  raison: string
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
  /** true = déjà dans le placard/frigo, pas besoin de l'acheter (distinct de "fait"). */
  deja_en_stock: boolean
  created_at: string
}

// ------------------------------------------------------------
// Autres activités sportives (escalade, vélo, course...)
// ------------------------------------------------------------

/** Type d'activité pour l'onglet "Autre sport" */
export type TypeActivite =
  | 'escalade'
  | 'velo'
  | 'course'
  | 'pilates'
  | 'danse'
  | 'rando'
  | 'natation_libre'
  | 'ski'
  | 'boxe'
  | 'muscu_libre'
  | 'voile'
  | 'golf'
  | 'marche'
  | 'football'
  | 'basket'
  | 'raquette'
  | 'equitation'
  | 'fitness'
  | 'autre'

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
  calories_cibles?: number | null
  proteines_cibles?: number | null
  glucides_cibles?: number | null
  lipides_cibles?: number | null
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
  calories_cibles?: number | null
  proteines_cibles?: number | null
  glucides_cibles?: number | null
  lipides_cibles?: number | null
}

export interface WorkoutYogaComplet {
  id: string
  date: string
  duration_min: number | null
  feeling: number | null
  notes: string | null  // format : "[type] notes optionnel"
  calories_cibles?: number | null
  proteines_cibles?: number | null
  glucides_cibles?: number | null
  lipides_cibles?: number | null
}

// ------------------------------------------------------------
// Alimentation
// ------------------------------------------------------------

/** Checklist anti-inflammatoire de la semaine (garde uniquement le batch cooking désormais) */
export interface NutritionLog {
  id: string
  user_id: string
  week_start: string            // lundi de la semaine, format ISO
  checklist: Record<string, boolean>  // { "omega3": true, "legumes": false, ... }
  batch_done: boolean
  notes: string | null
  created_at: string
}

/**
 * Checklist alimentation quotidienne (Chantier 6) : anti-inflammatoire adapté
 * à la phase + préparation de la séance du jour. Remise à zéro chaque jour,
 * contrairement à `NutritionLog` qui reste hebdomadaire (batch cooking).
 */
export interface NutritionChecklistJour {
  id: string
  user_id: string
  date: string                  // format ISO YYYY-MM-DD
  checklist: Record<string, boolean>
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

/** Lien affectif / statut du proche invité (stocké en base). */
export type ProcheRelationType = 'partenaire' | 'ami' | 'famille'

/** Connexion invitation / lien partagé */
export interface ProcheConnection {
  id: string
  owner_id: string
  partner_id: string | null
  invite_code: string
  invite_email: string | null
  /** E-mail saisi côté owner pour l’envoi Resend (optionnel) */
  partner_email?: string | null
  email_sent_at?: string | null
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
  relation_type?: ProcheRelationType
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

/**
 * Pourcentage d'ajustement (+/-) appliqué selon la phase du cycle, réglable
 * dans Paramètres > Planning sport. S'applique à la charge en muscu et à la
 * distance en natation (et à toute nouvelle séance ajoutée plus tard).
 * Valeurs par défaut : voir POURCENTAGES_GAIA_DEFAUT. Ce sont des réglages de
 * confort personnalisables, pas une prescription scientifique validée — la
 * littérature ne fixe pas de chiffre précis (voir Bibliographie).
 */
export type PourcentagesGaia = Record<Phase, number>

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
  /** Objectifs macros par défaut (jour de sport) */
  calories_defaut?: number | null
  proteines_defaut?: number | null
  glucides_defaut?: number | null
  lipides_defaut?: number | null
  /** Mode calculateur macros : auto (calcul) ou manuel (saisie par séance) */
  macros_mode?: MacrosMode
  /** Afficher onglet Aujourd'hui (macros + repas) ; sinon onglet Recettes */
  suivi_calorique?: boolean
  /** Date (ISO) de la dernière génération automatique de conseils via l'IA */
  conseils_generes_le?: string | null
  /** Pourcentages d'ajustement par phase (charge muscu, distance natation...) */
  pourcentages_gaia?: PourcentagesGaia | null
}

export type MacrosMode = 'auto' | 'manuel'

// ------------------------------------------------------------
// Conseils enrichis (table `conseils`) + Bibliographie (table `sources`)
// ------------------------------------------------------------

export type CategorieConseil = 'sport' | 'nutrition' | 'sommeil' | 'bien_etre' | 'astuce'

export interface Source {
  id: string
  titre: string
  url: string
  created_at: string
}

export interface Conseil {
  id: string
  phase: Phase
  categorie: CategorieConseil
  texte: string
  source_id: string | null
  genere_ia: boolean
  created_at: string
  /** Jointure Supabase `sources(titre,url)` quand demandée */
  sources?: Pick<Source, 'titre' | 'url'> | null
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
/**
 * Valeurs par défaut des pourcentages Gaia par phase — réglage de confort
 * personnalisable (Paramètres > Planning sport), pas une prescription
 * scientifique stricte (voir Bibliographie, revues 2021-2025 sur le sujet).
 */
export const POURCENTAGES_GAIA_DEFAUT: PourcentagesGaia = {
  menstruation: -15,
  folliculaire: 5,
  ovulation: 10,
  luteale: -10,
}

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

/**
 * Substitution ponctuelle de l'activité prévue pour UNE date précise
 * (table `planning_overrides`) — ne modifie jamais le planning hebdo lui-même.
 * Utilisé par le bouton "Changer la séance d'aujourd'hui".
 */
export interface PlanningOverride {
  id: string
  user_id: string
  date: string
  /** Séance précise remplacée (id `planning_sport_entries`) ; null = substitution "libre" (jour sans séance prévue). */
  entree_id: string | null
  type_planning: TypePlanningJour
  created_at: string
}

/** Cibles nutritionnelles par type d’activité (planning sport) */
export interface MacrosSeance {
  id: string
  user_id: string
  type_seance: TypePlanningJour
  calories: number | null
  proteines: number | null
  glucides: number | null
  lipides: number | null
  notes: string | null
  created_at: string
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
// Sport — variantes nommées (onglets Muscu / Natation / Yoga)
// ------------------------------------------------------------

/** Sports pour lesquels une séance peut être enregistrée en plusieurs variantes nommées */
export type TypeVarianteSport = 'muscu_full' | 'muscu_upper' | 'natation' | 'yoga'

/** Lieu d'une variante ; 'na' = non applicable (natation, yoga) */
export type LieuVariante = Lieu | 'na'

/**
 * Une variante nommée d'une séance (ligne `sport_variantes`), affichée en onglet.
 * Une seule variante par (user, type_seance, lieu) peut être `est_active` à la fois ;
 * aucune variante active = utiliser les réglages par défaut (catalogue / niveau de base).
 */
export interface SportVariante {
  id: string
  user_id: string
  type_seance: TypeVarianteSport
  lieu: LieuVariante
  nom: string
  est_active: boolean
  /** Muscu uniquement */
  exercices: ExerciceCustom[] | null
  /** Natation uniquement — niveau de base (utilisé si aucun bloc personnalisé) */
  niveau_natation: number | null
  /** Natation uniquement — blocs ordonnés personnalisés (prioritaires sur le niveau) */
  blocs_natation: BlocNatation[] | null
  /** Yoga uniquement — postures personnalisées (ordre + sélection) */
  postures: PostureYoga[] | null
  /** Intensité/effort/durée de ce programme, utilisés pour le calcul des macros. */
  intensite: IntensiteEffort
  type_effort: TypeEffort
  duree_min: number
  created_at: string
  updated_at: string
}

// ------------------------------------------------------------
// Planning sport — calendrier hebdo avec récurrence (redesign du planning sport)
// ------------------------------------------------------------

/** Jour de la semaine, clé du planning hebdo. */
export type JourSemaine = keyof PlanningSport

/**
 * Une séance planifiée dans le calendrier hebdo (`planning_sport_entries`).
 * Contrairement à `PlanningSport` (un seul type par jour), plusieurs entrées
 * peuvent exister pour un même jour, et chacune a sa propre récurrence
 * (ex. un mercredi sur 2 en natation, l'autre en danse).
 */
export interface PlanningSportEntry {
  id: string
  user_id: string
  jour_semaine: JourSemaine
  type_seance: TypeVarianteSport | 'autre'
  /** Programme précis (muscu/natation/yoga) ; null = libre, choisi au moment de la séance. */
  variante_id: string | null
  /** Activité précise si type_seance === 'autre' (ex. danse) ; null = libre. */
  activite_type: TypeActivite | null
  /** 1 = toutes les semaines, 2 = une semaine sur deux, etc. */
  intervalle_semaines: number
  /** Semaine de départ dans le cycle, entre 0 et intervalle_semaines - 1. */
  decalage_semaine: number
  created_at: string
  updated_at: string
}

/** Données nécessaires pour créer une nouvelle entrée du calendrier. */
export interface NouvellePlanningSportEntry {
  jour_semaine: JourSemaine
  type_seance: TypeVarianteSport | 'autre'
  variante_id?: string | null
  activite_type?: TypeActivite | null
  intervalle_semaines?: number
  decalage_semaine?: number
}

/** Types de nage prédéfinis proposés pour un bloc de séance natation personnalisée */
export type TypeNage = 'echauffement' | 'crawl' | 'dos' | 'papillon' | 'mixte' | 'brasse' | 'recuperation'

/**
 * Un bloc ordonné dans une séance natation personnalisée (variante).
 * `nage` est soit une valeur prédéfinie de TypeNage, soit un libellé
 * personnalisé libre saisi via l'option « Autre » de l'éditeur de blocs.
 */
export interface BlocNatation {
  nage: string
  distanceM: number
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

/** Catégories du grand catalogue de postures (filtrage dans l'éditeur) */
export type CategoriePosture =
  | 'debout'
  | 'assise'
  | 'torsion'
  | 'equilibre'
  | 'etirement'
  | 'renforcement'
  | 'relaxation'

/** Une posture dans une séance yoga */
export interface PostureYoga {
  nom: string
  dureeSec: number
  benefice: string
  /** Optionnel — utilisé uniquement pour le filtrage dans le catalogue */
  categorie?: CategoriePosture
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

// ------------------------------------------------------------
// Todo — récurrence
// ------------------------------------------------------------

export type FrequenceRecurrence = 'daily' | 'weekly' | 'monthly'

export interface RecurringTodo {
  id: string
  user_id: string
  text: string
  frequency: FrequenceRecurrence
  week_days: number[] | null   // 1=lundi ... 7=dimanche
  month_day: number | null     // 1-31
  active: boolean
  created_at: string
}

// ------------------------------------------------------------
// Nutrition — profil macros personnalisé
// ------------------------------------------------------------

export type Objectif = 'perte_gras' | 'recompo' | 'maintien'
export type NiveauActivite = 'sedentaire' | 'leger' | 'modere' | 'actif'

export interface MacroProfile {
  id: string
  user_id: string
  poids_kg: number
  poids_cible_kg: number | null
  delai_mois: number | null
  taille_cm: number
  age: number
  objectif: Objectif
  activite: NiveauActivite
  sommeil_heures: number
  pas_quotidiens: number
  mb: number | null
  tdee: number | null
  kcal_base: number | null
  proteines_g: number | null
  glucides_g: number | null
  lipides_g: number | null
  kcal_sport: number | null
  proteines_sport_g: number | null
  glucides_sport_g: number | null
  lipides_sport_g: number | null
  kcal_repos: number | null
  proteines_repos_g: number | null
  glucides_repos_g: number | null
  lipides_repos_g: number | null
  macros_manuels?: MacrosManuelsParSeance | null
  updated_at: string
}

export interface MacrosJour {
  kcal: number
  proteines: number
  glucides: number
  lipides: number
}

export type MacrosManuelsParSeance = Partial<Record<TypePlanningJour, MacrosJour>>

export type IntensiteEffort = 'legere' | 'moderee' | 'intense'
export type TypeEffort = 'force' | 'cardio' | 'mixte' | 'mobilite' | 'aucun'

export interface ProfilEffort {
  intensite: IntensiteEffort
  type_effort: TypeEffort
  duree_min: number
}

export interface SeanceProfil {
  id: string
  user_id: string
  seance_type: string
  intensite: IntensiteEffort
  type_effort: TypeEffort
  duree_min: number
  created_at: string
}

/** Profils par défaut pour chaque type de séance */
export const PROFILS_DEFAUT: Record<string, ProfilEffort> = {
  muscu_full: { intensite: 'intense', type_effort: 'force', duree_min: 45 },
  muscu_upper: { intensite: 'intense', type_effort: 'force', duree_min: 45 },
  natation: { intensite: 'moderee', type_effort: 'cardio', duree_min: 50 },
  yoga: { intensite: 'legere', type_effort: 'mobilite', duree_min: 40 },
  escalade: { intensite: 'moderee', type_effort: 'mixte', duree_min: 90 },
  repos: { intensite: 'legere', type_effort: 'aucun', duree_min: 0 },
}
