"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar, Clock, BookOpen, Search, Tag, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { getCategoryName, translateCategorySlug } from "@/lib/blog-translations";
import { getLanguageFromRoute } from "@/lib/route-translations";
import { useState, useTransition } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  post_count?: number;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  slug_en?: string | null;
  slug_fr?: string | null;
  slug_de?: string | null;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  reading_time: number;
  views: number;
  is_featured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface BlogListClientProps {
  initialPosts: Post[];
  categories: Category[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  featuredPosts: Post[];
  selectedCategory?: string;
  searchQuery?: string;
}

export function BlogListClient({ 
  initialPosts, 
  categories,
  currentPage,
  totalPages,
  totalCount,
  featuredPosts,
  selectedCategory,
  searchQuery
}: BlogListClientProps) {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  // Locale desde URL (fuente de verdad para SSR) - evita links /es/blog/... en páginas EN
  const locale = getLanguageFromRoute(pathname || "") || language;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchQuery || "");

  // Filtrar categorías con artículos
  const categoriesWithPosts = categories.filter(cat => (cat.post_count || 0) > 0);

  // 🌐 Helper para obtener slug y construir href - solo enlazar a idiomas donde existe (evita 404)
  const getBlogArticleHref = (post: Post): string => {
    const categorySlug = post.category?.slug || 'general';
    const hasTranslation = (locale === 'es') || (locale === 'en' && post.slug_en) || (locale === 'fr' && post.slug_fr) || (locale === 'de' && post.slug_de);
    const slug = locale === 'es' ? post.slug : locale === 'en' ? (post.slug_en || post.slug) : locale === 'fr' ? (post.slug_fr || post.slug) : (post.slug_de || post.slug);
    const translatedCategory = translateCategorySlug(categorySlug, locale);
    if (hasTranslation) {
      return `/${locale}/blog/${translatedCategory}/${slug}`;
    }
    return `/es/blog/${categorySlug}/${post.slug}`;
  };

  // Navegar con parámetros de búsqueda
  const navigateWithParams = (updates: { page?: number; category?: string | null; q?: string | null }) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    
    if (updates.page !== undefined) {
      if (updates.page === 1) {
        params.delete('page');
      } else {
        params.set('page', updates.page.toString());
      }
    }
    
    if (updates.category !== undefined) {
      if (updates.category === null) {
        params.delete('category');
      } else {
        params.set('category', updates.category);
      }
    }
    
    if (updates.q !== undefined) {
      if (updates.q === null || updates.q === '') {
        params.delete('q');
      } else {
        params.set('q', updates.q);
      }
    }
    
    const queryString = params.toString();
    startTransition(() => {
      router.push(queryString ? `?${queryString}` : window.location.pathname);
    });
  };

  const handleCategoryChange = (slug: string | null) => {
    navigateWithParams({ category: slug, page: 1 });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigateWithParams({ q: searchInput, page: 1 });
  };

  const handlePageChange = (page: number) => {
    navigateWithParams({ page });
    // Scroll suave al inicio del contenido
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar de categorías - Desktop */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
          <h3 className="text-xl font-heading font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5 text-furgocasa-orange" />
            {t("Categorías")}
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => handleCategoryChange(null)}
              disabled={isPending}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                !selectedCategory
                  ? "bg-furgocasa-blue text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{t("Todos los artículos")}</span>
                <span className={`text-sm ${!selectedCategory ? 'text-white/80' : 'text-gray-500'}`}>
                  {totalCount}
                </span>
              </div>
            </button>
            {categoriesWithPosts.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                disabled={isPending}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedCategory === category.slug
                    ? "bg-furgocasa-blue text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{getCategoryName(category.slug, locale)}</span>
                  <span className={`text-sm ${selectedCategory === category.slug ? 'text-white/80' : 'text-gray-500'}`}>
                    {category.post_count || 0}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="lg:col-span-9">
        {/* Barra de búsqueda y filtros móvil */}
        <div className="mb-12">
          {/* Búsqueda */}
          <form onSubmit={handleSearch} className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("Buscar artículos...")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={isPending}
              className="w-full pl-12 pr-20 py-4 rounded-xl border-2 border-gray-200 focus:border-furgocasa-blue focus:ring-2 focus:ring-furgocasa-blue/20 transition-all disabled:opacity-50"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  navigateWithParams({ q: null, page: 1 });
                }}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-furgocasa-blue text-white px-4 py-2 rounded-lg hover:bg-furgocasa-blue-dark transition-all disabled:opacity-50"
            >
              {t("Buscar")}
            </button>
          </form>

          {/* Categorías móvil */}
          <div className="flex lg:hidden flex-wrap gap-3">
            <button
              onClick={() => handleCategoryChange(null)}
              disabled={isPending}
              className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                !selectedCategory
                  ? "bg-furgocasa-blue text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {t("Todos")} ({totalCount})
            </button>
            {categoriesWithPosts.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                disabled={isPending}
                className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                  selectedCategory === category.slug
                    ? "bg-furgocasa-blue text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {getCategoryName(category.slug, locale)} ({category.post_count || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Indicador de carga */}
        {isPending && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-furgocasa-blue text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {t("Cargando...")}
          </div>
        )}

        {/* Posts destacados */}
        {featuredPosts.length > 0 && (
          <div className="mb-12 md:mb-16">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-furgocasa-orange flex-shrink-0" />
              <h2 className="text-xl md:text-3xl font-heading font-bold text-gray-900">
                {t("Artículos Destacados")}
              </h2>
            </div>
            <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">{t("Los mejores artículos seleccionados para ti")}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={getBlogArticleHref(post)}
                    className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-furgocasa-orange/30"
                  >
                    <div className="h-56 bg-gray-200 relative overflow-hidden">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-furgocasa-blue to-blue-600">
                          <BookOpen className="h-16 w-16 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="bg-furgocasa-orange text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 shadow-lg">
                          <Sparkles className="h-3.5 w-3.5" />
                          {t("Destacado")}
                        </span>
                      </div>
                      {post.category && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-white/95 text-gray-900 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                            {getCategoryName(post.category.slug, locale)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-heading font-bold text-gray-900 mb-3 group-hover:text-furgocasa-blue transition-colors line-clamp-2 leading-tight">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                        {post.published_at && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(post.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Madrid' })}
                          </span>
                        )}
                        {post.reading_time > 0 && (
                          <span className="flex items-center gap-1.5 font-medium text-furgocasa-blue">
                            <Clock className="h-3.5 w-3.5" />
                            {post.reading_time} min
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
            
            {/* Separador visual */}
            <div className="mt-16 mb-12 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gray-50 px-6 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {t("Todos los artículos")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Lista de posts */}
        {initialPosts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("No se encontraron artículos")}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? t("Intenta con otros términos de búsqueda") 
                : selectedCategory 
                  ? t("No hay artículos en esta categoría")
                  : t("No hay artículos disponibles")}
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchInput("");
                  navigateWithParams({ q: null, category: null, page: 1 });
                }}
                disabled={isPending}
                className="text-furgocasa-blue font-semibold hover:underline disabled:opacity-50"
              >
                {t("Limpiar filtros")}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {initialPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={getBlogArticleHref(post)}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                          <BookOpen className="h-12 w-12 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      {post.category && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-furgocasa-blue text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {getCategoryName(post.category.slug, locale)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-heading font-bold text-gray-900 mb-2 group-hover:text-furgocasa-blue transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {post.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.published_at).toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                        )}
                        <span className="text-furgocasa-orange font-semibold group-hover:translate-x-1 transition-transform">
                          {t("Leer más")} →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-12">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {/* Botón anterior */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isPending}
                    className={`p-2 rounded-lg transition-all ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-furgocasa-blue hover:bg-furgocasa-blue hover:text-white disabled:opacity-50'
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Números de página */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                    // Mostrar solo algunas páginas alrededor de la actual
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isPending}
                          className={`min-w-[40px] h-10 rounded-lg font-medium transition-all disabled:opacity-50 ${
                            currentPage === pageNum
                              ? 'bg-furgocasa-blue text-white shadow-lg'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="text-gray-400 px-2">...</span>;
                    }
                    return null;
                  })}

                  {/* Botón siguiente */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isPending}
                    className={`p-2 rounded-lg transition-all ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-furgocasa-blue hover:bg-furgocasa-blue hover:text-white disabled:opacity-50'
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Resultados */}
                <div className="mt-6 text-center text-gray-600">
                  {t("Mostrando")} <strong>{((currentPage - 1) * 12) + 1}</strong>-<strong>{Math.min(currentPage * 12, totalCount)}</strong> {t("de")} <strong>{totalCount}</strong> {t("artículos")}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
