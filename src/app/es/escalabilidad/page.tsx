import { Metadata } from "next";
import { EscalabilidadClient } from "./escalabilidad-client";

/**
 * 🔒 PÁGINA ESTRATÉGICA INTERNA - NO INDEXABLE
 * ===============================================
 * 
 * Página de presentación del proyecto de escalabilidad digital
 * para socios de FURGOCASA. No debe ser indexada por Google.
 * 
 * PRIVACIDAD:
 * - Sin OpenGraph para evitar previews en redes sociales
 * - Sin Twitter Cards
 * - Título genérico para no revelar contenido
 */

export const metadata: Metadata = {
  title: "Acceso Restringido - FURGOCASA",
  description: "Contenido de acceso restringido",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
  // Sin alternates/hreflang (no hay versiones en otros idiomas)
  alternates: {
    canonical: null, // Sin canonical - página interna sin SEO
  },
  // Sin OpenGraph ni Twitter Cards para máxima privacidad
  openGraph: undefined,
  twitter: undefined,
};

export default function EscalabilidadPage() {
  return <EscalabilidadClient />;
}
