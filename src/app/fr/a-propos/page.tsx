import { Metadata } from "next";
import { Users, Heart, Star } from "lucide-react";
import { AboutPageJsonLd } from "@/components/static-pages/jsonld";
import { translateServer } from "@/lib/i18n/server-translation";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { COMPANY } from "@/lib/company";
import type { Locale } from "@/lib/i18n/config";

/**
 * 🎯 QUIÉNES SOMOS MULTIIDIOMA - Nueva arquitectura [locale]
 * ======================================================
 * 
 * Página institucional con soporte multiidioma físico.
 * - /es/quienes-somos → Español
 * - /en/about-us → Inglés
 * - /fr/a-propos → Francés
 * - /de/uber-uns → Alemán
 */

interface AboutPageProps {
}

// 🎯 Metadata SEO optimizada
export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = 'fr'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);
  const alternates = buildCanonicalAlternates('/quienes-somos', locale);

  const ogLocales: Record<Locale, string> = {
    es: "es_ES",
    en: "en_US",
    fr: "fr_FR",
    de: "de_DE",
  };

  return {
    title: "À propos - Découvrez Furgocasa",
    description: "Furgocasa est une entreprise familiale de location de camping-cars à Murcie depuis 2012, avec plus de 500 voyages réalisés.",
    keywords: "à propos furgocasa, entreprise location camping-car murcie, histoire furgocasa, famille furgocasa, camping-cars murcie",
    authors: [{ name: "Furgocasa" }],
    openGraph: {
      images: [{ url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp", width: 1200, height: 630, alt: "Furgocasa" }],
      title: "À propos - Découvrez Furgocasa",
      description: "Découvrez Furgocasa, entreprise familiale spécialisée dans la location de camping-cars à Murcie depuis 2012.",
      type: "website",
      url: alternates.canonical,
      siteName: "Furgocasa",
      locale: ogLocales[locale] || "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: "À propos - Découvrez Furgocasa",
      description: "Entreprise familiale de location de camping-cars à Murcie depuis 2012.",
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

// ✅ Server Component
export default async function LocaleQuienesSomosPage() {
  const locale: Locale = 'fr'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);

  return (
    <>
      <AboutPageJsonLd locale={locale} />
      <main className="min-h-screen bg-gray-50 font-amiko">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              À propos de Furgocasa
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
              Entreprise familiale, flotte premium et accompagnement réel
            </p>
          </div>
        </section>

        {/* Bloque respuesta breve */}
        <section className="py-8 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                <strong>Qui sommes-nous ?</strong> Furgocasa est une entreprise familiale de location de camping-cars à Murcie depuis {COMPANY.foundingDate}. Plus de 500 voyages réalisés. Flotte premium avec kilométrage illimité en Espagne, tarifs dès {COMPANY.rentalPolicy.dailyRateFrom.lowSeason}€/jour et départ à {COMPANY.rentalPolicy.pickupLocationsLabel}. Téléphone : {COMPANY.phoneDisplay}.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg text-gray-600 leading-relaxed mx-auto text-center mb-16">
                <p className="text-2xl font-medium text-gray-800 mb-8">
                  {t("Somos una empresa familiar nacida de la pasión por el mundo camper y las ganas de compartir esa libertad con los demás.")}
                </p>
                <p className="text-lg mb-6">
                  {t("En Furgocasa, no solo alquilamos vehículos; ofrecemos experiencias. Entendemos que cada viaje es único y personal, por eso cuidamos cada detalle para que tu única preocupación sea disfrutar del camino.")}
                </p>
                <p className="text-lg">
                  {t("Nuestra flota está compuesta por vehículos modernos, seguros y equipados con todo lo necesario para que te sientas como en casa, estés donde estés.")}
                </p>
              </div>

              {/* Values */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-50 rounded-3xl p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-furgocasa-blue">
                    <Heart className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">{t("Pasión")}</h2>
                  <p className="text-sm text-gray-600">{t("Amamos lo que hacemos y eso se nota en el cuidado de nuestros vehículos y el trato al cliente.")}</p>
                </div>
                
                <div className="bg-gray-50 rounded-3xl p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-furgocasa-orange">
                    <Star className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">{t("Calidad")}</h2>
                  <p className="text-sm text-gray-600">{t("Solo trabajamos con las mejores marcas y mantenemos nuestra flota en perfecto estado.")}</p>
                </div>

                <div className="bg-gray-50 rounded-3xl p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <Users className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-gray-900 mb-3">{t("Cercanía")}</h2>
                  <p className="text-sm text-gray-600">{t("Te acompañamos antes, durante y después de tu viaje. Somos tu copiloto de confianza.")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 md:py-24 bg-furgocasa-blue text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                {t("Furgocasa en cifras")}
              </h2>
              <p className="text-blue-100 text-lg">
                {t("Más de una década compartiendo la pasión por viajar")}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                <p className="text-3xl md:text-5xl font-heading font-bold mb-1 md:mb-2">12+</p>
                <p className="text-blue-200 uppercase tracking-wider md:tracking-widest text-xs md:text-sm">{t("Años de experiencia")}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                <p className="text-3xl md:text-5xl font-heading font-bold mb-1 md:mb-2">500+</p>
                <p className="text-blue-200 uppercase tracking-wider md:tracking-widest text-xs md:text-sm">{t("Viajes realizados")}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                <p className="text-3xl md:text-5xl font-heading font-bold mb-1 md:mb-2">8</p>
                <p className="text-blue-200 uppercase tracking-wider md:tracking-widest text-xs md:text-sm">{t("Vehículos Premium")}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                <p className="text-3xl md:text-5xl font-heading font-bold mb-1 md:mb-2">4.9</p>
                <p className="text-blue-200 uppercase tracking-wider md:tracking-widest text-xs md:text-sm">{t("Valoración Media")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
