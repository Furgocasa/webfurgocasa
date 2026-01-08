"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ComoFuncionaRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/guia-camper");
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo a la Guía Camper...</p>
      </div>
    </div>
  );
}






