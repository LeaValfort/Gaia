-- Redesign du planning sport (étape A) : calendrier hebdo avec plusieurs
-- séances par jour, récurrence (toutes les N semaines) et programme optionnel.
-- N'affecte ni le planning jour-par-jour existant (user_preferences.planning_sport)
-- ni les macros (seance_profils) : ces deux-là restent utilisés tels quels
-- jusqu'aux étapes suivantes du chantier.

create table if not exists planning_sport_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  jour_semaine text not null check (
    jour_semaine in ('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche')
  ),
  type_seance text not null check (
    type_seance in ('muscu_full', 'muscu_upper', 'yoga', 'natation', 'autre')
  ),
  -- Programme précis (variante) pour muscu/natation/yoga ; null = "libre"
  -- (le programme exact sera choisi au moment de la séance, comme aujourd'hui).
  variante_id uuid references sport_variantes(id) on delete set null,
  -- Activité précise pour "Autre sport" (ex. danse, escalade...) ; null = "libre".
  -- Renseigné uniquement quand type_seance = 'autre'.
  activite_type text,
  -- 1 = toutes les semaines, 2 = une semaine sur deux, 3 = une sur trois, etc.
  intervalle_semaines integer not null default 1 check (intervalle_semaines >= 1),
  -- Semaine de départ dans le cycle de récurrence (0 à intervalle_semaines - 1).
  decalage_semaine integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint planning_sport_entries_decalage_valide check (
    decalage_semaine >= 0 and decalage_semaine < intervalle_semaines
  ),
  constraint planning_sport_entries_activite_type_coherent check (
    activite_type is null or type_seance = 'autre'
  ),
  constraint planning_sport_entries_variante_coherente check (
    variante_id is null or type_seance in ('muscu_full', 'muscu_upper', 'natation', 'yoga')
  )
);

create index if not exists planning_sport_entries_user_jour_idx
  on planning_sport_entries (user_id, jour_semaine);

alter table planning_sport_entries enable row level security;

create policy "planning_sport_entries_select_own" on planning_sport_entries
  for select using (auth.uid() = user_id);
create policy "planning_sport_entries_insert_own" on planning_sport_entries
  for insert with check (auth.uid() = user_id);
create policy "planning_sport_entries_update_own" on planning_sport_entries
  for update using (auth.uid() = user_id);
create policy "planning_sport_entries_delete_own" on planning_sport_entries
  for delete using (auth.uid() = user_id);
