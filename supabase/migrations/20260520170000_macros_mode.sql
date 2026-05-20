-- Mode macros (auto / manuel) + valeurs manuelles par type de séance

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS macros_mode text NOT NULL DEFAULT 'auto'
  CHECK (macros_mode IN ('auto', 'manuel'));

ALTER TABLE public.macro_profiles
  ADD COLUMN IF NOT EXISTS macros_manuels jsonb;
