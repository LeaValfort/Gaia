-- Lot C2/C3 (22/10) : profil santé (contraception + conditions) et rendez-vous santé.
-- Les rappels liés à la contraception (contrôle annuel, changement du stérilet)
-- sont calculés à partir de sante_profil, pas stockés en double.
-- Idempotent.

create table if not exists sante_profil (
  user_id uuid primary key references auth.users(id) on delete cascade,
  contraception text not null default 'aucune',
  date_pose date,
  duree_ans integer,
  dernier_controle date,
  conditions text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table sante_profil enable row level security;
drop policy if exists "sante_profil_own" on sante_profil;
create policy "sante_profil_own" on sante_profil
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists rdv_sante (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titre text not null,
  date date not null,
  recurrence_mois integer,
  notes text,
  fait boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists rdv_sante_user_date on rdv_sante (user_id, date);

alter table rdv_sante enable row level security;
drop policy if exists "rdv_sante_own" on rdv_sante;
create policy "rdv_sante_own" on rdv_sante
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
