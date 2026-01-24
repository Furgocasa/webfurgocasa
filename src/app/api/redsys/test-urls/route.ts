import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/redsys/test-urls
 * 
 * Endpoint temporal para mostrar las URLs configuradas
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  return NextResponse.json({
    current: {
      urlOk: `${baseUrl}/pago/exito`,
      urlKo: `${baseUrl}/pago/error`,
      notificationUrl: `${baseUrl}/api/redsys/notification`,
    },
    test: {
      urlOk: `${baseUrl}/pago/test`,
      urlKo: `${baseUrl}/pago/error`,
      notificationUrl: `${baseUrl}/api/redsys/notification`,
    },
    instructions: [
      "1. La página /pago/test capturará TODOS los datos que envía Redsys",
      "2. Para usarla temporalmente, modifica getRedsysConfig() en src/lib/redsys/params.ts",
      "3. Cambia urlOk a: `${baseUrl}/pago/test`",
      "4. Realiza un pago de prueba",
      "5. Copia el JSON completo de /pago/test",
      "6. IMPORTANTE: Restaura urlOk a /pago/exito después",
    ],
  });
}
