-- Corrige un decalage de schema : la table activity_logs reelle (production)
-- n'avait ni colonne `date` ni colonne `created_at`, contrairement a ce que
-- decrivait supabase/schema.sql. Resultat : l'enregistrement d'une activite
-- "Autre sport" echouait avec l'erreur PostgREST "Could not find the 'date'
-- column of 'activity_logs' in the schema cache".
--
-- DEFAULT CURRENT_DATE permet a ADD COLUMN de backfiller en un seul coup
-- les lignes existantes sans dependre d'une colonne created_at absente.

ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS date date NOT NULL DEFAULT CURRENT_DATE;
