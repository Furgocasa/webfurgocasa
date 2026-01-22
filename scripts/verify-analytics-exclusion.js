/**
 * 🛡️ Script de Verificación de Exclusión de Analytics en Admin
 * 
 * Ejecutar este script en DevTools Console para verificar que Analytics
 * está correctamente bloqueado en páginas de administrador.
 * 
 * USO:
 * 1. Abrir DevTools (F12)
 * 2. Ir a Console
 * 3. Copiar y pegar este script completo
 * 4. Presionar Enter
 * 5. Leer el reporte generado
 */

(function() {
  console.clear();
  console.log('%c🛡️ VERIFICACIÓN DE EXCLUSIÓN DE ANALYTICS EN ADMIN', 'background: #1e40af; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  console.log('');

  // Detectar página actual
  const pathname = window.location.pathname;
  const isAdminPage = pathname.startsWith('/administrator') || pathname.startsWith('/admin');
  
  console.log(`📍 Página actual: ${pathname}`);
  console.log(`🔍 Es página admin: ${isAdminPage ? '✅ SÍ' : '❌ NO'}`);
  console.log('');

  // Verificar estado de Analytics
  const gtagExists = typeof window.gtag !== 'undefined';
  const dataLayerExists = typeof window.dataLayer !== 'undefined';
  
  console.log('📊 Estado de Google Analytics:');
  console.log('  - window.gtag:', gtagExists ? '⚠️ EXISTE' : '✅ NO EXISTE');
  console.log('  - window.dataLayer:', dataLayerExists ? '⚠️ EXISTE' : '✅ NO EXISTE');
  console.log('');

  // Verificar scripts cargados
  const gtagScript = document.querySelector('script[src*="googletagmanager.com/gtag"]');
  const hasAnalyticsScripts = gtagScript !== null;
  
  console.log('📜 Scripts cargados:');
  console.log('  - gtag.js:', hasAnalyticsScripts ? '⚠️ CARGADO' : '✅ NO CARGADO');
  console.log('');

  // Diagnóstico y recomendaciones
  console.log('%c🎯 DIAGNÓSTICO:', 'background: #059669; color: white; padding: 5px; font-weight: bold;');
  console.log('');

  if (isAdminPage) {
    // ESTAMOS EN PÁGINA ADMIN - No debería haber Analytics
    console.log('🏢 Verificación de Página Admin:');
    console.log('');

    let allGood = true;

    if (gtagExists) {
      console.log('%c❌ PROBLEMA: window.gtag existe en página admin', 'color: red; font-weight: bold;');
      console.log('   → Verificar que AnalyticsBlocker está montado');
      console.log('   → El bloqueador debería sobrescribir gtag con función vacía');
      allGood = false;
    } else {
      console.log('%c✅ CORRECTO: window.gtag NO existe', 'color: green; font-weight: bold;');
    }

    if (dataLayerExists) {
      console.log('%c⚠️ ADVERTENCIA: window.dataLayer existe en página admin', 'color: orange; font-weight: bold;');
      console.log('   → Verificar que AnalyticsBlocker está bloqueando push()');
      allGood = false;
    } else {
      console.log('%c✅ CORRECTO: window.dataLayer NO existe', 'color: green; font-weight: bold;');
    }

    if (hasAnalyticsScripts) {
      console.log('%c❌ PROBLEMA: Scripts de gtag.js cargados en página admin', 'color: red; font-weight: bold;');
      console.log('   → Verificar AnalyticsScripts component');
      console.log('   → Debería retornar null en páginas admin');
      allGood = false;
    } else {
      console.log('%c✅ CORRECTO: Scripts de gtag.js NO están cargados', 'color: green; font-weight: bold;');
    }

    console.log('');
    if (allGood) {
      console.log('%c🎉 ¡PERFECTO! Analytics está completamente bloqueado en admin', 'background: green; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
      console.log('');
      console.log('✅ NO se enviará tráfico a Google Analytics desde esta página');
      console.log('✅ Los administradores NO serán trackeados');
      console.log('✅ Los datos de Analytics permanecerán limpios');
    } else {
      console.log('%c⚠️ HAY PROBLEMAS - Analytics no está completamente bloqueado', 'background: orange; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
      console.log('');
      console.log('🔧 ACCIONES RECOMENDADAS:');
      console.log('1. Verificar que los cambios se desplegaron correctamente');
      console.log('2. Limpiar caché del navegador (Ctrl+Shift+Del)');
      console.log('3. Recargar la página en modo incógnito');
      console.log('4. Verificar DevTools Console para mensajes de [AnalyticsBlocker]');
      console.log('5. Revisar Network tab para ver qué scripts se están cargando');
    }

  } else {
    // ESTAMOS EN PÁGINA PÚBLICA - Debería haber Analytics
    console.log('🌐 Verificación de Página Pública:');
    console.log('');

    let allGood = true;

    if (!gtagExists) {
      console.log('%c⚠️ PROBLEMA: window.gtag NO existe en página pública', 'color: orange; font-weight: bold;');
      console.log('   → Analytics no se cargará');
      console.log('   → Verificar AnalyticsScripts component');
      console.log('   → Verificar que no hay bloqueadores de anuncios activos');
      allGood = false;
    } else {
      console.log('%c✅ CORRECTO: window.gtag existe', 'color: green; font-weight: bold;');
    }

    if (!dataLayerExists) {
      console.log('%c⚠️ PROBLEMA: window.dataLayer NO existe en página pública', 'color: orange; font-weight: bold;');
      console.log('   → Analytics no funcionará correctamente');
      allGood = false;
    } else {
      console.log('%c✅ CORRECTO: window.dataLayer existe', 'color: green; font-weight: bold;');
    }

    if (!hasAnalyticsScripts) {
      console.log('%c⚠️ PROBLEMA: Scripts de gtag.js NO están cargados', 'color: orange; font-weight: bold;');
      console.log('   → Verificar bloqueador de anuncios');
      console.log('   → Verificar AnalyticsScripts component');
      allGood = false;
    } else {
      console.log('%c✅ CORRECTO: Scripts de gtag.js están cargados', 'color: green; font-weight: bold;');
    }

    console.log('');
    if (allGood) {
      console.log('%c🎉 ¡PERFECTO! Analytics está funcionando correctamente', 'background: green; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
      console.log('');
      console.log('✅ Se enviará tráfico a Google Analytics desde esta página');
      console.log('✅ Los pageviews se registrarán');
      console.log('✅ Los eventos se trackearán correctamente');
      
      // Test manual
      console.log('');
      console.log('%c🧪 PRUEBA MANUAL:', 'background: #1e40af; color: white; padding: 5px; font-weight: bold;');
      console.log('Ejecuta en consola:');
      console.log('  window.gtag("event", "test_verification");');
      console.log('');
      console.log('Si NO aparece error → Analytics funciona ✅');
    } else {
      console.log('%c⚠️ HAY PROBLEMAS - Analytics no está funcionando correctamente', 'background: orange; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
      console.log('');
      console.log('🔧 ACCIONES RECOMENDADAS:');
      console.log('1. Verificar bloqueador de anuncios (puede bloquear Analytics)');
      console.log('2. Revisar Network tab para ver errores de carga');
      console.log('3. Verificar que cookies están permitidas');
      console.log('4. Revisar Console para errores JavaScript');
    }
  }

  console.log('');
  console.log('%c📚 INFORMACIÓN ADICIONAL:', 'background: #6366f1; color: white; padding: 5px; font-weight: bold;');
  console.log('');
  console.log('🔍 Para más detalles, busca en Console:');
  console.log('  - Mensajes con [Analytics]');
  console.log('  - Mensajes con [AnalyticsBlocker]');
  console.log('  - Errores en Network tab');
  console.log('');
  console.log('📖 Documentación: FIX-ANALYTICS-ADMIN-EXCLUSION.md');
  console.log('📖 Resumen: RESUMEN-FIX-ANALYTICS-ADMIN.md');
  console.log('');
  console.log('%c✅ Verificación completada', 'background: #059669; color: white; padding: 5px;');

})();
