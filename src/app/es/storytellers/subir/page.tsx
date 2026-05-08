import type { Metadata } from "next";
import { UploaderFlow } from "@/components/storytellers/uploader-flow";

export const metadata: Metadata = {
  title: "Subir fotos y vídeos · Storytellers Furgocasa",
  description:
    "Sube tus fotos y vídeos del viaje en camper Furgocasa y empieza a sumar puntos. Identifícate con tu nº de reserva y email.",
  alternates: { canonical: "https://www.furgocasa.com/es/storytellers/subir" },
  robots: { index: false, follow: true },
};

export default function StorytellersSubirPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-amiko">
      <header className="bg-gradient-to-br from-furgocasa-orange to-furgocasa-orange-dark py-10 text-white md:py-14">
        <div className="container mx-auto max-w-3xl px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">
            Programa Storytellers
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold md:text-4xl">
            Sube tu material y suma puntos
          </h1>
          <p className="mt-3 max-w-2xl text-orange-50">
            Identifícate con tu reserva y arrastra tus fotos o vídeos. Sin login.
          </p>
        </div>
      </header>
      <UploaderFlow />
    </div>
  );
}
