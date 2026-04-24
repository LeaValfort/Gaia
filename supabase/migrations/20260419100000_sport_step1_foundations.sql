-- Étape 1 fondations Sport : planning_sport, seances_custom, dernieres_charges
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS planning_sport jsonb DEFAULT '{
    "lundi": "muscu_full",
    "mardi": "repos",
    "mercredi": "yoga",
    "jeudi": "repos",
    "vendredi": "muscu_upper",
    "samedi": "natation",
    "dimanche": "repos"
  }'::jsonb;

CREATE TABLE IF NOT EXISTS seances_custom (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  type_seance text NOT NULL,
  lieu        text NOT NULL,
  exercices   jsonb NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, type_seance, lieu)
);
ALTER TABLE seances_custom ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Seances custom" ON seances_custom;
DROP POLICY IF EXISTS "Seances custom personnelles" ON seances_custom;
DROP POLICY IF EXISTS "seances_custom_select" ON seances_custom;
DROP POLICY IF EXISTS "seances_custom_insert" ON seances_custom;
DROP POLICY IF EXISTS "seances_custom_update" ON seances_custom;
DROP POLICY IF EXISTS "seances_custom_delete" ON seances_custom;
CREATE POLICY "Seances custom" ON seances_custom
  FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dernieres_charges (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users NOT NULL,
  exercise_name text NOT NULL,
  weight_kg     decimal(5,2) NOT NULL,
  reps          integer,
  sets          integer,
  date_seance   date NOT NULL,
  updated_at    timestamptz DEFAULT now(),
  UNIQUE (user_id, exercise_name)
);
ALTER TABLE dernieres_charges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Charges perso" ON dernieres_charges;
CREATE POLICY "Charges perso" ON dernieres_charges
  FOR ALL USING (auth.uid() = user_id);
