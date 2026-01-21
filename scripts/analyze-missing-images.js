const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const LOCAL_IMAGES_DIR = path.join(__dirname, '../furgocasa_images/blog');

/**
 * Extrae todas las URLs de imágenes de un post
 */
function extractImageUrls(post) {
  const urls = new Set();

  // Featured image
  if (post.featured_image && post.featured_image.includes('/images/')) {
    urls.add(post.featured_image);
  }

  // Imágenes en el contenido HTML
  if (post.content) {
    const imgRegex1 = /src=["']([^"']*\/images\/\d{4}\/\d{2}\/\d+\/[^"']+)["']/g;
    let match;
    while ((match = imgRegex1.exec(post.content)) !== null) {
      urls.add(match[1]);
    }
    
    const imgRegex2 = /src=["']([^"']*\/images\/furgocasa\/blog\/\d{4}\.\d{2}\/[^"']+)["']/g;
    while ((match = imgRegex2.exec(post.content)) !== null) {
      urls.add(match[1]);
    }
  }

  return Array.from(urls);
}

/**
 * Extrae fecha de URL
 */
function extractDateFromUrl(imageUrl) {
  let match = imageUrl.match(/\/images\/(\d{4})\/(\d{2})\/\d+\/(.+)$/);
  if (match) {
    return {
      year: match[1],
      month: match[2],
      filename: decodeURIComponent(match[3])
    };
  }
  
  match = imageUrl.match(/\/images\/furgocasa\/blog\/(\d{4})\.(\d{2})\/(.+)$/);
  if (match) {
    return {
      year: match[1],
      month: match[2],
      filename: decodeURIComponent(match[3])
    };
  }
  
  return null;
}

/**
 * Busca un archivo en todas las carpetas del blog
 */
function searchFileInAllFolders(filename) {
  const basename = path.basename(filename, path.extname(filename));
  const cleanBasename = basename
    .replace(/_large$/, '')
    .replace(/_medium$/, '')
    .replace(/_small$/, '')
    .replace(/_\d+$/, '')
    .replace(/\s+/g, '_')
    .toLowerCase();

  try {
    const allFolders = fs.readdirSync(LOCAL_IMAGES_DIR)
      .filter(f => {
        const fullPath = path.join(LOCAL_IMAGES_DIR, f);
        return fs.statSync(fullPath).isDirectory();
      });

    for (const folder of allFolders) {
      const folderPath = path.join(LOCAL_IMAGES_DIR, folder);
      try {
        const files = fs.readdirSync(folderPath);
        
        for (const file of files) {
          const fileBasename = path.basename(file, path.extname(file));
          const fileClean = fileBasename
            .replace(/_large$/, '')
            .replace(/_medium$/, '')
            .replace(/_small$/, '')
            .replace(/_\d+$/, '')
            .replace(/\s+/g, '_')
            .toLowerCase();
          
          if (fileClean === cleanBasename || 
              fileBasename.toLowerCase() === basename.toLowerCase() ||
              fileClean.includes(cleanBasename) ||
              cleanBasename.includes(fileClean)) {
            return {
              found: true,
              folder: folder,
              filename: file,
              fullPath: path.join(folderPath, file)
            };
          }
        }
      } catch (error) {
        // Continuar
      }
    }
  } catch (error) {
    console.error(`Error al buscar: ${error.message}`);
  }

  return { found: false };
}

async function main() {
  console.log('🔍 Analizando imágenes faltantes...\n');

  // Obtener todos los posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, title, slug, content, featured_image, published_at, created_at')
    .eq('post_type', 'blog')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (postsError) {
    throw new Error(`Error: ${postsError.message}`);
  }

  console.log(`📚 Total de posts: ${posts.length}\n`);

  const missingImages = [];
  const foundInWrongPlace = [];

  for (const post of posts) {
    const imageUrls = extractImageUrls(post);
    
    for (const imageUrl of imageUrls) {
      const dateInfo = extractDateFromUrl(imageUrl);
      const filename = dateInfo ? dateInfo.filename : path.basename(imageUrl);
      
      // Buscar en carpeta esperada
      let expectedFolder = null;
      if (dateInfo) {
        expectedFolder = `${dateInfo.year}.${dateInfo.month}`;
      } else if (post.published_at) {
        const postDate = new Date(post.published_at);
        const year = postDate.getFullYear();
        const month = String(postDate.getMonth() + 1).padStart(2, '0');
        expectedFolder = `${year}.${month}`;
      }

      let foundInExpected = false;
      if (expectedFolder) {
        const expectedPath = path.join(LOCAL_IMAGES_DIR, expectedFolder);
        if (fs.existsSync(expectedPath)) {
          const files = fs.readdirSync(expectedPath);
          const basename = path.basename(filename, path.extname(filename));
          foundInExpected = files.some(f => {
            const fBase = path.basename(f, path.extname(f));
            return f === filename || 
                   fBase.replace(/_large$/, '').replace(/_medium$/, '').replace(/_small$/, '') === 
                   basename.replace(/_large$/, '').replace(/_medium$/, '').replace(/_small$/, '');
          });
        }
      }

      if (!foundInExpected) {
        // Buscar en todas las carpetas
        const searchResult = searchFileInAllFolders(filename);
        
        if (searchResult.found) {
          foundInWrongPlace.push({
            postTitle: post.title,
            postSlug: post.slug,
            imageUrl: imageUrl,
            filename: filename,
            expectedFolder: expectedFolder || 'desconocida',
            actualFolder: searchResult.folder,
            actualFilename: searchResult.filename
          });
        } else {
          missingImages.push({
            postTitle: post.title,
            postSlug: post.slug,
            postDate: post.published_at || post.created_at,
            imageUrl: imageUrl,
            filename: filename,
            expectedFolder: expectedFolder || 'desconocida'
          });
        }
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 RESULTADOS DEL ANÁLISIS');
  console.log('='.repeat(80));
  console.log(`\n✅ Imágenes en carpeta correcta: ${posts.length * 2 - missingImages.length - foundInWrongPlace.length}`);
  console.log(`⚠️  Imágenes en carpeta incorrecta: ${foundInWrongPlace.length}`);
  console.log(`❌ Imágenes NO ENCONTRADAS: ${missingImages.length}\n`);

  if (foundInWrongPlace.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('⚠️  IMÁGENES ENCONTRADAS EN CARPETA INCORRECTA');
    console.log('='.repeat(80));
    foundInWrongPlace.slice(0, 20).forEach((item, idx) => {
      console.log(`\n${idx + 1}. ${item.postTitle}`);
      console.log(`   📄 Slug: ${item.postSlug}`);
      console.log(`   🖼️  Archivo: ${item.filename}`);
      console.log(`   📁 Esperada: ${item.expectedFolder}`);
      console.log(`   📁 Real: ${item.actualFolder}`);
      console.log(`   📝 Archivo real: ${item.actualFilename}`);
    });
    if (foundInWrongPlace.length > 20) {
      console.log(`\n... y ${foundInWrongPlace.length - 20} más\n`);
    }
  }

  if (missingImages.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('❌ IMÁGENES NO ENCONTRADAS EN NINGUNA CARPETA');
    console.log('='.repeat(80));
    missingImages.slice(0, 30).forEach((item, idx) => {
      console.log(`\n${idx + 1}. ${item.postTitle}`);
      console.log(`   📄 Slug: ${item.postSlug}`);
      console.log(`   📅 Fecha: ${item.postDate}`);
      console.log(`   🖼️  Archivo: ${item.filename}`);
      console.log(`   🔗 URL: ${item.imageUrl}`);
      console.log(`   📁 Carpeta esperada: ${item.expectedFolder}`);
    });
    if (missingImages.length > 30) {
      console.log(`\n... y ${missingImages.length - 30} más\n`);
    }
  }

  // Guardar resultados
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPosts: posts.length,
      imagesInCorrectPlace: posts.length * 2 - missingImages.length - foundInWrongPlace.length,
      imagesInWrongPlace: foundInWrongPlace.length,
      imagesMissing: missingImages.length
    },
    foundInWrongPlace,
    missingImages
  };

  const reportPath = path.join(__dirname, `missing-images-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Reporte completo guardado en: ${reportPath}\n`);
}

main().then(() => {
  console.log('✨ Análisis completado\n');
  process.exit(0);
}).catch(error => {
  console.error('❌ ERROR:', error);
  process.exit(1);
});
