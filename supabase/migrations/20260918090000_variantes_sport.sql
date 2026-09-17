-- Chantier 4 étape 1 : variantes de séance nommées (onglets) + changement
-- ponctuel de la séance du jour, sans toucher au planning hebdo.

create table if not exists sport_variantes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type_seance text not null check (type_seance in ('muscu_full', 'muscu_upper', 'natation', 'yoga')),
  lieu text not null default 'na',
  nom text not null,
  est_active boolean not null default false,
  exercices jsonb,
  niveau_natation integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, type_seance, lieu, nom)
);

-- Une seule variante active à la fois par (user, type_seance, lieu).
create unique index if not exists sport_variantes_active_uniq
  on sport_variantes (user_id, type_seance, lieu)
  where est_active;

alter table sport_variantes enable row level security;

create policy "sport_variantes_select_own" on sport_variantes
  for select using (auth.uid() = user_id);
create policy "sport_variantes_insert_own" on sport_variantes
  for insert with check (auth.uid() = user_id);
create policy "sport_variantes_update_own" on sport_variantes
  for update using (auth.uid() = user_id);
create policy "sport_variantes_delete_own" on sport_variantes
  for delete using (auth.uid() = user_id);

-- Reprend les personnalisations muscu existantes (seances_custom) sans perte :
-- chacune devient la variante active "Séance par défaut".
insert into sport_variantes (user_id, type_seance, lieu, nom, est_active, exercices)
select user_id, type_seance, lieu, 'Séance par défaut', true, exercices
from seances_custom
on conflict (user_id, type_seance, lieu, nom) do nothing;

-- Substitution ponctuelle du planning hebdo pour une date précise, sans modifier
-- le planning lui-même ("Changer la séance d'aujourd'hui").
create table if not exists planning_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  type_planning text not null check (
    type_planning in ('muscu_full', 'muscu_upper', 'yoga', 'natation', 'autre', 'repos')
  ),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table planning_overrides enable row level security;

create policy "planning_overrides_own" on planning_overrides
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
