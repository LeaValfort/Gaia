-- Étape C2b1 (refonte planning sport) : la substitution "changer la séance
-- d'aujourd'hui" doit pouvoir cibler une séance précise du calendrier,
-- maintenant qu'un même jour peut avoir plusieurs séances planifiées
-- (planning_sport_entries).

ALTER TABLE planning_overrides
  ADD COLUMN IF NOT EXISTS entree_id uuid REFERENCES planning_sport_entries(id) ON DELETE SET NULL;

-- L'ancienne contrainte unique (user_id, date) empêchait d'avoir plusieurs
-- substitutions le même jour. On la retire : son nom exact dépend de la façon
-- dont la table a été créée à l'origine, donc on le retrouve dynamiquement
-- plutôt que de le deviner.
DO $$
DECLARE
  nom_contrainte text;
BEGIN
  SELECT tc.constraint_name INTO nom_contrainte
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'planning_overrides'
    AND tc.constraint_type = 'UNIQUE'
  GROUP BY tc.constraint_name
  HAVING array_agg(kcu.column_name::text ORDER BY kcu.column_name) = ARRAY['date', 'user_id']
  LIMIT 1;

  IF nom_contrainte IS NOT NULL THEN
    EXECUTE format('ALTER TABLE planning_overrides DROP CONSTRAINT %I', nom_contrainte);
  END IF;
END $$;

-- Remplacée par deux règles :
-- - une substitution ciblée sur une séance précise (entree_id renseigné) : une seule par séance
-- - une substitution "libre" pour un jour sans séance prévue (entree_id null) : une seule par jour
CREATE UNIQUE INDEX IF NOT EXISTS planning_overrides_par_seance
  ON planning_overrides (user_id, date, entree_id)
  WHERE entree_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS planning_overrides_libre
  ON planning_overrides (user_id, date)
  WHERE entree_id IS NULL;
