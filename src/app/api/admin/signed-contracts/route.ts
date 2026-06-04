/**
 * GET /api/admin/signed-contracts
 *
 * Lista los contratos firmados para el panel de administración. Para cada uno
 * genera una URL firmada temporal (1h) que permite descargar el PDF desde el
 * bucket privado `signed-contracts`.
 *
 * Solo accesible por administradores autenticados.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/server";
import { SIGNED_CONTRACTS_BUCKET } from "@/lib/contracts/config";

export const dynamic = "force-dynamic";

const SIGNED_URL_TTL_SEC = 60 * 60; // 1h
const PAGE_SIZE = 200;

interface SignedContractRow {
  id: string;
  booking_id: string;
  booking_number: string;
  customer_email: string;
  customer_name: string | null;
  accepted_conditions: boolean;
  accepted_data_protection: boolean;
  contract_version: string;
  signed_pdf_path: string;
  signed_at: string;
  ip_address: string | null;
}

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const supabase = createAdminClient();
    const search = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";

    let query = (supabase as any)
      .from("signed_contracts")
      .select(
        "id, booking_id, booking_number, customer_email, customer_name, accepted_conditions, accepted_data_protection, contract_version, signed_pdf_path, signed_at, ip_address"
      )
      .order("signed_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (search) {
      query = query.or(
        `booking_number.ilike.%${search}%,customer_email.ilike.%${search}%,customer_name.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error("[admin/signed-contracts] query error:", error);
      return NextResponse.json({ error: "Error al consultar contratos." }, { status: 500 });
    }

    const rows = (data || []) as SignedContractRow[];

    const items = await Promise.all(
      rows.map(async (row) => {
        let downloadUrl: string | null = null;
        const { data: signed } = await supabase.storage
          .from(SIGNED_CONTRACTS_BUCKET)
          .createSignedUrl(row.signed_pdf_path, SIGNED_URL_TTL_SEC);
        downloadUrl = signed?.signedUrl || null;

        return {
          id: row.id,
          bookingId: row.booking_id,
          bookingNumber: row.booking_number,
          customerEmail: row.customer_email,
          customerName: row.customer_name,
          acceptedConditions: row.accepted_conditions,
          acceptedDataProtection: row.accepted_data_protection,
          contractVersion: row.contract_version,
          signedAt: row.signed_at,
          ipAddress: row.ip_address,
          downloadUrl,
        };
      })
    );

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error("[admin/signed-contracts]", e);
    return NextResponse.json({ error: "Error del servidor." }, { status: 500 });
  }
}
