-- Lot E2 (23/10) : afficher ou non les repas prévus du jour sur l'accueil.
alter table user_preferences
  add column if not exists repas_jour_accueil boolean not null default true;
notify pgrst, 'reload schema';
