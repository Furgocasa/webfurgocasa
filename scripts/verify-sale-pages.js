#!/usr/bin/env node

/**
 * Script de verificación post-deploy
 * Verifica que las páginas de venta por ciudad estén funcionando correctamente
 * 
 * Uso: node scripts/verify-sale-pages.js
 */

const https = require('https');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.furgocasa.com';

// Ciudades principales para verificar
const CITIES_TO_CHECK = [
  'murcia',
  'cartagena',
  'alicante',
  'malaga',
  'madrid',
  'valencia',
  'benidorm',
  'torrevieja',
];

// Idiomas a verificar
const LANGUAGES = ['es', 'en', 'fr', 'de'];

// Patrones de traducción
const PATTERNS = {
  es: '/venta-autocaravanas-camper-',
  en: '/campervans-for-sale-in-',
  fr: '/camping-cars-a-vendre-',
  de: '/wohnmobile-zu-verkaufen-',
};

/**
 * Verifica que una URL responda con 200
 */
function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      const status = res.statusCode;
      const success = status === 200;
      resolve({ url, status, success });
    }).on('error', (err) => {
      resolve({ url, status: 0, success: false, error: err.message });
    });
  });
}

/**
 * Main
 */
async function main() {
  console.log('🔍 Verificando páginas de venta por ciudad...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const results = {
    total: 0,
    success: 0,
    failed: 0,
    failedUrls: [],
  };

  // Generar todas las URLs a verificar
  const urlsToCheck = [];
  for (const lang of LANGUAGES) {
    for (const city of CITIES_TO_CHECK) {
      const pattern = PATTERNS[lang];
      const url = `${BASE_URL}/${lang}${pattern}${city}`;
      urlsToCheck.push({ lang, city, url });
    }
  }

  results.total = urlsToCheck.length;

  console.log(`📊 Total de URLs a verificar: ${results.total}\n`);

  // Verificar todas las URLs
  for (const { lang, city, url } of urlsToCheck) {
    const result = await checkUrl(url);
    
    if (result.success) {
      results.success++;
      console.log(`✅ [${lang}] ${city} - ${result.status}`);
    } else {
      results.failed++;
      results.failedUrls.push(url);
      console.log(`❌ [${lang}] ${city} - ${result.status} ${result.error || ''}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 RESUMEN');
  console.log('═══════════════════════════════════════════════');
  console.log(`Total verificadas: ${results.total}`);
  console.log(`✅ Exitosas: ${results.success} (${((results.success / results.total) * 100).toFixed(1)}%)`);
  console.log(`❌ Fallidas: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`);

  if (results.failed > 0) {
    console.log('\n⚠️  URLs fallidas:');
    results.failedUrls.forEach(url => console.log(`   - ${url}`));
    console.log('\n💡 Posibles causas:');
    console.log('   1. Las tablas SQL no se ejecutaron en Supabase');
    console.log('   2. El build de Vercel no completó correctamente');
    console.log('   3. Alguna ciudad tiene is_active = false');
    process.exit(1);
  } else {
    console.log('\n🎉 ¡Todas las páginas funcionan correctamente!');
    process.exit(0);
  }
}

// Verificar también el sitemap
async function verifySitemap() {
  console.log('\n🗺️  Verificando sitemap...');
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  const result = await checkUrl(sitemapUrl);
  
  if (result.success) {
    console.log(`✅ Sitemap accesible: ${sitemapUrl}`);
  } else {
    console.log(`❌ Sitemap no accesible: ${sitemapUrl}`);
  }
}

// Ejecutar
console.clear();
main().then(() => verifySitemap());
