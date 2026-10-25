-- Bibliothèque de recettes commune à toutes les utilisatrices : chaque recette générée
-- par l'IA y est ajoutée, et Gaia y pioche avant de demander de nouvelles recettes.
create table if not exists recettes_communes (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  -- Nom en minuscules sans accents : évite les doublons (« Bowl de quinoa » = « bowl de quinoa »).
  nom_normalise text not null unique,
  phase text,
  type_repas text,
  temps_min integer not null default 30,
  portions integer not null default 1,
  ingredients_structures jsonb not null,
  instructions text not null default '',
  raison text not null default '',
  -- Mois de création (1-12) : sert à ne reproposer que des recettes de saison.
  mois integer not null,
  -- Profils santé pour lesquels la recette a été pensée (thyroïde, SOPK…).
  conditions text[] not null default '{}',
  liee_batch boolean not null default false,
  utilisations integer not null default 0,
  cree_par uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists recettes_communes_type_repas_idx on recettes_communes (type_repas, phase);

alter table recettes_communes enable row level security;
-- Lecture : toute utilisatrice connectée. Ajout : en son nom uniquement. Pas de modification.
drop policy if exists "recettes_communes_lecture" on recettes_communes;
create policy "recettes_communes_lecture" on recettes_communes for select to authenticated using (true);
drop policy if exists "recettes_communes_ajout" on recettes_communes;
create policy "recettes_communes_ajout" on recettes_communes for insert to authenticated with check (auth.uid() = cree_par);

notify pgrst, 'reload schema';
