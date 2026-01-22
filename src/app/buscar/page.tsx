import { Metadata } from "next";
import { BuscarClient } from "./buscar-client";

// 🎯 SEO Metadata - Único y optimizado para /buscar
export const metadata: Metadata = {
  title: "Buscar Disponibilidad de Campers",
  description: "Busca y compara la disponibilidad de campers y autocaravanas para tus fechas de viaje. Reserva online tu camper ideal con Furgocasa.",
  keywords: "buscar camper disponible, disponibilidad autocaravana, reservar camper fechas, buscar alquiler camper",
  robots: {
    index: false, // Página de resultados de búsqueda, no indexar
    follow: true,
  },
  alternates: {
    canonical: "https://www.furgocasa.com/es/buscar",
  },
};

export default function BuscarPage() {
  return <BuscarClient />;
}
