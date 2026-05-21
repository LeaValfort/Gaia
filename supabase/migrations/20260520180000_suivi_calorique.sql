-- Suivi calorique (macros / repas du jour)
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS suivi_calorique boolean DEFAULT true;
