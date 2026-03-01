import { Metadata } from "next";
import { AutocaravanasClient } from "../../es/autocaravanas/autocaravanas-client";
import { generateMultilingualMetadata } from "@/lib/seo/multilingual-metadata";
import { getMotorhomeServices, getMotorhomeServiceStats, getMotorhomeServiceProvinces } from "@/lib/supabase/queries";
import type { Locale } from "@/lib/i18n/config";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = 'en';

  return generateMultilingualMetadata('/autocaravanas', locale, {
    es: {
      title: "Autocaravanas: Guía Completa 2026 | Tipos, Permisos, Normativa y Directorio",
      description: "Todo sobre autocaravanas en España: tipos, permisos, normativa, peso, seguro, mantenimiento. Directorio con +900 talleres y concesionarios.",
      keywords: "autocaravanas, tipos de autocaravanas, permiso autocaravana, normativa autocaravanas España",
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
  });
}

export default async function MotorhomesPage() {
  const [servicesResult, stats, provinces] = await Promise.all([
    getMotorhomeServices({ limit: 50, minQuality: 3 }),
    getMotorhomeServiceStats(),
    getMotorhomeServiceProvinces(),
  ]);

  return (
    <AutocaravanasClient
      initialServices={servicesResult.data || []}
      initialCount={servicesResult.count}
      stats={stats}
      provinces={provinces}
    />
  );
}
