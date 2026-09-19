-- Chantier 5, étape 5a-1 : moteur de recettes IA + Nutri-score.
-- Nouvelles colonnes sur `recipes` pour stocker le détail complet d'une recette
-- (perso ou générée par l'IA), sans dépendre de TheMealDB à l'affichage.

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS portions integer NOT NULL DEFAULT 1;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS poids_total_g integer;

-- Valeurs nutritionnelles pour 100g (kcal, proteines, glucides, sucres, lipides,
-- acides_gras_satures, sel, fibres, fruits_legumes_pct) : uniquement pour calculer
-- le Nutri-score côté application, jamais affichées telles quelles.
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS nutrition_100g jsonb;

COMMENT ON COLUMN recipes.spoonacular_id IS
  'Ancien identifiant TheMealDB — legacy, sert uniquement à identifier les recettes à migrer (Chantier 5). Ne plus utiliser pour de nouvelles recettes.';
