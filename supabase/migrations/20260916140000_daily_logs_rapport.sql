-- Ajoute un marqueur "rapport" au journal du jour (case a cocher / etoile),
-- affiche dans le questionnaire du jour et sur le calendrier mensuel.
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS rapport boolean NOT NULL DEFAULT false;
