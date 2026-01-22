import { Metadata } from "next";
import { headers } from "next/headers";
import { BlogCategoryClient } from "./blog-category-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

// Mapeo de categorías a nombres y descripciones
const categoryMeta: Record<string, { name: string; description: string }> = {
  rutas: {
    name: "Rutas en Camper",
    description: "Las mejores rutas en camper por España y Europa. Descubre destinos increíbles, consejos de viaje y experiencias únicas para tu próxima aventura.",
  },
  noticias: {
    name: "Noticias Camper",
    description: "Mantente al día con las últimas novedades del mundo camper. Eventos, ferias, actualidad del sector y tendencias del caravaning.",
  },
  vehiculos: {
    name: "Vehículos y Comparativas",
    description: "Conoce los mejores vehículos para viajar en camper. Comparativas, análisis detallados y recomendaciones de expertos.",
  },
  consejos: {
    name: "Consejos para Viajeros",
    description: "Guías prácticas y consejos útiles para sacar el máximo partido a tu experiencia camper. Tips de expertos viajeros.",
  },
  destinos: {
    name: "Destinos Camper",
    description: "Descubre los mejores destinos para viajar en camper. Playas, montañas, pueblos con encanto y lugares únicos.",
  },
  equipamiento: {
    name: "Equipamiento y Accesorios",
    description: "Todo sobre accesorios, equipamiento y gadgets para tu camper. Reviews, comparativas y recomendaciones.",
  },
};

type Props = {
  params: Promise<{ category: string }>;
};

// 🎯 SEO Metadata dinámico para /blog/[category]
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const headersList = await headers();
  const locale = (headersList.get('x-detected-locale') || 'es') as Locale;
  const meta = categoryMeta[category] || {
    name: category.charAt(0).toUpperCase() + category.slice(1),
    description: `Artículos sobre ${category} en el blog de Furgocasa. Consejos, guías y experiencias de viaje en camper.`,
  };

  // ✅ Canonical autorreferenciado: ruta sin prefijo de idioma (el helper lo añade)
  const alternates = buildCanonicalAlternates(`/blog/${category}`, locale);

  const ogLocales: Record<Locale, string> = {
    es: "es_ES",
    en: "en_US",
    fr: "fr_FR",
    de: "de_DE",
  };

  return {
    title: `${meta.name} - Blog Camper`,
    description: meta.description,
    keywords: `blog camper ${category}, artículos ${category}, viajes camper, furgocasa blog`,
    openGraph: {
      title: `${meta.name} - Blog Camper`,
      description: meta.description,
      type: "website",
      url: alternates.canonical,
      siteName: "Furgocasa",
      locale: ogLocales[locale] || "es_ES",
    },
    twitter: {
      card: "summary",
      title: `${meta.name} - Blog Camper`,
      description: meta.description,
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

export default function BlogCategoryPage() {
  return <BlogCategoryClient />;
}
