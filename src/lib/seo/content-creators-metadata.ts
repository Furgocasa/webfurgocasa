import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import {
  buildCanonicalAlternates,
  buildOpenGraphMetadata,
  OG_DEFAULT_IMAGE,
} from "@/lib/seo/multilingual-metadata";

const PACK: Record<Locale, { title: string; description: string; keywords: string }> = {
  es: {
    title: "Creadores de contenido para campers de gran volumen | Colabora con FURGOCASA",
    description:
      "FURGOCASA busca creadores de contenido para colaboraciones pactadas con campers de gran volumen: propuesta previa, entregables claros y cesión de derechos. No es un programa de clientes.",
    keywords:
      "creadores contenido camper, colaborar marca camper, contenido viajes camper, colaboración camper gran volumen, creadores furgoneta camper, viajes en camper España, Fiat Ducato camperizada",
  },
  en: {
    title: "Content creator collaborations for large-volume campervans | FURGOCASA",
    description:
      "FURGOCASA partners with content creators on agreed productions for our large-volume campervans in Spain: prior proposal, clear deliverables and usage rights. Not a customer program.",
    keywords:
      "campervan content creator, motorhome brand collaboration, travel content Spain, large volume campervan rental, camper content collaboration",
  },
  fr: {
    title: "Créateurs de contenu pour campers grand volume | Collaboration FURGOCASA",
    description:
      "FURGOCASA collabore avec des créateurs de contenu sur des productions concertées autour de nos campers grand volume en Espagne : proposition préalable, livrables clairs et droits d'usage.",
    keywords:
      "créateur contenu camper, collaboration marque van, contenu voyage Espagne, location camper grand volume",
  },
  de: {
    title: "Content-Creator Kooperation für großvolumige Camper | FURGOCASA",
    description:
      "FURGOCASA arbeitet mit Content-Creator an abgestimmten Produktionen rund um unsere großvolumigen Camper in Spanien: Vorabkonzept, klare Lieferungen und Nutzungsrechte.",
    keywords:
      "Content Creator Camper, Markenkooperation Camper, Reiseinhalte Spanien, Großvolumen-Camper Vermietung",
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
