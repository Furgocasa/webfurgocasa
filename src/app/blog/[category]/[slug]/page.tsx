"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LocalizedLink } from "@/components/localized-link";
import { Calendar, User, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Tag, BookOpen, Eye, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { supabase } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { getCategorySlugInSpanish, getCategoryName, translateCategorySlug } from "@/lib/blog-translations";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  slug_en: string | null;
  excerpt: string | null;
  excerpt_en: string | null;
  content: string;
  content_en: string | null;
  featured_image: string | null;
  published_at: string | null;
  reading_time: number;
  views: number;
  meta_title: string | null;
  meta_description: string | null;
  category: Category | null;
  tags?: TagItem[];
}

interface RelatedPost {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  slug_en: string | null;
  featured_image: string | null;
  published_at: string | null;
  reading_time: number;
}

// Mapeo de slugs a nombres
const categoryNames: Record<string, string> = {
  rutas: "Rutas",
  noticias: "Noticias",
  vehiculos: "Vehículos",
  consejos: "Consejos",
  destinos: "Destinos",
  equipamiento: "Equipamiento",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPostPage() {
  const params = useParams();
  const { t, language } = useLanguage();
  
  const categorySlug = params.category as string;
  const postSlug = params.slug as string;
  
  // Convertir el slug de categoría a español si no lo está (la BD tiene slugs en español)
  const esCategorySlug = getCategorySlugInSpanish(categorySlug, language);

  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper para obtener el contenido en el idioma actual
  const getTranslated = (es: string | null, en: string | null): string => {
    if (language === 'en' && en) return en;
    return es || '';
  };

  useEffect(() => {
    async function loadPost() {
      setLoading(true);

      // Buscar por slug_en si el idioma es inglés, sino por slug español
      const slugToSearch = postSlug;
      const slugField = language === 'en' ? 'slug_en' : 'slug';
      
      console.log(`🔍 Buscando post con ${slugField}:`, slugToSearch);

      // Intentar buscar por el slug en el idioma actual
      let query = supabase
        .from("posts")
        .select(`
          id,
          title,
          title_en,
          slug,
          slug_en,
          excerpt,
          excerpt_en,
          content,
          content_en,
          featured_image,
          published_at,
          reading_time,
          views,
          meta_title,
          meta_description,
          category:content_categories(id, name, slug, description)
        `)
        .eq("status", "published");

      // Buscar por slug_en si es inglés, sino por slug
      if (language === 'en') {
        query = query.or(`slug_en.eq.${slugToSearch},slug.eq.${slugToSearch}`);
      } else {
        query = query.eq('slug', slugToSearch);
      }

      const { data: postData, error } = await query.single();

      if (postData) {
        // Transformar category de array a objeto único
        const transformedPost = {
          ...postData,
          category: Array.isArray(postData.category) ? postData.category[0] : postData.category
        };
        setPost(transformedPost);

        // Incrementar vistas
        await supabase
          .from("posts")
          .update({ views: (postData.views || 0) + 1 })
          .eq("id", postData.id);

        // Cargar posts relacionados (misma categoría)
        if (postData.category) {
          const { data: related } = await supabase
            .from("posts")
            .select("id, title, title_en, slug, slug_en, featured_image, published_at, reading_time")
            .eq("category_id", postData.category.id)
            .eq("status", "published")
            .neq("id", postData.id)
            .order("published_at", { ascending: false })
            .limit(3);

          setRelatedPosts(related || []);
        }

        // Cargar tags del post
        const { data: postTags } = await supabase
          .from("post_tags")
          .select("tag:tags(id, name, slug)")
          .eq("post_id", postData.id);

        if (postTags && postData) {
          setPost({
            ...postData,
            tags: postTags.map((pt: any) => pt.tag).filter(Boolean),
          });
        }
      }

      setLoading(false);
    }

    if (postSlug) {
      loadPost();
    }
  }, [postSlug]);

  // Obtener el nombre de la categoría traducido
  const categoryName = post?.category?.slug 
    ? getCategoryName(post.category.slug, language)
    : getCategoryName(esCategorySlug, language);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-blue"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t("Artículo no encontrado")}
          </h1>
          <p className="text-gray-500 mb-8">
            {t("El artículo que buscas no existe o ha sido eliminado.")}
          </p>
          <LocalizedLink 
            href={`/blog/${categorySlug}`} 
            className="inline-flex items-center gap-2 bg-furgocasa-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("Volver a {categoryName}")}
          </LocalizedLink>
        </main>
        <Footer />
      </>
    );
  }

  // URL actual para compartir
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 font-amiko">
        {/* Hero */}
        <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-white/70 text-sm mb-8 flex-wrap">
              <LocalizedLink href="/" className="hover:text-white transition-colors">Inicio</LocalizedLink>
              <ChevronRight className="h-4 w-4" />
              <LocalizedLink href="/blog" className="hover:text-white transition-colors">Blog</LocalizedLink>
              <ChevronRight className="h-4 w-4" />
              <LocalizedLink href={`/blog/${categorySlug}`} className="hover:text-white transition-colors">{categoryName}</LocalizedLink>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium truncate max-w-[200px]">{getTranslated(post.title, post.title_en)}</span>
            </nav>

            <div className="max-w-4xl mx-auto text-center">
              <LocalizedLink 
                href={`/blog/${categorySlug}`}
                className="inline-block px-4 py-1.5 bg-furgocasa-orange text-white rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-lg hover:bg-furgocasa-orange-dark transition-colors"
              >
                {categoryName}
              </LocalizedLink>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-8 leading-tight">
                {getTranslated(post.title, post.title_en)}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-blue-100 font-medium bg-white/10 backdrop-blur-md rounded-2xl py-4 px-6 text-sm">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-furgocasa-orange" />
                  Furgocasa
                </span>
                <span className="w-1 h-1 bg-blue-300 rounded-full hidden md:block"></span>
                {post.published_at && (
                  <>
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-furgocasa-orange" />
                      {formatDate(post.published_at)}
                    </span>
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
            <div className="h-64 md:h-[500px] bg-gray-200 rounded-3xl shadow-2xl flex items-center justify-center text-gray-400 overflow-hidden border-4 border-white">
              {post.featured_image ? (
                <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
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
              {/* Share Sidebar (Desktop) */}
              <div className="lg:col-span-1 hidden lg:block">
                <div className="sticky top-32 flex flex-col gap-4 items-center">
                  <p className="text-xs font-bold text-gray-400 uppercase rotate-180 mb-4" style={{ writingMode: 'vertical-rl' }}>
                    {t("Compartir")}
                  </p>
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white text-blue-600 rounded-full shadow-md hover:scale-110 transition-transform"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white text-sky-500 rounded-full shadow-md hover:scale-110 transition-transform"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a 
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white text-blue-700 rounded-full shadow-md hover:scale-110 transition-transform"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>

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
                  className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-furgocasa-orange prose-strong:text-gray-900 prose-li:text-gray-600 prose-img:rounded-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:mt-8 prose-h3:mb-4"
                  dangerouslySetInnerHTML={{ __html: getTranslated(post.content, post.content_en) }}
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

                {/* Share Mobile */}
                <div className="lg:hidden mt-8 pt-8 border-t border-gray-100">
                  <p className="text-gray-900 font-bold mb-4 text-center">{t("Compartir artículo")}</p>
                  <div className="flex gap-4 justify-center">
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-600 text-white rounded-full shadow-lg"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-sky-500 text-white rounded-full shadow-lg"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a 
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-700 text-white rounded-full shadow-lg"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-16 bg-furgocasa-blue rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-heading font-bold mb-4">{t("¿Te ha inspirado este artículo?")}</h3>
                    <p className="text-blue-100 mb-8 text-lg">
                      {t("Haz realidad tu viaje. Reserva tu camper y empieza a explorar estos destinos increíbles.")}
                    </p>
                    <LocalizedLink
                      href="/reservar"
                      className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold py-4 px-8 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                      {t("Ver disponibilidad y precios")}
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
                        {t("Más en {categoryName}")}
                      </h3>
                      <ul className="space-y-6">
                        {relatedPosts.map((related) => (
                          <li key={related.id}>
                            <LocalizedLink
                              href={`/blog/${categorySlug}/${related.slug}`}
                              className="block group"
                            >
                              {related.featured_image && (
                                <div className="h-24 rounded-lg overflow-hidden mb-3">
                                  <img 
                                    src={related.featured_image} 
                                    alt={related.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )}
                              <p className="text-gray-900 font-bold leading-tight group-hover:text-furgocasa-blue transition-colors line-clamp-2">
                                {getTranslated(related.title, related.title_en)}
                              </p>
                              {related.published_at && (
                                <p className="text-xs text-gray-400 mt-2">
                                  {formatDate(related.published_at)}
                                </p>
                              )}
                            </LocalizedLink>
                          </li>
                        ))}
                      </ul>
                      <LocalizedLink 
                        href={`/blog/${categorySlug}`}
                        className="block text-center text-sm font-bold text-furgocasa-blue hover:text-furgocasa-orange mt-6 pt-4 border-t border-gray-100 transition-colors"
                      >
                        {t("Ver más artículos de {categoryName}")} →
                      </LocalizedLink>
                    </div>
                  )}
                  
                  {/* Back to category */}
                  <LocalizedLink 
                    href={`/blog/${categorySlug}`}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("Volver a {categoryName}")}
                  </LocalizedLink>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

