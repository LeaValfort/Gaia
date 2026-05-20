-- Profils d'effort par type de séance (intensité, type d'effort, durée)

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
