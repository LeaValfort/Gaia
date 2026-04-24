-- ============================================================
-- Journal repas quotidien (daily_meal_intakes) — Gaia
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query → Run
-- Idempotent : safe à relancer (IF NOT EXISTS / DROP POLICY IF EXISTS)
-- ============================================================

-- Étapes de préparation sur les recettes (si pas déjà là)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS instructions text;

-- Table journal par jour + créneau repas
CREATE TABLE IF NOT EXISTS daily_meal_intakes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  date                date NOT NULL,
  type_repas          text NOT NULL CHECK (type_repas IN ('petit-dej', 'dejeuner', 'collation', 'diner')),
  quantite_realisee   integer NOT NULL DEFAULT 0,
  quantite_cible      integer NOT NULL DEFAULT 1 CHECK (quantite_cible >= 1),
  calories            integer NOT NULL DEFAULT 0,
  proteines           integer NOT NULL DEFAULT 0,
  glucides            integer NOT NULL DEFAULT 0,
  lipides             integer NOT NULL DEFAULT 0,
  nom_personnalise    text,
  source_recipe_id    uuid REFERENCES recipes (id) ON DELETE SET NULL,
  created_at          timestamptz DEFAULT now(),
  UNIQUE (user_id, date, type_repas)
);

ALTER TABLE daily_meal_intakes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Journal repas personnel" ON daily_meal_intakes;
CREATE POLICY "Journal repas personnel" ON daily_meal_intakes
  FOR ALL USING (auth.uid() = user_id);

-- Objectifs par nutriment (optionnel ; null = répartition auto dans l’app)
ALTER TABLE daily_meal_intakes ADD COLUMN IF NOT EXISTS objectif_calories integer;
ALTER TABLE daily_meal_intakes ADD COLUMN IF NOT EXISTS objectif_proteines integer;
ALTER TABLE daily_meal_intakes ADD COLUMN IF NOT EXISTS objectif_glucides integer;
ALTER TABLE daily_meal_intakes ADD COLUMN IF NOT EXISTS objectif_lipides integer;
