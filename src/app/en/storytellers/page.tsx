import type { Metadata } from "next";
import { StorytellersLanding } from "@/components/storytellers/storytellers-landing";
import { STORYTELLERS_OG_IMAGE_URL } from "@/lib/storytellers/config";

export const metadata: Metadata = {
  title: "Furgocasa Storytellers Program | Upload photos and earn up to 15% off",
  description:
    "Upload your camper trip photos and videos to Furgocasa and earn up to 15% off future bookings. No login, no long forms.",
  keywords:
    "storytellers furgocasa, camper trip photos, motorhome rental discount, furgocasa loyalty program, upload camper photos",
  alternates: {
    canonical: "https://www.furgocasa.com/en/storytellers",
    languages: {
      es: "https://www.furgocasa.com/es/storytellers",
      en: "https://www.furgocasa.com/en/storytellers",
      fr: "https://www.furgocasa.com/fr/storytellers",
      de: "https://www.furgocasa.com/de/storytellers",
      "x-default": "https://www.furgocasa.com/es/storytellers",
    },
  },
  openGraph: {
    title: "Furgocasa Storytellers Program",
    description: "Upload your trip photos and videos and earn up to 15% off.",
    url: "https://www.furgocasa.com/en/storytellers",
    siteName: "Furgocasa",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: STORYTELLERS_OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Camper traveller sharing trip photos — Furgocasa Storytellers programme",
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
  return <StorytellersLanding locale="en" />;
}
