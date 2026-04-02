import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import {
  buildCanonicalAlternates,
  buildOpenGraphMetadata,
  OG_DEFAULT_IMAGE,
} from "@/lib/seo/multilingual-metadata";

const PACK: Record<Locale, { title: string; description: string; keywords: string }> = {
  es: {
    title: "Creadores de contenido para viajar en camper | Colabora con FURGOCASA",
    description:
      "En FURGOCASA buscamos creadores de contenido y perfiles UGC para colaboraciones profesionales con nuestras campers. Envía tu propuesta y tu portfolio.",
    keywords:
      "creadores contenido camper, colaborar marca camper, content creators viajes, colaboración camper, creadores UGC viajes, colaboración autocaravanas, influencers camper España",
  },
  en: {
    title: "Camper content creator collaborations | FURGOCASA",
    description:
      "FURGOCASA works with professional travel content creators and UGC talent for campervan and motorhome productions in Spain. Submit your portfolio and proposal.",
    keywords:
      "camper content creator, motorhome brand collaboration, travel UGC Spain, campervan rental content",
  },
  fr: {
    title: "Créateurs de contenu camping-car | Collaboration FURGOCASA",
    description:
      "FURGOCASA recherche des créateurs de contenu et profils UGC pour des collaborations autour de nos camping-cars en Espagne. Envoyez votre proposition.",
    keywords:
      "créateur contenu camping-car, collaboration marque van, UGC voyage Espagne",
  },
  de: {
    title: "Content-Creator Kooperation Wohnmobil | FURGOCASA",
    description:
      "FURGOCASA sucht Content Creator und UGC-Talente für Kooperationen mit Campern und Wohnmobilen in Spanien. Reichen Sie Portfolio und Konzept ein.",
    keywords:
      "Content Creator Wohnmobil, Markenkooperation Camper, UGC Reisen Spanien",
  },
};

export function buildContentCreatorsMetadata(locale: Locale): Metadata {
  const alternates = buildCanonicalAlternates("/creadores-de-contenido", locale);
  const m = PACK[locale];
  const ogLocales: Record<Locale, string> = {
    es: "es_ES",
    en: "en_US",
    fr: "fr_FR",
    de: "de_DE",
  };

  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    authors: [{ name: "Furgocasa" }],
    alternates,
    openGraph: {
      ...buildOpenGraphMetadata(alternates, { title: m.title, description: m.description }),
      locale: ogLocales[locale],
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
      images: [OG_DEFAULT_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
