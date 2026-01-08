"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BlogListClient } from "@/components/blog/blog-list-client";
import { BookOpen } from "lucide-react";

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

// ✅ CLIENT COMPONENT
export default function BlogPage() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Cargar posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            slug,
            excerpt,
            featured_image,
            published_at,
            reading_time,
            views,
            is_featured,
            category:content_categories(id, name, slug)
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (postsError) {
          console.error('Error loading posts:', postsError);
        } else {
          // Transformar category de array a objeto único
          const transformedPosts = postsData?.map(post => ({
            ...post,
            category: Array.isArray(post.category) ? post.category[0] : post.category
          })) || [];
          setPosts(transformedPosts);
        }

        // Cargar categorías
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('content_categories')
          .select('id, name, slug, description')
          .order('name');

        if (categoriesError) {
          console.error('Error loading categories:', categoriesError);
        } else if (categoriesData) {
          // Contar posts por categoría
          const categoriesWithCount = await Promise.all(
            categoriesData.map(async (category) => {
              const { count } = await supabase
                .from('posts')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'published')
                .eq('category_id', category.id);
              
              return {
                ...category,
                post_count: count || 0,
              };
            })
          );
          setCategories(categoriesWithCount);
        }
      } catch (error) {
        console.error('Error loading blog data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-blue mb-4"></div>
            <p className="text-gray-600">{t("Cargando...")}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <BookOpen className="h-12 w-12 text-white" />
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-white">
                {t("Blog de Viajes en Camper")}
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
              {t("Consejos, rutas y experiencias para inspirar tu próxima aventura en autocaravana")}
            </p>
          </div>
        </section>

        {/* Lista de posts con filtros (Client Component) */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <BlogListClient initialPosts={posts} categories={categories} />
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-gradient-to-r from-furgocasa-blue to-furgocasa-blue-dark">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
              {t("¿Quieres más consejos sobre viajes en camper?")}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t("Síguenos en nuestras redes sociales y no te pierdas ningún artículo")}
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="https://www.facebook.com/furgocasa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-heading font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg"
              >
                {t("Síguenos en Facebook")}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
