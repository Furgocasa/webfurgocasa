import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LocalizedLink } from "@/components/localized-link";
import { Calendar, User, Clock, ArrowLeft, Tag, BookOpen, Eye, ChevronRight } from "lucide-react";
import { getPostBySlug, getRelatedPosts, getAllPublishedPostSlugs } from "@/lib/blog/server-actions";
import { BlogViewTracker } from "@/components/blog/blog-view-tracker";
import { getCategoryName, getAllPostSlugTranslations, translateCategorySlug, sanitizeBlogContentLinks } from "@/lib/blog-translations";
import { ShareButtons } from "@/components/blog/share-buttons";
import { BlogPostJsonLd } from "@/components/blog/blog-post-jsonld";
import { BlogRouteDataProvider } from "@/components/blog/blog-route-data";
import { getTranslatedContent, getTranslatedRecords, type Locale } from "@/lib/translations/get-translations";
import { translateServer } from "@/lib/i18n/server-translation";
import { buildBlogCanonicalAlternates } from "@/lib/seo/multilingual-metadata";

/**
 * 🎯 ARTÍCULOS DE BLOG MULTIIDIOMA - Nueva arquitectura [locale]
 * ======================================================
 * 
 * Páginas de artículos individuales con soporte multiidioma físico.
 * - /es/blog/rutas/algarve-en-camper → Español
 * - /en/blog/routes/algarve-en-camper → Inglés
 * - /fr/blog/itineraires/algarve-en-camper → Francés
 * - /de/blog/routen/algarve-en-camper → Alemán
 * 
 * Los artículos tienen traducciones reales en content_translations
 */

interface BlogPostPageProps {
  params: Promise<{ category: string; slug: string }>;
}

// Locale fijo para esta carpeta /de/
const LOCALE: Locale = 'de';

// ⚡ ISR: Revalidar cada día (artículos de blog son muy estáticos)
export const revalidate = 86400;

// 🚀 Pre-generar TODOS los posts en build time (SEO óptimo)
export async function generateStaticParams() {
  const posts = await getAllPublishedPostSlugs('de');
  console.log(`[generateStaticParams] Pre-generando ${posts.length} posts del blog en alemán`);
  return posts;
}

/**
 * 🎯 Metadata dinámica para SEO óptimo
 */
export async function generateMetadata({ 
  params 
}: BlogPostPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const locale = LOCALE;
  const post = await getPostBySlug(slug, category, locale);

  if (!post) {
    return {
      title: "Artikel nicht gefunden",
      description: "Der gesuchte Artikel existiert nicht oder wurde entfernt."
    };
  }

  // 🌐 OBTENER TRADUCCIONES PARA METADATA
  const translatedMeta = await getTranslatedContent(
    'posts',
    post.id,
    ['title', 'excerpt', 'meta_title', 'meta_description'],
    locale,
    {
      title: post.title,
      excerpt: post.excerpt,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
    }
  );

  // ✅ Canonical autorreferenciado
  const alternates = buildBlogCanonicalAlternates(`/blog/${category}/${slug}`, locale, post);
  
  return {
    title: translatedMeta.meta_title || translatedMeta.title,
    description: translatedMeta.meta_description || translatedMeta.excerpt || translatedMeta.title,
    authors: [{ name: "Furgocasa" }],
    keywords: post.tags?.map(tag => tag.name).join(","),
    openGraph: {
      title: translatedMeta.title,
      description: translatedMeta.excerpt || translatedMeta.meta_description || "",
      type: "article",
      url: alternates.canonical,
      images: post.featured_image ? [
        {
          url: post.featured_image,
          width: 1200,
          height: 630,
          alt: translatedMeta.title,
        }
      ] : [],
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      authors: ["Furgocasa"],
      section: post.category?.name || "Blog",
      tags: post.tags?.map(tag => tag.name),
    },
    twitter: {
      card: "summary_large_image",
      title: translatedMeta.title,
      description: translatedMeta.excerpt || translatedMeta.meta_description || "",
      images: post.featured_image ? [post.featured_image] : [],
      creator: "@furgocasa",
    },
    alternates,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

function formatDate(date: string, locale: Locale) {
  const localeStr = locale === 'es' ? 'es-ES' : 
                    locale === 'en' ? 'en-US' : 
                    locale === 'fr' ? 'fr-FR' : 'de-DE';
  
  return new Date(date).toLocaleDateString(localeStr, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// 🎨 Server Component principal
export default async function LocaleBlogPostPage({ 
  params 
}: BlogPostPageProps) {
  const { category, slug } = await params;
  const locale = LOCALE;
  
  // Obtener post desde el servidor (locale fijo 'de' para esta carpeta)
  const post = await getPostBySlug(slug, category, locale);

  if (!post) {
    notFound();
  }

  // Función helper para UI estática
  const t = (key: string) => translateServer(key, locale);

  // 🌐 OBTENER TRADUCCIONES DEL POST DESDE SUPABASE
  const translatedPost = await getTranslatedContent(
    'posts',
    post.id,
    ['title', 'excerpt', 'content', 'meta_title', 'meta_description'],
    locale,
    {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
    }
  );

  // Obtener posts relacionados y traducir títulos al idioma de la página
  const rawRelatedPosts = post.category_id 
    ? await getRelatedPosts(post.category_id, post.id)
    : [];
  const relatedPosts = locale !== 'es'
    ? await getTranslatedRecords('posts', rawRelatedPosts, ['title'], locale)
    : rawRelatedPosts;

  const categoryName = post.category?.slug 
    ? getCategoryName(post.category.slug, locale)
    : "Blog";

  // ⚠️ URL canónica con el idioma actual
  const url = `https://www.furgocasa.com/${locale}/blog/${category}/${slug}`;

  // 🌐 Obtener slugs traducidos para el cambio de idioma dinámico
  const blogRouteData = await getAllPostSlugTranslations(
    post.id,
    post.slug,
    post.category?.slug || category
  );

  return (
    <>
      <BlogViewTracker postId={post.id} />
      <BlogRouteDataProvider data={blogRouteData} />
      <BlogPostJsonLd post={post} url={url} />
      <main className="min-h-screen bg-gray-50 font-amiko">
        {/* Hero */}
        <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-white/70 text-sm mb-8 flex-wrap" aria-label="Breadcrumb">
              <LocalizedLink href="/" className="hover:text-white transition-colors">{t("Inicio")}</LocalizedLink>
              <ChevronRight className="h-4 w-4" />
              <LocalizedLink href="/blog" className="hover:text-white transition-colors">Blog</LocalizedLink>
              <ChevronRight className="h-4 w-4" />
              <LocalizedLink href={`/blog/${category}`} className="hover:text-white transition-colors">{categoryName}</LocalizedLink>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium truncate max-w-[200px]">{translatedPost.title}</span>
            </nav>

            <div className="max-w-4xl mx-auto text-center">
              <LocalizedLink 
                href={`/blog/${category}`}
                className="inline-block px-4 py-1.5 bg-furgocasa-orange text-white rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-lg hover:bg-furgocasa-orange-dark transition-colors"
              >
                {categoryName}
              </LocalizedLink>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-8 leading-tight">
                {translatedPost.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-blue-100 font-medium bg-white/10 backdrop-blur-md rounded-2xl py-4 px-6 text-sm">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-furgocasa-orange" />
                  Furgocasa
                </span>
                <span className="w-1 h-1 bg-blue-300 rounded-full hidden md:block"></span>
                {post.published_at && (
                  <>
                    <time dateTime={post.published_at} className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-furgocasa-orange" />
                      {formatDate(post.published_at, locale)}
                    </time>
                    <span className="w-1 h-1 bg-blue-300 rounded-full hidden md:block"></span>
                  </>
                )}
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-furgocasa-orange" />
                  {post.reading_time || 5} {t("min de lectura")}
                </span>
                <span className="w-1 h-1 bg-blue-300 rounded-full hidden md:block"></span>
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-furgocasa-orange" />
                  {post.views || 0} {t("vistas")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="container mx-auto px-4 -mt-16 relative z-20 max-w-5xl">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[21/9] bg-gray-100">
              <Image
                src={post.featured_image}
                alt={translatedPost.title || post.title}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
                priority
                quality={90}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <article className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Main Content */}
            <div className="flex-1 min-w-0 lg:max-w-3xl">
              {translatedPost.excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed mb-8 font-medium italic border-l-4 border-furgocasa-orange pl-6 bg-gray-50 py-4 rounded-r-lg">
                  {translatedPost.excerpt}
                </p>
              )}

              <div 
                className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:font-bold prose-a:text-furgocasa-blue hover:prose-a:text-furgocasa-blue-dark prose-img:rounded-2xl prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: sanitizeBlogContentLinks(translatedPost.content || post.content || "", locale) }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {t("Etiquetas")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Buttons */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  {t("Compartir artículo")}
                </h3>
                <ShareButtons
                  url={url}
                  title={translatedPost.title || post.title}
                />
              </div>

              {/* Back to Category */}
              <div className="mt-12">
                <LocalizedLink
                  href={`/blog/${category}`}
                  className="inline-flex items-center gap-2 text-furgocasa-blue font-bold hover:text-furgocasa-blue-dark transition-colors group"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  {t("Ver más en")} {categoryName}
                </LocalizedLink>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-8">
                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-furgocasa-orange" />
                      {t("Artículos relacionados")}
                    </h3>
                    <div className="space-y-4">
                      {relatedPosts.slice(0, 3).map((related) => {
                        const hasTranslation = (locale === 'es') || (locale === 'en' && related.slug_en) || (locale === 'fr' && related.slug_fr) || (locale === 'de' && related.slug_de);
                        const relatedSlug = hasTranslation ? (locale === 'es' ? related.slug : locale === 'en' ? (related.slug_en || related.slug) : locale === 'fr' ? (related.slug_fr || related.slug) : (related.slug_de || related.slug)) : related.slug;
                        const relatedCategorySlug = translateCategorySlug(related.category?.slug || 'general', hasTranslation ? locale : 'es');
                        const href = hasTranslation ? `/${locale}/blog/${relatedCategorySlug}/${relatedSlug}` : `/es/blog/${related.category?.slug || 'general'}/${related.slug}`;
                        
                        return (
                        <Link
                          key={related.id}
                          href={href}
                          className="group block"
                        >
                          {related.featured_image && (
                            <div className="relative h-32 rounded-xl overflow-hidden mb-3 bg-gray-100">
                              <Image
                                src={related.featured_image}
                                alt={related.title}
                                fill
                                sizes="320px"
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-furgocasa-blue transition-colors line-clamp-2 leading-snug">
                            {related.title}
                          </h4>
                          {related.published_at && (
                            <time className="text-xs text-gray-500 mt-1 block">
                              {formatDate(related.published_at, locale)}
                            </time>
                          )}
                        </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark rounded-2xl p-6 text-white">
                  <h3 className="text-xl font-heading font-bold mb-3">
                    {t("¿Listo para tu aventura?")}
                  </h3>
                  <p className="text-blue-100 text-sm mb-6">
                    {t("Descubre nuestra flota de campers y comienza tu viaje")}
                  </p>
                  <LocalizedLink
                    href="/vehiculos"
                    className="block w-full bg-white text-furgocasa-blue font-bold py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors text-center text-sm uppercase tracking-wide shadow-lg"
                  >
                    {t("Ver vehículos")}
                  </LocalizedLink>
                </div>
              </div>
            </aside>
          </div>
        </article>
      </main>
    </>
  );
}
