import type { Metadata } from "next";
import { StorytellersLanding } from "@/components/storytellers/storytellers-landing";

export const metadata: Metadata = {
  title: "Programme Storytellers Furgocasa | Envoyez vos photos et gagnez jusqu'à 15 % de remise",
  description:
    "Envoyez vos photos et vidéos de voyage en camper Furgocasa et obtenez jusqu'à 15 % de remise sur vos futures réservations. Sans inscription, sans formulaires longs.",
  keywords:
    "storytellers furgocasa, photos voyage camper, remise location camper, programme fidélité furgocasa, envoyer photos camper",
  alternates: {
    canonical: "https://www.furgocasa.com/fr/storytellers",
  },
  openGraph: {
    title: "Programme Storytellers Furgocasa",
    description: "Envoyez vos photos et vidéos de voyage et obtenez jusqu'à 15 % de remise.",
    url: "https://www.furgocasa.com/fr/storytellers",
    locale: "fr_FR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function StorytellersPage() {
  return <StorytellersLanding />;
}
