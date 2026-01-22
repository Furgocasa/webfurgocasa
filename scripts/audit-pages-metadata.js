/**
 * ========================================================================
 * AUDITORÍA COMPLETA: Páginas sin metadata definida
 * ========================================================================
 * 
 * OBJETIVO:
 * - Encontrar TODAS las páginas (page.tsx) en src/app
 * - Verificar si tienen metadata o generateMetadata definida
 * - Reportar las que NO tienen metadata (CRÍTICO para SEO)
 * ========================================================================
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores para consola
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function findAllPageFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      // Ignorar node_modules y .next
      if (!file.startsWith('.') && file !== 'node_modules') {
        findAllPageFiles(filePath, fileList);
      }
    } else if (file === 'page.tsx' || file === 'page.ts') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function checkMetadata(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Buscar metadata o generateMetadata
    const hasExportMetadata = /export\s+const\s+metadata\s*[:=]/.test(content);
    const hasGenerateMetadata = /export\s+async\s+function\s+generateMetadata/.test(content);
    
    return {
      hasMetadata: hasExportMetadata || hasGenerateMetadata,
      type: hasGenerateMetadata ? 'generateMetadata()' : hasExportMetadata ? 'export const metadata' : null,
      lines: content.split('\n').length
    };
  } catch (error) {
    return {
      hasMetadata: false,
      type: null,
      error: error.message
    };
  }
}

function getRouteFromPath(filePath, appDir) {
  let route = relative(appDir, dirname(filePath));
  
  // Convertir ruta de Windows a Unix
  route = route.replace(/\\/g, '/');
  
  // Convertir parámetros dinámicos
  route = route.replace(/\[([^\]]+)\]/g, ':$1');
  
  // Ignorar grupos de ruta (protected), (auth), etc.
  route = route.replace(/\([^)]+\)/g, '');
  
  // Limpiar barras múltiples
  route = route.replace(/\/+/g, '/');
  
  // Raíz
  if (!route || route === '/') return '/';
  
  return '/' + route;
}

async function auditPages() {
  const appDir = join(__dirname, '..', 'src', 'app');
  
  console.log('\n');
  console.log('╔═════════════════════════════════════════════════════════════════════╗');
  console.log('║         AUDITORÍA COMPLETA: PÁGINAS SIN METADATA (SEO)            ║');
  console.log('╚═════════════════════════════════════════════════════════════════════╝');
  console.log('\nBuscando todos los archivos page.tsx en src/app...\n');

  const pageFiles = findAllPageFiles(appDir);
  
  console.log(`📄 Encontrados ${colors.bold}${pageFiles.length}${colors.reset} archivos page.tsx\n`);
  console.log('='.repeat(80));

  const withMetadata = [];
  const withoutMetadata = [];
  const errors = [];

  for (const filePath of pageFiles) {
    const route = getRouteFromPath(filePath, appDir);
    const check = checkMetadata(filePath);
    const relativePath = relative(process.cwd(), filePath);

    if (check.error) {
      errors.push({ route, path: relativePath, error: check.error });
    } else if (check.hasMetadata) {
      withMetadata.push({ route, path: relativePath, type: check.type });
    } else {
      withoutMetadata.push({ route, path: relativePath });
    }
  }

  // REPORTE: Páginas SIN metadata (CRÍTICO)
  console.log(`\n${colors.red}${colors.bold}❌ CRÍTICO: PÁGINAS SIN METADATA (${withoutMetadata.length})${colors.reset}`);
  console.log('='.repeat(80));
  
  if (withoutMetadata.length > 0) {
    withoutMetadata.forEach(({ route, path }) => {
      console.log(`\n${colors.red}⚠️  FALTA METADATA:${colors.reset}`);
      console.log(`   Ruta: ${colors.yellow}${route}${colors.reset}`);
      console.log(`   Archivo: ${path}`);
    });
  } else {
    console.log(`\n${colors.green}✅ ¡Perfecto! Todas las páginas tienen metadata definida.${colors.reset}`);
  }

  // REPORTE: Páginas CON metadata (OK)
  console.log(`\n\n${colors.green}${colors.bold}✅ PÁGINAS CON METADATA (${withMetadata.length})${colors.reset}`);
  console.log('='.repeat(80));
  
  withMetadata.forEach(({ route, type }) => {
    console.log(`${colors.green}✓${colors.reset} ${route.padEnd(50)} ${colors.blue}${type}${colors.reset}`);
  });

  // REPORTE: Errores
  if (errors.length > 0) {
    console.log(`\n\n${colors.red}${colors.bold}⚠️  ERRORES AL LEER ARCHIVOS (${errors.length})${colors.reset}`);
    console.log('='.repeat(80));
    
    errors.forEach(({ route, path, error }) => {
      console.log(`\n❌ ${route}`);
      console.log(`   Archivo: ${path}`);
      console.log(`   Error: ${error}`);
    });
  }

  // RESUMEN FINAL
  console.log('\n\n╔═════════════════════════════════════════════════════════════════════╗');
  console.log('║                         RESUMEN FINAL                               ║');
  console.log('╚═════════════════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Total páginas: ${pageFiles.length}`);
  console.log(`${colors.green}✅ Con metadata: ${withMetadata.length}${colors.reset}`);
  console.log(`${colors.red}❌ Sin metadata: ${withoutMetadata.length}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Errores: ${errors.length}${colors.reset}`);
  
  console.log('\n' + '='.repeat(80));
  
  if (withoutMetadata.length > 0) {
    console.log(`\n${colors.red}${colors.bold}⚠️  ACCIÓN REQUERIDA:${colors.reset}`);
    console.log(`${colors.red}Hay ${withoutMetadata.length} página(s) SIN metadata definida.${colors.reset}`);
    console.log(`${colors.red}Esto es CRÍTICO para SEO. Deben ser corregidas inmediatamente.${colors.reset}`);
    console.log('\n' + '='.repeat(80));
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bold}✅ ¡EXCELENTE!${colors.reset}`);
    console.log(`${colors.green}Todas las páginas tienen metadata definida correctamente.${colors.reset}`);
    console.log('\n' + '='.repeat(80));
  }
}

// Ejecutar
auditPages().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
