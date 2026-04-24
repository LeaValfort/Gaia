-- Séances muscu personnalisées (catalogue modifié par l’utilisatrice)
CREATE TABLE IF NOT EXISTS seances_custom (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users NOT NULL,
  type_seance   text NOT NULL,
  lieu          text NOT NULL,
  exercices     jsonb NOT NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  UNIQUE (user_id, type_seance, lieu)
);
ALTER TABLE seances_custom ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Seances custom personnelles" ON seances_custom;
CREATE POLICY "seances_custom_select" ON seances_custom FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "seances_custom_insert" ON seances_custom FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "seances_custom_update" ON seances_custom FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "seances_custom_delete" ON seances_custom FOR DELETE USING (auth.uid() = user_id);
