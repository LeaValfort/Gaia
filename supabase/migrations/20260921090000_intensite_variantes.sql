-- Refonte Planning sport — étape B : l'intensité/effort/durée (utilisés pour les
-- macros) se règlent désormais à la création de chaque programme (variante),
-- plutôt que par type de séance dans Paramètres.
-- La table seance_profils est conservée pour l'instant (suppression prévue à
-- l'étape C) : elle devient un cache resynchronisé automatiquement à chaque
-- création/activation/modification de variante, plus un réglage édité à la main.

alter table sport_variantes
  add column if not exists intensite text not null default 'moderee'
    check (intensite in ('legere', 'moderee', 'intense')),
  add column if not exists type_effort text not null default 'mixte'
    check (type_effort in ('force', 'cardio', 'mixte', 'mobilite')),
  add column if not exists duree_min integer not null default 45
    check (duree_min > 0);
