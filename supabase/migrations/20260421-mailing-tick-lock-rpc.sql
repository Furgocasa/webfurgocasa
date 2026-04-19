-- RPC para tomar / soltar el lock del cron sin pasar por UPDATE REST con filtros
-- sobre tick_lock_at. En algunos despliegues PostgREST devolvía
-- "column mailing_campaigns.tick_lock_at does not exist" aunque la columna
-- existiera en Postgres (caché de esquema / capa REST). Estas funciones
-- ejecutan SQL puro en el servidor y se invocan vía supabase.rpc().

CREATE OR REPLACE FUNCTION public.mailing_claim_campaign_tick(p_campaign_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stale_boundary timestamptz := now() - interval '5 minutes';
  updated int;
BEGIN
  UPDATE mailing_campaigns
  SET tick_lock_at = now()
  WHERE id = p_campaign_id
    AND status = 'sending'
    AND is_paused = false
    AND (tick_lock_at IS NULL OR tick_lock_at < stale_boundary);
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated = 1;
END;
$$;

COMMENT ON FUNCTION public.mailing_claim_campaign_tick(uuid) IS
  'Intenta tomar el lock exclusivo del tick para una campaña. Devuelve true si esta invocación ganó el lock (1 fila actualizada).';

CREATE OR REPLACE FUNCTION public.mailing_release_campaign_tick(p_campaign_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE mailing_campaigns
  SET tick_lock_at = NULL
  WHERE id = p_campaign_id;
END;
$$;

COMMENT ON FUNCTION public.mailing_release_campaign_tick(uuid) IS
  'Libera el lock tick_lock_at de una campaña (siempre al terminar el tick).';

REVOKE ALL ON FUNCTION public.mailing_claim_campaign_tick(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mailing_release_campaign_tick(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mailing_claim_campaign_tick(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.mailing_release_campaign_tick(uuid) TO service_role;
