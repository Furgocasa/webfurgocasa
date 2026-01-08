"use client";

import { useState } from "react";
import { LocalizedLink } from "@/components/localized-link";
import { Calendar, Clock, ArrowRight, BookOpen, Search, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { getCategoryName, translateCategorySlug } from "@/lib/blog-translations";

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
}

const POSTS_PER_PAGE = 12;

export function BlogListClient({ initialPosts, categories }: BlogListClientProps) {
  const { t } = useLanguage();
  const { language } = useLanguage();
  const [posts, setPosts] = useState(initialPosts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrar posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || 
      post.category?.slug === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Calcular paginación
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  // Posts destacados (solo en la primera página sin filtros)
  const showFeatured = currentPage === 1 && !searchTerm && !selectedCategory;
  const featuredPosts = showFeatured ? filteredPosts.filter(p => p.is_featured).slice(0, 3) : [];
  const regularPosts = showFeatured 
    ? currentPosts.filter(p => !featuredPosts.find(fp => fp.id === p.id))
    : currentPosts;

  // Resetear a página 1 cuando cambian los filtros
  const handleCategoryChange = (slug: string | null) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Contar posts por categoría
  const getCategoryCount = (categorySlug: string) => {
    return posts.filter(p => p.category?.slug === categorySlug).length;
  };

  // Filtrar categorías con artículos
  const categoriesWithPosts = categories.filter(cat => getCategoryCount(cat.slug) > 0);

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
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                selectedCategory === null
                  ? "bg-furgocasa-blue text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{t("Todos los artículos")}</span>
                <span className={`text-sm ${selectedCategory === null ? 'text-white/80' : 'text-gray-500'}`}>
                  {posts.length}
                </span>
              </div>
            </button>
            {categoriesWithPosts.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedCategory === category.slug
                    ? "bg-furgocasa-blue text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{getCategoryName(category.slug, language)}</span>
                  <span className={`text-sm ${selectedCategory === category.slug ? 'text-white/80' : 'text-gray-500'}`}>
                    {getCategoryCount(category.slug)}
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
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-furgocasa-blue focus:ring-2 focus:ring-furgocasa-blue/20 transition-all"
            />
          </div>

          {/* Categorías móvil */}
          <div className="flex lg:hidden flex-wrap gap-3">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                selectedCategory === null
                  ? "bg-furgocasa-blue text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {t("Todos")} ({posts.length})
            </button>
            {categoriesWithPosts.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                  selectedCategory === category.slug
                    ? "bg-furgocasa-blue text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {getCategoryName(category.slug, language)} ({getCategoryCount(category.slug)})
              </button>
            ))}
          </div>
        </div>

        {/* Posts destacados */}
        {featuredPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-8">
              {t("Artículos Destacados")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => {
                const categorySlug = post.category?.slug || 'general';
                const translatedCategorySlug = translateCategorySlug(categorySlug, language);
                return (
                  <LocalizedLink
                    key={post.id}
                    href={`/blog/${translatedCategorySlug}/${post.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-furgocasa-blue to-blue-600">
                          <BookOpen className="h-12 w-12 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {post.category && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-furgocasa-orange text-white px-2 py-1 rounded-full text-xs font-bold uppercase">
                            {getCategoryName(post.category.slug, language)}
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
                            {new Date(post.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                        {post.reading_time > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.reading_time} min
                          </span>
                        )}
                      </div>
                    </div>
                  </LocalizedLink>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista de posts */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {t("No se encontraron artículos")}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("Intenta ajustar los filtros de búsqueda")}
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(null);
                setCurrentPage(1);
              }}
              className="text-furgocasa-blue font-semibold hover:underline"
            >
              {t("Limpiar filtros")}
            </button>
          </div>
        ) : (
          <>
            {regularPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post) => {
                  const categorySlug = post.category?.slug || 'general';
                  const translatedCategorySlug = translateCategorySlug(categorySlug, language);
                  return (
                    <LocalizedLink
                      key={post.id}
                      href={`/blog/${translatedCategorySlug}/${post.slug}`}
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <div className="h-48 bg-gray-200 relative overflow-hidden">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                              {getCategoryName(post.category.slug, language)}
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
                    </LocalizedLink>
                  );
                })}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {/* Botón anterior */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-furgocasa-blue hover:bg-furgocasa-blue hover:text-white'
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
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
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
                    return <span key={pageNum} className="text-gray-400">...</span>;
                  }
                  return null;
                })}

                {/* Botón siguiente */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-furgocasa-blue hover:bg-furgocasa-blue hover:text-white'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Resultados */}
            <div className="mt-8 text-center text-gray-600">
              {t("Mostrando")} <strong>{startIndex + 1}</strong>-<strong>{Math.min(endIndex, filteredPosts.length)}</strong> {t("de")} <strong>{filteredPosts.length}</strong> {t("artículos")}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
