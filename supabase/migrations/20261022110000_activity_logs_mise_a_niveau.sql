-- 22/10 : la table activity_logs réelle (prod) était une ancienne version,
-- rattachée à `workouts` (workout_id obligatoire), sans user_id ni sport_type,
-- avec d'anciens noms de colonnes (custom_name, duration_sec, routes_done,
-- activity_style, speed_avg, pace). Aucune activité « autre sport » ne pouvait
-- donc s'enregistrer depuis le code actuel. Mise à niveau sans perte, idempotente.
-- (Les colonnes du schéma actuel ont été ajoutées juste avant à la main par Léa,
-- reprises ici pour que la migration se suffise à elle-même.)

alter table activity_logs
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists sport_type text,
  add column if not exists sport_name text,
  add column if not exists duration_min integer,
  add column if not exists speed_kmh decimal,
  add column if not exists pace_min_km decimal,
  add column if not exists routes_completed integer,
  add column if not exists sport_style text,
  add column if not exists repetitions integer,
  add column if not exists feeling text,
  add column if not exists notes text,
  add column if not exists contenu jsonb,
  add column if not exists created_at timestamptz default now();

-- Une activité n'est plus forcément rattachée à une séance.
alter table activity_logs alter column workout_id drop not null;

-- Anciennes lignes : propriétaire retrouvé via leur séance.
update activity_logs a
set user_id = w.user_id
from workouts w
where a.user_id is null and a.workout_id = w.id;

-- Recopie des anciennes colonnes vers les nouvelles (sans écraser).
update activity_logs set
  sport_type = coalesce(sport_type, 'autre'),
  sport_name = coalesce(sport_name, custom_name),
  duration_min = coalesce(duration_min, round(duration_sec / 60.0)::integer),
  routes_completed = coalesce(routes_completed, routes_done),
  sport_style = coalesce(sport_style, activity_style),
  speed_kmh = coalesce(speed_kmh, speed_avg);

alter table activity_logs alter column sport_type set default 'autre';

-- Accès : par user_id (nouveau) ou via la séance (anciennes lignes).
alter table activity_logs enable row level security;
drop policy if exists "activity_logs_own" on activity_logs;
create policy "activity_logs_own" on activity_logs
  for all
  using (
    auth.uid() = user_id
    or exists (select 1 from workouts w where w.id = activity_logs.workout_id and w.user_id = auth.uid())
  )
  with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
