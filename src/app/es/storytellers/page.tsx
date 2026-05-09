import type { Metadata } from "next";
import { StorytellersLanding } from "@/components/storytellers/storytellers-landing";

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
    locale: "es_ES",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function StorytellersPage() {
  return <StorytellersLanding locale="es" />;
}
