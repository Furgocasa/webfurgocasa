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
    googleBot: {
      index: false,
      follow: false,
    },
  },
  // Sin OpenGraph ni Twitter Cards para máxima privacidad
  openGraph: undefined,
  twitter: undefined,
};

export default function EscalabilidadPage() {
  return <EscalabilidadClient />;
}
