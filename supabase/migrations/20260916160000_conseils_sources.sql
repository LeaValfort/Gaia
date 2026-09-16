-- ============================================================
-- Chantier 2 : Conseils enrichis (rotation) + Bibliographie des sources
-- ============================================================

-- Table des sources bibliographiques (references scientifiques consultables)
CREATE TABLE IF NOT EXISTS sources (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre      text NOT NULL,
  url        text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table des conseils : plusieurs variantes par phase x categorie, avec rotation cote appli
CREATE TABLE IF NOT EXISTS conseils (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase      text NOT NULL CHECK (phase IN ('menstruation', 'folliculaire', 'ovulation', 'luteale')),
  categorie  text NOT NULL CHECK (categorie IN ('sport', 'nutrition', 'sommeil', 'bien_etre', 'astuce')),
  texte      text NOT NULL,
  source_id  uuid REFERENCES sources(id) ON DELETE SET NULL,
  genere_ia  boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conseils_phase_categorie ON conseils (phase, categorie);

ALTER TABLE sources  ENABLE ROW LEVEL SECURITY;
ALTER TABLE conseils ENABLE ROW LEVEL SECURITY;

-- Contenu global (pas de user_id) : lecture/ecriture pour toute utilisatrice authentifiee.
-- App mono-utilisatrice : suffisant, pas besoin d'un partage multi-comptes.
DROP POLICY IF EXISTS "Lecture sources" ON sources;
CREATE POLICY "Lecture sources" ON sources FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Ecriture sources" ON sources;
CREATE POLICY "Ecriture sources" ON sources FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Lecture conseils" ON conseils;
CREATE POLICY "Lecture conseils" ON conseils FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Ecriture conseils" ON conseils;
CREATE POLICY "Ecriture conseils" ON conseils FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Marqueur de derniere generation automatique (IA) de nouveaux conseils
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS conseils_generes_le date;

-- ------------------------------------------------------------
-- Seed : 8 sources scientifiques vetees + reprise des conseils existants
-- (auparavant codes en dur dans lib/data/conseils-phase-cycle.ts)
-- ------------------------------------------------------------

INSERT INTO sources (id, titre, url) VALUES
  ('10000000-0000-4000-8000-000000000001', 'The Influence of Menstrual Cycle Phases on Maximal Strength Performance in Healthy Female Adults: A Systematic Review with Meta-Analysis (MDPI, 2024)', 'https://www.mdpi.com/2075-4663/12/1/31'),
  ('10000000-0000-4000-8000-000000000002', 'Current evidence shows no influence of women''s menstrual cycle phase on acute strength performance or adaptations to resistance exercise training (Frontiers, 2023)', 'https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2023.1054542/full'),
  ('10000000-0000-4000-8000-000000000003', 'The Effects of Menstrual Cycle Phase on Elite Athlete Performance: A Critical and Systematic Review (Frontiers/PMC)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8170151/'),
  ('10000000-0000-4000-8000-000000000004', 'Power in the flow: how menstrual experiences shape women''s strength training performance (Frontiers, 2025)', 'https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2025.1519825/full'),
  ('10000000-0000-4000-8000-000000000005', 'Nutritional practices to manage menstrual cycle related symptoms: a systematic review (Nutrition Research Reviews, Cambridge)', 'https://www.cambridge.org/core/journals/nutrition-research-reviews/article/nutritional-practices-to-manage-menstrual-cycle-related-symptoms-a-systematic-review/F28E2DC079C7DC2F1AC07A0EFCDE0DE1'),
  ('10000000-0000-4000-8000-000000000006', 'The Menstrual Cycle and Sleep (Sleep Medicine Clinics, PubMed)', 'https://pubmed.ncbi.nlm.nih.gov/38501513/'),
  ('10000000-0000-4000-8000-000000000007', 'Effects of magnesium and vitamin B6 on the severity of premenstrual syndrome symptoms (PubMed)', 'https://pubmed.ncbi.nlm.nih.gov/25276694/'),
  ('10000000-0000-4000-8000-000000000008', 'Cognition, The Menstrual Cycle, and Premenstrual Disorders: A Review (PubMed/MDPI)', 'https://pubmed.ncbi.nlm.nih.gov/32230889/')
ON CONFLICT (id) DO NOTHING;

-- Menstruation
INSERT INTO conseils (phase, categorie, texte, source_id) VALUES
  ('menstruation', 'sport', 'Repos et douceur — yoga yin, marche légère. Écoute ton corps.', NULL),
  ('menstruation', 'nutrition', 'Privilégie le fer (légumineuses, épinards), le magnésium et le chocolat noir 70%+.', '10000000-0000-4000-8000-000000000005'),
  ('menstruation', 'sommeil', 'Dors autant que possible. La fatigue est normale ces jours-ci.', '10000000-0000-4000-8000-000000000006'),
  ('menstruation', 'bien_etre', 'Bouillote, bain chaud, tisane framboisier ou camomille.', NULL),
  ('menstruation', 'astuce', 'Évite les anti-douleurs trop souvent — l''ibuprofène est plus efficace que le paracétamol pour les crampes utérines.', NULL),
  ('menstruation', 'astuce', 'Pendant les règles, ton taux d''œstrogènes est au plus bas. C''est normal de se sentir plus introvertie et moins énergique. 🌸', '10000000-0000-4000-8000-000000000008');

-- Folliculaire
INSERT INTO conseils (phase, categorie, texte, source_id) VALUES
  ('folliculaire', 'sport', 'Énergie en hausse — idéal pour la musculation et les séances intenses.', '10000000-0000-4000-8000-000000000001'),
  ('folliculaire', 'nutrition', 'Aliments fermentés, protéines maigres et oméga-3 pour soutenir l''ovulation.', '10000000-0000-4000-8000-000000000005'),
  ('folliculaire', 'sommeil', 'Ton sommeil est plus léger et récupérateur cette semaine.', '10000000-0000-4000-8000-000000000006'),
  ('folliculaire', 'bien_etre', 'C''est le bon moment pour démarrer de nouveaux projets et prendre des décisions.', '10000000-0000-4000-8000-000000000008'),
  ('folliculaire', 'astuce', 'Profite de cette phase pour augmenter tes charges en musculation — ta tolérance à la douleur est plus élevée.', '10000000-0000-4000-8000-000000000001'),
  ('folliculaire', 'astuce', 'Les œstrogènes montent progressivement, ce qui améliore ton humeur, ta mémoire et ta confiance. Tu es au top ! ✨', '10000000-0000-4000-8000-000000000008');

-- Ovulation
INSERT INTO conseils (phase, categorie, texte, source_id) VALUES
  ('ovulation', 'sport', 'Pic d''énergie — HIIT, escalade, natation intensive. Tous les défis sont permis !', '10000000-0000-4000-8000-000000000001'),
  ('ovulation', 'nutrition', 'Fibres, légumes crucifères et antioxydants pour équilibrer les œstrogènes.', '10000000-0000-4000-8000-000000000005'),
  ('ovulation', 'sommeil', 'Tu as besoin de moins de sommeil ces jours-ci — profites-en !', '10000000-0000-4000-8000-000000000006'),
  ('ovulation', 'bien_etre', 'Tu rayonnes naturellement — c''est hormonal ! Profite de ton énergie sociale.', '10000000-0000-4000-8000-000000000008'),
  ('ovulation', 'astuce', 'L''ovulation dure 12-24h maximum. Les signes : légère douleur côté bas-ventre, glaire cervicale transparente.', NULL),
  ('ovulation', 'astuce', 'Ton pic de LH (hormone lutéinisante) déclenche l''ovulation. C''est ton moment de peak performance mensuel. 🚀', '10000000-0000-4000-8000-000000000004');

-- Luteale
INSERT INTO conseils (phase, categorie, texte, source_id) VALUES
  ('luteale', 'sport', 'Préfère le yoga flow ou la natation douce. Réduis l''intensité progressivement.', '10000000-0000-4000-8000-000000000001'),
  ('luteale', 'nutrition', 'Magnésium (noix, graines), glucides complexes et évite la caféine après 14h.', '10000000-0000-4000-8000-000000000005'),
  ('luteale', 'sommeil', 'La progestérone peut perturber ton sommeil. Couche-toi plus tôt.', '10000000-0000-4000-8000-000000000006'),
  ('luteale', 'bien_etre', 'Sois indulgente avec toi-même — les sautes d''humeur sont hormonales, pas un défaut.', '10000000-0000-4000-8000-000000000008'),
  ('luteale', 'astuce', 'Si tu as des fringales de sucre, c''est normal — la progestérone augmente ton métabolisme de base.', NULL),
  ('luteale', 'astuce', 'Le syndrome prémenstruel touche 75% des femmes. Le magnésium et la vitamine B6 peuvent aider. 🌙', '10000000-0000-4000-8000-000000000007');
