/**
 * Borra contratos firmados de la BD y sus PDFs del bucket privado.
 * Solo para uso desde API admin (service_role).
 */

import { SIGNED_CONTRACTS_BUCKET } from "./config";

export interface SignedContractToDelete {
  id: string;
  signed_pdf_path: string;
}

export async function deleteSignedContractRecords(
  supabase: ReturnType<typeof import("@/lib/supabase/server").createAdminClient>,
  rows: SignedContractToDelete[]
): Promise<{ deleted: number; storageErrors: string[] }> {
  if (!rows.length) return { deleted: 0, storageErrors: [] };

  const storageErrors: string[] = [];
  const paths = rows.map((r) => r.signed_pdf_path).filter(Boolean);

  if (paths.length) {
    const { error: storageErr } = await supabase.storage
      .from(SIGNED_CONTRACTS_BUCKET)
      .remove(paths);
    if (storageErr) {
      storageErrors.push(storageErr.message);
    }
  }

  const ids = rows.map((r) => r.id);
  const { error: dbErr } = await (supabase as any)
    .from("signed_contracts")
    .delete()
    .in("id", ids);

  if (dbErr) {
    throw new Error(dbErr.message);
  }

  return { deleted: rows.length, storageErrors };
}
