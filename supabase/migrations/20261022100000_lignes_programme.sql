-- Lot B3b (22/10) : lignes perso (mouvements, blocs, intervalles…) ajoutées aux
-- programmes Muscu / Natation / Yoga, qui reviennent à chaque séance.
-- `cle` = type de séance + lieu + programme (variante ou « defaut »).
-- `workouts.contenu_libre` garde les lignes cochées lors d'une séance donnée.
-- Idempotent.

create table if not exists programme_lignes_libres (
  user_id uuid not null references auth.users(id) on delete cascade,
  cle text not null,
  lignes jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, cle)
);

alter table programme_lignes_libres enable row level security;

drop policy if exists "programme_lignes_libres_own" on programme_lignes_libres;
create policy "programme_lignes_libres_own" on programme_lignes_libres
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table workouts
  add column if not exists contenu_libre jsonb;
