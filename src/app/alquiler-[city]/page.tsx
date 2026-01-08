"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface LocationData {
  name: string;
  slug: string;
  meta_title: string;
  province: string;
  region: string;
}

export default function LocationPage() {
  const params = useParams();
  const citySlug = params?.city as string;
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!citySlug) return;
      
      // El slug viene como "autocaravanas-campervans-murcia"
      // Necesitamos extraer solo "murcia"
      const parts = citySlug.split('-');
      const actualSlug = parts[parts.length - 1];
      
      try {
        const { data } = await supabase
          .from('location_targets')
          .select('*')
          .eq('slug', actualSlug)
          .single();
        
        setLocationData(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [citySlug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p>Cargando...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!locationData) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">404 - No encontrado</h1>
            <p>La ubicación no existe.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">{locationData.meta_title}</h1>
        <p className="text-xl mb-4">{locationData.name}, {locationData.province}</p>
        <p className="text-gray-600">{locationData.region}</p>
        
        <div className="mt-8 p-6 bg-green-50 rounded-lg border-2 border-green-500">
          <p className="text-green-800 font-semibold text-2xl">✅ ¡Página funcionando!</p>
          <p className="text-sm text-gray-600 mt-2">City param: {citySlug}</p>
          <p className="text-sm text-gray-600">Ubicación: {locationData.name}</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
