/**
 * Script para eliminar H1 duplicados en el contenido de artículos del blog
 * 
 * Problema: Los artículos tienen un H1 en la página (título del post) 
 * y otro H1 dentro del contenido HTML del artículo.
 * 
 * Solución: Este script elimina el H1 del contenido si coincide con el título.
 * 
 * Ejecutar: node scripts/fix-duplicate-h1-blog.js
 * 
 * Opciones:
 *   --dry-run    Solo mostrar qué se corregiría sin hacer cambios
 *   --verbose    Mostrar más detalles
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Opciones de línea de comandos
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan credenciales de Supabase en .env.local');
  console.log('Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Normaliza un texto para comparación
 * Elimina espacios extra, HTML, caracteres especiales
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '') // Eliminar HTML
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')  // Normalizar espacios
    .trim()
    .toLowerCase();
}

/**
 * Compara si dos textos son similares (con tolerancia)
 */
function textsAreSimilar(text1, text2) {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);
  
  // Coincidencia exacta
  if (normalized1 === normalized2) return true;
  
  // Uno está contenido en el otro (para casos con subtítulos)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return true;
  
  // Coincidencia parcial (más del 80% de similitud)
  const longer = normalized1.length > normalized2.length ? normalized1 : normalized2;
  const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1;
  
  if (longer.length === 0) return false;
  
  let matchCount = 0;
  const words1 = normalized1.split(/\s+/);
  const words2 = normalized2.split(/\s+/);
  
  for (const word of words1) {
    if (words2.includes(word) && word.length > 2) {
      matchCount++;
    }
  }
  
  const totalWords = Math.max(words1.length, words2.length);
  return totalWords > 0 && (matchCount / totalWords) > 0.7;
}

/**
 * Extrae el texto de un H1 tag
 */
function extractH1Text(h1Match) {
  if (!h1Match) return '';
  // Extraer el contenido entre <h1...> y </h1>
  const match = h1Match.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? match[1] : '';
}

/**
 * Analiza y corrige el contenido de un post
 * Retorna { needsFix, newContent, h1Found }
 */
function analyzeAndFixContent(content, title) {
  if (!content || !title) {
    return { needsFix: false, newContent: content, h1Found: null };
  }

  // El contenido viene de Joomla con estructura HTML compleja
  // Patrones específicos para encontrar H1 en contenido de Joomla
  const h1Patterns = [
    // H1 con itemprop="headline" (estructura de Joomla)
    /(<h1[^>]*itemprop=["']headline["'][^>]*>[\s\S]*?<\/h1>)/i,
    // H1 dentro de article-header
    /<div class="article-header">\s*(<h1[^>]*>[\s\S]*?<\/h1>)/i,
    // H1 estándar
    /(<h1[^>]*>[\s\S]*?<\/h1>)/i,
  ];

  let h1Match = null;
  let h1Text = '';

  for (const pattern of h1Patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      h1Match = match[1];
      h1Text = extractH1Text(h1Match);
      break;
    } else if (match && match[0]) {
      // Para el segundo patrón que captura todo el bloque article-header
      const innerH1 = match[0].match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (innerH1) {
        h1Match = innerH1[0];
        h1Text = innerH1[1] || '';
      }
      break;
    }
  }

  if (!h1Match) {
    return { needsFix: false, newContent: content, h1Found: null };
  }

  // Verificar si el H1 encontrado es similar al título
  if (!textsAreSimilar(h1Text, title)) {
    return { 
      needsFix: false, 
      newContent: content, 
      h1Found: { text: h1Text, reason: 'H1 no coincide con el título' } 
    };
  }

  // Eliminar el H1 duplicado
  let newContent = content;

  // Primero intentar eliminar el bloque article-header completo que contiene el H1
  const articleHeaderPattern = /<div class="article-header">[\s\S]*?<h1[^>]*>[\s\S]*?<\/h1>[\s\S]*?<\/div>/i;
  if (articleHeaderPattern.test(newContent)) {
    newContent = newContent.replace(articleHeaderPattern, '');
  } else {
    // Si no, eliminar solo el H1
    newContent = newContent.replace(h1Match, '');
  }
  
  // Limpiar divs vacíos que puedan quedar
  newContent = newContent.replace(/<div[^>]*>\s*<\/div>/gi, '');
  
  // Limpiar párrafos vacíos
  newContent = newContent.replace(/<p>\s*<\/p>/gi, '');
  
  // Limpiar múltiples saltos de línea
  newContent = newContent.replace(/(\s*\n\s*){3,}/g, '\n\n');

  return {
    needsFix: true,
    newContent: newContent,
    h1Found: { text: h1Text, fullMatch: h1Match }
  };
}

async function main() {
  console.log('🔍 Buscando artículos del blog con H1 duplicados...\n');
  
  if (DRY_RUN) {
    console.log('⚠️  MODO DRY-RUN: No se harán cambios en la base de datos\n');
  }

  // 1. Obtener todos los posts publicados
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, content, status')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('❌ Error al consultar posts:', error.message);
    process.exit(1);
  }

  console.log(`📚 Total posts encontrados: ${posts.length}\n`);

  // 2. Analizar cada post
  const postsToFix = [];
  const postsWithOtherH1 = [];
  const postsOk = [];

  for (const post of posts) {
    const result = analyzeAndFixContent(post.content, post.title);
    
    if (result.needsFix) {
      postsToFix.push({
        ...post,
        newContent: result.newContent,
        h1Found: result.h1Found
      });
    } else if (result.h1Found) {
      postsWithOtherH1.push({
        ...post,
        h1Found: result.h1Found
      });
    } else {
      postsOk.push(post);
    }
  }

  // 3. Mostrar resumen
  console.log('📊 Resumen del análisis:');
  console.log(`   ✅ Posts sin H1 duplicado: ${postsOk.length}`);
  console.log(`   🔧 Posts con H1 a corregir: ${postsToFix.length}`);
  console.log(`   ⚠️  Posts con H1 diferente: ${postsWithOtherH1.length}`);
  console.log('');

  // 4. Mostrar posts a corregir
  if (postsToFix.length > 0) {
    console.log('🔧 Posts con H1 duplicado que se van a corregir:\n');
    
    for (let i = 0; i < postsToFix.length; i++) {
      const post = postsToFix[i];
      console.log(`${i + 1}. ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   H1 encontrado: "${post.h1Found.text.substring(0, 80)}${post.h1Found.text.length > 80 ? '...' : ''}"`);
      
      if (VERBOSE) {
        console.log(`   Match completo: ${post.h1Found.fullMatch.substring(0, 150)}...`);
      }
      console.log('');
    }
  }

  // 5. Mostrar posts con H1 diferente (para revisión manual)
  if (postsWithOtherH1.length > 0 && VERBOSE) {
    console.log('\n⚠️  Posts con H1 que NO coincide con el título (revisar manualmente):\n');
    
    for (const post of postsWithOtherH1) {
      console.log(`   - ${post.title}`);
      console.log(`     H1: "${post.h1Found.text.substring(0, 60)}..."`);
      console.log(`     Razón: ${post.h1Found.reason}`);
    }
    console.log('');
  }

  // 6. Aplicar correcciones si no es dry-run
  if (postsToFix.length === 0) {
    console.log('✅ No hay H1 duplicados que corregir');
    return;
  }

  if (DRY_RUN) {
    console.log('ℹ️  Ejecuta sin --dry-run para aplicar los cambios');
    return;
  }

  console.log('🔄 Aplicando correcciones...\n');

  let fixedCount = 0;
  let errorCount = 0;

  for (const post of postsToFix) {
    const { error: updateError } = await supabase
      .from('posts')
      .update({ 
        content: post.newContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id);

    if (updateError) {
      console.log(`   ❌ Error en "${post.title}": ${updateError.message}`);
      errorCount++;
    } else {
      console.log(`   ✅ Corregido: ${post.title}`);
      fixedCount++;
    }
  }

  // 7. Resumen final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN FINAL:');
  console.log(`   ✅ Posts corregidos: ${fixedCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  console.log('='.repeat(50));
  
  if (fixedCount > 0) {
    console.log('\n🎉 ¡Proceso completado! Los H1 duplicados han sido eliminados.');
    console.log('   Recuerda regenerar el sitio si usas ISR/SSG.');
  }
}

main().catch(console.error);
