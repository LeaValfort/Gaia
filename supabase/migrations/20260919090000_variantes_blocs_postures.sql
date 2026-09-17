-- Chantier 4 étape 2 : contenu personnalisable des variantes natation (blocs
-- ordonnés : échauffement / crawl / brasse / récupération) et yoga (postures
-- personnalisées, ordre + sélection).

alter table sport_variantes
  add column if not exists blocs_natation jsonb,
  add column if not exists postures jsonb;
