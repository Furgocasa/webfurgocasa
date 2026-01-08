"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function LocationPage() {
  const params = useParams();
  const location = params?.location as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!location) return;
      
      const { data: locationData } = await supabase
        .from('location_targets')
        .select('*')
        .eq('slug', location)
        .single();
      
      setData(locationData);
      setLoading(false);
    }
    
    load();
  }, [location]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <h1 className="text-4xl">404 - No encontrado</h1>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-4">{data.meta_title}</h1>
        <div className="bg-green-100 border-4 border-green-600 rounded-lg p-8 mt-8">
          <p className="text-3xl font-bold text-green-800">✅ FUNCIONA!</p>
          <p className="text-xl mt-4">Ubicación: {data.name}</p>
          <p className="text-lg">Provincia: {data.province}</p>
          <p className="text-lg">Slug: {location}</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
