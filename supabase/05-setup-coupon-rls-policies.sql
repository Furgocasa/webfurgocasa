-- ============================================
-- SISTEMA DE CUPONES DE DESCUENTO
-- Paso 5: Configurar políticas de seguridad RLS
-- ============================================

-- Habilitar RLS en las tablas de cupones
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA TABLA COUPONS
-- ============================================

-- Permitir que los usuarios públicos puedan validar cupones (solo lectura de cupones activos)
DROP POLICY IF EXISTS "Cualquiera puede leer cupones activos" ON coupons;
CREATE POLICY "Cualquiera puede leer cupones activos" ON coupons
    FOR SELECT
    USING (is_active = true);

-- Los administradores pueden hacer todo con los cupones
DROP POLICY IF EXISTS "Admins pueden gestionar cupones" ON coupons;
CREATE POLICY "Admins pueden gestionar cupones" ON coupons
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.is_active = true
        )
    );

-- ============================================
-- POLÍTICAS PARA TABLA COUPON_USAGE
-- ============================================

-- Solo los admins pueden ver el historial de uso
DROP POLICY IF EXISTS "Admins pueden ver historial de cupones" ON coupon_usage;
CREATE POLICY "Admins pueden ver historial de cupones" ON coupon_usage
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.is_active = true
        )
    );

-- Solo el sistema (service role) puede insertar registros de uso
DROP POLICY IF EXISTS "Sistema puede registrar uso de cupones" ON coupon_usage;
CREATE POLICY "Sistema puede registrar uso de cupones" ON coupon_usage
    FOR INSERT
    WITH CHECK (true);

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Políticas RLS configuradas exitosamente para sistema de cupones';
END $$;

-- Verificar políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('coupons', 'coupon_usage')
ORDER BY tablename, policyname;
