import { Metadata } from "next";
import { VideoTutorialesClient } from "./video-tutoriales-client";

// 🎯 SEO Metadata - Único y optimizado para /video-tutoriales
export const metadata: Metadata = {
  title: "Video Tutoriales del Camper",
  description: "Videos tutoriales sobre el funcionamiento de tu camper de alquiler. Panel de control, agua, electricidad, calefacción, nevera y más sistemas explicados paso a paso.",
  keywords: "video tutorial camper, como usar autocaravana, tutorial panel control camper, videos furgocasa, aprender usar camper",
  openGraph: {
    title: "Video Tutoriales del Camper",
    description: "Aprende a usar tu camper de alquiler con nuestros videos tutoriales.",
    type: "website",
    url: "https://www.furgocasa.com/es/video-tutoriales",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Video Tutoriales del Camper",
    description: "Aprende a usar tu camper de alquiler.",
  },
  alternates: {
    canonical: "https://www.furgocasa.com/es/video-tutoriales",
    languages: {
      'es': 'https://www.furgocasa.com/es/video-tutoriales',
      'en': 'https://www.furgocasa.com/en/video-tutoriales',
      'fr': 'https://www.furgocasa.com/fr/video-tutoriales',
      'de': 'https://www.furgocasa.com/de/video-tutoriales',
      'x-default': 'https://www.furgocasa.com/es/video-tutoriales',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function VideoTutorialesPage() {
  return <VideoTutorialesClient />;
}
