"use client";

import { Suspense } from "react";
import { useLanguage } from "@/contexts/language-context";
import { SearchResultsContent } from "@/components/booking/search-results-content";

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

export function BuscarClient() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gray-50 font-amiko py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">
          {t("Resultados de búsqueda")}
        </h1>

        <Suspense fallback={<LoadingState />}>
          <SearchResultsContent />
        </Suspense>
      </div>
    </main>
  );
}
