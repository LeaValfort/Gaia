-- ============================================================
-- GAIA — Schéma de base de données Supabase
-- À coller dans : Supabase Dashboard → SQL Editor → New query
-- Puis cliquer "Run"
-- ============================================================

-- Active l'extension uuid pour générer des IDs automatiquement
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE : cycles
-- Stocke chaque cycle menstruel (date de début, durée)
-- ============================================================
CREATE TABLE IF NOT EXISTS cycles (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  start_date   date NOT NULL,
  cycle_length integer DEFAULT 26,
  notes        text,
  created_at   timestamp WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLE : daily_logs
-- Journal quotidien (énergie, douleur, humeur, notes)
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_logs (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date       date NOT NULL,
  cycle_day  integer,           -- jour dans le cycle (1 à N)
  phase      text CHECK (phase IN ('menstruation', 'folliculaire', 'ovulation', 'luteale')),
  energy     integer CHECK (energy BETWEEN 1 AND 5),
  pain       integer CHECK (pain BETWEEN 0 AND 10),
  mood       text,
  notes      text,
  created_at timestamp WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, date)        -- un seul log par jour par utilisatrice
);

-- ============================================================
-- TABLE : workouts
-- Une séance de sport (type, durée, ressenti)
-- ============================================================
CREATE TABLE IF NOT EXISTS workouts (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date         date NOT NULL,
  type         text CHECK (type IN ('muscu', 'natation', 'yoga', 'escalade', 'autre')) NOT NULL,
  duration_min integer,
  location     text CHECK (location IN ('maison', 'salle')),
  feeling      integer CHECK (feeling BETWEEN 1 AND 5),
  notes        text,
  created_at   timestamp WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLE : workout_sets
-- Détail des exercices de musculation (séries, répétitions, charge)
-- ============================================================
CREATE TABLE IF NOT EXISTS workout_sets (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id    uuid REFERENCES workouts ON DELETE CASCADE NOT NULL,
  exercise_name text NOT NULL,
  sets          integer,
  reps          integer,
  weight_kg     decimal(5, 2)
);

-- ============================================================
-- TABLE : swim_logs
-- Détail des séances de natation (niveau, distances, structure)
-- ============================================================
CREATE TABLE IF NOT EXISTS swim_logs (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id        uuid REFERENCES workouts ON DELETE CASCADE NOT NULL,
  level             integer CHECK (level BETWEEN 1 AND 4),
  total_distance_m  integer,
  crawl_m           integer,
  breaststroke_m    integer,
  block_structure   text          -- ex: "5x(50B+150C)"
);

-- ============================================================
-- TABLE : nutrition_logs
-- Checklist anti-inflammatoire hebdomadaire
-- ============================================================
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  week_start  date NOT NULL,
  checklist   jsonb DEFAULT '{}',  -- état de chaque item de la checklist
  batch_done  boolean DEFAULT false,
  notes       text,
  created_at  timestamp WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, week_start)
);

-- ============================================================
-- TABLE : todos
-- To-do liste quotidienne (manuelle ou générée par l'appli)
-- ============================================================
CREATE TABLE IF NOT EXISTS todos (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date       date NOT NULL,
  text       text NOT NULL,
  done       boolean DEFAULT false,
  auto       boolean DEFAULT false,  -- true = générée automatiquement
  created_at timestamp WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- TABLE : user_preferences
-- Paramètres de l'utilisatrice (cycle, alimentation, thème)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  cycle_length      integer DEFAULT 26,
  last_cycle_start  date,
  food_likes        text[] DEFAULT '{}',
  food_dislikes     text[] DEFAULT '{}',
  food_allergies    text[] DEFAULT '{}',
  cook_time_minutes integer DEFAULT 30,
  theme             text DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  notifications     boolean DEFAULT true
);

-- ============================================================
-- SÉCURITÉ : Row Level Security (RLS)
-- Chaque utilisatrice ne voit que SES propres données
-- ============================================================

ALTER TABLE cycles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE swim_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Politiques : l'utilisatrice peut lire/écrire uniquement ses données
CREATE POLICY "Accès personnel cycles"           ON cycles           FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Accès personnel daily_logs"       ON daily_logs       FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Accès personnel workouts"         ON workouts         FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Accès personnel nutrition_logs"   ON nutrition_logs   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Accès personnel todos"            ON todos             FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Accès personnel user_preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- workout_sets et swim_logs héritent la sécurité via workout_id
CREATE POLICY "Accès personnel workout_sets" ON workout_sets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_sets.workout_id AND workouts.user_id = auth.uid())
  );

CREATE POLICY "Accès personnel swim_logs" ON swim_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workouts WHERE workouts.id = swim_logs.workout_id AND workouts.user_id = auth.uid())
  );

-- ============================================================
-- TABLE : exercises (catalogue de référence)
-- Liste statique des exercices disponibles dans l'appli.
-- Pas de user_id : catalogue partagé, lecture seule par tous.
-- ============================================================
CREATE TABLE IF NOT EXISTS exercises (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  muscles      text[],
  category     text,           -- 'compound' | 'isolation' | 'gainage'
  seance       text,           -- 'full_body' | 'upper_lower'
  location     text,           -- 'maison' | 'salle' | 'both'
  sets_default integer,
  reps_default integer,
  rest_seconds integer,
  description  text,
  tip          text,
  progression  text
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
-- Lisible par toutes les utilisatrices authentifiées (catalogue public)
CREATE POLICY "Exercises lisibles" ON exercises
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- MIGRATION : colonnes journal enrichi dans daily_logs
-- À exécuter dans l'éditeur SQL Supabase.
-- ADD COLUMN IF NOT EXISTS = sûr à relancer plusieurs fois.
-- ============================================================
-- ============================================================
-- TABLE : recipes (recettes sauvegardées depuis les suggestions IA)
-- ============================================================
CREATE TABLE IF NOT EXISTS recipes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users NOT NULL,
  nom        text NOT NULL,
  ingredients text[] NOT NULL DEFAULT '{}',
  temps_min  integer,
  phase      text,
  type_repas text,
  raison     text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recettes personnelles" ON recipes
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABLE : shopping_items (liste de courses par semaine)
-- ============================================================
CREATE TABLE IF NOT EXISTS shopping_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users NOT NULL,
  week_start date NOT NULL,
  nom        text NOT NULL,
  quantite   text,
  categorie  text,
  fait       boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses personnelles" ON shopping_items
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABLE : activity_logs (autres sports : escalade, vélo, course...)
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users NOT NULL,
  date             date NOT NULL,
  sport_type       text NOT NULL,
  sport_name       text,
  duration_min     integer,
  distance_km      decimal,
  elevation_m      integer,
  speed_kmh        decimal,
  pace_min_km      decimal,
  calories         integer,
  heart_rate_avg   integer,
  heart_rate_max   integer,
  difficulty       text,
  routes_completed integer,
  sport_style      text,
  repetitions      integer,
  feeling          text,
  notes            text,
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activites personnelles" ON activity_logs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- MIGRATION : colonnes journal enrichi dans daily_logs
-- À exécuter dans l'éditeur SQL Supabase.
-- ADD COLUMN IF NOT EXISTS = sûr à relancer plusieurs fois.
-- ============================================================
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS emotions      text[];
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS symptoms      text[];
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS libido        text;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS sleep_quality text;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS sleep_hours   decimal;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS stress_level  text;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS appetite      text[];
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS flow_intensity text;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS free_note     text;
