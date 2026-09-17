-- ============================================================
-- Chantier 3 : pourcentages d'ajustement par phase (reglables dans
-- Parametres > Planning sport), appliques a la charge en muscu et a la
-- distance en natation (reutilisable pour toute seance ajoutee plus tard).
--
-- Valeurs par defaut : reglage de confort, pas une prescription scientifique
-- stricte -- la litterature ne fixe pas de pourcentage precis (voir la
-- nouvelle source ci-dessous, ajoutee a la Bibliographie).
-- ============================================================

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS pourcentages_gaia jsonb
  NOT NULL DEFAULT '{"menstruation": -15, "folliculaire": 5, "ovulation": 10, "luteale": -10}'::jsonb;

INSERT INTO sources (id, titre, url) VALUES
  ('10000000-0000-4000-8000-000000000009', 'Evidence for Periodizing Strength and/or Endurance Training According to Menstrual Cycle Phases to Optimize Female Athlete Performance Is Lacking (Strength & Conditioning Journal, 2025)', 'https://journals.lww.com/nsca-scj/fulltext/2025/12000/evidence_for_periodizing_strength_and_or_endurance.4.aspx')
ON CONFLICT (id) DO NOTHING;
