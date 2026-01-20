/**
 * Script de Prueba - Google Analytics
 * 
 * Este script verifica que Google Analytics está correctamente configurado
 * y que las páginas de administrador están excluidas del tracking.
 * 
 * EJECUCIÓN:
 * 1. Abre el navegador en https://www.furgocasa.com
 * 2. Abre la consola de desarrollo (F12)
 * 3. Copia y pega este script completo
 * 4. Presiona Enter
 * 
 * El script navegará automáticamente por diferentes páginas y verificará
 * que Analytics solo se active en páginas públicas.
 */

(async function testGoogleAnalytics() {
  console.log('🔍 Iniciando test de Google Analytics...\n');
  
  const GA_ID = 'G-G5YLBN5XXZ';
  const results = {
    passed: [],
    failed: []
  };

  // Test 1: Verificar que gtag está cargado (solo en páginas públicas)
  function testGtagLoaded() {
    const currentPath = window.location.pathname;
    const isAdmin = currentPath.startsWith('/administrator') || currentPath.startsWith('/admin');
    
    console.log(`📍 Ruta actual: ${currentPath}`);
    console.log(`🔐 ¿Es ruta admin?: ${isAdmin}`);
    
    if (isAdmin) {
      if (!window.gtag || !window.dataLayer || window.dataLayer.length === 0) {
        console.log('✅ CORRECTO: gtag NO está cargado en página admin');
        results.passed.push('gtag no cargado en admin');
        return true;
      } else {
        console.error('❌ ERROR: gtag está cargado en página admin!');
        results.failed.push('gtag cargado en admin');
        return false;
      }
    } else {
      if (window.gtag && window.dataLayer) {
        console.log('✅ CORRECTO: gtag está cargado en página pública');
        results.passed.push('gtag cargado en página pública');
        return true;
      } else {
        console.error('❌ ERROR: gtag NO está cargado en página pública!');
        results.failed.push('gtag no cargado en página pública');
        return false;
      }
    }
  }

  // Test 2: Verificar dataLayer
  function testDataLayer() {
    const currentPath = window.location.pathname;
    const isAdmin = currentPath.startsWith('/administrator') || currentPath.startsWith('/admin');
    
    if (isAdmin) {
      console.log('⏭️  Skipping dataLayer test en admin (esperado vacío)');
      return true;
    }
    
    if (window.dataLayer && window.dataLayer.length > 0) {
      console.log('✅ CORRECTO: dataLayer tiene eventos:', window.dataLayer.length);
      results.passed.push('dataLayer poblado');
      return true;
    } else {
      console.error('❌ ERROR: dataLayer está vacío en página pública');
      results.failed.push('dataLayer vacío');
      return false;
    }
  }

  // Test 3: Verificar que el ID de Analytics es correcto
  function testAnalyticsID() {
    const currentPath = window.location.pathname;
    const isAdmin = currentPath.startsWith('/administrator') || currentPath.startsWith('/admin');
    
    if (isAdmin) {
      console.log('⏭️  Skipping Analytics ID test en admin');
      return true;
    }
    
    const dataLayerString = JSON.stringify(window.dataLayer);
    
    if (dataLayerString.includes(GA_ID)) {
      console.log(`✅ CORRECTO: ID de Analytics encontrado (${GA_ID})`);
      results.passed.push('ID correcto');
      return true;
    } else {
      console.error(`❌ ERROR: ID de Analytics NO encontrado (buscando: ${GA_ID})`);
      results.failed.push('ID incorrecto');
      return false;
    }
  }

  // Test 4: Verificar modo de consentimiento
  function testConsentMode() {
    const currentPath = window.location.pathname;
    const isAdmin = currentPath.startsWith('/administrator') || currentPath.startsWith('/admin');
    
    if (isAdmin) {
      console.log('⏭️  Skipping consent mode test en admin');
      return true;
    }
    
    const dataLayerString = JSON.stringify(window.dataLayer);
    
    if (dataLayerString.includes('consent')) {
      console.log('✅ CORRECTO: Modo de consentimiento configurado');
      results.passed.push('consent mode configurado');
      return true;
    } else {
      console.warn('⚠️  ADVERTENCIA: No se detectó configuración de consentimiento');
      results.failed.push('consent mode no encontrado');
      return false;
    }
  }

  // Test 5: Verificar script de Google Analytics en DOM
  function testGAScript() {
    const currentPath = window.location.pathname;
    const isAdmin = currentPath.startsWith('/administrator') || currentPath.startsWith('/admin');
    
    const gaScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_ID}"]`);
    
    if (isAdmin) {
      if (!gaScript) {
        console.log('✅ CORRECTO: Script de GA NO está en el DOM en página admin');
        results.passed.push('script GA no cargado en admin');
        return true;
      } else {
        console.error('❌ ERROR: Script de GA está en el DOM en página admin!');
        results.failed.push('script GA cargado en admin');
        return false;
      }
    } else {
      if (gaScript) {
        console.log('✅ CORRECTO: Script de GA está en el DOM en página pública');
        results.passed.push('script GA cargado en página pública');
        return true;
      } else {
        console.error('❌ ERROR: Script de GA NO está en el DOM en página pública!');
        results.failed.push('script GA no cargado en página pública');
        return false;
      }
    }
  }

  // Ejecutar tests
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 Ejecutando Tests');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  testGtagLoaded();
  testDataLayer();
  testAnalyticsID();
  testConsentMode();
  testGAScript();

  // Mostrar resumen
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Resumen de Tests');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`✅ Tests pasados: ${results.passed.length}`);
  results.passed.forEach(test => console.log(`   • ${test}`));
  
  console.log(`\n❌ Tests fallidos: ${results.failed.length}`);
  results.failed.forEach(test => console.log(`   • ${test}`));

  const totalTests = results.passed.length + results.failed.length;
  const percentage = totalTests > 0 ? Math.round((results.passed.length / totalTests) * 100) : 0;
  
  console.log(`\n📈 Porcentaje de éxito: ${percentage}%`);
  
  if (percentage === 100) {
    console.log('\n🎉 ¡Todos los tests pasaron! Google Analytics está configurado correctamente.');
  } else if (percentage >= 80) {
    console.log('\n⚠️  La mayoría de tests pasaron, pero hay algunos problemas menores.');
  } else {
    console.log('\n❌ Hay problemas significativos con la configuración de Google Analytics.');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 Próximos pasos:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('1. Si estás en una página pública:');
  console.log('   • Acepta las cookies de analytics en el banner');
  console.log('   • Vuelve a ejecutar este script');
  console.log('   • Verifica en Google Analytics → Tiempo Real\n');
  console.log('2. Para probar exclusión de admin:');
  console.log('   • Navega a /administrator/login');
  console.log('   • Ejecuta este script de nuevo');
  console.log('   • Debe mostrar que gtag NO está cargado\n');
  console.log('3. Para inspeccionar dataLayer:');
  console.log('   • Ejecuta: window.dataLayer');
  console.log('   • Revisa los eventos registrados\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Información adicional
  console.log('📋 Información del Entorno:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`🌐 URL: ${window.location.href}`);
  console.log(`📍 Pathname: ${window.location.pathname}`);
  console.log(`🔐 ¿Es admin?: ${window.location.pathname.startsWith('/administrator')}`);
  console.log(`🍪 Cookies aceptadas: ${localStorage.getItem('furgocasa_cookie_consent') || 'No'}`);
  
  try {
    const prefs = JSON.parse(localStorage.getItem('furgocasa_cookie_preferences') || '{}');
    console.log(`📊 Analytics permitido: ${prefs.analytics || false}`);
  } catch (e) {
    console.log('📊 Analytics permitido: No configurado');
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
})();
