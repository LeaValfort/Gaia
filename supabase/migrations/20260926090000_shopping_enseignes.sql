-- Chantier 5 : enseignes de courses personnalisées.
-- Remplace la liste fixe ENSEIGNES_DEFAUT (codée en dur côté app) par des
-- enseignes éditables en base, avec des règles de rangement automatique
-- (rayons entiers cochés + mots-clés libres). Les 4 enseignes actuelles
-- sont reprises comme lignes éditables, avec les mêmes identifiants
-- qu'avant, pour que les articles déjà enregistrés restent bien rangés.

CREATE TABLE IF NOT EXISTS shopping_enseignes (
  id         text NOT NULL,
  user_id    uuid REFERENCES auth.users NOT NULL,
  label      text NOT NULL,
  emoji      text NOT NULL,
  couleur    text NOT NULL,
  rayons     text[] NOT NULL DEFAULT '{}',
  mots_cles  text[] NOT NULL DEFAULT '{}',
  ordre      integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

ALTER TABLE shopping_enseignes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enseignes personnelles" ON shopping_enseignes
  FOR ALL USING (auth.uid() = user_id);

-- Reprise : les 4 enseignes par défaut deviennent des lignes éditables,
-- pour chaque utilisatrice existante, avec les mêmes id que le code
-- utilisait en dur (biocoop, grand_frais, boucherie, grande_surface).
INSERT INTO shopping_enseignes (id, user_id, label, emoji, couleur, ordre)
SELECT 'biocoop', id, 'Biocoop', '🌿', 'bg-green-100 dark:bg-green-900/40', 0 FROM auth.users
ON CONFLICT (user_id, id) DO NOTHING;

INSERT INTO shopping_enseignes (id, user_id, label, emoji, couleur, ordre)
SELECT 'grand_frais', id, 'Grand Frais', '🐟', 'bg-blue-100 dark:bg-blue-900/40', 1 FROM auth.users
ON CONFLICT (user_id, id) DO NOTHING;

INSERT INTO shopping_enseignes (id, user_id, label, emoji, couleur, ordre)
SELECT 'boucherie', id, 'Boucherie', '🥩', 'bg-red-100 dark:bg-red-900/40', 2 FROM auth.users
ON CONFLICT (user_id, id) DO NOTHING;

INSERT INTO shopping_enseignes (id, user_id, label, emoji, couleur, ordre)
SELECT 'grande_surface', id, 'Grande surface', '🛒', 'bg-yellow-100 dark:bg-yellow-900/40', 3 FROM auth.users
ON CONFLICT (user_id, id) DO NOTHING;
