-- El contador de visitas del blog fallaba en silencio: la RPC hacía UPDATE sobre posts
-- pero RLS solo permite SELECT público. SECURITY DEFINER permite incrementar views
-- sin abrir UPDATE general sobre posts.

CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE posts
    SET views = COALESCE(views, 0) + 1
    WHERE id = post_id
      AND status = 'published';
END;
$$;

REVOKE ALL ON FUNCTION increment_post_views(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO anon, authenticated, service_role;
