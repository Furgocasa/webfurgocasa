-- =====================================================
-- FIX: Políticas RLS para translation_queue
-- =====================================================
-- El problema: Cuando un admin crea/actualiza un vehículo,
-- los triggers intentan insertar en translation_queue,
-- pero solo service_role tiene permisos de escritura.
-- 
-- Solución: Permitir que usuarios autenticados (admin)
-- puedan insertar/actualizar en translation_queue
-- =====================================================

-- 1. Ver políticas actuales (para diagnóstico)
SELECT 
  policyname, 
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'translation_queue';

-- 2. Eliminar política restrictiva actual
DROP POLICY IF EXISTS "Cola: solo service_role" ON translation_queue;
DROP POLICY IF EXISTS "Cola: admin puede leer" ON translation_queue;

-- 3. Crear nuevas políticas más permisivas

-- Lectura pública para la cola
CREATE POLICY "translation_queue_select_authenticated"
  ON translation_queue FOR SELECT
  TO authenticated
  USING (true);

-- Admins pueden insertar (necesario para triggers de vehículos, posts, etc.)
CREATE POLICY "translation_queue_insert_authenticated"
  ON translation_queue FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins pueden actualizar (por si necesitan cambiar estado manualmente)
CREATE POLICY "translation_queue_update_authenticated"
  ON translation_queue FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role tiene acceso total (para Edge Functions)
CREATE POLICY "translation_queue_all_service_role"
  ON translation_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Verificar que las políticas se crearon correctamente
SELECT 
  policyname, 
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'translation_queue'
ORDER BY policyname;

-- 5. También verificar content_translations por si acaso
SELECT 
  policyname, 
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'content_translations'
ORDER BY policyname;

-- =====================================================
-- RESUMEN DE CAMBIOS
-- =====================================================
-- 
-- ANTES:
-- - translation_queue: Solo service_role podía escribir
-- - Los triggers fallaban cuando admin creaba vehículos
--
-- DESPUÉS:
-- - translation_queue: authenticated puede SELECT, INSERT, UPDATE
-- - service_role mantiene acceso total
-- - Los triggers funcionarán correctamente
--
-- =====================================================
