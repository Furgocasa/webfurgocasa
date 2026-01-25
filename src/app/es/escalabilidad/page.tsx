import { Metadata } from "next";
import { EscalabilidadClient } from "./escalabilidad-client";

/**
 * 🔒 PÁGINA ESTRATÉGICA INTERNA - NO INDEXABLE
 * ===============================================
 * 
 * Página de presentación del proyecto de escalabilidad digital
 * para socios de FURGOCASA. No debe ser indexada por Google.
 */

export const metadata: Metadata = {
  title: "Proyecto de Escalabilidad Digital - FURGOCASA",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function EscalabilidadPage() {
  return <EscalabilidadClient />;
}
