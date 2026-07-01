/**
 * Configuración de la subida de documentación del cliente (KILL NOTION · FASE 4).
 *
 * El cliente sube DNI (anverso/reverso) y carnet de conducir (anverso/reverso)
 * de cada conductor desde el link de su reserva. Identidad sin login: nº de
 * reserva + email (reutiliza el token de sesión de la firma de contratos).
 */

export const RENTAL_DOCS_BUCKET = "rental-documents";

export type DocKind = "dni_front" | "dni_back" | "license_front" | "license_back";

export const DOC_KINDS: DocKind[] = [
  "dni_front",
  "dni_back",
  "license_front",
  "license_back",
];

export const DOC_KIND_LABELS: Record<DocKind, string> = {
  dni_front: "DNI (anverso)",
  dni_back: "DNI (reverso)",
  license_front: "Carnet de conducir (anverso)",
  license_back: "Carnet de conducir (reverso)",
};

export const ALLOWED_DOC_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
] as const;

/** 15 MiB por imagen (coincide con el file_size_limit del bucket). */
export const MAX_DOC_SIZE_BYTES = 15 * 1024 * 1024;

/** Nº máximo de conductores por reserva (titular + adicionales). */
export const MAX_DRIVERS = 4;

export type AiStatus = "pending" | "ok" | "warning" | "error";

export function mimeToExt(mime: string, originalName?: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
    "application/pdf": "pdf",
  };
  if (map[mime]) return map[mime];
  const fromName = originalName?.split(".").pop();
  return fromName ? fromName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6) || "bin" : "bin";
}

export function isAllowedDocMime(mime: string): boolean {
  return (ALLOWED_DOC_MIME_TYPES as readonly string[]).includes(mime);
}

/** Ruta interna en el bucket: bookings/{bookingId}/{driverIndex}/{docKind}.{ext} */
export function buildDocPath(
  bookingId: string,
  driverIndex: number,
  docKind: DocKind,
  ext: string,
): string {
  return `bookings/${bookingId}/${driverIndex}/${docKind}.${ext}`;
}
