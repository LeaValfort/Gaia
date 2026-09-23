-- Correctif : suppression d'une recette impossible (erreur 409) quand elle a déjà
-- été utilisée dans le journal repas quotidien (daily_meal_intakes.source_recipe_id).
--
-- Diagnostic (23/09) : le fichier supabase/journal_repas.sql définit bien cette
-- colonne avec "ON DELETE SET NULL", mais la contrainte réellement active dans la
-- base ne l'applique pas (bloque la suppression au lieu de vider la référence) —
-- probablement une version antérieure de ce SQL exécutée dans le Dashboard avant
-- que la clause "ON DELETE SET NULL" ne soit ajoutée au fichier local.
--
-- Ce correctif retrouve la contrainte existante sur cette colonne (quel que soit
-- son nom exact, qu'on ne connaît pas avec certitude) puis la remplace par la
-- bonne clause. Idempotent, sûr à relancer.

DO $$
DECLARE
  contrainte text;
BEGIN
  SELECT con.conname INTO contrainte
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
  WHERE con.contype = 'f'
    AND rel.relname = 'daily_meal_intakes'
    AND att.attname = 'source_recipe_id';

  IF contrainte IS NOT NULL THEN
    EXECUTE format('ALTER TABLE daily_meal_intakes DROP CONSTRAINT %I', contrainte);
  END IF;
END $$;

ALTER TABLE daily_meal_intakes
  ADD CONSTRAINT daily_meal_intakes_source_recipe_id_fkey
  FOREIGN KEY (source_recipe_id) REFERENCES recipes (id) ON DELETE SET NULL;
