-- Lot B2 (22/10) : séances libres pour n'importe quel sport.
-- 1. Contenu détaillé d'une activité « autre sport » : lignes ordonnées
--    d'exercices (séries/reps/charge) et de blocs (durée/distance), en jsonb.
-- 2. Modèles réutilisables de séance libre.
-- Idempotent : peut être relancé sans risque.

alter table activity_logs
  add column if not exists contenu jsonb;

create table if not exists modeles_seance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nom text not null,
  sport_type text not null,
  sport_name text,
  contenu jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, nom)
);

alter table modeles_seance enable row level security;

drop policy if exists "modeles_seance_own" on modeles_seance;
create policy "modeles_seance_own" on modeles_seance
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Modifier une activité passée : la policy UPDATE manquait peut-être sur
-- activity_logs (seul l'INSERT était utilisé jusqu'ici). Ajoutée si absente.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'activity_logs' and cmd in ('UPDATE', 'ALL')
  ) then
    create policy "activity_logs_update_own" on activity_logs
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies
    where tablename = 'activity_logs' and cmd in ('DELETE', 'ALL')
  ) then
    create policy "activity_logs_delete_own" on activity_logs
      for delete using (auth.uid() = user_id);
  end if;
end $$;
