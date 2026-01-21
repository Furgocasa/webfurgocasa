const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const STORAGE_BASE_URL = 'https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/blog';

console.log('🔄 Actualizando featured_image de posts con URLs antiguas...\n');

/**
 * Extrae fecha y nombre de archivo de URL antigua
 */
function extractDateFromUrl(url) {
  // Patrón: /images/YYYY/MM/DD/filename o /images/YYYY/MM/filename
  const pattern1 = /\/images\/(\d{4})\/(\d{2})\/(\d{2})\/([^?]+)/;
  const pattern2 = /\/images\/(\d{4})\/(\d{2})\/([^?]+)/;
  
  let match = url.match(pattern1);
  if (match) {
    return {
      year: match[1],
      month: match[2],
      filename: decodeURIComponent(match[4]).split('?')[0]
    };
  }
  
  match = url.match(pattern2);
  if (match) {
    return {
      year: match[1],
      month: match[2],
      filename: decodeURIComponent(match[3]).split('?')[0]
    };
  }
  
  return null;
}

/**
 * Busca imagen en Supabase Storage
 */
async function findImageInStorage(year, month, filename) {
  const folderPath = `${year}/${month}`;
  
  try {
    // Listar archivos en la carpeta
    const { data: files, error } = await supabase.storage
      .from('blog')
      .list(folderPath);
    
    if (error || !files) {
      return null;
    }
    
    // Normalizar nombre del archivo buscado (sin extensión, minúsculas)
    const baseFilename = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '').toLowerCase();
    
    // Buscar coincidencia flexible
    const found = files.find(file => {
      const storageBase = file.name.replace(/\.webp$/i, '').toLowerCase();
      
      // Coincidencia exacta
      if (storageBase === baseFilename) return true;
      
      // Coincidencia sin _large, _medium, _small
      const cleanBase = baseFilename.replace(/_(large|medium|small|[0-9]+)$/i, '');
      const cleanStorage = storageBase.replace(/_(large|medium|small|[0-9]+)$/i, '');
      if (cleanBase === cleanStorage) return true;
      
      // Coincidencia de prefijo (el nombre del storage contiene el buscado o viceversa)
      if (storageBase.includes(cleanBase) || cleanBase.includes(storageBase)) {
        return true;
      }
      
      return false;
    });
    
    if (found) {
      return `${STORAGE_BASE_URL}/${folderPath}/${found.name}`;
    }
    
    return null;
  } catch (error) {
    console.error(`   ⚠️  Error al buscar en Storage: ${error.message}`);
    return null;
  }
}

async function main() {
  try {
    // Obtener posts con URL antigua en featured_image
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, slug, featured_image, published_at, created_at')
      .eq('status', 'published')
      .not('featured_image', 'is', null)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('❌ Error al consultar posts:', error.message);
      process.exit(1);
    }

    // Filtrar solo los que tienen URL antigua
    const postsWithOldUrl = posts.filter(post => 
      post.featured_image && !post.featured_image.includes('supabase.co/storage/v1/object/public/blog/')
    );

    console.log(`📊 Total de posts con URL antigua: ${postsWithOldUrl.length}\n`);

    if (postsWithOldUrl.length === 0) {
      console.log('✅ ¡Todos los posts ya tienen URLs actualizadas!');
      return;
    }

    let updatedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    const results = [];

    for (let i = 0; i < postsWithOldUrl.length; i++) {
      const post = postsWithOldUrl[i];
      console.log(`\n[${i + 1}/${postsWithOldUrl.length}] ${post.title}`);
      console.log(`   📅 Fecha: ${post.published_at || post.created_at}`);
      console.log(`   🔗 URL antigua: ${post.featured_image}`);
      
      // Extraer fecha y nombre de archivo
      const dateInfo = extractDateFromUrl(post.featured_image);
      
      if (!dateInfo) {
        console.log('   ⚠️  No se pudo extraer fecha de la URL antigua');
        notFoundCount++;
        results.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
          status: 'error',
          reason: 'No se pudo extraer fecha de URL antigua'
        });
        continue;
      }
      
      console.log(`   🔍 Buscando: ${dateInfo.year}/${dateInfo.month}/${dateInfo.filename}`);
      
      // Buscar en Supabase Storage
      const newUrl = await findImageInStorage(dateInfo.year, dateInfo.month, dateInfo.filename);
      
      if (!newUrl) {
        console.log('   ❌ No encontrada en Supabase Storage');
        notFoundCount++;
        results.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
          status: 'not_found',
          search: `${dateInfo.year}/${dateInfo.month}/${dateInfo.filename}`
        });
        continue;
      }
      
      console.log(`   ✅ Encontrada: ${newUrl}`);
      
      // Actualizar featured_image
      const { error: updateError } = await supabase
        .from('posts')
        .update({ featured_image: newUrl })
        .eq('id', post.id);
      
      if (updateError) {
        console.log(`   ❌ Error al actualizar: ${updateError.message}`);
        errorCount++;
        results.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
          status: 'error',
          reason: updateError.message
        });
        continue;
      }
      
      console.log('   ✅ ¡Actualizado correctamente!');
      updatedCount++;
      results.push({
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: 'updated',
        old_url: post.featured_image,
        new_url: newUrl
      });
    }

    // Resumen
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(70));
    console.log(`Total procesados: ${postsWithOldUrl.length}`);
    console.log(`✅ Actualizados correctamente: ${updatedCount}`);
    console.log(`❌ No encontrados en Storage: ${notFoundCount}`);
    console.log(`⚠️  Errores al actualizar: ${errorCount}`);
    console.log('='.repeat(70));

    // Guardar log
    const logPath = path.join(__dirname, 'featured-images-update-log.json');
    const logData = {
      fecha: new Date().toISOString(),
      total: postsWithOldUrl.length,
      actualizados: updatedCount,
      no_encontrados: notFoundCount,
      errores: errorCount,
      resultados: results
    };
    
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
    console.log(`\n📄 Log guardado en: ${logPath}`);

    // Guardar TXT con los no encontrados
    if (notFoundCount > 0) {
      const notFound = results.filter(r => r.status === 'not_found');
      let txtContent = '═══════════════════════════════════════════════════════════════\n';
      txtContent += '  IMÁGENES DE PORTADA NO ENCONTRADAS EN SUPABASE STORAGE\n';
      txtContent += '═══════════════════════════════════════════════════════════════\n\n';
      txtContent += `Total: ${notFoundCount}\n`;
      txtContent += `Fecha: ${new Date().toLocaleString('es-ES')}\n\n`;
      txtContent += '───────────────────────────────────────────────────────────────\n\n';

      notFound.forEach((item, index) => {
        txtContent += `${index + 1}. ${item.title}\n`;
        txtContent += `   └─ Slug: ${item.slug}\n`;
        txtContent += `   └─ Buscado: ${item.search}\n`;
        txtContent += `   └─ URL: https://www.furgocasa.com/es/blog/${item.slug}\n\n`;
      });

      const txtPath = path.join(__dirname, '../FEATURED-IMAGES-NO-ENCONTRADAS.txt');
      fs.writeFileSync(txtPath, txtContent);
      console.log(`📄 Lista de no encontradas: ${txtPath}`);
    }

    if (updatedCount > 0) {
      console.log('\n✨ ¡Actualización completada! Los posts ahora apuntan a Supabase Storage.');
    }

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    process.exit(1);
  }
}

main().then(() => {
  console.log('\n✨ Proceso completado\n');
  process.exit(0);
});
