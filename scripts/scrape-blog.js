/**
 * SCRIPT DE EXTRACCIÓN DEL BLOG DE FURGOCASA
 * ==========================================
 * 
 * Este script extrae todos los artículos del blog antiguo de furgocasa.com
 * usando el sitemap para obtener todas las URLs.
 * 
 * Extrae:
 * - Título del artículo
 * - URL completa y slug
 * - Categoría (rutas, noticias, vehiculos)
 * - Contenido HTML
 * - Imagen destacada
 * - Excerpt/Extracto
 * - Fecha de publicación
 * 
 * Uso:
 * node scripts/scrape-blog.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// URL del sitemap
const SITEMAP_URL = 'https://www.furgocasa.com/?option=com_jmap&view=sitemap&lang=es';

// Categorías del blog que nos interesan
const BLOG_CATEGORIES = ['rutas', 'noticias', 'vehiculos'];

// Función auxiliar para limpiar texto
function cleanText(text) {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

// Función para extraer el slug de una URL
function extractSlug(url) {
  const parts = url.split('/');
  return parts[parts.length - 1] || parts[parts.length - 2];
}

// Función para extraer la categoría de una URL
function extractCategory(url) {
  for (const cat of BLOG_CATEGORIES) {
    if (url.includes(`/blog/${cat}/`)) {
      return cat;
    }
  }
  return null;
}

// Función para escapar comillas simples en SQL
function escapeSqlString(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

// Función para extraer todas las URLs del sitemap
async function getAllBlogUrls(page) {
  console.log(`\n📑 Extrayendo URLs del sitemap: ${SITEMAP_URL}`);
  
  try {
    await page.goto(SITEMAP_URL, { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // Extraer todos los enlaces del sitemap que sean de blog
    const blogUrls = await page.evaluate((categories) => {
      const urls = [];
      const links = document.querySelectorAll('a[href*="/blog/"]');
      
      links.forEach(link => {
        const href = link.href;
        // Verificar si es de alguna de las categorías que nos interesan
        const isRelevant = categories.some(cat => href.includes(`/blog/${cat}/`));
        
        if (isRelevant && !urls.includes(href)) {
          urls.push(href);
        }
      });
      
      return urls;
    }, BLOG_CATEGORIES);
    
    // Agrupar por categoría
    const urlsByCategory = {
      rutas: [],
      noticias: [],
      vehiculos: []
    };
    
    blogUrls.forEach(url => {
      const category = extractCategory(url);
      if (category && urlsByCategory[category]) {
        urlsByCategory[category].push(url);
      }
    });
    
    console.log(`\n✅ URLs extraídas del sitemap:`);
    console.log(`   📂 Rutas: ${urlsByCategory.rutas.length} artículos`);
    console.log(`   📂 Noticias: ${urlsByCategory.noticias.length} artículos`);
    console.log(`   📂 Vehículos: ${urlsByCategory.vehiculos.length} artículos`);
    console.log(`   📊 TOTAL: ${blogUrls.length} artículos`);
    
    return urlsByCategory;
    
  } catch (error) {
    console.error(`   ❌ Error al extraer URLs del sitemap:`, error.message);
    return { rutas: [], noticias: [], vehiculos: [] };
  }
}

// Función para extraer el contenido de un artículo
async function scrapeArticle(page, url, category) {
  try {
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // Extraer datos del artículo
    const articleData = await page.evaluate(() => {
      // Intentar diferentes selectores para el contenido
      const contentSelectors = [
        '.blog-posts-showfull',
        '.blog-post-content',
        '.vblog-post-content',
        'article .content',
        '.blog-content',
        '.post-content',
        '.entry-content',
        'main article',
        '[role="article"]',
        'article',
        '.main-content'
      ];
      
      let contentElement = null;
      let contentHtml = '';
      
      for (const selector of contentSelectors) {
        contentElement = document.querySelector(selector);
        if (contentElement && contentElement.innerHTML.trim().length > 100) {
          contentHtml = contentElement.innerHTML;
          break;
        }
      }
      
      // Si no encontramos contenido, intentar con el body y limpiar
      if (!contentHtml) {
        const mainElement = document.querySelector('main') || document.querySelector('body');
        if (mainElement) {
          // Clonar el elemento para no modificar el DOM
          const clone = mainElement.cloneNode(true);
          // Eliminar elementos no deseados
          const unwanted = ['nav', 'header', 'footer', 'script', 'style', '.navigation', '.menu', '.sidebar'];
          unwanted.forEach(sel => {
            const elements = clone.querySelectorAll(sel);
            elements.forEach(el => el.remove());
          });
          contentHtml = clone.innerHTML;
        }
      }
      
      // Título
      const title = document.querySelector('h1')?.textContent?.trim() || 
                   document.querySelector('.post-title')?.textContent?.trim() ||
                   document.querySelector('.blog-title')?.textContent?.trim() ||
                   document.title.split('|')[0].split('-')[0].trim();
      
      // Contenido HTML (limpiado)
      const content = contentHtml;
      
      // Imagen destacada
      const featuredImage = document.querySelector('meta[property="og:image"]')?.content ||
                           document.querySelector('.featured-image img')?.src ||
                           document.querySelector('.blog-image img')?.src ||
                           document.querySelector('article img')?.src ||
                           '';
      
      // Extracto
      const excerpt = document.querySelector('meta[name="description"]')?.content ||
                     document.querySelector('meta[property="og:description"]')?.content ||
                     '';
      
      // Fecha de publicación
      const publishedDate = document.querySelector('time')?.getAttribute('datetime') ||
                           document.querySelector('.published')?.textContent ||
                           document.querySelector('.post-date')?.textContent ||
                           document.querySelector('.blog-date')?.textContent ||
                           '';
      
      // Meta tags
      const metaTitle = document.querySelector('meta[property="og:title"]')?.content || 
                       document.querySelector('title')?.textContent || 
                       document.title;
      const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
      const metaKeywords = document.querySelector('meta[name="keywords"]')?.content || '';
      
      return {
        title,
        content,
        featuredImage,
        excerpt,
        publishedDate,
        metaTitle,
        metaDescription,
        metaKeywords
      };
    });
    
    // Calcular tiempo de lectura estimado (palabras / 200)
    const wordCount = articleData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    return {
      url,
      slug: extractSlug(url),
      category: category,
      ...articleData,
      readingTime
    };
    
  } catch (error) {
    console.error(`   ❌ Error al extraer artículo ${url}:`, error.message);
    return null;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando extracción del blog de Furgocasa desde el sitemap...\n');
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Obtener todas las URLs del sitemap
  const urlsByCategory = await getAllBlogUrls(page);
  
  // Array para almacenar todos los artículos
  const allArticles = [];
  
  // Procesar cada categoría
  for (const [category, urls] of Object.entries(urlsByCategory)) {
    if (urls.length === 0) continue;
    
    console.log(`\n📂 Procesando categoría: ${category} (${urls.length} artículos)`);
    
    // Extraer contenido de cada artículo
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`   📄 [${i + 1}/${urls.length}] Extrayendo: ${url}`);
      
      const article = await scrapeArticle(page, url, category);
      if (article) {
        allArticles.push(article);
        console.log(`      ✅ ${article.title.substring(0, 80)}${article.title.length > 80 ? '...' : ''}`);
      }
      
      // Pequeña pausa para no sobrecargar el servidor
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  await browser.close();
  
  console.log(`\n✅ Extracción completada: ${allArticles.length} artículos encontrados`);
  console.log(`   📂 Rutas: ${allArticles.filter(a => a.category === 'rutas').length}`);
  console.log(`   📂 Noticias: ${allArticles.filter(a => a.category === 'noticias').length}`);
  console.log(`   📂 Vehículos: ${allArticles.filter(a => a.category === 'vehiculos').length}`);
  
  // Guardar datos en JSON
  const jsonPath = path.join(__dirname, 'blog-articles.json');
  fs.writeFileSync(jsonPath, JSON.stringify(allArticles, null, 2), 'utf-8');
  console.log(`\n💾 Datos guardados en: ${jsonPath}`);
  
  // Generar SQL
  generateSQL(allArticles);
}

// Función para generar el archivo SQL
function generateSQL(articles) {
  const sqlPath = path.join(__dirname, 'import-blog-articles.sql');
  
  let sql = `-- ============================================
-- IMPORTACIÓN DE ARTÍCULOS DEL BLOG FURGOCASA
-- Generado automáticamente el ${new Date().toISOString()}
-- Total de artículos: ${articles.length}
-- ============================================

-- Primero necesitamos los IDs de las categorías
DO $$
DECLARE
  cat_rutas UUID;
  cat_noticias UUID;
  cat_vehiculos UUID;
BEGIN
  -- Obtener IDs de categorías
  SELECT id INTO cat_rutas FROM content_categories WHERE slug = 'rutas';
  SELECT id INTO cat_noticias FROM content_categories WHERE slug = 'noticias';
  SELECT id INTO cat_vehiculos FROM content_categories WHERE slug = 'vehiculos';
  
  -- Insertar artículos
`;

  articles.forEach((article, index) => {
    const categoryVar = article.category === 'rutas' ? 'cat_rutas' :
                       article.category === 'noticias' ? 'cat_noticias' :
                       'cat_vehiculos';
    
    const publishedAt = article.publishedDate || 'NOW()';
    
    sql += `
  -- Artículo ${index + 1}: ${article.title}
  INSERT INTO posts (
    title,
    slug,
    excerpt,
    content,
    featured_image,
    category_id,
    status,
    is_featured,
    reading_time,
    meta_title,
    meta_description,
    meta_keywords,
    og_image,
    published_at,
    post_type
  ) VALUES (
    '${escapeSqlString(article.title)}',
    '${escapeSqlString(article.slug)}',
    '${escapeSqlString(article.excerpt)}',
    '${escapeSqlString(article.content)}',
    '${escapeSqlString(article.featuredImage)}',
    ${categoryVar},
    'published',
    ${index < 3 ? 'TRUE' : 'FALSE'}, -- Los primeros 3 como destacados
    ${article.readingTime},
    '${escapeSqlString(article.metaTitle)}',
    '${escapeSqlString(article.metaDescription)}',
    '${escapeSqlString(article.metaKeywords)}',
    '${escapeSqlString(article.featuredImage)}',
    ${publishedAt === 'NOW()' ? publishedAt : `'${publishedAt}'`},
    'blog'
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    excerpt = EXCLUDED.excerpt,
    featured_image = EXCLUDED.featured_image,
    updated_at = NOW();
`;
  });
  
  sql += `
END $$;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 
  p.title as "Título",
  c.name as "Categoría",
  p.slug as "Slug",
  p.status as "Estado",
  p.published_at as "Publicado"
FROM posts p
LEFT JOIN content_categories c ON p.category_id = c.id
WHERE p.post_type = 'blog'
ORDER BY p.published_at DESC;

-- Resumen por categoría
SELECT 
  c.name as "Categoría",
  COUNT(*) as "Total Artículos"
FROM posts p
LEFT JOIN content_categories c ON p.category_id = c.id
WHERE p.post_type = 'blog'
GROUP BY c.name
ORDER BY c.name;
`;
  
  fs.writeFileSync(sqlPath, sql, 'utf-8');
  console.log(`📝 Archivo SQL generado: ${sqlPath}`);
  
  // Generar también un CSV para revisión rápida
  generateCSV(articles);
}

// Función para generar CSV de resumen
function generateCSV(articles) {
  const csvPath = path.join(__dirname, 'blog-articles-summary.csv');
  
  let csv = 'Categoría,Título,Slug,URL,Extracto,Imagen,Fecha\n';
  
  articles.forEach(article => {
    const row = [
      article.category,
      `"${article.title.replace(/"/g, '""')}"`,
      article.slug,
      article.url,
      `"${article.excerpt.substring(0, 100).replace(/"/g, '""')}..."`,
      article.featuredImage ? 'Sí' : 'No',
      article.publishedDate || 'N/A'
    ];
    csv += row.join(',') + '\n';
  });
  
  fs.writeFileSync(csvPath, csv, 'utf-8');
  console.log(`📊 Resumen CSV generado: ${csvPath}`);
}

// Ejecutar
main().catch(console.error);
