"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function TestPageContent() {
  const searchParams = useSearchParams();
  const [allData, setAllData] = useState<any>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Capturar TODA la información posible
    const data: any = {
      timestamp: new Date().toISOString(),
      url: {
        full: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      },
      queryParams: {},
      searchParamsObj: {},
      sessionStorage: {},
      localStorage: {},
      postData: (window as any).redsysPostData || null,
    };

    // Query params usando URLSearchParams nativo
    const allParams = new URLSearchParams(window.location.search);
    allParams.forEach((value, key) => {
      data.queryParams[key] = value;
    });

    // Search params de Next.js
    Array.from(searchParams.keys()).forEach((key) => {
      data.searchParamsObj[key] = searchParams.get(key);
    });

    // SessionStorage
    try {
      const lastOrderNumber = sessionStorage.getItem('lastPaymentOrderNumber');
      const lastBookingId = sessionStorage.getItem('lastPaymentBookingId');
      data.sessionStorage = {
        lastPaymentOrderNumber: lastOrderNumber,
        lastPaymentBookingId: lastBookingId,
      };
    } catch (e) {
      data.sessionStorage = { error: String(e) };
    }

    // LocalStorage (por si acaso)
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.includes('payment') || key.includes('redsys')) {
          data.localStorage[key] = localStorage.getItem(key);
        }
      });
    } catch (e) {
      data.localStorage = { error: String(e) };
    }

    // Decodificar Ds_MerchantParameters si existe
    if (data.queryParams.Ds_MerchantParameters) {
      try {
        const decoded = JSON.parse(atob(data.queryParams.Ds_MerchantParameters));
        data.decodedMerchantParams = decoded;
      } catch (e) {
        data.decodedMerchantParams = { error: String(e) };
      }
    }

    setAllData(data);
    console.log("🔍 [TEST PAGE] DATOS CAPTURADOS:", data);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔍 Página de Test - Captura de Datos Redsys
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Instrucciones:
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Cambia la URL de éxito de Redsys a: <code className="bg-gray-100 px-2 py-1 rounded">/pago/test</code></li>
            <li>Realiza un pago de prueba</li>
            <li>Esta página capturará TODOS los datos que envía Redsys</li>
            <li>Copia el JSON completo y envíaselo al desarrollador</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Datos Capturados:
          </h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
            {JSON.stringify(allData, null, 2)}
          </pre>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(allData, null, 2));
              alert("JSON copiado al portapapeles");
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            📋 Copiar JSON
          </button>
          <a
            href="/pago/exito"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Ir a /pago/exito
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <TestPageContent />
    </Suspense>
  );
}
