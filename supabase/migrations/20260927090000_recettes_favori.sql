-- Chantier 5b : badge "favori" (cœur) sur les cartes recette.
-- Ajoute une colonne booléenne sur les recettes sauvegardées, sans toucher
-- aux recettes déjà en base (défaut false pour toutes).

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS favori boolean NOT NULL DEFAULT false;
