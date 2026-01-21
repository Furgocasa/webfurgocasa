const fs = require('fs');
const path = require('path');

const LOCAL_IMAGES_DIR = path.join(__dirname, '../furgocasa_images/blog');

console.log('🔍 Analizando imágenes de portada no encontradas en Supabase...\n');

/**
 * Extrae nombre de archivo de URL
 */
function extractFilenameFromUrl(url) {
  // Patrón: /images/YYYY/MM/DD/filename o /images/YYYY/MM/filename
  const pattern1 = /\/images\/(\d{4})\/(\d{2})\/(\d{2})\/([^?]+)/;
  const pattern2 = /\/images\/(\d{4})\/(\d{2})\/([^?]+)/;
  const pattern3 = /\/images\/furgocasa\/blog\/(.+)$/;
  
  let match = url.match(pattern1);
  if (match) {
    return {
      year: match[1],
      month: match[2],
      day: match[3],
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
  
  match = url.match(pattern3);
  if (match) {
    return {
      filename: decodeURIComponent(match[1]).split('?')[0]
    };
  }
  
  return null;
}

/**
 * Busca archivo en sistema local recursivamente
 */
function searchFileInAllFolders(filename) {
  if (!fs.existsSync(LOCAL_IMAGES_DIR)) {
    return null;
  }

  // Normalizar nombre buscado
  const searchBase = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '').toLowerCase();
  const cleanSearchBase = searchBase
    .replace(/_(large|medium|small)$/i, '')
    .replace(/_\d+$/i, '')
    .replace(/\s+/g, '_');

  function searchInDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          const result = searchInDir(fullPath);
          if (result) return result;
        } else if (stat.isFile()) {
          // Normalizar nombre del archivo encontrado
          const fileBase = item.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '').toLowerCase();
          const cleanFileBase = fileBase
            .replace(/_(large|medium|small)$/i, '')
            .replace(/_\d+$/i, '')
            .replace(/\s+/g, '_');
          
          // Coincidencia flexible
          if (cleanFileBase === cleanSearchBase || 
              cleanFileBase.includes(cleanSearchBase) ||
              cleanSearchBase.includes(cleanFileBase)) {
            return {
              path: fullPath,
              relativePath: path.relative(LOCAL_IMAGES_DIR, fullPath),
              filename: item
            };
          }
        }
      }
    } catch (error) {
      // Ignorar errores de lectura de directorios
    }
    
    return null;
  }

  return searchInDir(LOCAL_IMAGES_DIR);
}

async function main() {
  try {
    // Leer el JSON con los posts no encontrados
    const logPath = path.join(__dirname, 'featured-images-update-log.json');
    
    if (!fs.existsSync(logPath)) {
      console.error('❌ No se encontró el archivo featured-images-update-log.json');
      console.error('   Ejecuta primero: node scripts/update-featured-images-urls.js');
      process.exit(1);
    }

    const logData = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    const notFoundPosts = logData.resultados.filter(r => r.status === 'not_found' || r.status === 'error');

    console.log(`📊 Total de posts a analizar: ${notFoundPosts.length}\n`);

    const foundLocally = [];
    const notFoundLocally = [];
    const noUrlPattern = [];

    for (let i = 0; i < notFoundPosts.length; i++) {
      const post = notFoundPosts[i];
      console.log(`[${i + 1}/${notFoundPosts.length}] ${post.title}`);
      
      // Intentar extraer info de búsqueda
      let searchInfo = null;
      if (post.search) {
        // Ya tiene search del script anterior
        const parts = post.search.split('/');
        searchInfo = {
          filename: parts[parts.length - 1]
        };
      } else if (post.old_url) {
        // Extraer de URL antigua
        searchInfo = extractFilenameFromUrl(post.old_url);
      }
      
      if (!searchInfo || !searchInfo.filename) {
        console.log('   ⚠️  No se pudo extraer nombre de archivo');
        noUrlPattern.push(post);
        continue;
      }
      
      console.log(`   🔍 Buscando: ${searchInfo.filename}`);
      
      // Buscar en sistema local
      const localFile = searchFileInAllFolders(searchInfo.filename);
      
      if (localFile) {
        console.log(`   ✅ Encontrada localmente: ${localFile.relativePath}`);
        foundLocally.push({
          ...post,
          localPath: localFile.path,
          localRelativePath: localFile.relativePath,
          localFilename: localFile.filename,
          searchedFor: searchInfo.filename
        });
      } else {
        console.log(`   ❌ NO existe localmente`);
        notFoundLocally.push({
          ...post,
          searchedFor: searchInfo.filename
        });
      }
    }

    // Resumen
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 RESUMEN DEL ANÁLISIS');
    console.log('='.repeat(70));
    console.log(`Total analizados: ${notFoundPosts.length}`);
    console.log(`✅ Encontradas localmente: ${foundLocally.length}`);
    console.log(`❌ NO existen localmente: ${notFoundLocally.length}`);
    console.log(`⚠️  Sin patrón de URL reconocible: ${noUrlPattern.length}`);
    console.log('='.repeat(70));

    // Guardar resultados detallados
    const resultsPath = path.join(__dirname, '../ANALISIS-IMAGENES-PORTADA.json');
    const results = {
      fecha_analisis: new Date().toISOString(),
      total: notFoundPosts.length,
      encontradas_localmente: foundLocally.length,
      no_existen_localmente: notFoundLocally.length,
      sin_patron_url: noUrlPattern.length,
      imagenes_encontradas: foundLocally,
      imagenes_no_encontradas: notFoundLocally,
      sin_patron: noUrlPattern
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 JSON detallado guardado en: ${resultsPath}`);

    // Generar TXT con las encontradas (listas para subir)
    if (foundLocally.length > 0) {
      let txtFound = '═══════════════════════════════════════════════════════════════\n';
      txtFound += '  IMÁGENES DE PORTADA ENCONTRADAS LOCALMENTE\n';
      txtFound += '  (Listas para subir a Supabase Storage)\n';
      txtFound += '═══════════════════════════════════════════════════════════════\n\n';
      txtFound += `Total: ${foundLocally.length}\n`;
      txtFound += `Fecha: ${new Date().toLocaleString('es-ES')}\n\n`;
      txtFound += '───────────────────────────────────────────────────────────────\n\n';

      foundLocally.forEach((item, index) => {
        txtFound += `${index + 1}. ${item.title}\n`;
        txtFound += `   └─ Slug: ${item.slug}\n`;
        txtFound += `   └─ Archivo local: ${item.localRelativePath}\n`;
        txtFound += `   └─ Ruta completa: ${item.localPath}\n`;
        txtFound += `   └─ URL post: https://www.furgocasa.com/es/blog/${item.slug}\n\n`;
      });

      txtFound += '\n═══════════════════════════════════════════════════════════════\n';
      txtFound += 'SIGUIENTE PASO:\n';
      txtFound += '═══════════════════════════════════════════════════════════════\n\n';
      txtFound += '1. Ir a /administrator/media\n';
      txtFound += '2. Seleccionar bucket "blog"\n';
      txtFound += '3. Para cada imagen:\n';
      txtFound += '   a) Navegar a la carpeta YYYY/MM/ (según fecha del post)\n';
      txtFound += '   b) Subir la imagen desde la ruta indicada\n';
      txtFound += '   c) Editar el post y actualizar "Imagen destacada"\n';
      txtFound += '4. Volver a ejecutar update-featured-images-urls.js\n\n';

      const txtFoundPath = path.join(__dirname, '../IMAGENES-PORTADA-ENCONTRADAS-LOCALMENTE.txt');
      fs.writeFileSync(txtFoundPath, txtFound);
      console.log(`📄 Lista de encontradas: ${txtFoundPath}`);
    }

    // Generar TXT con las NO encontradas (hay que crearlas)
    if (notFoundLocally.length > 0) {
      let txtNotFound = '═══════════════════════════════════════════════════════════════\n';
      txtNotFound += '  IMÁGENES DE PORTADA NO EXISTEN LOCALMENTE\n';
      txtNotFound += '  (Hay que crear/buscar estas imágenes)\n';
      txtNotFound += '═══════════════════════════════════════════════════════════════\n\n';
      txtNotFound += `Total: ${notFoundLocally.length}\n`;
      txtNotFound += `Fecha: ${new Date().toLocaleString('es-ES')}\n\n`;
      txtNotFound += '───────────────────────────────────────────────────────────────\n\n';

      notFoundLocally.forEach((item, index) => {
        txtNotFound += `${index + 1}. ${item.title}\n`;
        txtNotFound += `   └─ Slug: ${item.slug}\n`;
        txtNotFound += `   └─ Buscado: ${item.searchedFor}\n`;
        txtNotFound += `   └─ URL post: https://www.furgocasa.com/es/blog/${item.slug}\n\n`;
      });

      txtNotFound += '\n═══════════════════════════════════════════════════════════════\n';
      txtNotFound += 'SIGUIENTE PASO:\n';
      txtNotFound += '═══════════════════════════════════════════════════════════════\n\n';
      txtNotFound += '1. Para cada post, leer el artículo y entender el tema\n';
      txtNotFound += '2. Opciones:\n';
      txtNotFound += '   a) Buscar imagen relacionada en bancos de imágenes\n';
      txtNotFound += '   b) Usar IA para generar imagen relacionada\n';
      txtNotFound += '   c) Tomar foto propia si aplica\n';
      txtNotFound += '3. Subir a /administrator/media → bucket "blog"\n';
      txtNotFound += '4. Editar post y actualizar "Imagen destacada"\n\n';

      const txtNotFoundPath = path.join(__dirname, '../IMAGENES-PORTADA-NO-EXISTEN.txt');
      fs.writeFileSync(txtNotFoundPath, txtNotFound);
      console.log(`📄 Lista de NO encontradas: ${txtNotFoundPath}`);
    }

    // Resumen final
    console.log('\n✨ Análisis completado\n');
    console.log('📋 Archivos generados:');
    console.log(`   • ANALISIS-IMAGENES-PORTADA.json (datos completos)`);
    if (foundLocally.length > 0) {
      console.log(`   • IMAGENES-PORTADA-ENCONTRADAS-LOCALMENTE.txt (${foundLocally.length} listas para subir)`);
    }
    if (notFoundLocally.length > 0) {
      console.log(`   • IMAGENES-PORTADA-NO-EXISTEN.txt (${notFoundLocally.length} hay que crear)`);
    }

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main().then(() => {
  console.log('\n✨ Proceso completado\n');
  process.exit(0);
});
