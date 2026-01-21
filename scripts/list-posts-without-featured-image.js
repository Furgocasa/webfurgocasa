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

console.log('🔍 Buscando artículos sin imagen de portada...\n');

async function main() {
  try {
    // Obtener todos los posts publicados
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, slug, featured_image, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('❌ Error al consultar posts:', error.message);
      process.exit(1);
    }

    console.log(`📊 Total de posts publicados: ${posts.length}`);

    // Filtrar posts sin featured_image o con URL antigua (no de Supabase)
    const postsWithoutFeaturedImage = posts.filter(post => {
      // Sin featured_image
      if (!post.featured_image) {
        return true;
      }

      // Con featured_image pero URL antigua (no es de Supabase Storage)
      const isOldUrl = !post.featured_image.includes('supabase.co/storage/v1/object/public/blog/');
      return isOldUrl;
    });

    console.log(`⚠️  Posts sin imagen de portada válida: ${postsWithoutFeaturedImage.length}\n`);

    if (postsWithoutFeaturedImage.length === 0) {
      console.log('✅ ¡Todos los posts tienen imagen de portada válida!');
      return;
    }

    // Generar contenido del archivo TXT
    let txtContent = '═══════════════════════════════════════════════════════════════\n';
    txtContent += '  ARTÍCULOS DEL BLOG SIN IMAGEN DE PORTADA VÁLIDA\n';
    txtContent += '═══════════════════════════════════════════════════════════════\n\n';
    txtContent += `Total de artículos: ${postsWithoutFeaturedImage.length}\n`;
    txtContent += `Fecha de generación: ${new Date().toLocaleString('es-ES')}\n\n`;
    txtContent += '───────────────────────────────────────────────────────────────\n\n';

    // Agrupar por estado
    const withoutImage = postsWithoutFeaturedImage.filter(p => !p.featured_image);
    const withOldUrl = postsWithoutFeaturedImage.filter(p => p.featured_image && !p.featured_image.includes('supabase.co'));

    if (withoutImage.length > 0) {
      txtContent += `🔴 POSTS SIN IMAGEN DE PORTADA (${withoutImage.length})\n`;
      txtContent += '───────────────────────────────────────────────────────────────\n\n';

      withoutImage.forEach((post, index) => {
        const publishedDate = post.published_at 
          ? new Date(post.published_at).toLocaleDateString('es-ES')
          : new Date(post.created_at).toLocaleDateString('es-ES');

        txtContent += `${index + 1}. ${post.title}\n`;
        txtContent += `   └─ Slug: ${post.slug}\n`;
        txtContent += `   └─ Fecha: ${publishedDate}\n`;
        txtContent += `   └─ Estado: SIN IMAGEN\n`;
        txtContent += `   └─ URL: https://www.furgocasa.com/es/blog/${post.slug}\n`;
        txtContent += '\n';
      });

      txtContent += '\n';
    }

    if (withOldUrl.length > 0) {
      txtContent += `🟡 POSTS CON URL ANTIGUA (${withOldUrl.length})\n`;
      txtContent += '───────────────────────────────────────────────────────────────\n\n';

      withOldUrl.forEach((post, index) => {
        const publishedDate = post.published_at 
          ? new Date(post.published_at).toLocaleDateString('es-ES')
          : new Date(post.created_at).toLocaleDateString('es-ES');

        txtContent += `${index + 1}. ${post.title}\n`;
        txtContent += `   └─ Slug: ${post.slug}\n`;
        txtContent += `   └─ Fecha: ${publishedDate}\n`;
        txtContent += `   └─ URL antigua: ${post.featured_image}\n`;
        txtContent += `   └─ URL post: https://www.furgocasa.com/es/blog/${post.slug}\n`;
        txtContent += '\n';
      });

      txtContent += '\n';
    }

    // Resumen final
    txtContent += '═══════════════════════════════════════════════════════════════\n';
    txtContent += 'RESUMEN\n';
    txtContent += '═══════════════════════════════════════════════════════════════\n\n';
    txtContent += `Total posts sin imagen válida: ${postsWithoutFeaturedImage.length}\n`;
    txtContent += `  • Sin imagen: ${withoutImage.length}\n`;
    txtContent += `  • Con URL antigua: ${withOldUrl.length}\n\n`;
    txtContent += 'SIGUIENTES PASOS:\n';
    txtContent += '─────────────────\n\n';
    txtContent += '1. Buscar imágenes en furgocasa_images/blog/ por fecha de publicación\n';
    txtContent += '2. Subir imágenes faltantes al panel /administrator/media\n';
    txtContent += '   └─ Bucket: blog\n';
    txtContent += '   └─ Carpeta: YYYY/MM/ (según fecha de publicación)\n';
    txtContent += '3. Actualizar featured_image en el editor del post\n';
    txtContent += '4. Volver a ejecutar este script para verificar\n\n';

    // Guardar archivo TXT
    const outputPath = path.join(__dirname, '../POSTS-SIN-IMAGEN-PORTADA.txt');
    fs.writeFileSync(outputPath, txtContent, 'utf-8');

    console.log('✅ Archivo generado correctamente\n');
    console.log(`📄 Ubicación: ${outputPath}\n`);
    console.log('📊 Estadísticas:');
    console.log(`   • Total posts sin imagen válida: ${postsWithoutFeaturedImage.length}`);
    console.log(`   • Sin imagen: ${withoutImage.length}`);
    console.log(`   • Con URL antigua: ${withOldUrl.length}`);

    // También guardar JSON para uso programático
    const jsonPath = path.join(__dirname, '../posts-sin-imagen-portada.json');
    const jsonData = {
      fecha_generacion: new Date().toISOString(),
      total: postsWithoutFeaturedImage.length,
      sin_imagen: withoutImage.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        published_at: p.published_at,
        created_at: p.created_at,
        url: `https://www.furgocasa.com/es/blog/${p.slug}`
      })),
      con_url_antigua: withOldUrl.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        featured_image_antigua: p.featured_image,
        published_at: p.published_at,
        created_at: p.created_at,
        url: `https://www.furgocasa.com/es/blog/${p.slug}`
      }))
    };

    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log(`\n📄 JSON guardado en: ${jsonPath}`);

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    process.exit(1);
  }
}

main().then(() => {
  console.log('\n✨ Proceso completado\n');
  process.exit(0);
});
