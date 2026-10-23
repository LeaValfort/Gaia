-- Chantier Proches, fix #2 (23/10) : notifications push.
-- push_subscriptions : abonnements navigateur (un par appareil).
-- proches_notif_prefs : récap quotidien côté proche qui reçoit.
-- proches_notifs_envoyees : anti-doublon (une alerte par connexion, type et jour),
--   écrite uniquement côté serveur avec la clé service_role (aucune policy).
-- Idempotent.

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table push_subscriptions enable row level security;
drop policy if exists "push_subscriptions_own" on push_subscriptions;
create policy "push_subscriptions_own" on push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists proches_notif_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  recap_actif boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table proches_notif_prefs enable row level security;
drop policy if exists "proches_notif_prefs_own" on proches_notif_prefs;
create policy "proches_notif_prefs_own" on proches_notif_prefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists proches_notifs_envoyees (
  connection_id uuid not null references proches_connections(id) on delete cascade,
  type text not null,
  date date not null,
  created_at timestamptz not null default now(),
  primary key (connection_id, type, date)
);
alter table proches_notifs_envoyees enable row level security;

alter table proches_connections
  add column if not exists notif_humeur_difficile boolean not null default true;

notify pgrst, 'reload schema';
