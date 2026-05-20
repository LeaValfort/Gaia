-- Profil macros personnalisé + objectifs par défaut dans user_preferences

CREATE TABLE IF NOT EXISTS public.macro_profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  poids_kg              numeric NOT NULL,
  taille_cm             numeric NOT NULL,
  age                   integer NOT NULL,
  objectif              text NOT NULL CHECK (objectif IN ('perte_gras', 'recompo', 'maintien')),
  activite              text NOT NULL CHECK (activite IN ('sedentaire', 'leger', 'modere', 'actif')),
  sommeil_heures        numeric NOT NULL,
  pas_quotidiens        integer NOT NULL DEFAULT 0,
  mb                    integer,
  tdee                  integer,
  kcal_base             integer,
  proteines_g           integer,
  glucides_g            integer,
  lipides_g             integer,
  kcal_sport            integer,
  proteines_sport_g     integer,
  glucides_sport_g      integer,
  lipides_sport_g       integer,
  kcal_repos            integer,
  proteines_repos_g     integer,
  glucides_repos_g      integer,
  lipides_repos_g       integer,
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.macro_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "macro_profiles_select" ON public.macro_profiles;
DROP POLICY IF EXISTS "macro_profiles_insert" ON public.macro_profiles;
DROP POLICY IF EXISTS "macro_profiles_update" ON public.macro_profiles;
DROP POLICY IF EXISTS "macro_profiles_delete" ON public.macro_profiles;

CREATE POLICY "macro_profiles_select" ON public.macro_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "macro_profiles_insert" ON public.macro_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "macro_profiles_update" ON public.macro_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "macro_profiles_delete" ON public.macro_profiles
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS calories_defaut integer,
  ADD COLUMN IF NOT EXISTS proteines_defaut integer,
  ADD COLUMN IF NOT EXISTS glucides_defaut integer,
  ADD COLUMN IF NOT EXISTS lipides_defaut integer;
