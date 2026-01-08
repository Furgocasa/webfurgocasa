-- ============================================================
-- BLOQUEAR CREACIÓN DE NUEVAS CATEGORÍAS
-- ============================================================
-- Este script asegura que NO se puedan crear nuevas categorías
-- sin autorización explícita
-- ============================================================

-- 1. CREAR TRIGGER PARA PREVENIR INSERCIONES NO AUTORIZADAS
-- ===========================================================

CREATE OR REPLACE FUNCTION prevent_unauthorized_category_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Permitir solo si es la categoría oficial de Furgocasa
    IF NEW.id != 'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid THEN
        RAISE EXCEPTION 'NO AUTORIZADO: No se pueden crear nuevas categorías sin aprobación. Solo existe la categoría "Campers Gran Volumen" (ID: c5bc538e-9d91-43ba-907d-b75bd4aab56d)';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS block_new_categories ON vehicle_categories;
CREATE TRIGGER block_new_categories
    BEFORE INSERT ON vehicle_categories
    FOR EACH ROW
    EXECUTE FUNCTION prevent_unauthorized_category_insert();

-- 2. CREAR TRIGGER PARA PREVENIR ELIMINACIÓN DE LA CATEGORÍA OFICIAL
-- ====================================================================

CREATE OR REPLACE FUNCTION prevent_official_category_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.id = 'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid THEN
        RAISE EXCEPTION 'NO AUTORIZADO: No se puede eliminar la categoría oficial "Campers Gran Volumen"';
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS block_official_category_deletion ON vehicle_categories;
CREATE TRIGGER block_official_category_deletion
    BEFORE DELETE ON vehicle_categories
    FOR EACH ROW
    EXECUTE FUNCTION prevent_official_category_deletion();

-- 3. ASEGURAR QUE TODOS LOS VEHÍCULOS NUEVOS TENGAN LA CATEGORÍA CORRECTA
-- =========================================================================

CREATE OR REPLACE FUNCTION ensure_vehicle_category()
RETURNS TRIGGER AS $$
BEGIN
    -- Si no se especifica categoría, asignar la oficial
    IF NEW.category_id IS NULL THEN
        NEW.category_id := 'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid;
    END IF;
    
    -- Verificar que la categoría asignada existe
    IF NEW.category_id != 'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid THEN
        RAISE WARNING 'ADVERTENCIA: El vehículo % tiene una categoría diferente a "Campers Gran Volumen"', NEW.name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS auto_assign_vehicle_category ON vehicles;
CREATE TRIGGER auto_assign_vehicle_category
    BEFORE INSERT OR UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_vehicle_category();

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

-- Verificar triggers creados
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('vehicle_categories', 'vehicles')
  AND trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================================
-- RESULTADO ESPERADO
-- ============================================================
-- ✓ Trigger: block_new_categories
--   → Impide crear nuevas categorías
--
-- ✓ Trigger: block_official_category_deletion
--   → Impide eliminar la categoría "Campers Gran Volumen"
--
-- ✓ Trigger: auto_assign_vehicle_category
--   → Asigna automáticamente la categoría a vehículos nuevos
--
-- ============================================================
-- PARA DESACTIVAR LA PROTECCIÓN (solo si es necesario)
-- ============================================================
-- DROP TRIGGER IF EXISTS block_new_categories ON vehicle_categories;
-- DROP TRIGGER IF EXISTS block_official_category_deletion ON vehicle_categories;
-- DROP TRIGGER IF EXISTS auto_assign_vehicle_category ON vehicles;
-- ============================================================

