import type { Metadata } from "next";
import { StorytellersLanding } from "@/components/storytellers/storytellers-landing";

export const metadata: Metadata = {
  title: "Furgocasa Storytellers Program | Upload photos and earn up to 15% off",
  description:
    "Upload your camper trip photos and videos to Furgocasa and earn up to 15% off future bookings. No login, no long forms.",
  keywords:
    "storytellers furgocasa, camper trip photos, motorhome rental discount, furgocasa loyalty program, upload camper photos",
  alternates: {
    canonical: "https://www.furgocasa.com/en/storytellers",
  },
  openGraph: {
    title: "Furgocasa Storytellers Program",
    description: "Upload your trip photos and videos and earn up to 15% off.",
    url: "https://www.furgocasa.com/en/storytellers",
    locale: "en_US",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function StorytellersPage() {
  return <StorytellersLanding />;
}
