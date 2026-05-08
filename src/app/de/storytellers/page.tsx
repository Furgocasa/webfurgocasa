import type { Metadata } from "next";
import { StorytellersLanding } from "@/components/storytellers/storytellers-landing";

export const metadata: Metadata = {
  title: "Furgocasa Storytellers Programm | Fotos hochladen und bis zu 15 % Rabatt erhalten",
  description:
    "Lade deine Fotos und Videos vom Camper-Roadtrip zu Furgocasa hoch und sichere dir bis zu 15 % Rabatt auf zukünftige Buchungen. Ohne Login, ohne lange Formulare.",
  keywords:
    "storytellers furgocasa, camper reisefotos, wohnmobil mieten rabatt, furgocasa treueprogramm, camper fotos hochladen",
  alternates: {
    canonical: "https://www.furgocasa.com/de/storytellers",
  },
  openGraph: {
    title: "Furgocasa Storytellers Programm",
    description: "Lade deine Reisefotos und -videos hoch und erhalte bis zu 15 % Rabatt.",
    url: "https://www.furgocasa.com/de/storytellers",
    locale: "de_DE",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function StorytellersPage() {
  return <StorytellersLanding />;
}
