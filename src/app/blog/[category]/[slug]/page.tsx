import { Metadata } from"next";
import { notFound } from"next/navigation";
import { headers } from"next/headers";
import Image from"next/image";
import { LocalizedLink } from"@/components/localized-link";
import { Calendar, User, Clock, ArrowLeft, Tag, BookOpen, Eye, ChevronRight } from"lucide-react";
import { getPostBySlug, getRelatedPosts, incrementPostViews, getAllPublishedPostSlugs } from"@/lib/blog/server-actions";
import { getCategoryName } from"@/lib/blog-translations";
import { ShareButtons } from"@/components/blog/share-buttons";
import { BlogPostJsonLd } from"@/components/blog/blog-post-jsonld";
import { getTranslatedContent, type Locale } from"@/lib/translations/get-translations";
import { translateServer } from"@/lib/i18n/server-translation";
import { buildCanonicalAlternates } from"@/lib/seo/multilingual-metadata";

// ⚡ ISR: Revalidar cada hora
// ⚡ ISR: Revalidar cada día (artículos de blog son muy estáticos)
export const revalidate = 86400;

// 🚀 Pre-generar TODOS los posts en build time (SEO óptimo)
export async function generateStaticParams() {
  const posts = await getAllPublishedPostSlugs();
  console.log(`[generateStaticParams] Pre-generando ${posts.length} posts del blog`);
  return posts; // Sin límite - todos los posts publicados
}

/**
 * 🎯 Metadata dinámica para SEO óptimo
 * 
 * SEO MULTIIDIOMA - Modelo correcto con prefijo /es/
 * Ver /SEO-MULTIIDIOMA-MODELO.md para documentación completa
 */
export async function generateMetadata({ 
  params 
}: { 
  params: { category: string; slug: string } 
}): Promise<Metadata> {
  const headersList = await headers();
  const locale = (headersList.get('x-detected-locale') || 'es') as Locale;
  const post = await getPostBySlug(params.slug, params.category);

  if (!post) {
    return {
      title: "Artículo no encontrado",
      description: "El artículo que buscas no existe o ha sido eliminado."
    };
  }

  // ✅ Canonical autorreferenciado: ruta sin prefijo de idioma (el helper lo añade)
  const alternates = buildCanonicalAlternates(`/blog/${params.category}/${params.slug}`, locale);
  
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || post.title,
    authors: [{ name:"Furgocasa" }],
    keywords: post.tags?.map(tag => tag.name).join(","),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.meta_description ||"",
      type:"article",
      url: alternates.canonical,
      images: post.featured_image ? [
        {
          url: post.featured_image,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      authors: ["Furgocasa"],
      section: post.category?.name ||"Blog",
      tags: post.tags?.map(tag => tag.name),
    },
    twitter: {
      card:"summary_large_image",
      title: post.title,
      description: post.excerpt || post.meta_description ||"",
      images: post.featured_image ? [post.featured_image] : [],
      creator:"@furgocasa",
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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-ES", {
    day:"numeric",
    month:"long",
    year:"numeric",
  });
}

// 🎨 Server Component principal
export default async function BlogPostPage({ 
  params 
}: { 
  params: { category: string; slug: string } 
}) {
  // Obtener post desde el servidor
  const post = await getPostBySlug(params.slug, params.category);

  if (!post) {
    notFound();
  }

  // Detectar idioma desde headers (middleware)
  const headersList = await headers();
  const locale = (headersList.get('x-detected-locale') || 'es') as Locale;
  
  // Función helper para UI estática
  const t = (key: string) => translateServer(key, locale);

  // 🌐 OBTENER TRADUCCIONES DEL POST DESDE SUPABASE
  // Si el idioma no es español, busca traducciones en content_translations
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

  // Obtener posts relacionados (también traducidos)
  const relatedPosts = post.category_id 
    ? await getRelatedPosts(post.category_id, post.id)
    : [];

  // Incrementar vistas (sin esperar)
  incrementPostViews(post.id, post.views).catch(console.error);

  const categoryName = post.category?.slug 
    ? getCategoryName(post.category.slug, locale)
    :"Blog";

  // ⚠️ URL canónica con el idioma actual
  const url = `https://www.furgocasa.com/${locale}/blog/${params.category}/${params.slug}`;

  return (
    <>
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
              <LocalizedLink href={`/blog/${params.category}`} className="hover:text-white transition-colors">{categoryName}</LocalizedLink>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium truncate max-w-[200px]">{translatedPost.title}</span>
            </nav>

            <div className="max-w-4xl mx-auto text-center">
              <LocalizedLink 
                href={`/blog/${params.category}`}
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
                      {formatDate(post.published_at)}
                    </time>
                    <span className="w-1 h-1 bg-blue-300 rounded-full hidden md:block"></span>
                  </>
                )}
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-furgocasa-orange" />
                  {post.reading_time || 5} {t("min lectura")}
                </span>
                {post.views > 0 && (
                  <>
                    <span className="w-1 h-1 bg-blue-300 rounded-full hidden md:block"></span>
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-furgocasa-orange" />
                      {post.views} {t("visitas")}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        <div className="container mx-auto px-4 -mt-16 relative z-20">
          <div className="max-w-5xl mx-auto">
            <div className="h-64 md:h-[500px] bg-gray-200 rounded-3xl shadow-2xl flex items-center justify-center text-gray-400 overflow-hidden border-4 border-white relative">
              {post.featured_image ? (
                <Image 
                  src={post.featured_image} 
                  alt={translatedPost.title || ''} 
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  className="object-cover"
                  priority
                  quality={70}
                />
              ) : (
                <div className="flex flex-col items-center">
                  <BookOpen className="h-24 w-24 mb-4 opacity-50" />
                  <span className="font-heading font-bold text-xl">{t("Imagen del artículo")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-12">
              {/* Share Sidebar */}
              <ShareButtons shareUrl={url} title={post.title} />

              {/* Content */}
              <article className="lg:col-span-8">
                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-xl text-gray-600 leading-relaxed mb-8 font-medium border-l-4 border-furgocasa-orange pl-6">
                    {post.excerpt}
                  </p>
                )}

                {/* Main Content */}
                <div
                  className="prose prose-lg max-w-none 
                    prose-headings:font-heading prose-headings:font-bold prose-headings:text-gray-900 
                    prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:leading-tight
                    prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:leading-tight
                    prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-3
                    prose-p:text-gray-700 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6
                    prose-a:text-furgocasa-orange prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 prose-strong:font-bold
                    prose-em:text-gray-700 prose-em:italic
                    prose-ul:my-6 prose-ul:space-y-2
                    prose-ol:my-6 prose-ol:space-y-2
                    prose-li:text-gray-700 prose-li:text-lg prose-li:leading-relaxed
                    prose-blockquote:border-l-4 prose-blockquote:border-furgocasa-orange prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-gray-600
                    prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
                    prose-hr:my-12 prose-hr:border-gray-200
                    prose-code:text-furgocasa-blue prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-base
                   prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-6 prose-pre:my-8"
                  dangerouslySetInnerHTML={{ __html: translatedPost.content || '' }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Tag className="h-5 w-5 text-furgocasa-orange" />
                      {post.tags.map((tag) => (
                        <LocalizedLink
                          key={tag.id}
                          href={`/blog/etiqueta/${tag.slug}`}
                          className="px-4 py-1.5 bg-gray-50 hover:bg-furgocasa-blue hover:text-white rounded-lg text-sm font-medium text-gray-600 transition-all"
                        >
                          #{tag.name}
                        </LocalizedLink>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-16 bg-furgocasa-blue rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-heading font-bold mb-4">¿Te ha inspirado este artículo?</h3>
                    <p className="text-blue-100 mb-8 text-lg">
                      Haz realidad tu viaje. Reserva tu camper y empieza a explorar estos destinos increíbles.
                    </p>
                    <LocalizedLink
                      href="/reservar"
                      className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold py-4 px-8 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                      Ver disponibilidad y precios
                    </LocalizedLink>
                  </div>
                </div>
              </article>

              {/* Sidebar */}
              <aside className="lg:col-span-3">
                <div className="sticky top-32 space-y-8">
                  {/* Related posts */}
                  {relatedPosts.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <h3 className="text-lg font-heading font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">
                        Más en {categoryName}
                      </h3>
                      <ul className="space-y-6">
                        {relatedPosts.map((related) => (
                          <li key={related.id}>
                            <LocalizedLink
                              href={`/blog/${params.category}/${related.slug}`}
                              className="block group"
                            >
                              {related.featured_image && (
                                <div className="h-24 rounded-lg overflow-hidden mb-3 relative">
                                  <Image 
                                    src={related.featured_image} 
                                    alt={related.title}
                                    fill
                                    sizes="200px"
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                    quality={70}
                                  />
                                </div>
                              )}
                              <p className="text-gray-900 font-bold leading-tight group-hover:text-furgocasa-blue transition-colors line-clamp-2">
                                {related.title}
                              </p>
                              {related.published_at && (
                                <time dateTime={related.published_at} className="text-xs text-gray-400 mt-2 block">
                                  {formatDate(related.published_at)}
                                </time>
                              )}
                            </LocalizedLink>
                          </li>
                        ))}
                      </ul>
                      <LocalizedLink 
                        href={`/blog/${params.category}`}
                        className="block text-center text-sm font-bold text-furgocasa-blue hover:text-furgocasa-orange mt-6 pt-4 border-t border-gray-100 transition-colors"
                      >
                        Ver más artículos de {categoryName} →
                      </LocalizedLink>
                    </div>
                  )}
                  
                  {/* Back to category */}
                  <LocalizedLink 
                    href={`/blog/${params.category}`}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a {categoryName}
                  </LocalizedLink>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
</>
  );
}
