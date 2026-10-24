-- Muscu : nouveau lieu « street » (street workout, parc) à côté de maison et salle.
alter table workouts drop constraint if exists workouts_location_check;
alter table workouts add constraint workouts_location_check check (location in ('maison', 'salle', 'street'));

notify pgrst, 'reload schema';
