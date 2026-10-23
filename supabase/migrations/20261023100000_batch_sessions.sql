-- Lot E3 (23/10) : sessions de batch cooking (une par semaine).
-- `deroule` = étapes communes générées par l'IA, `faits` = identifiants des étapes cochées.
-- Idempotent.

create table if not exists batch_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  recette_ids uuid[] not null default '{}',
  deroule jsonb not null default '{}'::jsonb,
  faits text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table batch_sessions enable row level security;
drop policy if exists "batch_sessions_own" on batch_sessions;
create policy "batch_sessions_own" on batch_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
