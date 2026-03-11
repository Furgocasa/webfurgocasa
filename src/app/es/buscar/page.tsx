import { Metadata } from "next";
import { BuscarClient } from "./buscar-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Único y optimizado para /buscar
const BUSCAR_METADATA: Metadata = {
  title: "Buscar Disponibilidad de Campers - Reserva Online | Furgocasa",
  description: "Busca y compara la disponibilidad de campers y autocaravanas para tus fechas de viaje. Reserva online tu camper ideal con Furgocasa.",
  keywords: "buscar camper disponible, disponibilidad autocaravana, reservar camper fechas, buscar alquiler camper",
  robots: {
    index: false, // Página de resultados de búsqueda, no indexar
    follow: true,
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'es'; // Locale fijo
  
  const alternates = buildCanonicalAlternates('/buscar', locale);

  return {
    ...BUSCAR_METADATA,
    alternates,
    openGraph: {
      title: BUSCAR_METADATA.title,
      description: "Busca y compara disponibilidad de campers. Reserva online tu camper ideal con Furgocasa.",
      url: alternates.canonical,
      type: "website",
      siteName: "Furgocasa",
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa - Alquiler de Campers" }],
    },
  };
}

export default async function LocaleBuscarPage({ params }: PageProps) {
  return <BuscarClient />;
}
