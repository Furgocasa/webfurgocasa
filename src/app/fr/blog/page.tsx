import { Suspense } from "react";
import { Metadata } from "next";
import { BlogContent } from "@/components/blog/blog-content";
import { BlogSkeleton } from "@/components/blog/blog-skeleton";
import { BookOpen } from "lucide-react";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

/**
 * 🎯 BLOG MULTIIDIOMA - Nueva arquitectura [locale]
 * ======================================================
 * 
 * Listado principal del blog con soporte multiidioma físico.
 * - /es/blog → Español
 * - /en/blog → Inglés
 * - /fr/blog → Francés
 * - /de/blog → Alemán
 * 
 * Los artículos ya tienen traducciones en Supabase (content_translations)
 */

interface BlogPageProps {
  ;
  searchParams: { page?: string; category?: string; q?: string };
}

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = 'fr'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);
  const alternates = buildCanonicalAlternates('/blog', locale);

  const ogLocales: Record<Locale, string> = {
    es: "es_ES",
    en: "en_US",
    fr: "fr_FR",
    de: "de_DE",
  };

  return {
    title: t("Blog de Viajes en Camper"),
    description: t("Descubre los mejores consejos para viajar en camper, rutas espectaculares por España, destinos imprescindibles y guías completas para tu próxima aventura en autocaravana. Blog actualizado semanalmente."),
    keywords: "blog camper, viajes autocaravana, rutas camper españa, consejos autocaravana, destinos camper, alquiler campers murcia, camping autocaravana, vida en camper",
    authors: [{ name: "Furgocasa" }],
    openGraph: {
      title: t("Blog de Viajes en Camper"),
      description: t("Consejos, rutas y experiencias para inspirar tu próxima aventura en autocaravana. Descubre los mejores destinos de España."),
      type: "website",
      siteName: "Furgocasa",
      url: alternates.canonical,
      locale: ogLocales[locale] || "es_ES",
      images: [
        {
          url: "https://www.furgocasa.com/og-blog.jpg",
          width: 1200,
          height: 630,
          alt: `${t("Blog de Viajes en Camper")} - Furgocasa`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("Blog de Viajes en Camper"),
      description: t("Consejos, rutas y experiencias para inspirar tu próxima aventura en autocaravana"),
      images: ["https://www.furgocasa.com/og-blog.jpg"],
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

// ⚡ ISR: Revalidar cada día (contenido muy estático)
export const revalidate = 86400;

export default async function LocaleBlogPage({
  params,
  searchParams,
}: BlogPageProps) {
  const locale: Locale = 'fr'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6">
              <BookOpen className="h-8 w-8 md:h-12 md:w-12 text-white" />
              <h1 className="text-2xl md:text-4xl lg:text-6xl font-heading font-bold text-white">
                {t("Blog de Viajes en Camper")}
              </h1>
            </div>
            <p className="text-base md:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed px-2">
              {t("Consejos, rutas y experiencias para inspirar tu próxima aventura en autocaravana")}
            </p>
          </div>
        </section>

        {/* Lista de posts con filtros */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Suspense fallback={<BlogSkeleton />}>
              <BlogContent searchParams={searchParams} />
            </Suspense>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-furgocasa-blue to-furgocasa-blue-dark">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-xl md:text-3xl lg:text-4xl font-heading font-bold text-white mb-4 md:mb-6 px-2">
              {t("¿Quieres más consejos sobre viajes en camper?")}
            </h2>
            <p className="text-sm md:text-xl text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto px-2">
              {t("Síguenos en nuestras redes sociales y no te pierdas ningún artículo")}
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="https://www.facebook.com/furgocasa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-heading font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg text-sm md:text-base"
              >
                {t("Síguenos en Facebook")}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
