import type { Metadata } from "next";
import { StorytellersLanding } from "@/components/storytellers/storytellers-landing";
import { STORYTELLERS_OG_IMAGE_URL } from "@/lib/storytellers/config";

export const metadata: Metadata = {
  title: "Programa Storytellers Furgocasa | Sube fotos y gana hasta 15% descuento",
  description:
    "Sube tus fotos y vídeos del viaje en camper Furgocasa y gana hasta un 15% de descuento en próximas reservas. Sin login, sin formularios largos.",
  keywords:
    "storytellers furgocasa, fotos camper viaje, descuento alquiler camper, programa fidelización furgocasa, sube fotos camper",
  alternates: {
    canonical: "https://www.furgocasa.com/es/storytellers",
    languages: {
      es: "https://www.furgocasa.com/es/storytellers",
      en: "https://www.furgocasa.com/en/storytellers",
      fr: "https://www.furgocasa.com/fr/storytellers",
      de: "https://www.furgocasa.com/de/storytellers",
      "x-default": "https://www.furgocasa.com/es/storytellers",
    },
  },
  openGraph: {
    title: "Programa Storytellers Furgocasa",
    description: "Sube tus fotos y vídeos del viaje y gana hasta un 15% de descuento.",
    url: "https://www.furgocasa.com/es/storytellers",
    siteName: "Furgocasa",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: STORYTELLERS_OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Cliente en una camper Furgocasa compartiendo fotos del viaje — programa Storytellers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [STORYTELLERS_OG_IMAGE_URL],
  },
  robots: { index: true, follow: true },
};

export default function StorytellersPage() {
  return <StorytellersLanding locale="es" />;
}
