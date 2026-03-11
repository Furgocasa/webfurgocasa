import { Metadata } from "next";
import { AutocaravanasClient } from "./autocaravanas-client";
import { generateMultilingualMetadata } from "@/lib/seo/multilingual-metadata";
import { getMotorhomeServices, getMotorhomeServiceStats, getMotorhomeServiceProvinces } from "@/lib/supabase/queries";
import type { Locale } from "@/lib/i18n/config";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = 'es';

  return generateMultilingualMetadata('/autocaravanas', locale, {
    es: {
      title: "Autocaravanas: Guía Completa 2026 | Tipos, Permisos, Normativa y Directorio",
      description: "Todo sobre autocaravanas en España: tipos, permisos, normativa DGT, peso y seguro. Directorio con +900 talleres y concesionarios.",
      keywords: "autocaravanas, tipos de autocaravanas, permiso autocaravana, normativa autocaravanas España, talleres autocaravanas, concesionarios autocaravanas, autocaravana perfilada, autocaravana integral, autocaravana capuchina, alquiler autocaravanas, comprar autocaravana",
    },
    en: {
      title: "Motorhomes: Complete Guide 2026 | Types, Licences, Regulations & Directory",
      description: "Everything about motorhomes in Spain: types, driving licences, regulations, weight, insurance, maintenance. Directory with 900+ workshops and dealers.",
      keywords: "motorhomes, motorhome types, motorhome licence, motorhome regulations Spain, motorhome workshops, motorhome dealers",
    },
    fr: {
      title: "Camping-Cars: Guide Complet 2026 | Types, Permis, Réglementation et Annuaire",
      description: "Tout sur les camping-cars en Espagne : types, permis de conduire, réglementation, poids, assurance, entretien. Annuaire avec +900 ateliers et concessionnaires.",
      keywords: "camping-cars, types camping-car, permis camping-car, réglementation camping-car Espagne",
    },
    de: {
      title: "Wohnmobile: Kompletter Leitfaden 2026 | Typen, Führerschein, Vorschriften & Verzeichnis",
      description: "Alles über Wohnmobile in Spanien: Typen, Führerschein, Vorschriften, Gewicht, Versicherung, Wartung. Verzeichnis mit über 900 Werkstätten und Händlern.",
      keywords: "Wohnmobile, Wohnmobiltypen, Führerschein Wohnmobil, Wohnmobil Vorschriften Spanien",
    },
  }, {
    images: ['https://www.furgocasa.com/images/slides/hero-11.webp'],
  });
}

export default async function AutocaravanasPage() {
  let servicesResult = { data: null as unknown[], error: null, count: 0 };
  let stats = { talleres: 0, concesionarios: 0, total: 0, provinces: 0 };
  let provinces: { province: string; region: string; count: number }[] = [];

  try {
    const [servicesRes, statsRes, provincesRes] = await Promise.all([
      getMotorhomeServices({ limit: 1000 }),
      getMotorhomeServiceStats(),
      getMotorhomeServiceProvinces(),
    ]);
    servicesResult = servicesRes;
    stats = statsRes;
    provinces = provincesRes;
  } catch (err) {
    console.error('[autocaravanas] Error loading data:', err);
  }

  return (
    <AutocaravanasClient
      initialServices={servicesResult.data || []}
      initialCount={servicesResult.count}
      stats={stats}
      provinces={provinces}
    />
  );
}
