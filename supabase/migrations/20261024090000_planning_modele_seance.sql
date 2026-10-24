-- Planning sport : une séance planifiée peut pointer vers un modèle de séance libre
-- (autres sports : course, pilates, danse…). Supprimer le modèle remet la séance en « par défaut ».
alter table planning_sport_entries
  add column if not exists modele_id uuid references modeles_seance(id) on delete set null;

notify pgrst, 'reload schema';
