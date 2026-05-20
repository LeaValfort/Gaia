-- ============================================================
-- Gaia — migrations macros à exécuter UNE FOIS dans Supabase
-- Dashboard → SQL Editor → New query → Coller tout → Run
-- ============================================================

-- 1) Poids cible (calculateur)
ALTER TABLE public.macro_profiles
  ADD COLUMN IF NOT EXISTS poids_cible_kg numeric,
  ADD COLUMN IF NOT EXISTS delai_mois integer;

-- 2) Profils d'effort par séance (planning sport)
CREATE TABLE IF NOT EXISTS public.seance_profils (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  seance_type text NOT NULL,
  intensite   text NOT NULL CHECK (intensite IN ('legere', 'moderee', 'intense')),
  type_effort text NOT NULL CHECK (type_effort IN ('force', 'cardio', 'mixte', 'mobilite', 'aucun')),
  duree_min   integer NOT NULL DEFAULT 0 CHECK (duree_min >= 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, seance_type)
);

ALTER TABLE public.seance_profils ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seance_profils_select" ON public.seance_profils;
DROP POLICY IF EXISTS "seance_profils_insert" ON public.seance_profils;
DROP POLICY IF EXISTS "seance_profils_update" ON public.seance_profils;
DROP POLICY IF EXISTS "seance_profils_delete" ON public.seance_profils;

CREATE POLICY "seance_profils_select" ON public.seance_profils
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "seance_profils_insert" ON public.seance_profils
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seance_profils_update" ON public.seance_profils
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seance_profils_delete" ON public.seance_profils
  FOR DELETE USING (auth.uid() = user_id);

-- 3) Mode auto / manuel + saisie manuelle
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS macros_mode text;

UPDATE public.user_preferences
SET macros_mode = 'auto'
WHERE macros_mode IS NULL;

ALTER TABLE public.user_preferences
  ALTER COLUMN macros_mode SET DEFAULT 'auto';

ALTER TABLE public.user_preferences
  ALTER COLUMN macros_mode SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_preferences_macros_mode_check'
  ) THEN
    ALTER TABLE public.user_preferences
      ADD CONSTRAINT user_preferences_macros_mode_check
      CHECK (macros_mode IN ('auto', 'manuel'));
  END IF;
END $$;

ALTER TABLE public.macro_profiles
  ADD COLUMN IF NOT EXISTS macros_manuels jsonb;
