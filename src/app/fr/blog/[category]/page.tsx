import { Metadata } from "next";
import { BlogCategoryClient } from "./blog-category-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

/**
 * 🎯 BLOG CATEGORÍAS MULTIIDIOMA - Nueva arquitectura [locale]
 * ======================================================
 * 
 * Páginas de categorías del blog con soporte multiidioma físico.
 * - /es/blog/rutas → Español
 * - /en/blog/routes → Inglés (via middleware)
 * - /fr/blog/itineraires → Francés (via middleware)
 * - /de/blog/routen → Alemán (via middleware)
 */

// Mapeo de categorías a nombres y descripciones (incluye slugs FR)
const categoryMeta: Record<string, { name: string; description: string }> = {
  itineraires: { name: "Itinéraires en Camping-Car", description: "Les meilleurs itinéraires en camping-car en Espagne et Europe. Découvrez des destinations incroyables et des expériences uniques." },
  conseils: { name: "Conseils pour Voyageurs Camping-Car", description: "Guides pratiques et conseils pour profiter au maximum de votre expérience camping-car." },
  destinations: { name: "Destinations Camping-Car", description: "Découvrez les meilleures destinations pour voyager en camping-car. Plages, montagnes et villages charmants." },
  equipement: { name: "Équipement et Accessoires", description: "Tout sur les accessoires et équipements pour votre camping-car. Avis et recommandations." },
  actualites: { name: "Actualités Camping-Car", description: "Restez informé des dernières nouveautés du monde du camping-car. Événements et tendances." },
  vehicules: { name: "Véhicules et Comparatifs", description: "Découvrez les meilleurs véhicules pour voyager en camping-car. Comparatifs et recommandations." },
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
  const locale: Locale = 'fr'; // Locale fijo para /fr/
  const t = (key: string) => translateServer(key, locale);
  
  const meta = categoryMeta[category] || {
    name: category.charAt(0).toUpperCase() + category.slice(1),
    description: `Articles sur ${category} dans le blog Furgocasa. Conseils, guides et expériences de voyage en camping-car.`,
  };

  // ✅ Canonical autorreferenciado a la URL exacta (evita canonical incorrecto)
  const alternates = buildCanonicalAlternates(`/blog/${category}`, locale, { useActualPath: true });

  const ogLocales: Record<Locale, string> = {
    es: "es_ES",
    en: "en_US",
    fr: "fr_FR",
    de: "de_DE",
  };

  const shortTitle = `${meta.name} | Blog Furgocasa`;
  return {
    title: shortTitle,
    description: meta.description,
    keywords: `blog camping-car ${category}, articles ${category}, voyages camping-car, furgocasa blog`,
    openGraph: {
      images: [{ url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp", width: 1200, height: 630, alt: "Furgocasa" }],
      title: shortTitle,
      description: meta.description,
      type: "website",
      url: alternates.canonical,
      siteName: "Furgocasa",
      locale: ogLocales[locale] || "fr_FR",
    },
    twitter: {
      card: "summary",
      title: shortTitle,
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

export default function LocaleBlogCategoryPage() {
  return <BlogCategoryClient />;
}
