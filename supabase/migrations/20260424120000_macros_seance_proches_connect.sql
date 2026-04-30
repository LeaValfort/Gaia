-- À exécuter sur Supabase (tables + RLS + RPC connexion partenaire)

CREATE TABLE IF NOT EXISTS public.macros_seance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type_seance text NOT NULL,
  calories integer,
  proteines integer,
  glucides integer,
  lipides integer,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, type_seance)
);
ALTER TABLE public.macros_seance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Macros seance perso" ON public.macros_seance;
CREATE POLICY "Macros seance perso" ON public.macros_seance
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.macros_seance TO authenticated;

ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS calories_cibles integer,
  ADD COLUMN IF NOT EXISTS proteines_cibles integer,
  ADD COLUMN IF NOT EXISTS glucides_cibles integer,
  ADD COLUMN IF NOT EXISTS lipides_cibles integer;

ALTER TABLE public.proches_connections
  ADD COLUMN IF NOT EXISTS partner_email text,
  ADD COLUMN IF NOT EXISTS email_sent_at timestamptz;

-- Connexion d’un compte partenaire à une invitation (évite RLS stricte sur SELECT par code)
CREATE OR REPLACE FUNCTION public.fn_proches_connect_partner(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  conn public.proches_connections%ROWTYPE;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  IF p_code IS NULL OR length(trim(p_code)) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  SELECT * INTO conn FROM public.proches_connections
  WHERE upper(trim(invite_code)) = upper(trim(p_code))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF conn.status = 'revoked' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'revoked');
  END IF;

  IF conn.owner_id = uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'own_link');
  END IF;

  IF conn.partner_id IS NOT NULL AND conn.partner_id <> uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_linked');
  END IF;

  IF conn.partner_id = uid THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  UPDATE public.proches_connections
  SET
    partner_id = uid,
    status = 'active',
    accepted_at = COALESCE(accepted_at, now())
  WHERE id = conn.id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_proches_connect_partner(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_proches_connect_partner(text) TO authenticated;
