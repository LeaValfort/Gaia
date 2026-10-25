-- Mode « sans règles » (contraception hormonale : pas de phases ni de prédictions)
-- + suivi de la pilule (prise du jour, rappel par notification).

-- 1. Nouvelle valeur autorisée pour mode_utilisateur (la contrainte éventuelle est recréée).
do $$
declare c record;
begin
  for c in
    select con.conname from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    where rel.relname = 'user_preferences' and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%mode_utilisateur%'
  loop
    execute format('alter table user_preferences drop constraint %I', c.conname);
  end loop;
end $$;
alter table user_preferences
  add constraint user_preferences_mode_utilisateur_check
  check (mode_utilisateur in ('cycle', 'sans_cycle', 'sans_regles'));

-- 2. Réglage du rappel de pilule.
create table if not exists pilule_reglages (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rappel_actif boolean not null default false,
  heure text not null default '21:00',  -- HH:MM, heure de Paris
  updated_at timestamptz not null default now()
);
alter table pilule_reglages enable row level security;
drop policy if exists "pilule_reglages_own" on pilule_reglages;
create policy "pilule_reglages_own" on pilule_reglages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. Prises cochées (une par jour).
create table if not exists prises_pilule (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  prise_at timestamptz not null default now(),
  primary key (user_id, date)
);
alter table prises_pilule enable row level security;
drop policy if exists "prises_pilule_own" on prises_pilule;
create policy "prises_pilule_own" on prises_pilule
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. Anti-doublon des rappels (écrit uniquement par le serveur, clé service_role).
create table if not exists rappels_pilule_envoyes (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  primary key (user_id, date)
);
alter table rappels_pilule_envoyes enable row level security;

notify pgrst, 'reload schema';
