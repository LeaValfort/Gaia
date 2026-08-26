-- Corrige un decalage de schema : activity_logs existait sans colonne `date`
-- (la table avait ete creee avant que schema.sql l'ajoute, et
-- `CREATE TABLE IF NOT EXISTS` ne met pas a jour une table deja existante).
-- Resultat : l'enregistrement d'une activite "Autre sport" echouait avec
-- l'erreur PostgREST "Could not find the 'date' column of 'activity_logs'
-- in the schema cache".

ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS date date;

-- Comble les eventuelles lignes existantes sans date, avec la date de creation.
UPDATE activity_logs SET date = created_at::date WHERE date IS NULL;

ALTER TABLE activity_logs ALTER COLUMN date SET NOT NULL;
