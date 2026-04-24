-- Planning hebdo sport (onglet Planification) : persistance par semaine
CREATE TABLE IF NOT EXISTS planning_sport_semaine (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  week_start    date NOT NULL, -- lundi (ISO) de la semaine
  jours         jsonb NOT NULL DEFAULT '{}', -- { "2026-04-16": "muscu", ... }
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);
CREATE INDEX IF NOT EXISTS planning_sport_semaine_user_week ON planning_sport_semaine (user_id, week_start);

ALTER TABLE planning_sport_semaine ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "planning_sport_select" ON planning_sport_semaine;
DROP POLICY IF EXISTS "planning_sport_insert" ON planning_sport_semaine;
DROP POLICY IF EXISTS "planning_sport_update" ON planning_sport_semaine;
DROP POLICY IF EXISTS "planning_sport_delete" ON planning_sport_semaine;
CREATE POLICY "planning_sport_select" ON planning_sport_semaine FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "planning_sport_insert" ON planning_sport_semaine FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "planning_sport_update" ON planning_sport_semaine
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "planning_sport_delete" ON planning_sport_semaine FOR DELETE USING (auth.uid() = user_id);
