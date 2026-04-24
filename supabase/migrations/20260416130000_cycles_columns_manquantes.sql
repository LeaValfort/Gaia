-- Erreur PostgreSQL 42703 = colonne inexistante.
-- Ce script ajoute les colonnes utilisées par Gaia sur `public.cycles` si elles manquent.

ALTER TABLE public.cycles ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE public.cycles ADD COLUMN IF NOT EXISTS period_length integer;
ALTER TABLE public.cycles ADD COLUMN IF NOT EXISTS notes text;
