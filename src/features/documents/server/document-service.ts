import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from "pdf-lib";
import { DocumentType, DocumentVisibility, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { siteConfig } from "@/config/site";
import { QuoteProposalData } from "@/features/quotes/server/proposal-template";

const GENERATED_QUOTE_PROPOSAL_PREFIX = "generated:quote-proposal:";

type QuoteWithProposal = Prisma.QuoteGetPayload<{
  include: {
    customer: true;
    documents: true;
  };
}>;

type PdfTheme = {
  primary: ReturnType<typeof rgb>;
  primarySoft: ReturnType<typeof rgb>;
  slate: ReturnType<typeof rgb>;
  muted: ReturnType<typeof rgb>;
  border: ReturnType<typeof rgb>;
  white: ReturnType<typeof rgb>;
  success: ReturnType<typeof rgb>;
  warning: ReturnType<typeof rgb>;
};

function formatDate(value?: Date | string | null) {
  if (!value) {
    return "Por definir";
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "Por definir" : date.toLocaleDateString("es-MX");
}

function formatMoney(value: Prisma.Decimal | number | string | null | undefined) {
  const numeric =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number(value ?? 0);

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function safeFileName(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function getGeneratedQuoteProposalStorageKey(quoteId: string) {
  return `${GENERATED_QUOTE_PROPOSAL_PREFIX}${quoteId}`;
}

export function parseGeneratedQuoteProposalStorageKey(storageKey: string) {
  return storageKey.startsWith(GENERATED_QUOTE_PROPOSAL_PREFIX)
    ? storageKey.slice(GENERATED_QUOTE_PROPOSAL_PREFIX.length)
    : null;
}

export async function getQuoteForProposalDocument(quoteId: string) {
  return prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      customer: true,
      documents: true,
    },
  });
}

function getQuoteProposalDocumentName(quote: QuoteWithProposal) {
  return `Cotizacion ${quote.quoteNumber}`;
}

export function getQuoteProposalFileName(quote: QuoteWithProposal) {
  const base = safeFileName(`${quote.quoteNumber}-${quote.title || "cotizacion"}`);
  return `${base || quote.quoteNumber.toLowerCase()}.pdf`;
}

function getProposalData(quote: QuoteWithProposal) {
  return (quote.proposalData ?? null) as QuoteProposalData | null;
}

export async function ensureQuoteProposalDocumentRecord(quoteId: string, uploadedByUserId?: string | null) {
  const quote = await getQuoteForProposalDocument(quoteId);

  if (!quote || !quote.proposalData) {
    return null;
  }

  const existing = quote.documents.find((document) => document.type === "QUOTE_PROPOSAL");

  const data = {
    customerId: quote.customerId ?? undefined,
    quoteId: quote.id,
    uploadedByUserId: uploadedByUserId ?? undefined,
    type: DocumentType.QUOTE_PROPOSAL,
    name: getQuoteProposalDocumentName(quote),
    storageKey: getGeneratedQuoteProposalStorageKey(quote.id),
    fileName: getQuoteProposalFileName(quote),
    mimeType: "application/pdf",
    sizeBytes: 0,
    visibility: DocumentVisibility.CLIENT,
  };

  if (existing) {
    return prisma.document.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.document.create({
    data,
  });
}

function drawWrappedText(
  page: PDFPage,
  text: string,
  options: {
    x: number;
    y: number;
    maxWidth: number;
    font: PDFFont;
    size: number;
    color?: ReturnType<typeof rgb>;
    lineHeight?: number;
  },
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    const width = options.font.widthOfTextAtSize(nextLine, options.size);

    if (width <= options.maxWidth) {
      currentLine = nextLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  const lineHeight = options.lineHeight ?? options.size * 1.42;
  let currentY = options.y;

  for (const line of lines) {
    page.drawText(line, {
      x: options.x,
      y: currentY,
      size: options.size,
      font: options.font,
      color: options.color ?? rgb(0.15, 0.2, 0.26),
    });
    currentY -= lineHeight;
  }

  return currentY;
}

function drawRoundedCard(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: ReturnType<typeof rgb>,
  border: ReturnType<typeof rgb>,
) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: fill,
    borderColor: border,
    borderWidth: 1,
  });
}

function drawMetricCard(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  fonts: { regular: PDFFont; bold: PDFFont },
  theme: PdfTheme,
) {
  drawRoundedCard(page, x, y - 56, width, 56, theme.white, theme.border);
  page.drawText(label, {
    x: x + 14,
    y: y - 18,
    size: 9,
    font: fonts.regular,
    color: theme.muted,
  });
  page.drawText(value, {
    x: x + 14,
    y: y - 38,
    size: 14,
    font: fonts.bold,
    color: theme.slate,
  });
}

function drawDetailRow(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  fonts: { regular: PDFFont; bold: PDFFont },
  theme: PdfTheme,
) {
  page.drawText(label, {
    x,
    y,
    size: 9,
    font: fonts.bold,
    color: theme.muted,
  });

  return drawWrappedText(page, value, {
    x: x + 114,
    y,
    maxWidth: width - 114,
    font: fonts.regular,
    size: 10,
    color: theme.slate,
    lineHeight: 13,
  });
}

function drawSectionTitle(
  page: PDFPage,
  title: string,
  subtitle: string | null,
  x: number,
  y: number,
  width: number,
  fonts: { regular: PDFFont; bold: PDFFont },
  theme: PdfTheme,
) {
  page.drawText(title, {
    x,
    y,
    size: 15,
    font: fonts.bold,
    color: theme.slate,
  });

  if (subtitle) {
    page.drawText(subtitle, {
      x,
      y: y - 14,
      size: 9,
      font: fonts.regular,
      color: theme.muted,
    });
  }

  page.drawRectangle({
    x: x + width - 72,
    y: y - 2,
    width: 72,
    height: 2,
    color: theme.primary,
  });
}

export async function generateQuoteProposalPdfBytes(quote: QuoteWithProposal) {
  const proposal = getProposalData(quote);

  if (!proposal) {
    throw new Error("La cotizacion no tiene datos de propuesta.");
  }

  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fonts = { regular: regularFont, bold: boldFont };
  const theme: PdfTheme = {
    primary: rgb(0.05, 0.52, 0.72),
    primarySoft: rgb(0.92, 0.97, 0.99),
    slate: rgb(0.11, 0.16, 0.23),
    muted: rgb(0.39, 0.47, 0.56),
    border: rgb(0.86, 0.9, 0.94),
    white: rgb(1, 1, 1),
    success: rgb(0.03, 0.48, 0.3),
    warning: rgb(0.74, 0.16, 0.16),
  };

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 40;
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight;

  const createPage = () => {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawRectangle({
      x: 0,
      y: pageHeight - 94,
      width: pageWidth,
      height: 94,
      color: theme.slate,
    });
    page.drawText(siteConfig.name, {
      x: margin,
      y: pageHeight - 38,
      size: 18,
      font: boldFont,
      color: theme.white,
    });
    page.drawText("Propuesta de viaje", {
      x: margin,
      y: pageHeight - 62,
      size: 10,
      font: regularFont,
      color: rgb(0.82, 0.9, 0.97),
    });
    page.drawText(`Cotizacion ${quote.quoteNumber}`, {
      x: pageWidth - margin - 170,
      y: pageHeight - 38,
      size: 10,
      font: boldFont,
      color: theme.white,
    });
    page.drawText(`Generada ${proposal.generatedAt}`, {
      x: pageWidth - margin - 170,
      y: pageHeight - 58,
      size: 9,
      font: regularFont,
      color: rgb(0.82, 0.9, 0.97),
    });
    y = pageHeight - 120;
  };

  const ensureSpace = (height: number) => {
    if (y - height < margin) {
      createPage();
    }
  };

  createPage();

  page.drawText(quote.title, {
    x: margin,
    y,
    size: 24,
    font: boldFont,
    color: theme.slate,
  });
  page.drawText("Documento comercial para seguimiento, aprobacion y pagos del viaje.", {
    x: margin,
    y: y - 22,
    size: 10,
    font: regularFont,
    color: theme.muted,
  });
  y -= 52;

  drawMetricCard(page, margin, y, 162, "Cliente", proposal.clientName, fonts, theme);
  drawMetricCard(page, margin + 176, y, 162, "Destino", proposal.destination, fonts, theme);
  drawMetricCard(page, margin + 352, y, 162, "Total cotizado", formatMoney(quote.grandTotal), fonts, theme);
  y -= 74;

  drawRoundedCard(page, margin, y - 104, pageWidth - margin * 2, 104, theme.primarySoft, theme.border);
  page.drawText("Datos del viaje", {
    x: margin + 16,
    y: y - 18,
    size: 13,
    font: boldFont,
    color: theme.slate,
  });
  page.drawText(`Fechas: ${proposal.checkIn} al ${proposal.checkOut} (${proposal.nights} noches)`, {
    x: margin + 16,
    y: y - 40,
    size: 10,
    font: regularFont,
    color: theme.slate,
  });
  page.drawText(
    `Ocupacion: ${proposal.adults} adultos${proposal.minors ? ` · ${proposal.minors} menores` : ""}${
      proposal.minorAges ? ` (${proposal.minorAges})` : ""
    }`,
    {
      x: margin + 16,
      y: y - 56,
      size: 10,
      font: regularFont,
      color: theme.slate,
    },
  );
  page.drawText(`Vigencia: ${formatDate(quote.validUntil)}`, {
    x: margin + 16,
    y: y - 72,
    size: 10,
    font: regularFont,
    color: theme.slate,
  });
  page.drawText(`Anticipo: ${formatMoney(quote.depositRequired)}`, {
    x: margin + 300,
    y: y - 40,
    size: 10,
    font: boldFont,
    color: theme.slate,
  });
  page.drawText(`Saldo restante: ${formatMoney(quote.balanceDue)}`, {
    x: margin + 300,
    y: y - 56,
    size: 10,
    font: boldFont,
    color: theme.slate,
  });
  page.drawText(`Contacto: ${quote.customer?.email ?? "Sin correo"}${proposal.clientPhone ? ` · ${proposal.clientPhone}` : ""}`, {
    x: margin + 300,
    y: y - 72,
    size: 10,
    font: regularFont,
    color: theme.slate,
  });
  y -= 128;

  for (const hotel of proposal.hotels) {
    ensureSpace(198);
    drawRoundedCard(page, margin, y - 176, pageWidth - margin * 2, 176, theme.white, theme.border);
    drawSectionTitle(
      page,
      hotel.name,
      `${hotel.supplierName ?? "Proveedor por confirmar"} · ${hotel.supplierCode ?? "Sin clave"} · ${hotel.roomType} · ${hotel.mealPlan}`,
      margin + 16,
      y - 22,
      pageWidth - margin * 2 - 32,
      fonts,
      theme,
    );

    let rowY = y - 52;
    rowY = drawDetailRow(page, "Codigo hotel", hotel.code || "N/D", margin + 16, rowY, 220, fonts, theme) - 10;
    rowY = drawDetailRow(
      page,
      "Fecha anticipo",
      hotel.depositDueDate || "Por definir",
      margin + 16,
      rowY,
      220,
      fonts,
      theme,
    ) - 10;
    rowY = drawDetailRow(
      page,
      "Monto anticipo",
      hotel.depositAmount || formatMoney(quote.depositRequired),
      margin + 16,
      rowY,
      220,
      fonts,
      theme,
    ) - 10;
    rowY = drawDetailRow(
      page,
      "Fecha liquidacion",
      hotel.balanceDueDate || "Por definir",
      margin + 16,
      rowY,
      220,
      fonts,
      theme,
    ) - 10;

    let rightY = y - 52;
    rightY = drawDetailRow(
      page,
      "Monto saldo",
      hotel.balanceAmount || formatMoney(quote.balanceDue),
      margin + 278,
      rightY,
      240,
      fonts,
      theme,
    ) - 10;
    rightY = drawDetailRow(
      page,
      "Precio por noche",
      hotel.pricePerNight || "Incluido en total",
      margin + 278,
      rightY,
      240,
      fonts,
      theme,
    ) - 10;
    rightY = drawDetailRow(page, "Total hotel", hotel.total, margin + 278, rightY, 240, fonts, theme) - 10;

    if (hotel.legend) {
      page.drawText(hotel.legend, {
        x: margin + 16,
        y: y - 148,
        size: 9,
        font: boldFont,
        color: theme.warning,
      });
    }

    if (hotel.note) {
      drawRoundedCard(page, margin + 16, y - 168, pageWidth - margin * 2 - 32, 24, rgb(1, 0.97, 0.87), rgb(0.96, 0.86, 0.47));
      drawWrappedText(page, hotel.note, {
        x: margin + 24,
        y: y - 158,
        maxWidth: pageWidth - margin * 2 - 48,
        font: regularFont,
        size: 8.5,
        color: theme.slate,
        lineHeight: 11,
      });
    }

    y -= 194;
  }

  if (proposal.flights?.segments?.length) {
    ensureSpace(144 + proposal.flights.segments.length * 40);
    drawRoundedCard(page, margin, y - 124 - proposal.flights.segments.length * 30, pageWidth - margin * 2, 124 + proposal.flights.segments.length * 30, theme.white, theme.border);
    drawSectionTitle(page, "Vuelos", "Tramos incluidos en la propuesta", margin + 16, y - 22, pageWidth - margin * 2 - 32, fonts, theme);
    let flightY = y - 52;

    for (const segment of proposal.flights.segments) {
      page.drawRectangle({
        x: margin + 16,
        y: flightY - 24,
        width: pageWidth - margin * 2 - 32,
        height: 24,
        color: theme.primarySoft,
        borderColor: theme.border,
        borderWidth: 1,
      });
      page.drawText(`${segment.origin} → ${segment.destination}`, {
        x: margin + 24,
        y: flightY - 9,
        size: 10,
        font: boldFont,
        color: theme.slate,
      });
      page.drawText(
        `${formatDate(segment.departureDate)} · ${segment.departureTime} - ${segment.arrivalTime} · ${segment.type}`,
        {
          x: margin + 190,
          y: flightY - 9,
          size: 9,
          font: regularFont,
          color: theme.muted,
        },
      );
      flightY -= 32;
    }

    const baggageLine = [proposal.flights.baggageLabel, proposal.flights.personalItemLabel, proposal.flights.carryOnLabel]
      .filter(Boolean)
      .join(" · ");

    if (baggageLine) {
      drawWrappedText(page, baggageLine, {
        x: margin + 16,
        y: flightY - 2,
        maxWidth: pageWidth - margin * 2 - 32,
        font: regularFont,
        size: 9,
        color: theme.muted,
      });
    }

    y = flightY - 26;
  }

  if (proposal.transfer?.hotels?.length) {
    ensureSpace(132 + proposal.transfer.hotels.length * 20);
    drawRoundedCard(page, margin, y - 96 - proposal.transfer.hotels.length * 20, pageWidth - margin * 2, 96 + proposal.transfer.hotels.length * 20, theme.white, theme.border);
    drawSectionTitle(page, "Traslados", "Servicio adicional de aeropuerto y hotel", margin + 16, y - 22, pageWidth - margin * 2 - 32, fonts, theme);
    page.drawText(`Aeropuerto: ${proposal.transfer.airport}`, {
      x: margin + 16,
      y: y - 46,
      size: 10,
      font: regularFont,
      color: theme.slate,
    });
    page.drawText(`Servicio: ${proposal.transfer.service}`, {
      x: margin + 16,
      y: y - 62,
      size: 10,
      font: regularFont,
      color: theme.slate,
    });
    page.drawText(`Pasajeros: ${proposal.transfer.adults} adultos · ${proposal.transfer.minors} menores`, {
      x: margin + 300,
      y: y - 46,
      size: 10,
      font: regularFont,
      color: theme.slate,
    });

    let transferY = y - 88;
    for (const hotel of proposal.transfer.hotels) {
      page.drawText(hotel.name, {
        x: margin + 16,
        y: transferY,
        size: 10,
        font: regularFont,
        color: theme.slate,
      });
      page.drawText(hotel.price, {
        x: pageWidth - margin - 120,
        y: transferY,
        size: 10,
        font: boldFont,
        color: theme.slate,
      });
      transferY -= 16;
    }
    y = transferY - 20;
  }

  ensureSpace(164);
  drawRoundedCard(page, margin, y - 144, pageWidth - margin * 2, 144, theme.slate, theme.slate);
  page.drawText("Resumen financiero", {
    x: margin + 16,
    y: y - 22,
    size: 15,
    font: boldFont,
    color: theme.white,
  });
  const totals = [
    ["Subtotal", formatMoney(quote.subtotal)],
    ["Descuento", formatMoney(quote.discountTotal)],
    ["Total", formatMoney(quote.grandTotal)],
    ["Anticipo", formatMoney(quote.depositRequired)],
    ["Saldo restante", formatMoney(quote.balanceDue)],
  ];
  let totalY = y - 48;

  for (const [label, value] of totals) {
    page.drawText(label, {
      x: margin + 16,
      y: totalY,
      size: 10,
      font: regularFont,
      color: rgb(0.9, 0.94, 0.98),
    });
    page.drawText(value, {
      x: pageWidth - margin - 130,
      y: totalY,
      size: 10,
      font: boldFont,
      color: theme.white,
    });
    totalY -= 18;
  }

  page.drawText("Este documento sirve como referencia comercial para seguimiento y autorizacion.", {
    x: margin + 16,
    y: y - 132,
    size: 8.5,
    font: regularFont,
    color: rgb(0.76, 0.84, 0.92),
  });
  y -= 168;

  const footerNote =
    proposal.footerNote ??
    "*Precio cotizado por el total en moneda mexicana, sujeto a disponibilidad y cambios sin previo aviso.";
  ensureSpace(40);
  drawWrappedText(page, footerNote, {
    x: margin,
    y,
    maxWidth: pageWidth - margin * 2,
    font: regularFont,
    size: 8.5,
    color: theme.muted,
    lineHeight: 11,
  });

  return pdfDoc.save();
}
