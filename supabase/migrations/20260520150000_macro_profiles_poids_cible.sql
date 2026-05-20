-- Objectif de poids cible pour le calculateur de macros

ALTER TABLE public.macro_profiles
  ADD COLUMN IF NOT EXISTS poids_cible_kg numeric,
  ADD COLUMN IF NOT EXISTS delai_mois integer;
