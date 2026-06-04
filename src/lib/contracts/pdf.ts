/**
 * Genera el PDF del contrato firmado a partir del texto íntegro (contract-content),
 * no desde los PDF antiguos de /public/documentos.
 *
 * Estructura:
 *   1. Condiciones del alquiler (texto paginado)
 *   2. Anexo de protección de datos (texto paginado)
 *   3. Puntos confirmados por el cliente
 *   4. Hoja de firma electrónica (datos + rúbricas)
 */

import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { CONTRACT_VERSION } from "./config";
import {
  CONTRACT_CONTENT,
  type ContractBlock,
  type ContractDocContent,
} from "./contract-content";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = 36;

const BRAND_BLUE = rgb(6 / 255, 57 / 255, 113 / 255);
const BRAND_ORANGE = rgb(234 / 255, 88 / 255, 12 / 255);
const GRAY = rgb(0.4, 0.4, 0.4);
const DARK = rgb(0.12, 0.12, 0.12);
const HIGHLIGHT = rgb(0.72, 0.12, 0.1);
const HIGHLIGHT_BG = rgb(1, 0.96, 0.96);
const LINE_GRAY = rgb(0.82, 0.82, 0.82);

export interface SignedContractInput {
  bookingNumber: string;
  customerName: string | null;
  customerEmail: string;
  signedAt: Date;
  ipAddress: string | null;
  signatureConditions: string;
  signatureDataProtection: string;
  confirmations: Array<{ id: string; label: string }>;
}

function pdfSafeText(text: string): string {
  return text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ");
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(",");
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return new Uint8Array(Buffer.from(base64, "base64"));
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

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = pdfSafeText(text).split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

interface LayoutCtx {
  pdf: PDFDocument;
  helv: PDFFont;
  helvBold: PDFFont;
  page: PDFPage | null;
  y: number;
  pageNum: number;
}

function addPage(ctx: LayoutCtx): void {
  ctx.page = ctx.pdf.addPage([PAGE_W, PAGE_H]);
  ctx.pageNum += 1;
  ctx.y = PAGE_H - MARGIN;
  drawPageFooter(ctx);
}

function drawPageFooter(ctx: LayoutCtx): void {
  if (!ctx.page) return;
  ctx.page.drawText(`Furgocasa · Contrato firmado · ${ctx.pageNum}`, {
    x: MARGIN,
    y: FOOTER_Y,
    size: 7.5,
    font: ctx.helv,
    color: GRAY,
  });
}

function ensureSpace(ctx: LayoutCtx, needed: number): void {
  if (!ctx.page) {
    addPage(ctx);
    return;
  }
  if (ctx.y - needed < MARGIN + 24) {
    addPage(ctx);
  }
}

function drawLines(
  ctx: LayoutCtx,
  lines: string[],
  opts: {
    x: number;
    width: number;
    size: number;
    font: PDFFont;
    color: ReturnType<typeof rgb>;
    lineHeight: number;
    beforeGap?: number;
    highlightBg?: boolean;
  }
): void {
  const blockH = lines.length * opts.lineHeight + (opts.beforeGap || 0);
  ensureSpace(ctx, blockH);

  if (opts.highlightBg && lines.length > 0) {
    const bgH = lines.length * opts.lineHeight + 6;
    ctx.page.drawRectangle({
      x: opts.x - 4,
      y: ctx.y - bgH + 2,
      width: opts.width + 8,
      height: bgH,
      color: HIGHLIGHT_BG,
    });
  }

  ctx.y -= opts.beforeGap || 0;
  for (const line of lines) {
    ensureSpace(ctx, opts.lineHeight);
    ctx.page.drawText(line, {
      x: opts.x,
      y: ctx.y - opts.size,
      size: opts.size,
      font: opts.font,
      color: opts.color,
    });
    ctx.y -= opts.lineHeight;
  }
}

function drawSectionBanner(ctx: LayoutCtx, title: string, subtitle?: string): void {
  addPage(ctx);
  ctx.page.drawRectangle({
    x: 0,
    y: PAGE_H - 6,
    width: PAGE_W,
    height: 6,
    color: BRAND_ORANGE,
  });
  ctx.page.drawText(title, {
    x: MARGIN,
    y: ctx.y - 20,
    size: 16,
    font: ctx.helvBold,
    color: BRAND_BLUE,
  });
  ctx.y -= 32;
  if (subtitle) {
    ctx.page.drawText(pdfSafeText(subtitle), {
      x: MARGIN,
      y: ctx.y - 10,
      size: 9,
      font: ctx.helv,
      color: GRAY,
    });
    ctx.y -= 22;
  }
  ctx.y -= 8;
}

function renderBlock(ctx: LayoutCtx, block: ContractBlock): void {
  const highlight = "highlight" in block && block.highlight;

  if (block.type === "h") {
    const lines = wrapText(block.text, ctx.helvBold, 11, CONTENT_W);
    drawLines(ctx, lines, {
      x: MARGIN,
      width: CONTENT_W,
      size: 11,
      font: ctx.helvBold,
      color: BRAND_BLUE,
      lineHeight: 14,
      beforeGap: 10,
    });
    ctx.y -= 4;
    return;
  }

  if (block.type === "li") {
    const bullet = "• ";
    const lines = wrapText(block.text, ctx.helv, 9, CONTENT_W - 14);
    const first = `${bullet}${lines[0] || ""}`;
    const rest = lines.slice(1);
    drawLines(ctx, [first, ...rest], {
      x: MARGIN + 2,
      width: CONTENT_W - 14,
      size: 9,
      font: ctx.helv,
      color: highlight ? HIGHLIGHT : DARK,
      lineHeight: 11.5,
      beforeGap: 3,
      highlightBg: highlight,
    });
    return;
  }

  const lines = wrapText(block.text, ctx.helv, 9, CONTENT_W);
  drawLines(ctx, lines, {
    x: MARGIN,
    width: CONTENT_W,
    size: 9,
    font: ctx.helv,
    color: highlight ? HIGHLIGHT : DARK,
    lineHeight: 11.5,
    beforeGap: 5,
    highlightBg: highlight,
  });
}

function renderDocument(ctx: LayoutCtx, doc: ContractDocContent): void {
  drawSectionBanner(ctx, doc.title, "FURGOCASA CAMPERVANS, S.L. · NIF B-87947412");
  for (const block of doc.blocks) {
    renderBlock(ctx, block);
  }
  ctx.y -= 12;
}

function renderConfirmations(ctx: LayoutCtx, input: SignedContractInput): void {
  drawSectionBanner(
    ctx,
    "Puntos importantes confirmados",
    `Reserva ${input.bookingNumber} · ${input.customerName || input.customerEmail}`
  );

  const size = 9.5;
  const lineHeight = 12.5;
  const checkX = MARGIN;
  const textX = MARGIN + 14;
  const textW = CONTENT_W - 14;

  for (const c of input.confirmations) {
    const lines = wrapText(c.label, ctx.helv, size, textW);
    const blockH = lines.length * lineHeight + 8;
    ensureSpace(ctx, blockH);

    ctx.page.drawText("[x]", {
      x: checkX,
      y: ctx.y - size,
      size: size + 1,
      font: ctx.helvBold,
      color: rgb(0.1, 0.5, 0.25),
    });
    lines.forEach((line, idx) => {
      ctx.page.drawText(line, {
        x: textX,
        y: ctx.y - size - idx * lineHeight,
        size,
        font: ctx.helv,
        color: DARK,
      });
    });
    ctx.y -= blockH;
  }

  ctx.y -= 6;
  drawLines(
    ctx,
    wrapText(
      "El cliente ha marcado expresamente cada punto anterior en la web antes de firmar.",
      ctx.helv,
      8,
      CONTENT_W
    ),
    {
      x: MARGIN,
      width: CONTENT_W,
      size: 8,
      font: ctx.helv,
      color: GRAY,
      lineHeight: 10,
    }
  );
}

function drawSignaturePage(
  ctx: LayoutCtx,
  input: SignedContractInput,
  sigConditionsImg: Awaited<ReturnType<PDFDocument["embedPng"]>>,
  sigDataImg: Awaited<ReturnType<PDFDocument["embedPng"]>>
): void {
  drawSectionBanner(ctx, "Firma electrónica del cliente");

  const rows: Array<[string, string]> = [
    ["Nº de reserva", input.bookingNumber],
    ["Cliente", input.customerName || "—"],
    ["Email", input.customerEmail],
    ["Fecha y hora", `${formatDateTime(input.signedAt)} (peninsular)`],
    ["IP", input.ipAddress || "—"],
    ["Versión documento", CONTRACT_VERSION],
  ];

  for (const [label, value] of rows) {
    ensureSpace(ctx, 16);
    ctx.page.drawText(`${label}:`, {
      x: MARGIN,
      y: ctx.y - 10,
      size: 9.5,
      font: ctx.helvBold,
      color: DARK,
    });
    const valueLines = wrapText(value, ctx.helv, 9.5, CONTENT_W - 120);
    valueLines.forEach((line, idx) => {
      ctx.page.drawText(line, {
        x: MARGIN + 115,
        y: ctx.y - 10 - idx * 12,
        size: 9.5,
        font: ctx.helv,
        color: DARK,
      });
    });
    ctx.y -= Math.max(16, valueLines.length * 12 + 4);
  }

  ctx.y -= 16;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: PAGE_W - MARGIN, y: ctx.y },
    thickness: 0.5,
    color: LINE_GRAY,
  });
  ctx.y -= 24;

  const drawSig = (
    label: string,
    sublabel: string,
    img: Awaited<ReturnType<PDFDocument["embedPng"]>>
  ) => {
    ensureSpace(ctx, 100);
    ctx.page.drawText(label, {
      x: MARGIN,
      y: ctx.y - 11,
      size: 11,
      font: ctx.helvBold,
      color: BRAND_BLUE,
    });
    ctx.y -= 18;
    ctx.page.drawText(sublabel, {
      x: MARGIN,
      y: ctx.y - 9,
      size: 8.5,
      font: ctx.helv,
      color: GRAY,
    });
    ctx.y -= 14;

    const maxW = CONTENT_W;
    const maxH = 56;
    const scale = Math.min(maxW / img.width, maxH / img.height, 1);
    const drawW = img.width * scale;
    const drawH = img.height * scale;

    ensureSpace(ctx, drawH + 28);
    const imgY = ctx.y - drawH;
    ctx.page.drawImage(img, {
      x: MARGIN,
      y: imgY,
      width: drawW,
      height: drawH,
    });
    ctx.y = imgY - 8;

    ctx.page.drawLine({
      start: { x: MARGIN, y: ctx.y },
      end: { x: MARGIN + 220, y: ctx.y },
      thickness: 0.75,
      color: DARK,
    });
    ctx.y -= 12;
    ctx.page.drawText("Firma del cliente", {
      x: MARGIN,
      y: ctx.y - 8,
      size: 8,
      font: ctx.helv,
      color: GRAY,
    });
    ctx.y -= 28;
  };

  drawSig(
    "1. Condiciones del alquiler detalladas",
    "He leído, acepto y firmo las condiciones del alquiler.",
    sigConditionsImg
  );
  drawSig(
    "2. Anexo de protección de datos (RGPD)",
    "He leído, acepto y firmo el tratamiento de mis datos y la geolocalización GPS.",
    sigDataImg
  );

  ensureSpace(ctx, 30);
  drawLines(
    ctx,
    wrapText(
      "Documento generado electrónicamente por Furgocasa. La firma manuscrita digital, la fecha, la hora y la dirección IP constituyen evidencia de la aceptación del cliente.",
      ctx.helv,
      7.5,
      CONTENT_W
    ),
    {
      x: MARGIN,
      width: CONTENT_W,
      size: 7.5,
      font: ctx.helv,
      color: GRAY,
      lineHeight: 9.5,
    }
  );
}

export async function generateSignedContractPdf(
  input: SignedContractInput
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Contrato firmado - Reserva ${input.bookingNumber}`);
  pdf.setAuthor("Furgocasa");
  pdf.setSubject("Contrato de alquiler y anexo de protección de datos firmados");
  pdf.setProducer("Furgocasa");
  pdf.setCreationDate(input.signedAt);

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const ctx: LayoutCtx = {
    pdf,
    helv,
    helvBold,
    page: null,
    y: 0,
    pageNum: 0,
  };

  renderDocument(ctx, CONTRACT_CONTENT["condiciones-alquiler"]);
  renderDocument(ctx, CONTRACT_CONTENT["proteccion-datos"]);

  if (input.confirmations.length > 0) {
    renderConfirmations(ctx, input);
  }

  const sigConditionsImg = await pdf.embedPng(dataUrlToBytes(input.signatureConditions));
  const sigDataImg = await pdf.embedPng(dataUrlToBytes(input.signatureDataProtection));
  drawSignaturePage(ctx, input, sigConditionsImg, sigDataImg);

  return pdf.save();
}
