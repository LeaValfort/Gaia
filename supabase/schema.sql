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
  mode_utilisateur  text DEFAULT 'cycle' CHECK (mode_utilisateur IN ('cycle', 'sans_cycle')),
  cycle_length      integer DEFAULT 26,
  last_cycle_start  date,
  food_likes        text[] DEFAULT '{}',
  food_dislikes     text[] DEFAULT '{}',
  food_allergies    text[] DEFAULT '{}',
  cook_time_minutes integer DEFAULT 30,
  theme             text DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  notifications     boolean DEFAULT true,
  google_calendar_enabled boolean DEFAULT true
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
-- RLS cycles : politiques séparées (INSERT requiert WITH CHECK). Voir aussi migrations/.
DROP POLICY IF EXISTS "Accès personnel cycles" ON cycles;
CREATE POLICY "cycles_select" ON cycles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cycles_insert" ON cycles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cycles_update" ON cycles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cycles_delete" ON cycles FOR DELETE USING (auth.uid() = user_id);
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
-- MIGRATION recipes : spoonacular_id
-- ============================================================
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS spoonacular_id integer;

-- ============================================================
-- MIGRATION shopping_items : enseigne, rayon, source
-- ============================================================
ALTER TABLE shopping_items ADD COLUMN IF NOT EXISTS enseigne text;
ALTER TABLE shopping_items ADD COLUMN IF NOT EXISTS rayon    text;
ALTER TABLE shopping_items ADD COLUMN IF NOT EXISTS source   text DEFAULT 'manuel';
-- source : 'manuel' | 'spoonacular'

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

-- ============================================================
-- TABLE : mensurations (suivi corporel hebdomadaire)
-- ============================================================
CREATE TABLE IF NOT EXISTS mensurations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users NOT NULL,
  date          date NOT NULL,
  poids_kg      decimal(4,1),
  tour_taille   integer,
  tour_hanches  integer,
  tour_bras_g   integer,
  tour_bras_d   integer,
  tour_cuisse_g integer,
  tour_cuisse_d integer,
  notes         text,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);
ALTER TABLE mensurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mensurations personnelles" ON mensurations
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- MIGRATION : cycle « façon Flo » (fin de cycle, règles, stats)
-- À exécuter dans l’éditeur SQL Supabase (idempotent).
-- ============================================================
ALTER TABLE cycles ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE cycles ADD COLUMN IF NOT EXISTS period_length integer;

CREATE TABLE IF NOT EXISTS cycle_stats (
  user_id               uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  cycle_length_moyen    integer,
  period_length_moyen   integer,
  phase_menstruation_j  integer,
  phase_folliculaire_j  integer,
  phase_ovulation_j     integer,
  phase_luteale_j       integer,
  nb_cycles_utilise     integer NOT NULL DEFAULT 0,
  fiabilite             text NOT NULL DEFAULT 'faible'
    CHECK (fiabilite IN ('haute', 'moyenne', 'faible')),
  derniere_maj          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cycle_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stats cycle personnelles" ON cycle_stats
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- MIGRATION : mode utilisateur (cycle / sans cycle)
-- ============================================================
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS mode_utilisateur text
  DEFAULT 'cycle' CHECK (mode_utilisateur IN ('cycle', 'sans_cycle'));

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS google_calendar_enabled boolean DEFAULT true;

-- ============================================================
-- MIGRATION : Proches (ex duo_connections) + vue publique
-- ============================================================
DO $$
BEGIN
  IF to_regclass('public.duo_connections') IS NOT NULL
     AND to_regclass('public.proches_connections') IS NULL THEN
    ALTER TABLE public.duo_connections RENAME TO proches_connections;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS proches_connections (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id              uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  partner_id            uuid REFERENCES auth.users ON DELETE SET NULL,
  invite_code           text UNIQUE NOT NULL,
  invite_email          text,
  status                text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'revoked')),
  partner_name          text,
  notif_debut_regles    boolean NOT NULL DEFAULT true,
  notif_energie_basse   boolean NOT NULL DEFAULT true,
  notif_douleur_haute   boolean NOT NULL DEFAULT true,
  voir_phase            boolean NOT NULL DEFAULT true,
  voir_energie          boolean NOT NULL DEFAULT true,
  voir_douleur          boolean NOT NULL DEFAULT true,
  voir_humeur           boolean NOT NULL DEFAULT true,
  voir_conseils         boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  accepted_at           timestamptz
);

ALTER TABLE proches_connections DROP COLUMN IF EXISTS owner_display_name;

ALTER TABLE proches_connections ADD COLUMN IF NOT EXISTS voir_phase boolean NOT NULL DEFAULT true;
ALTER TABLE proches_connections ADD COLUMN IF NOT EXISTS voir_energie boolean NOT NULL DEFAULT true;
ALTER TABLE proches_connections ADD COLUMN IF NOT EXISTS voir_douleur boolean NOT NULL DEFAULT true;
ALTER TABLE proches_connections ADD COLUMN IF NOT EXISTS voir_humeur boolean NOT NULL DEFAULT true;
ALTER TABLE proches_connections ADD COLUMN IF NOT EXISTS voir_conseils boolean NOT NULL DEFAULT true;
ALTER TABLE proches_connections ADD COLUMN IF NOT EXISTS voir_libido boolean NOT NULL DEFAULT false;
ALTER TABLE proches_connections ADD COLUMN IF NOT EXISTS voir_symptomes boolean NOT NULL DEFAULT false;

ALTER TABLE proches_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Duo owner full" ON proches_connections;
DROP POLICY IF EXISTS "Duo partner read" ON proches_connections;
DROP POLICY IF EXISTS "Proches owner full" ON proches_connections;
DROP POLICY IF EXISTS "Proches partner read" ON proches_connections;

CREATE POLICY "Proches owner full" ON proches_connections
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Proches partner read" ON proches_connections
  FOR SELECT TO authenticated
  USING (auth.uid() = partner_id);

-- Lecture publique du bundle via RPC uniquement (pas de SELECT anon sur la table).
-- Ne pas créer de politique « FOR SELECT TO anon USING (status = 'active') » : elle
-- exposerait toutes les invitations actives. Utiliser fn_proches_public_view (GRANT anon).

DROP FUNCTION IF EXISTS public.fn_duo_public_view(text);
DROP FUNCTION IF EXISTS public.fn_proches_public_view(text);

CREATE OR REPLACE FUNCTION public.fn_proches_public_view(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conn          proches_connections%ROWTYPE;
  owner_label   text;
  anchor        date;
  c_len         integer;
  diff_days     integer;
  jour          integer;
  ph            text;
  en            integer;
  pn            integer;
  hum           text;
  lib           text;
  sym           text[];
  ln            date;
  next_iso      text;
BEGIN
  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO conn FROM proches_connections
  WHERE upper(trim(invite_code)) = upper(trim(p_code))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  owner_label := 'Ton proche';
  SELECT COALESCE(
    NULLIF(TRIM(au.raw_user_meta_data->>'first_name'), ''),
    NULLIF(split_part(TRIM(au.raw_user_meta_data->>'full_name'), ' ', 1), ''),
    NULLIF(split_part(COALESCE(au.email, ''), '@', 1), ''),
    'Ton proche'
  ) INTO owner_label
  FROM auth.users au
  WHERE au.id = conn.owner_id;

  IF conn.status = 'revoked' THEN
    RETURN NULL;
  END IF;

  IF conn.status = 'pending' THEN
    UPDATE proches_connections
    SET status = 'active', accepted_at = COALESCE(accepted_at, now())
    WHERE id = conn.id;
    conn.status := 'active';
  END IF;

  SELECT c.start_date INTO ln FROM cycles c
  WHERE c.user_id = conn.owner_id
  ORDER BY c.start_date DESC NULLS LAST
  LIMIT 1;

  SELECT
    COALESCE(cs.cycle_length_moyen, up.cycle_length, 26),
    up.last_cycle_start
  INTO c_len, anchor
  FROM user_preferences up
  LEFT JOIN cycle_stats cs ON cs.user_id = up.user_id
  WHERE up.user_id = conn.owner_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'erreur', 'preferences_manquantes',
      'partner_name', conn.partner_name,
      'owner_display_name', owner_label,
      'voir_phase', COALESCE(conn.voir_phase, true),
      'voir_energie', COALESCE(conn.voir_energie, true),
      'voir_douleur', COALESCE(conn.voir_douleur, true),
      'voir_humeur', COALESCE(conn.voir_humeur, true),
      'voir_conseils', COALESCE(conn.voir_conseils, true),
      'voir_libido', COALESCE(conn.voir_libido, false),
      'voir_symptomes', COALESCE(conn.voir_symptomes, false)
    );
  END IF;

  anchor := COALESCE(ln, anchor);

  SELECT dl.energy, dl.pain, dl.mood, dl.libido, dl.symptoms
  INTO en, pn, hum, lib, sym
  FROM daily_logs dl
  WHERE dl.user_id = conn.owner_id AND dl.date = (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Paris')::date
  LIMIT 1;

  IF anchor IS NULL THEN
    IF NOT COALESCE(conn.voir_energie, true) THEN en := NULL; END IF;
    IF NOT COALESCE(conn.voir_douleur, true) THEN pn := NULL; END IF;
    IF NOT COALESCE(conn.voir_humeur, true) THEN hum := NULL; END IF;
    IF NOT COALESCE(conn.voir_libido, false) THEN lib := NULL; END IF;
    IF NOT COALESCE(conn.voir_symptomes, false) THEN sym := NULL; END IF;
    RETURN jsonb_build_object(
      'ok', true,
      'partner_name', conn.partner_name,
      'owner_display_name', owner_label,
      'status', conn.status,
      'phase', NULL,
      'jour_du_cycle', NULL,
      'energie', en,
      'douleur', pn,
      'humeur', hum,
      'libido', lib,
      'symptomes', to_jsonb(COALESCE(sym, ARRAY[]::text[])),
      'prochaine_cycle_predite', NULL,
      'voir_phase', COALESCE(conn.voir_phase, true),
      'voir_energie', COALESCE(conn.voir_energie, true),
      'voir_douleur', COALESCE(conn.voir_douleur, true),
      'voir_humeur', COALESCE(conn.voir_humeur, true),
      'voir_conseils', COALESCE(conn.voir_conseils, true),
      'voir_libido', COALESCE(conn.voir_libido, false),
      'voir_symptomes', COALESCE(conn.voir_symptomes, false)
    );
  END IF;

  diff_days := (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Paris')::date - anchor;
  IF diff_days < 0 THEN
    jour := 1;
  ELSE
    jour := (diff_days % c_len) + 1;
  END IF;

  IF jour <= 4 THEN
    ph := 'menstruation';
  ELSIF jour <= round(c_len * 0.42)::integer THEN
    ph := 'folliculaire';
  ELSIF jour <= round(c_len * 0.54)::integer THEN
    ph := 'ovulation';
  ELSE
    ph := 'luteale';
  END IF;

  next_iso := to_char(anchor + c_len, 'YYYY-MM-DD');

  IF NOT COALESCE(conn.voir_phase, true) THEN ph := NULL; jour := NULL; END IF;
  IF NOT COALESCE(conn.voir_energie, true) THEN en := NULL; END IF;
  IF NOT COALESCE(conn.voir_douleur, true) THEN pn := NULL; END IF;
  IF NOT COALESCE(conn.voir_humeur, true) THEN hum := NULL; END IF;
  IF NOT COALESCE(conn.voir_libido, false) THEN lib := NULL; END IF;
  IF NOT COALESCE(conn.voir_symptomes, false) THEN sym := NULL; END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'partner_name', conn.partner_name,
    'owner_display_name', owner_label,
    'status', conn.status,
    'phase', ph,
    'jour_du_cycle', jour,
    'energie', en,
    'douleur', pn,
    'humeur', hum,
    'libido', lib,
    'symptomes', to_jsonb(COALESCE(sym, ARRAY[]::text[])),
    'prochaine_cycle_predite', next_iso,
    'voir_phase', COALESCE(conn.voir_phase, true),
    'voir_energie', COALESCE(conn.voir_energie, true),
    'voir_douleur', COALESCE(conn.voir_douleur, true),
    'voir_humeur', COALESCE(conn.voir_humeur, true),
    'voir_conseils', COALESCE(conn.voir_conseils, true),
    'voir_libido', COALESCE(conn.voir_libido, false),
    'voir_symptomes', COALESCE(conn.voir_symptomes, false)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_proches_public_view(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_proches_public_view(text) TO anon, authenticated;

-- Création d’invitation Proches : contourne les cas où l’INSERT direct + RLS/PostgREST pose problème.
DROP FUNCTION IF EXISTS public.fn_duo_create_invitation(text, text, text, text);
DROP FUNCTION IF EXISTS public.fn_duo_create_invitation(text, text, text);
DROP FUNCTION IF EXISTS public.fn_proches_create_invitation(text, text, text);

CREATE OR REPLACE FUNCTION public.fn_proches_create_invitation(
  p_partner_name text,
  p_invite_email text,
  p_invite_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r             proches_connections%ROWTYPE;
  owner_label   text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF length(trim(coalesce(p_partner_name, ''))) < 1 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'partner_name_required');
  END IF;

  INSERT INTO proches_connections (
    owner_id,
    partner_id,
    invite_code,
    invite_email,
    status,
    partner_name,
    notif_debut_regles,
    notif_energie_basse,
    notif_douleur_haute,
    voir_phase,
    voir_energie,
    voir_douleur,
    voir_humeur,
    voir_conseils,
    voir_libido,
    voir_symptomes
  )
  VALUES (
    auth.uid(),
    NULL,
    trim(p_invite_code),
    NULLIF(trim(coalesce(p_invite_email, '')), ''),
    'pending',
    trim(p_partner_name),
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    false
  )
  RETURNING * INTO r;

  owner_label := 'Ton partenaire';
  SELECT COALESCE(
    NULLIF(TRIM(au.raw_user_meta_data->>'first_name'), ''),
    NULLIF(split_part(TRIM(au.raw_user_meta_data->>'full_name'), ' ', 1), ''),
    NULLIF(split_part(COALESCE(au.email, ''), '@', 1), ''),
    'Ton partenaire'
  ) INTO owner_label
  FROM auth.users au
  WHERE au.id = r.owner_id;

  RETURN jsonb_build_object(
    'ok', true,
    'id', r.id,
    'owner_id', r.owner_id,
    'partner_id', r.partner_id,
    'invite_code', r.invite_code,
    'invite_email', r.invite_email,
    'status', r.status,
    'partner_name', r.partner_name,
    'owner_display_name', owner_label,
    'notif_debut_regles', r.notif_debut_regles,
    'notif_energie_basse', r.notif_energie_basse,
    'notif_douleur_haute', r.notif_douleur_haute,
    'voir_phase', r.voir_phase,
    'voir_energie', r.voir_energie,
    'voir_douleur', r.voir_douleur,
    'voir_humeur', r.voir_humeur,
    'voir_conseils', r.voir_conseils,
    'created_at', r.created_at,
    'accepted_at', r.accepted_at
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'error', 'code_collision');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insert_failed', 'detail', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_proches_create_invitation(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_proches_create_invitation(text, text, text) TO authenticated;
