import { Metadata } from "next";
import DocumentacionClient from "./documentacion-client";

// Página SECRETA - No indexar, no seguir
export const metadata: Metadata = {
  title: "Documentación de Alquiler - Cliente",
  description: "Acceso exclusivo para clientes. Consulta, descarga y firma los documentos de tu alquiler.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

// ⚡ ISR: Revalidar cada día
export const revalidate = 86400;

export default function DocumentacionAlquilerPage() {
  return <DocumentacionClient />;
}
