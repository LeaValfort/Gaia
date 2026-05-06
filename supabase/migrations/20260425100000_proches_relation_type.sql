/* Proches: relation_type + fn_proches_create_invitation (4 args) */

ALTER TABLE public.proches_connections
  ADD COLUMN IF NOT EXISTS relation_type text NOT NULL DEFAULT 'partenaire';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proches_connections_relation_type_check'
  ) THEN
    ALTER TABLE public.proches_connections
      ADD CONSTRAINT proches_connections_relation_type_check
      CHECK (relation_type IN ('partenaire', 'ami', 'famille'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DROP FUNCTION IF EXISTS public.fn_proches_create_invitation(text, text, text);
DROP FUNCTION IF EXISTS public.fn_proches_create_invitation(text, text, text, text);

CREATE OR REPLACE FUNCTION public.fn_proches_create_invitation(
  p_partner_name text,
  p_invite_email text,
  p_invite_code text,
  p_relation_type text DEFAULT 'partenaire'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r             public.proches_connections%ROWTYPE;
  owner_label   text;
  v_rel         text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF length(trim(coalesce(p_partner_name, ''))) < 1 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'partner_name_required');
  END IF;

  v_rel := lower(trim(coalesce(p_relation_type, 'partenaire')));
  IF v_rel NOT IN ('partenaire', 'ami', 'famille') THEN
    v_rel := 'partenaire';
  END IF;

  INSERT INTO public.proches_connections (
    owner_id,
    partner_id,
    invite_code,
    invite_email,
    status,
    partner_name,
    relation_type,
    notif_debut_regles,
    notif_energie_basse,
    notif_douleur_haute,
    voir_phase,
    voir_energie,
    voir_douleur,
    voir_humeur,
    voir_conseils,
    voir_libido,
    voir_symptomes
  )
  VALUES (
    auth.uid(),
    NULL,
    trim(p_invite_code),
    NULLIF(trim(coalesce(p_invite_email, '')), ''),
    'pending',
    trim(p_partner_name),
    v_rel,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    false
  )
  RETURNING * INTO r;

  owner_label := 'Ton partenaire';
  SELECT COALESCE(
    NULLIF(TRIM(au.raw_user_meta_data->>'first_name'), ''),
    NULLIF(split_part(TRIM(au.raw_user_meta_data->>'full_name'), ' ', 1), ''),
    NULLIF(split_part(COALESCE(au.email, ''), '@', 1), ''),
    'Ton partenaire'
  ) INTO owner_label
  FROM auth.users au
  WHERE au.id = r.owner_id;

  RETURN jsonb_build_object(
    'ok', true,
    'id', r.id,
    'owner_id', r.owner_id,
    'partner_id', r.partner_id,
    'invite_code', r.invite_code,
    'invite_email', r.invite_email,
    'status', r.status,
    'partner_name', r.partner_name,
    'owner_display_name', owner_label,
    'relation_type', r.relation_type,
    'notif_debut_regles', r.notif_debut_regles,
    'notif_energie_basse', r.notif_energie_basse,
    'notif_douleur_haute', r.notif_douleur_haute,
    'voir_phase', r.voir_phase,
    'voir_energie', r.voir_energie,
    'voir_douleur', r.voir_douleur,
    'voir_humeur', r.voir_humeur,
    'voir_conseils', r.voir_conseils,
    'created_at', r.created_at,
    'accepted_at', r.accepted_at
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'error', 'code_collision');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insert_failed', 'detail', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_proches_create_invitation(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_proches_create_invitation(text, text, text, text) TO authenticated;
