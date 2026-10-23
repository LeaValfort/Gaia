-- 23/10 : sources des conseils du profil santé (C3) et du calendrier de saison (E1),
-- ajoutées à la Bibliographie. Idempotent : n'insère pas une URL déjà présente.

insert into sources (titre, url)
select v.titre, v.url
from (values
  ('Guidelines for the Treatment of Hypothyroidism (American Thyroid Association, 2014)', 'https://pubmed.ncbi.nlm.nih.gov/25266247/'),
  ('Recommendations from the 2023 International Evidence-based Guideline for the Assessment and Management of PCOS', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10477934/'),
  ('I Am the 1 in 10 — What Should I Eat? A Research Review of Nutrition in Endometriosis (Nutrients, 2022)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9783589/'),
  ('ESHRE guideline: endometriosis (2022)', 'https://pubmed.ncbi.nlm.nih.gov/35350465/'),
  ('Effect of tea and other dietary factors on iron absorption', 'https://pubmed.ncbi.nlm.nih.gov/11029010/'),
  ('ACG Clinical Guideline: Management of Irritable Bowel Syndrome (2021)', 'https://pubmed.ncbi.nlm.nih.gov/33315591/'),
  ('Magnesium in Migraine Prophylaxis — Is There an Evidence-Based Rationale? A Systematic Review', 'https://pubmed.ncbi.nlm.nih.gov/29131326/'),
  ('Impact of Dietary Fiber Consumption on Insulin Resistance and the Prevention of Type 2 Diabetes', 'https://pubmed.ncbi.nlm.nih.gov/29378044/'),
  ('Calendrier des fruits et légumes de saison (ADEME)', 'https://agirpourlatransition.ademe.fr/acteurs-education/enseigner/calendrier-fruits-legumes-saison'),
  ('Table de composition nutritionnelle des aliments Ciqual (ANSES)', 'https://ciqual.anses.fr/')
) as v(titre, url)
where not exists (select 1 from sources s where s.url = v.url);
