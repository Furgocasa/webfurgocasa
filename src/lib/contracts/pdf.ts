/**
 * Genera el PDF combinado del contrato firmado.
 *
 * Estructura del PDF resultante:
 *   1. Condiciones del alquiler detalladas (PDF original).
 *   2. Anexo de protección de datos (PDF original).
 *   3. Página de firma: rúbricas del cliente para ambos documentos + sello
 *      (nº de reserva, nombre, email, fecha/hora e IP) y aceptaciones.
 *
 * Los PDFs base se cargan desde la URL pública del sitio (en serverless los
 * ficheros de /public no se incluyen en el bundle de la función, por eso se
 * descargan por HTTP en lugar de leerse del filesystem).
 */

import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { CONTRACT_DOCUMENTS, CONTRACT_VERSION } from "./config";

const BRAND_BLUE = rgb(6 / 255, 57 / 255, 113 / 255);
const BRAND_ORANGE = rgb(234 / 255, 88 / 255, 12 / 255);
const GRAY = rgb(0.35, 0.35, 0.35);
const DARK = rgb(0.1, 0.1, 0.1);

export interface SignedContractInput {
  bookingNumber: string;
  customerName: string | null;
  customerEmail: string;
  signedAt: Date;
  ipAddress: string | null;
  /** dataURL PNG de la firma para las condiciones del alquiler */
  signatureConditions: string;
  /** dataURL PNG de la firma para el anexo de protección de datos */
  signatureDataProtection: string;
  /** Origen del sitio para descargar los PDFs base, p.ej. https://www.furgocasa.com */
  baseUrl: string;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(",");
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return new Uint8Array(Buffer.from(base64, "base64"));
}

async function fetchPdfBytes(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`No se pudo descargar el PDF base: ${url} (${res.status})`);
  }
  return res.arrayBuffer();
}

function formatDateTime(d: Date): string {
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
}

export async function generateSignedContractPdf(
  input: SignedContractInput
): Promise<Uint8Array> {
  const baseUrl = input.baseUrl.replace(/\/$/, "");

  const conditionsDoc = CONTRACT_DOCUMENTS.find((d) => d.id === "condiciones-alquiler")!;
  const dataProtectionDoc = CONTRACT_DOCUMENTS.find((d) => d.id === "proteccion-datos")!;

  const [conditionsBytes, dataProtectionBytes] = await Promise.all([
    fetchPdfBytes(`${baseUrl}${conditionsDoc.publicPath}`),
    fetchPdfBytes(`${baseUrl}${dataProtectionDoc.publicPath}`),
  ]);

  const out = await PDFDocument.create();
  out.setTitle(`Contrato firmado - Reserva ${input.bookingNumber}`);
  out.setAuthor("Furgocasa");
  out.setSubject("Contrato de alquiler y anexo de protección de datos firmados");
  out.setProducer("Furgocasa");
  out.setCreationDate(input.signedAt);

  const helv = await out.embedFont(StandardFonts.Helvetica);
  const helvBold = await out.embedFont(StandardFonts.HelveticaBold);

  // 1 + 2: copiar páginas de los dos documentos originales
  const srcConditions = await PDFDocument.load(conditionsBytes);
  const srcData = await PDFDocument.load(dataProtectionBytes);

  const condPages = await out.copyPages(srcConditions, srcConditions.getPageIndices());
  condPages.forEach((p) => out.addPage(p));
  const dataPages = await out.copyPages(srcData, srcData.getPageIndices());
  dataPages.forEach((p) => out.addPage(p));

  // 3: página de firma
  const sigConditionsBytes = dataUrlToBytes(input.signatureConditions);
  const sigDataBytes = dataUrlToBytes(input.signatureDataProtection);
  const sigConditionsImg = await out.embedPng(sigConditionsBytes);
  const sigDataImg = await out.embedPng(sigDataBytes);

  drawSignaturePage(out.addPage(), {
    helv,
    helvBold,
    input,
    sigConditionsImg,
    sigDataImg,
  });

  return out.save();
}

function drawSignaturePage(
  page: PDFPage,
  ctx: {
    helv: PDFFont;
    helvBold: PDFFont;
    input: SignedContractInput;
    sigConditionsImg: Awaited<ReturnType<PDFDocument["embedPng"]>>;
    sigDataImg: Awaited<ReturnType<PDFDocument["embedPng"]>>;
  }
) {
  const { helv, helvBold, input, sigConditionsImg, sigDataImg } = ctx;
  const { width, height } = page.getSize();
  const margin = 50;
  const contentWidth = width - margin * 2;
  let y = height - margin;

  // Cabecera
  page.drawRectangle({
    x: 0,
    y: height - 8,
    width,
    height: 8,
    color: BRAND_ORANGE,
  });

  page.drawText("Confirmación de firma", {
    x: margin,
    y: y - 18,
    size: 22,
    font: helvBold,
    color: BRAND_BLUE,
  });
  y -= 44;

  page.drawText(
    "El cliente declara haber leído, comprendido y aceptado los documentos anteriores",
    { x: margin, y, size: 10, font: helv, color: GRAY }
  );
  y -= 14;
  page.drawText(
    "(Condiciones del alquiler detalladas y Anexo de protección de datos) y los firma.",
    { x: margin, y, size: 10, font: helv, color: GRAY }
  );
  y -= 30;

  // Datos de la reserva
  const rows: Array<[string, string]> = [
    ["Nº de reserva:", input.bookingNumber],
    ["Cliente:", input.customerName || "—"],
    ["Email:", input.customerEmail],
    ["Fecha y hora de firma:", `${formatDateTime(input.signedAt)} (hora peninsular)`],
    ["Dirección IP:", input.ipAddress || "—"],
    ["Versión de documentos:", CONTRACT_VERSION],
  ];
  for (const [label, value] of rows) {
    page.drawText(label, { x: margin, y, size: 11, font: helvBold, color: DARK });
    page.drawText(value, { x: margin + 165, y, size: 11, font: helv, color: DARK });
    y -= 20;
  }

  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 30;

  // Bloques de firma
  const boxWidth = contentWidth;
  const boxHeight = 130;

  const drawSignatureBlock = (
    title: string,
    acceptText: string,
    img: Awaited<ReturnType<PDFDocument["embedPng"]>>,
    topY: number
  ) => {
    page.drawText(title, { x: margin, y: topY, size: 12, font: helvBold, color: BRAND_BLUE });
    page.drawText(acceptText, {
      x: margin,
      y: topY - 16,
      size: 9.5,
      font: helv,
      color: GRAY,
    });
    const boxTop = topY - 26;
    page.drawRectangle({
      x: margin,
      y: boxTop - boxHeight,
      width: boxWidth,
      height: boxHeight,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
      color: rgb(0.99, 0.99, 0.99),
    });
    // Escalar la firma para que quepa con margen interior
    const maxW = boxWidth - 24;
    const maxH = boxHeight - 24;
    const scale = Math.min(maxW / img.width, maxH / img.height, 1);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    page.drawImage(img, {
      x: margin + (boxWidth - drawW) / 2,
      y: boxTop - boxHeight + (boxHeight - drawH) / 2,
      width: drawW,
      height: drawH,
    });
    return boxTop - boxHeight;
  };

  let nextY = y;
  nextY = drawSignatureBlock(
    "1. Condiciones del Alquiler Detalladas",
    "He leído y acepto las condiciones del alquiler.",
    sigConditionsImg,
    nextY
  );
  nextY -= 34;
  nextY = drawSignatureBlock(
    "2. Anexo de Protección de Datos (RGPD)",
    "He leído y acepto el tratamiento de mis datos personales.",
    sigDataImg,
    nextY
  );

  // Pie legal
  page.drawText(
    "Documento generado electrónicamente por Furgocasa. La firma manuscrita digital y los datos de",
    { x: margin, y: margin + 14, size: 8, font: helv, color: GRAY }
  );
  page.drawText(
    "fecha, hora e IP constituyen evidencia de la aceptación por parte del cliente.",
    { x: margin, y: margin + 4, size: 8, font: helv, color: GRAY }
  );
}
