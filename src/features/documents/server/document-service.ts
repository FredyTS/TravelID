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

  const lineHeight = options.lineHeight ?? options.size * 1.45;
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

export async function generateQuoteProposalPdfBytes(quote: QuoteWithProposal) {
  const proposal = getProposalData(quote);

  if (!proposal) {
    throw new Error("La cotizacion no tiene datos de propuesta.");
  }

  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 42;
  const primary = rgb(0.11, 0.56, 0.67);
  const dark = rgb(0.12, 0.17, 0.23);
  const muted = rgb(0.41, 0.47, 0.54);
  const soft = rgb(0.95, 0.97, 0.99);
  const line = rgb(0.88, 0.91, 0.94);

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const createPage = () => {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
    page.drawRectangle({
      x: margin,
      y: pageHeight - 72,
      width: pageWidth - margin * 2,
      height: 1,
      color: line,
    });
    page.drawText(siteConfig.name, {
      x: margin,
      y: pageHeight - 52,
      size: 11,
      font: boldFont,
      color: dark,
    });
    page.drawText(`Cotizacion ${quote.quoteNumber}`, {
      x: pageWidth - margin - 170,
      y: pageHeight - 52,
      size: 10,
      font: regularFont,
      color: muted,
    });
  };

  const ensureSpace = (height: number) => {
    if (y - height < margin) {
      createPage();
    }
  };

  createPage();

  page.drawText("Propuesta de viaje", {
    x: margin,
    y: y - 36,
    size: 24,
    font: boldFont,
    color: primary,
  });
  page.drawText(quote.title, {
    x: margin,
    y: y - 66,
    size: 14,
    font: regularFont,
    color: dark,
  });
  page.drawText(`Generada el ${proposal.generatedAt}`, {
    x: margin,
    y: y - 88,
    size: 10,
    font: regularFont,
    color: muted,
  });
  y -= 118;

  page.drawRectangle({
    x: margin,
    y: y - 78,
    width: pageWidth - margin * 2,
    height: 78,
    color: soft,
  });
  page.drawText("Resumen del viaje", {
    x: margin + 14,
    y: y - 22,
    size: 12,
    font: boldFont,
    color: dark,
  });
  page.drawText(`Cliente: ${proposal.clientName}`, {
    x: margin + 14,
    y: y - 42,
    size: 10,
    font: regularFont,
    color: dark,
  });
  page.drawText(`Destino: ${proposal.destination}`, {
    x: margin + 14,
    y: y - 58,
    size: 10,
    font: regularFont,
    color: dark,
  });
  page.drawText(`Fechas: ${proposal.checkIn} a ${proposal.checkOut} · ${proposal.nights} noches`, {
    x: margin + 14,
    y: y - 74,
    size: 10,
    font: regularFont,
    color: dark,
  });
  page.drawText(`Ocupacion: ${proposal.adults} adultos · ${proposal.minors} menores${proposal.minorAges ? ` (${proposal.minorAges})` : ""}`, {
    x: margin + 290,
    y: y - 42,
    size: 10,
    font: regularFont,
    color: dark,
  });
  page.drawText(`Total: ${formatMoney(quote.grandTotal)} · Anticipo: ${formatMoney(quote.depositRequired)}`, {
    x: margin + 290,
    y: y - 58,
    size: 10,
    font: regularFont,
    color: dark,
  });
  page.drawText(`Vigencia: ${formatDate(quote.validUntil)}`, {
    x: margin + 290,
    y: y - 74,
    size: 10,
    font: regularFont,
    color: dark,
  });
  y -= 104;

  for (const hotel of proposal.hotels) {
    ensureSpace(170);
    page.drawText(hotel.name, {
      x: margin,
      y,
      size: 15,
      font: boldFont,
      color: dark,
    });
    y -= 18;
    page.drawText(
      `${hotel.supplierName ?? "Proveedor por confirmar"} · ${hotel.supplierCode ?? "Sin clave"} · ${hotel.roomType} · ${hotel.mealPlan}`,
      {
        x: margin,
        y,
        size: 10,
        font: regularFont,
        color: muted,
      },
    );
    y -= 22;

    const hotelRows = [
      ["Codigo hotel", hotel.code || "N/D"],
      ["Fecha de anticipo", hotel.depositDueDate || "Por definir"],
      ["Monto de anticipo", hotel.depositAmount || formatMoney(quote.depositRequired)],
      ["Fecha de liquidacion", hotel.balanceDueDate || "Por definir"],
      ["Monto de saldo", hotel.balanceAmount || formatMoney(quote.balanceDue)],
      ["Precio por noche", hotel.pricePerNight || "Incluido en total"],
      ["Total del hotel", hotel.total],
    ];

    for (const [label, value] of hotelRows) {
      ensureSpace(22);
      page.drawText(`${label}:`, {
        x: margin,
        y,
        size: 10,
        font: boldFont,
        color: dark,
      });
      y = drawWrappedText(page, value, {
        x: margin + 120,
        y,
        maxWidth: pageWidth - margin * 2 - 120,
        font: regularFont,
        size: 10,
        color: dark,
      });
      y -= 4;
    }

    if (hotel.legend) {
      ensureSpace(30);
      y = drawWrappedText(page, `Leyenda: ${hotel.legend}`, {
        x: margin,
        y,
        maxWidth: pageWidth - margin * 2,
        font: boldFont,
        size: 10,
        color: rgb(0.78, 0.12, 0.12),
      });
      y -= 6;
    }

    if (hotel.note) {
      ensureSpace(42);
      page.drawRectangle({
        x: margin,
        y: y - 26,
        width: pageWidth - margin * 2,
        height: 26,
        color: rgb(1, 0.97, 0.84),
      });
      y = drawWrappedText(page, hotel.note, {
        x: margin + 8,
        y: y - 16,
        maxWidth: pageWidth - margin * 2 - 16,
        font: regularFont,
        size: 9,
        color: dark,
        lineHeight: 12,
      });
      y -= 10;
    }

    y -= 8;
  }

  if (proposal.flights?.segments?.length) {
    ensureSpace(120);
    page.drawText("Vuelos", {
      x: margin,
      y,
      size: 15,
      font: boldFont,
      color: dark,
    });
    y -= 22;

    for (const segment of proposal.flights.segments) {
      ensureSpace(52);
      page.drawRectangle({
        x: margin,
        y: y - 34,
        width: pageWidth - margin * 2,
        height: 34,
        color: soft,
      });
      page.drawText(`${segment.origin} → ${segment.destination}`, {
        x: margin + 10,
        y: y - 14,
        size: 10,
        font: boldFont,
        color: dark,
      });
      page.drawText(
        `${formatDate(segment.departureDate)} · ${segment.departureTime} - ${segment.arrivalTime} · ${segment.type}`,
        {
          x: margin + 10,
          y: y - 28,
          size: 9,
          font: regularFont,
          color: muted,
        },
      );
      y -= 44;
    }

    const baggageLine = [proposal.flights.baggageLabel, proposal.flights.personalItemLabel, proposal.flights.carryOnLabel]
      .filter(Boolean)
      .join(" · ");
    if (baggageLine) {
      ensureSpace(24);
      y = drawWrappedText(page, baggageLine, {
        x: margin,
        y,
        maxWidth: pageWidth - margin * 2,
        font: regularFont,
        size: 10,
        color: muted,
      });
      y -= 8;
    }
  }

  if (proposal.transfer?.hotels?.length) {
    ensureSpace(120);
    page.drawText("Traslados", {
      x: margin,
      y,
      size: 15,
      font: boldFont,
      color: dark,
    });
    y -= 18;
    page.drawText(`Aeropuerto: ${proposal.transfer.airport}`, {
      x: margin,
      y,
      size: 10,
      font: regularFont,
      color: dark,
    });
    y -= 14;
    page.drawText(`Servicio: ${proposal.transfer.service}`, {
      x: margin,
      y,
      size: 10,
      font: regularFont,
      color: dark,
    });
    y -= 20;
    for (const hotel of proposal.transfer.hotels) {
      ensureSpace(24);
      page.drawText(hotel.name, {
        x: margin,
        y,
        size: 10,
        font: regularFont,
        color: dark,
      });
      page.drawText(hotel.price, {
        x: pageWidth - margin - 120,
        y,
        size: 10,
        font: boldFont,
        color: dark,
      });
      y -= 16;
    }
    y -= 8;
  }

  ensureSpace(88);
  page.drawText("Resumen financiero", {
    x: margin,
    y,
    size: 15,
    font: boldFont,
    color: dark,
  });
  y -= 22;
  const totals = [
    ["Subtotal", formatMoney(quote.subtotal)],
    ["Descuento", formatMoney(quote.discountTotal)],
    ["Total", formatMoney(quote.grandTotal)],
    ["Anticipo", formatMoney(quote.depositRequired)],
    ["Saldo", formatMoney(quote.balanceDue)],
  ];

  for (const [label, value] of totals) {
    ensureSpace(18);
    page.drawText(label, {
      x: margin,
      y,
      size: 10,
      font: regularFont,
      color: dark,
    });
    page.drawText(value, {
      x: pageWidth - margin - 120,
      y,
      size: 10,
      font: boldFont,
      color: dark,
    });
    y -= 15;
  }

  if (proposal.footerNote) {
    ensureSpace(46);
    y -= 8;
    y = drawWrappedText(page, proposal.footerNote, {
      x: margin,
      y,
      maxWidth: pageWidth - margin * 2,
      font: regularFont,
      size: 9,
      color: muted,
      lineHeight: 12,
    });
  }

  return pdfDoc.save();
}
