-- Chantier 6 : checklist alimentation quotidienne (anti-inflammatoire adapté
-- à la phase + préparation de la séance du jour), distincte de la checklist
-- hebdomadaire existante (nutrition_logs, gardée uniquement pour le batch
-- cooking du dimanche).

create table if not exists nutrition_checklist_jour (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  checklist jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists nutrition_checklist_jour_user_date_idx
  on nutrition_checklist_jour (user_id, date);

alter table nutrition_checklist_jour enable row level security;

create policy "nutrition_checklist_jour_select_own" on nutrition_checklist_jour
  for select using (auth.uid() = user_id);
create policy "nutrition_checklist_jour_insert_own" on nutrition_checklist_jour
  for insert with check (auth.uid() = user_id);
create policy "nutrition_checklist_jour_update_own" on nutrition_checklist_jour
  for update using (auth.uid() = user_id);
create policy "nutrition_checklist_jour_delete_own" on nutrition_checklist_jour
  for delete using (auth.uid() = user_id);
