/**
 * Script para limpiar el contenido HTML de los posts
 * Elimina la estructura de Joomla y deja solo el contenido del artículo
 * 
 * Uso: node scripts/clean-joomla-content.js [--dry-run] [--post-id=UUID]
 * 
 * --dry-run: Solo muestra lo que haría sin modificar la base de datos
 * --post-id: Limpia solo un post específico (para probar)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { JSDOM } = require('jsdom');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Argumentos de línea de comandos
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const postIdArg = args.find(a => a.startsWith('--post-id='));
const specificPostId = postIdArg ? postIdArg.split('=')[1] : null;

/**
 * Limpia el contenido HTML extrayendo solo el articleBody
 * y eliminando elementos innecesarios de Joomla
 */
function cleanContent(html) {
  if (!html || typeof html !== 'string') {
    return { cleaned: html, wasModified: false };
  }

  // Si no contiene estructura de Joomla, no modificar
  if (!html.includes('sp-main-body') && !html.includes('itemprop="articleBody"') && !html.includes('sp-component')) {
    return { cleaned: html, wasModified: false };
  }

  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Intentar extraer solo el articleBody
    let articleBody = doc.querySelector('[itemprop="articleBody"]');
    
    // Si no hay articleBody, intentar con sp-component
    if (!articleBody) {
      articleBody = doc.querySelector('#sp-component .sp-column');
    }
    
    // Si no hay ninguno de esos, intentar con article-details
    if (!articleBody) {
      articleBody = doc.querySelector('.article-details');
    }

    // Si encontramos el contenido principal, extraerlo
    let cleanedHtml;
    if (articleBody) {
      cleanedHtml = articleBody.innerHTML;
    } else {
      // Si no encontramos estructura de Joomla específica, devolver el original
      return { cleaned: html, wasModified: false };
    }

    // Crear nuevo DOM para limpiar el contenido extraído
    const cleanDom = new JSDOM(`<div>${cleanedHtml}</div>`);
    const cleanDoc = cleanDom.window.document;
    const container = cleanDoc.querySelector('div');

    // Eliminar elementos de Joomla que no queremos
    const elementsToRemove = [
      // Metadatos y estructura de Joomla
      '.article-info',
      '.article-ratings-social-share',
      '.social-share-block',
      '.article-social-share',
      'figure.article-full-image',
      // Elementos schema.org vacíos
      'meta[itemprop]',
      // Secciones vacías
      'section#sp-page-title',
      'section#sp-main-body',
      '#sp-component',
      '.sp-column',
      // Elementos de navegación
      '.category-name',
      '.published',
      '.hits',
      // Títulos duplicados de Joomla (el H1 ya viene del frontend)
      'h1',
      '.article-title',
      '.page-header',
      // Botones de redes sociales de Joomla
      '.social-share-icon',
      '[class*="share"]',
      // Elementos con visitas y fechas de Joomla
      '[class*="hits"]',
      '[class*="created"]',
      '[class*="modified"]',
    ];

    elementsToRemove.forEach(selector => {
      container.querySelectorAll(selector).forEach(el => el.remove());
    });

    // Convertir joomla-hidden-mail a enlaces normales
    container.querySelectorAll('joomla-hidden-mail').forEach(el => {
      const link = el.querySelector('a');
      if (link) {
        // Reemplazar el elemento joomla-hidden-mail con el enlace
        el.parentNode.replaceChild(link.cloneNode(true), el);
      } else {
        // Si no tiene enlace, eliminar
        el.remove();
      }
    });

    // Eliminar atributos data-* innecesarios de Joomla
    container.querySelectorAll('*').forEach(el => {
      const attrs = Array.from(el.attributes);
      attrs.forEach(attr => {
        if (attr.name.startsWith('data-start') || attr.name.startsWith('data-end')) {
          el.removeAttribute(attr.name);
        }
      });
    });

    // Eliminar H2 vacíos (Joomla a veces los genera)
    container.querySelectorAll('h2').forEach(el => {
      if (!el.textContent.trim()) {
        el.remove();
      }
    });

    // Eliminar divs vacíos
    container.querySelectorAll('div').forEach(el => {
      if (!el.innerHTML.trim() && !el.querySelector('img, video, iframe')) {
        el.remove();
      }
    });

    // Limpiar espacios en blanco excesivos
    cleanedHtml = container.innerHTML
      .replace(/\n\s*\n\s*\n/g, '\n\n')  // Múltiples líneas vacías a dos
      .replace(/^\s+/gm, '')  // Espacios al inicio de línea
      .trim();

    return { 
      cleaned: cleanedHtml, 
      wasModified: cleanedHtml !== html 
    };

  } catch (error) {
    console.error('Error parseando HTML:', error.message);
    return { cleaned: html, wasModified: false };
  }
}

async function main() {
  console.log('🧹 Limpieza de contenido HTML de posts');
  console.log('=====================================');
  
  if (dryRun) {
    console.log('⚠️  MODO DRY-RUN: No se modificará la base de datos\n');
  }

  // Obtener posts
  let query = supabase
    .from('posts')
    .select('id, title, slug, content')
    .order('created_at', { ascending: false });

  if (specificPostId) {
    query = query.eq('id', specificPostId);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error('❌ Error obteniendo posts:', error.message);
    process.exit(1);
  }

  console.log(`📝 Posts encontrados: ${posts.length}\n`);

  let modified = 0;
  let skipped = 0;
  let errors = 0;

  for (const post of posts) {
    process.stdout.write(`Procesando: ${post.title.substring(0, 50)}... `);

    const { cleaned, wasModified } = cleanContent(post.content);

    if (!wasModified) {
      console.log('⏭️  Sin cambios');
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log('✅ Se limpiaría');
      // Mostrar preview del contenido limpio
      const preview = cleaned.substring(0, 200).replace(/\n/g, ' ');
      console.log(`   Preview: ${preview}...`);
      modified++;
      continue;
    }

    // Actualizar en Supabase
    const { error: updateError } = await supabase
      .from('posts')
      .update({ 
        content: cleaned,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id);

    if (updateError) {
      console.log('❌ Error:', updateError.message);
      errors++;
    } else {
      console.log('✅ Limpiado');
      modified++;
    }
  }

  console.log('\n=====================================');
  console.log('📊 Resumen:');
  console.log(`   ✅ Modificados: ${modified}`);
  console.log(`   ⏭️  Sin cambios: ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
  
  if (dryRun) {
    console.log('\n💡 Ejecuta sin --dry-run para aplicar los cambios');
  }
}

main().catch(console.error);
