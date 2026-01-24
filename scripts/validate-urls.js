/**
 * Script de Validación de URLs - Arquitectura Multiidioma
 * ========================================================
 * 
 * Propósito: Verificar que todas las URLs críticas funcionan correctamente
 * y que las redirecciones 301 están implementadas según lo esperado.
 * 
 * Uso:
 *   node scripts/validate-urls.js
 *   node scripts/validate-urls.js --env production
 *   node scripts/validate-urls.js --verbose
 */

const https = require('https');
const http = require('http');

// Configuración
const BASE_URLS = {
  local: 'http://localhost:3000',
  staging: 'https://staging.furgocasa.com',
  production: 'https://www.furgocasa.com'
};

// Obtener entorno desde argumentos
const args = process.argv.slice(2);
const envArg = args.find(arg => arg.startsWith('--env='));
const env = envArg ? envArg.split('=')[1] : 'production';
const verbose = args.includes('--verbose');

const BASE_URL = BASE_URLS[env] || BASE_URLS.production;

console.log(`\n🔍 VALIDACIÓN DE URLs - Entorno: ${env.toUpperCase()}`);
console.log(`📍 Base URL: ${BASE_URL}\n`);

// URLs críticas a validar
const CRITICAL_URLS = [
  // Home
  { path: '/', expectedStatus: 301, description: 'Home sin locale → redirige a /es/' },
  { path: '/es', expectedStatus: 200, description: 'Home ES' },
  { path: '/en', expectedStatus: 200, description: 'Home EN' },
  { path: '/fr', expectedStatus: 200, description: 'Home FR' },
  { path: '/de', expectedStatus: 200, description: 'Home DE' },
  
  // Vehículos
  { path: '/vehiculos', expectedStatus: 301, description: 'Vehículos sin locale → /es/vehiculos' },
  { path: '/es/vehiculos', expectedStatus: 200, description: 'Vehículos ES' },
  { path: '/en/vehicles', expectedStatus: 200, description: 'Vehículos EN' },
  { path: '/fr/vehicules', expectedStatus: 200, description: 'Vehículos FR' },
  { path: '/de/fahrzeuge', expectedStatus: 200, description: 'Vehículos DE' },
  
  // Blog
  { path: '/blog', expectedStatus: 301, description: 'Blog sin locale → /es/blog' },
  { path: '/es/blog', expectedStatus: 200, description: 'Blog ES' },
  { path: '/en/blog', expectedStatus: 200, description: 'Blog EN' },
  
  // Quiénes somos
  { path: '/quienes-somos', expectedStatus: 301, description: 'Quiénes somos sin locale → /es/' },
  { path: '/es/quienes-somos', expectedStatus: 200, description: 'Quiénes somos ES' },
  { path: '/en/about-us', expectedStatus: 200, description: 'About us EN' },
  
  // Contacto
  { path: '/contacto', expectedStatus: 301, description: 'Contacto sin locale → /es/contacto' },
  { path: '/es/contacto', expectedStatus: 200, description: 'Contacto ES' },
  { path: '/en/contact', expectedStatus: 200, description: 'Contact EN' },
  
  // Tarifas
  { path: '/tarifas', expectedStatus: 301, description: 'Tarifas sin locale → /es/tarifas' },
  { path: '/es/tarifas', expectedStatus: 200, description: 'Tarifas ES' },
  { path: '/en/rates', expectedStatus: 200, description: 'Rates EN' },
  
  // Reservar
  { path: '/reservar', expectedStatus: 301, description: 'Reservar sin locale → /es/reservar' },
  { path: '/es/reservar', expectedStatus: 200, description: 'Reservar ES' },
  { path: '/en/book', expectedStatus: 200, description: 'Book EN' },
];

// URLs legacy que deben redirigir
const LEGACY_REDIRECTS = [
  { 
    path: '/es/inicio/quienes-somos', 
    expectedStatus: 301,
    expectedLocation: '/es/quienes-somos',
    description: 'Legacy: /es/inicio/quienes-somos → /es/quienes-somos'
  },
  { 
    path: '/inicio/quienes-somos', 
    expectedStatus: 301,
    expectedLocation: '/es/quienes-somos',
    description: 'Legacy: /inicio/quienes-somos → /es/quienes-somos'
  },
  {
    path: '/index.php',
    expectedStatus: 301,
    expectedLocation: '/',
    description: 'Legacy: /index.php → /'
  },
  {
    path: '/publicaciones',
    expectedStatus: 301,
    expectedLocation: '/blog',
    description: 'Legacy: /publicaciones → /blog'
  },
];

// URLs idioma cruzado que deben redirigir
const CROSS_LOCALE_REDIRECTS = [
  {
    path: '/de/vehicles',
    expectedStatus: 301,
    expectedLocation: '/de/fahrzeuge',
    description: 'Cross-locale: /de/vehicles → /de/fahrzeuge'
  },
  {
    path: '/fr/vehicles',
    expectedStatus: 301,
    expectedLocation: '/fr/vehicules',
    description: 'Cross-locale: /fr/vehicles → /fr/vehicules'
  },
  {
    path: '/en/vehiculos',
    expectedStatus: 301,
    expectedLocation: '/en/vehicles',
    description: 'Cross-locale: /en/vehiculos → /en/vehicles'
  },
];

// Utilidad para hacer request HTTP/HTTPS
function makeRequest(url, followRedirects = false) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Furgocasa-URL-Validator/1.0',
      },
      // No seguir redirecciones por defecto
      followRedirects: false,
    };
    
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          location: res.headers.location,
          body: data,
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Validar una URL
async function validateUrl(test) {
  try {
    const url = `${BASE_URL}${test.path}`;
    const response = await makeRequest(url);
    
    const passed = response.statusCode === test.expectedStatus;
    
    // Verificar redirección si se espera
    let redirectOk = true;
    if (test.expectedLocation && response.location) {
      const actualLocation = response.location.startsWith('http') 
        ? new URL(response.location).pathname 
        : response.location;
      redirectOk = actualLocation === test.expectedLocation;
    }
    
    const status = passed && redirectOk ? '✅' : '❌';
    const statusText = passed && redirectOk ? 'PASS' : 'FAIL';
    
    if (verbose || !passed || !redirectOk) {
      console.log(`${status} ${statusText} - ${test.description}`);
      console.log(`   URL: ${test.path}`);
      console.log(`   Expected: ${test.expectedStatus} | Got: ${response.statusCode}`);
      if (test.expectedLocation) {
        const actualLoc = response.location || 'none';
        console.log(`   Expected location: ${test.expectedLocation} | Got: ${actualLoc}`);
      }
      if (!passed || !redirectOk) {
        console.log(`   ⚠️  Requiere atención`);
      }
      console.log('');
    } else {
      process.stdout.write(status);
    }
    
    return { passed: passed && redirectOk, test, response };
    
  } catch (error) {
    console.log(`❌ ERROR - ${test.description}`);
    console.log(`   URL: ${test.path}`);
    console.log(`   Error: ${error.message}`);
    console.log('');
    return { passed: false, test, error };
  }
}

// Ejecutar todas las validaciones
async function runValidation() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 SECCIÓN 1: URLs CRÍTICAS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const criticalResults = [];
  for (const test of CRITICAL_URLS) {
    const result = await validateUrl(test);
    criticalResults.push(result);
  }
  
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 SECCIÓN 2: REDIRECCIONES LEGACY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const legacyResults = [];
  for (const test of LEGACY_REDIRECTS) {
    const result = await validateUrl(test);
    legacyResults.push(result);
  }
  
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 SECCIÓN 3: REDIRECCIONES IDIOMA CRUZADO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const crossLocaleResults = [];
  for (const test of CROSS_LOCALE_REDIRECTS) {
    const result = await validateUrl(test);
    crossLocaleResults.push(result);
  }
  
  // Resumen
  const allResults = [...criticalResults, ...legacyResults, ...crossLocaleResults];
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;
  const total = allResults.length;
  
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESUMEN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`Total tests: ${total}`);
  console.log(`✅ Passed: ${passed} (${Math.round((passed/total)*100)}%)`);
  console.log(`❌ Failed: ${failed} (${Math.round((failed/total)*100)}%)`);
  console.log('');
  
  if (failed > 0) {
    console.log('⚠️  ATENCIÓN: Hay URLs que requieren corrección\n');
    console.log('URLs fallidas:');
    allResults.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.test.path}: ${r.test.description}`);
    });
    console.log('');
  } else {
    console.log('🎉 ¡Todas las URLs pasaron la validación!\n');
  }
  
  // Validación adicional: robots.txt y sitemap.xml
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 SECCIÓN 4: ARCHIVOS SEO CRÍTICOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const robotsTest = await validateUrl({
    path: '/robots.txt',
    expectedStatus: 200,
    description: 'robots.txt accesible'
  });
  
  const sitemapTest = await validateUrl({
    path: '/sitemap.xml',
    expectedStatus: 200,
    description: 'sitemap.xml accesible'
  });
  
  console.log('\n');
  
  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

// Ejecutar
runValidation().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
