import type { Metadata } from "next";
import { MyPointsView } from "@/components/storytellers/my-points-view";

export const metadata: Metadata = {
  title: "Mis puntos · Storytellers Furgocasa",
  description:
    "Consulta tus puntos Storyteller, cupones disponibles y movimientos recientes en tu área privada Furgocasa.",
  alternates: { canonical: "https://www.furgocasa.com/es/storytellers/mis-puntos" },
  robots: { index: false, follow: false },
};

interface SearchParams {
  searchParams: Promise<{ t?: string }>;
}

export default async function StorytellersMisPuntosPage({ searchParams }: SearchParams) {
  const sp = await searchParams;
  const token = typeof sp?.t === "string" && sp.t.length > 0 ? sp.t : null;
  return (
    <div className="min-h-screen bg-gray-50 font-amiko">
      <MyPointsView token={token} />
    </div>
  );
}
