/* Proches: demande d'acces + validation owner (sans auto-activation) */

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

  SELECT *
  INTO conn
  FROM public.proches_connections
  WHERE upper(trim(invite_code)) = upper(trim(p_code))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF conn.owner_id = uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'own_link');
  END IF;

  IF conn.status = 'revoked' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'revoked');
  END IF;

  IF conn.partner_id IS NOT NULL AND conn.partner_id <> uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_linked');
  END IF;

  IF conn.partner_id = uid THEN
    RETURN jsonb_build_object('ok', true, 'already', true, 'status', conn.status);
  END IF;

  UPDATE public.proches_connections
  SET
    partner_id = uid,
    status = 'pending'
  WHERE id = conn.id;

  RETURN jsonb_build_object('ok', true, 'requested', true, 'status', 'pending');
END;
$$;

REVOKE ALL ON FUNCTION public.fn_proches_connect_partner(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_proches_connect_partner(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.fn_proches_decide_access(p_connection_id uuid, p_decision text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  conn public.proches_connections%ROWTYPE;
  v_decision text;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  v_decision := lower(trim(coalesce(p_decision, '')));
  IF v_decision NOT IN ('accept', 'refuse') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_decision');
  END IF;

  SELECT *
  INTO conn
  FROM public.proches_connections
  WHERE id = p_connection_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF conn.owner_id <> uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;

  IF conn.status <> 'pending' OR conn.partner_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_request');
  END IF;

  IF v_decision = 'accept' THEN
    UPDATE public.proches_connections
    SET
      status = 'active',
      accepted_at = COALESCE(accepted_at, now())
    WHERE id = conn.id;
    RETURN jsonb_build_object('ok', true, 'status', 'active');
  END IF;

  UPDATE public.proches_connections
  SET
    partner_id = NULL,
    status = 'pending',
    accepted_at = NULL
  WHERE id = conn.id;

  RETURN jsonb_build_object('ok', true, 'status', 'pending');
END;
$$;

REVOKE ALL ON FUNCTION public.fn_proches_decide_access(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_proches_decide_access(uuid, text) TO authenticated;
