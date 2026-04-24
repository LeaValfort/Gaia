-- Politiques RLS explicites sur `cycles` (INSERT avec WITH CHECK).
-- À exécuter dans Supabase → SQL Editor si l’enregistrement du début des règles échoue
-- avec une erreur de droits / RLS.

DROP POLICY IF EXISTS "Accès personnel cycles" ON public.cycles;

CREATE POLICY "cycles_select"
  ON public.cycles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "cycles_insert"
  ON public.cycles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cycles_update"
  ON public.cycles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cycles_delete"
  ON public.cycles FOR DELETE
  USING (auth.uid() = user_id);
