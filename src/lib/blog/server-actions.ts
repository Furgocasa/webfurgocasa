import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface TagItem {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  slug_en: string | null;
  slug_fr: string | null;
  slug_de: string | null;
  excerpt: string | null;
  excerpt_en: string | null;
  content: string;
  content_en: string | null;
  featured_image: string | null;
  published_at: string | null;
  updated_at: string | null;
  reading_time: number;
  views: number;
  meta_title: string | null;
  meta_description: string | null;
  category_id: string | null;
  category: Category | null;
  tags?: TagItem[];
}

export interface RelatedPost {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  slug_en: string | null;
  slug_fr: string | null;
  slug_de: string | null;
  featured_image: string | null;
  published_at: string | null;
  reading_time: number;
  category: Category | null;
}

// ⚡ Cache para optimización
// Ahora busca por slug original, slug_en, o slug traducido en content_translations
export const getPostBySlug = cache(async (slug: string, categorySlug?: string, locale?: string): Promise<Post | null> => {
  const supabase = await createClient();

  // Query base para seleccionar el post
  const postQuery = `
    id,
    title,
    title_en,
    slug,
    slug_en,
    slug_fr,
    slug_de,
    excerpt,
    excerpt_en,
    content,
    content_en,
    featured_image,
    published_at,
    updated_at,
    reading_time,
    views,
    meta_title,
    meta_description,
    category_id,
    category:content_categories(id, name, slug, description)
  `;

  // 1. Primero intentar buscar por slug original (español)
  let { data: postData, error } = await supabase
    .from("posts")
    .select(postQuery)
    .eq("status", "published")
    .eq("slug", slug)
    .single();

  // 2. Si no encuentra, buscar por slug traducido según el locale
  if ((error || !postData) && locale) {
    const slugField = locale === 'en' ? 'slug_en' : locale === 'fr' ? 'slug_fr' : locale === 'de' ? 'slug_de' : null;
    
    if (slugField) {
      const { data: postByTranslatedSlug, error: errorTranslated } = await supabase
        .from("posts")
        .select(postQuery)
        .eq("status", "published")
        .eq(slugField, slug)
        .single();
      
      if (!errorTranslated && postByTranslatedSlug) {
        postData = postByTranslatedSlug;
        error = null;
      }
    }
    
    // Fallback: buscar en content_translations si no hay slug_xx en la tabla
    if ((error || !postData) && ['fr', 'de'].includes(locale)) {
      const { data: translationData } = await supabase
        .from("content_translations")
        .select("source_id")
        .eq("source_table", "posts")
        .eq("source_field", "slug")
        .eq("locale", locale)
        .eq("translated_text", slug)
        .single();

      if (translationData?.source_id) {
        const { data: postByTranslatedSlug, error: errorTranslated } = await supabase
          .from("posts")
          .select(postQuery)
          .eq("status", "published")
          .eq("id", translationData.source_id)
          .single();

        if (!errorTranslated && postByTranslatedSlug) {
          postData = postByTranslatedSlug;
          error = null;
        }
      }
    }
  }

  // 3. Si aún no encuentra y NO pasaron locale, intentar buscar en todos los slugs traducidos
  if ((error || !postData) && !locale) {
    // Buscar en slug_en, slug_fr, slug_de
    for (const slugField of ['slug_en', 'slug_fr', 'slug_de']) {
      const { data: postByTranslatedSlug } = await supabase
        .from("posts")
        .select(postQuery)
        .eq("status", "published")
        .eq(slugField, slug)
        .single();

      if (postByTranslatedSlug) {
        postData = postByTranslatedSlug;
        error = null;
        break;
      }
    }
  }

  if (error || !postData) {
    return null;
  }

  // Transformar category de array a objeto único
  const post = {
    ...postData,
    category: Array.isArray(postData.category) ? postData.category[0] : postData.category
  };

  // Cargar tags del post
  const { data: postTags } = await supabase
    .from("post_tags")
    .select("tag:tags(id, name, slug)")
    .eq("post_id", postData.id);

  if (postTags) {
    post.tags = postTags.map((pt: any) => pt.tag).filter(Boolean);
  }

  return post;
});

export const getRelatedPosts = cache(async (categoryId: string, currentPostId: string): Promise<RelatedPost[]> => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("posts")
    .select(`
      id, 
      title, 
      title_en, 
      slug, 
      slug_en,
      slug_fr,
      slug_de, 
      featured_image, 
      published_at, 
      reading_time,
      category:content_categories(id, name, slug, description)
    `)
    .eq("category_id", categoryId)
    .eq("status", "published")
    .neq("id", currentPostId)
    .order("published_at", { ascending: false })
    .limit(3);

  return (data || []).map(post => ({
    ...post,
    category: Array.isArray(post.category) ? post.category[0] : post.category
  }));
});

export const incrementPostViews = async (postId: string, currentViews: number) => {
  const supabase = await createClient();
  
  await supabase
    .from("posts")
    .update({ views: currentViews + 1 })
    .eq("id", postId);
};

// Para generateStaticParams - Sin autenticación para build time
export const getAllPublishedPostSlugs = cache(async (): Promise<{ category: string; slug: string }[]> => {
  // En build time, usar el cliente público sin cookies
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("posts")
    .select(`
      slug,
      category:content_categories(slug)
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (!data) return [];

  return data.map(post => ({
    category: Array.isArray(post.category) ? post.category[0]?.slug : post.category?.slug || 'general',
    slug: post.slug
  })).filter(item => item.category && item.slug);
});
