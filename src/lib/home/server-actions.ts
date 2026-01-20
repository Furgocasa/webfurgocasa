import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';

export interface FeaturedVehicle {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  passengers: number;
  beds: number;
  main_image: string | null;
  images: string[];
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

// ⚡ Obtener vehículos destacados
export const getFeaturedVehicles = cache(async (): Promise<FeaturedVehicle[]> => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select(`
      id,
      name,
      slug,
      brand,
      model,
      passengers,
      beds,
      vehicle_images(image_url, is_primary, sort_order)
    `)
    .eq('is_for_rent', true)
    .neq('status', 'inactive')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching featured vehicles:', error);
    return [];
  }

  if (!vehicles) return [];

  return vehicles.map(vehicle => {
    // Ordenar imágenes: primero la principal, luego por sort_order
    const sortedImages = (vehicle.vehicle_images as any[] || [])
      .sort((a: any, b: any) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return (a.sort_order || 0) - (b.sort_order || 0);
      })
      .map((img: any) => img.image_url)
      .slice(0, 3); // Máximo 3 imágenes por vehículo

    return {
      id: vehicle.id,
      name: vehicle.name,
      slug: vehicle.slug,
      brand: vehicle.brand,
      model: vehicle.model,
      passengers: vehicle.passengers,
      beds: vehicle.beds,
      main_image: sortedImages[0] || null,
      images: sortedImages
    };
  });
});

// ⚡ Obtener últimos artículos del blog
export const getLatestBlogArticles = cache(async (limit: number = 3): Promise<BlogArticle[]> => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: articles } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      category:content_categories(id, name, slug)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (!articles) return [];

  return articles.map(article => ({
    ...article,
    category: Array.isArray(article.category) ? article.category[0] : article.category
  }));
});

// ⚡ Obtener estadísticas de la empresa
export interface CompanyStats {
  totalBookings: number;
  totalVehicles: number;
  averageRating: number;
  yearsExperience: number;
}

export const getCompanyStats = cache(async (): Promise<CompanyStats> => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Contar reservas completadas
  const { count: bookingsCount } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .in('status', ['confirmed', 'completed']);

  // Contar vehículos activos
  const { count: vehiclesCount } = await supabase
    .from('vehicles')
    .select('id', { count: 'exact', head: true })
    .eq('is_for_rent', true)
    .neq('status', 'inactive');

  return {
    totalBookings: bookingsCount || 500, // Valor por defecto si no hay datos
    totalVehicles: vehiclesCount || 8,
    averageRating: 4.9,
    yearsExperience: new Date().getFullYear() - 2012
  };
});
