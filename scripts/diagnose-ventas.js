/**
 * Script de diagnóstico para vehículos en venta
 * Ejecutar desde la consola del navegador en /ventas
 */

console.log('🔍 DIAGNÓSTICO DE VEHÍCULOS EN VENTA\n');

// 1. Verificar que Supabase está cargado
if (typeof window === 'undefined') {
  console.error('❌ Este script debe ejecutarse en el navegador');
} else {
  console.log('✅ Script ejecutándose en navegador\n');
}

// 2. Verificar consulta directa a Supabase
async function diagnosticarVentas() {
  try {
    // Importar cliente de Supabase
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    
    // Nota: Debes reemplazar estas variables con las correctas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Faltan variables de entorno de Supabase');
      console.log('ℹ️  Ejecuta este código en la consola de la página /ventas');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('📊 TEST 1: Todos los vehículos con is_for_sale = true');
    const { data: allForSale, error: error1 } = await supabase
      .from('vehicles')
      .select('id, name, slug, is_for_sale, sale_status, sale_price, status')
      .eq('is_for_sale', true);
    
    if (error1) {
      console.error('❌ Error:', error1);
    } else {
      console.log(`✅ Encontrados: ${allForSale?.length || 0} vehículos`);
      console.table(allForSale?.map(v => ({
        Nombre: v.name,
        'Sale Status': v.sale_status || 'NULL',
        'Status': v.status || 'NULL',
        'Precio': v.sale_price || 'NULL',
        'Slug': v.slug
      })));
    }
    
    console.log('\n📊 TEST 2: Vehículos con is_for_sale = true Y sale_status = available');
    const { data: available, error: error2 } = await supabase
      .from('vehicles')
      .select('id, name, slug, is_for_sale, sale_status, sale_price, status')
      .eq('is_for_sale', true)
      .eq('sale_status', 'available');
    
    if (error2) {
      console.error('❌ Error:', error2);
    } else {
      console.log(`✅ Encontrados: ${available?.length || 0} vehículos disponibles`);
      if (available && available.length > 0) {
        console.table(available.map(v => ({
          Nombre: v.name,
          'Sale Status': v.sale_status,
          'Precio': v.sale_price,
          'Slug': v.slug
        })));
      } else {
        console.warn('⚠️  No hay vehículos con sale_status = "available"');
        console.log('💡 Posibles causas:');
        console.log('   1. El campo sale_status es NULL');
        console.log('   2. El valor es diferente a "available" (ej: "Available", "AVAILABLE")');
        console.log('   3. Los vehículos están marcados como "reserved" o "sold"');
      }
    }
    
    console.log('\n📊 TEST 3: Query completa como en la página');
    const { data: fullQuery, error: error3 } = await supabase
      .from('vehicles')
      .select(`
        *,
        category:vehicle_categories(*),
        vehicle_images:vehicle_images(*),
        vehicle_equipment(
          id,
          equipment(*)
        )
      `)
      .eq('is_for_sale', true)
      .eq('sale_status', 'available')
      .order('created_at', { ascending: false });
    
    if (error3) {
      console.error('❌ Error en query completa:', error3);
    } else {
      console.log(`✅ Query completa retorna: ${fullQuery?.length || 0} vehículos`);
      if (fullQuery && fullQuery.length > 0) {
        console.log('✅ La página debería mostrar los vehículos correctamente');
      }
    }
    
    console.log('\n📊 RESUMEN:');
    console.log(`Total con is_for_sale=true: ${allForSale?.length || 0}`);
    console.log(`Con sale_status="available": ${available?.length || 0}`);
    console.log(`Query completa funcionando: ${fullQuery?.length || 0}`);
    
    if (allForSale?.length > 0 && available?.length === 0) {
      console.log('\n⚠️  PROBLEMA DETECTADO:');
      console.log('Hay vehículos marcados para venta pero ninguno tiene sale_status = "available"');
      console.log('\n🔧 SOLUCIÓN: Ejecuta este SQL en Supabase:');
      console.log(`
UPDATE vehicles
SET sale_status = 'available'
WHERE is_for_sale = TRUE 
  AND (sale_status IS NULL OR sale_status != 'sold' AND sale_status != 'reserved');
      `);
    }
    
  } catch (err) {
    console.error('❌ Error ejecutando diagnóstico:', err);
  }
}

// Ejecutar si estamos en el navegador
if (typeof window !== 'undefined') {
  console.log('⏳ Ejecutando diagnóstico...\n');
  diagnosticarVentas();
}
