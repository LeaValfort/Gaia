-- Étape C2c (refonte planning sport) : nettoyage final de l'ancien système,
-- devenu mort côté code depuis C2b1/C2b2 (remplacé par planning_sport_entries
-- + planning_overrides + seances_effectives_jour).

-- Ancien planning hebdo jour-par-jour (un seul type de séance par jour),
-- colonne jsonb sur user_preferences, plus lue ni écrite par le code.
ALTER TABLE user_preferences DROP COLUMN IF EXISTS planning_sport;

-- Ancienne table de planning hebdo (autre tentative, antérieure, jamais
-- reliée à la page Sport actuelle), plus référencée par aucun fichier.
DROP TABLE IF EXISTS planning_sport_semaine;
