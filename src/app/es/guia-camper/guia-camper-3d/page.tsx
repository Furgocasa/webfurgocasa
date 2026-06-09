import type { Metadata } from "next";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { GuiaCamper3dClient } from "./guia-camper-3d-client";

const GUIA_CAMPER_3D_METADATA: Metadata = {
  title: "Guía Camper 3D Interactiva - Aprende con Rayos X | Furgocasa",
  description:
    "Recorre una camper en 3D antes de recoger las llaves: batería, gas, aguas, WC y calefacción explicados con animación interactiva y modo rayos X.",
  keywords:
    "guía camper 3D, tutorial camper interactivo, aprender autocaravana, sistemas camper, rayos X camper, Furgocasa",
  openGraph: {
    title: "Guía Camper 3D Interactiva | Furgocasa",
    description:
      "Explora los sistemas de tu camper en 3D: energía, agua, gas, WC y calefacción con una experiencia interactiva.",
    type: "website",
    siteName: "Furgocasa",
    locale: "es_ES",
    images: [
      {
        url: "https://www.furgocasa.com/images/slides/hero-05.webp",
        width: 1200,
        height: 630,
        alt: "Guía Camper 3D - Furgocasa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guía Camper 3D Interactiva | Furgocasa",
    description: "Aprende a usar tu camper con una experiencia 3D interactiva.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const alternates = buildCanonicalAlternates("/guia-camper/guia-camper-3d", "es");

  return {
    ...GUIA_CAMPER_3D_METADATA,
    alternates,
    openGraph: {
      ...(GUIA_CAMPER_3D_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default function GuiaCamper3dPage() {
  return <GuiaCamper3dClient />;
}
