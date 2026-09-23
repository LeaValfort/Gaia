-- Correctif (suite du 20260928090000) : la suppression d'une recette restait
-- bloquée (409) même après avoir corrigé daily_meal_intakes.source_recipe_id.
--
-- Diagnostic (23/09, requête sur pg_constraint) : une deuxième contrainte,
-- meal_plans_recette_id_fkey (colonne meal_plans.recette_id → recipes.id),
-- n'a jamais été versionnée dans le dépôt (créée directement dans Supabase à
-- un moment non documenté) et était en NO ACTION (bloque la suppression),
-- alors que meal_plans.recette_id est nullable côté type (MealPlan.recette_id:
-- string | null) — le comportement attendu est donc SET NULL, comme pour
-- daily_meal_intakes : si la recette source d'un repas planifié est
-- supprimée, le créneau du planning reste, juste sans recette associée.

DO $$
DECLARE
  contrainte text;
BEGIN
  SELECT con.conname INTO contrainte
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
  WHERE con.contype = 'f'
    AND rel.relname = 'meal_plans'
    AND att.attname = 'recette_id';

  IF contrainte IS NOT NULL THEN
    EXECUTE format('ALTER TABLE meal_plans DROP CONSTRAINT %I', contrainte);
  END IF;
END $$;

ALTER TABLE meal_plans
  ADD CONSTRAINT meal_plans_recette_id_fkey
  FOREIGN KEY (recette_id) REFERENCES recipes (id) ON DELETE SET NULL;
