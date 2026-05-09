import type { Metadata } from "next";
import { StorytellersLanding } from "@/components/storytellers/storytellers-landing";
import { STORYTELLERS_OG_IMAGE_URL } from "@/lib/storytellers/config";

export const metadata: Metadata = {
  title: "Furgocasa Storytellers Programm | Fotos hochladen und bis zu 15 % Rabatt erhalten",
  description:
    "Lade deine Fotos und Videos vom Camper-Roadtrip zu Furgocasa hoch und sichere dir bis zu 15 % Rabatt auf zukünftige Buchungen. Ohne Login, ohne lange Formulare.",
  keywords:
    "storytellers furgocasa, camper reisefotos, wohnmobil mieten rabatt, furgocasa treueprogramm, camper fotos hochladen",
  alternates: {
    canonical: "https://www.furgocasa.com/de/storytellers",
    languages: {
      es: "https://www.furgocasa.com/es/storytellers",
      en: "https://www.furgocasa.com/en/storytellers",
      fr: "https://www.furgocasa.com/fr/storytellers",
      de: "https://www.furgocasa.com/de/storytellers",
      "x-default": "https://www.furgocasa.com/es/storytellers",
    },
  },
  openGraph: {
    title: "Furgocasa Storytellers Programm",
    description: "Lade deine Reisefotos und -videos hoch und erhalte bis zu 15 % Rabatt.",
    url: "https://www.furgocasa.com/de/storytellers",
    siteName: "Furgocasa",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: STORYTELLERS_OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Camper-Reise mit Furgocasa — Storytellers-Programm",
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
  return <StorytellersLanding locale="de" />;
}
