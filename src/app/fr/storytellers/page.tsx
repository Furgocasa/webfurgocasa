import type { Metadata } from "next";
import { StorytellersLanding } from "@/components/storytellers/storytellers-landing";
import { STORYTELLERS_OG_IMAGE_URL } from "@/lib/storytellers/config";

export const metadata: Metadata = {
  title: "Programme Storytellers Furgocasa | Envoyez vos photos et gagnez jusqu'à 15 % de remise",
  description:
    "Envoyez vos photos et vidéos de voyage en camper Furgocasa et obtenez jusqu'à 15 % de remise sur vos futures réservations. Sans inscription, sans formulaires longs.",
  keywords:
    "storytellers furgocasa, photos voyage camper, remise location camper, programme fidélité furgocasa, envoyer photos camper",
  alternates: {
    canonical: "https://www.furgocasa.com/fr/storytellers",
    languages: {
      es: "https://www.furgocasa.com/es/storytellers",
      en: "https://www.furgocasa.com/en/storytellers",
      fr: "https://www.furgocasa.com/fr/storytellers",
      de: "https://www.furgocasa.com/de/storytellers",
      "x-default": "https://www.furgocasa.com/es/storytellers",
    },
  },
  openGraph: {
    title: "Programme Storytellers Furgocasa",
    description: "Envoyez vos photos et vidéos de voyage et obtenez jusqu'à 15 % de remise.",
    url: "https://www.furgocasa.com/fr/storytellers",
    siteName: "Furgocasa",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: STORYTELLERS_OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Voyage en camper Furgocasa — programme Storytellers",
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
  return <StorytellersLanding locale="fr" />;
}
