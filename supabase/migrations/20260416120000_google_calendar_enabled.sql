-- Exécuter sur Supabase (SQL Editor ou migration) avant déploiement agenda intégré.
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS google_calendar_enabled boolean DEFAULT true;
