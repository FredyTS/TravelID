import { siteConfig } from "@/config/site";

export type QuoteHotelProposal = {
  name: string;
  code?: string;
  image?: string;
  mealPlan: string;
  roomType: string;
  depositDueDate?: string;
  depositAmount?: string;
  balanceDueDate?: string;
  balanceAmount?: string;
  pricePerNight?: string;
  total: string;
  legend?: string;
  note?: string;
};

export type QuoteFlightSegment = {
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  type: string;
};

export type QuoteFlightProposal = {
  baggageLabel: string;
  personalItemLabel?: string;
  carryOnLabel?: string;
  segments: QuoteFlightSegment[];
};

export type QuoteTransferHotel = {
  name: string;
  price: string;
};

export type QuoteTransferProposal = {
  airport: string;
  adults: number;
  minors: number;
  service: string;
  hotels: QuoteTransferHotel[];
};

export type QuoteProposalData = {
  clientName: string;
  clientPhone?: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  minors: number;
  minorAges?: string;
  generatedAt: string;
  footerNote?: string;
  hotels: QuoteHotelProposal[];
  flights?: QuoteFlightProposal | null;
  transfer?: QuoteTransferProposal | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderHotels(hotels: QuoteHotelProposal[]) {
  return hotels
    .map(
      (hotel, index) => `
        <section class="${index > 0 ? "page-break " : ""}hotel-card">
          <div class="section-title">
            <div>${escapeHtml(hotel.name)}</div>
            <div class="muted">${escapeHtml(hotel.code ?? "")}</div>
          </div>
          ${
            hotel.image
              ? `<img src="${escapeHtml(hotel.image)}" alt="${escapeHtml(hotel.name)}" class="hero-image" />`
              : ""
          }
          <table class="table">
            <tr><th>Plan</th><td>${escapeHtml(hotel.mealPlan)}</td><th>Habitacion</th><td>${escapeHtml(hotel.roomType)}</td></tr>
            <tr><th>Fecha anticipo</th><td>${escapeHtml(hotel.depositDueDate ?? "Por definir")}</td><th>Anticipo</th><td>${escapeHtml(hotel.depositAmount ?? "Por definir")}</td></tr>
            <tr><th>Fecha liquidacion</th><td>${escapeHtml(hotel.balanceDueDate ?? "Por definir")}</td><th>Saldo</th><td>${escapeHtml(hotel.balanceAmount ?? "Por definir")}</td></tr>
            <tr><th>Precio por noche</th><td>${escapeHtml(hotel.pricePerNight ?? "Incluido en total")}</td><th>Total</th><td><strong>${escapeHtml(hotel.total)}</strong></td></tr>
          </table>
          ${hotel.legend ? `<p class="alert">${escapeHtml(hotel.legend)}</p>` : ""}
          ${hotel.note ? `<div class="note">${escapeHtml(hotel.note)}</div>` : ""}
        </section>
      `,
    )
    .join("");
}

function renderFlights(flights?: QuoteFlightProposal | null) {
  if (!flights || flights.segments.length === 0) {
    return "";
  }

  const first = flights.segments[0];
  const segments = flights.segments
    .map(
      (segment) => `
        <div class="flight-segment">
          <div class="flight-date">
            <div>${escapeHtml(new Date(segment.departureDate).toLocaleDateString("es-MX", { weekday: "short" }))}</div>
            <div>${escapeHtml(new Date(segment.departureDate).toLocaleDateString("es-MX", { day: "numeric", month: "short" }))}</div>
          </div>
          <div class="flight-route">
            <div class="time">${escapeHtml(segment.departureTime)}</div>
            <div>${escapeHtml(segment.origin)} → ${escapeHtml(segment.destination)}</div>
            <div class="time">${escapeHtml(segment.arrivalTime)}</div>
          </div>
          <div class="muted">${escapeHtml(segment.type)}</div>
        </div>
      `,
    )
    .join("");

  return `
    <section class="page-break flight-box">
      <div class="flight-header">${escapeHtml(first.origin)} → ${escapeHtml(first.destination)}</div>
      ${segments}
      <div class="flight-footer">
        <div>${escapeHtml(flights.baggageLabel)}</div>
        <div class="muted">${escapeHtml(flights.personalItemLabel ?? "")} ${escapeHtml(flights.carryOnLabel ?? "")}</div>
      </div>
    </section>
  `;
}

function renderTransfer(transfer?: QuoteTransferProposal | null) {
  if (!transfer) {
    return "";
  }

  const hotelRows = transfer.hotels
    .map(
      (hotel) => `
        <tr>
          <td>${escapeHtml(hotel.name)}</td>
          <td class="align-right">${escapeHtml(hotel.price)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <section class="page-break transfer-card">
      <h3 class="transfer-title">Traslado aeropuerto - hotel - aeropuerto</h3>
      <div class="transfer-grid">
        <strong>Aeropuerto:</strong><span>${escapeHtml(transfer.airport)}</span>
        <strong>Adultos:</strong><span>${transfer.adults}</span>
        <strong>Menores:</strong><span>${transfer.minors}</span>
        <strong>Servicio:</strong><span>${escapeHtml(transfer.service)}</span>
      </div>
      <p class="muted align-right">*Cotizacion de traslados</p>
      <table class="table">
        <thead>
          <tr><th>Hotel</th><th class="align-right">Precio</th></tr>
        </thead>
        <tbody>${hotelRows}</tbody>
      </table>
    </section>
  `;
}

export function renderQuoteProposalHtml(data: QuoteProposalData) {
  const footerNote =
    data.footerNote ??
    "*Precio cotizado por el total en moneda mexicana, sujeto a disponibilidad y cambios sin previo aviso.";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Cotizacion de viaje</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');
    body { font-family: 'Open Sans', sans-serif; margin: 0; background: #fff; color: #243244; }
    .page-header,.page-footer { position: fixed; left: 0; right: 0; background: #fff; font-size: 10pt; }
    .page-header { top: 0; border-bottom: 2px solid #1ba7c7; padding: 12px 24px; }
    .page-footer { bottom: 0; border-top: 2px solid #1ba7c7; padding: 12px 24px; text-align: center; }
    .content { padding: 110px 40px 90px; }
    .brand-grid { width: 100%; border-collapse: collapse; }
    .brand-mark { width: 84px; height: 84px; border-radius: 22px; background: linear-gradient(135deg,#1ba7c7,#0f766e); color: #fff; display:flex; align-items:center; justify-content:center; font-size: 26px; font-weight: 700; }
    .header-cell { vertical-align: top; }
    .header-info { padding-left: 18px; }
    .header-info span { display:block; margin-bottom: 4px; }
    .section-title { display:flex; justify-content:space-between; align-items:center; font-size:18px; font-weight:700; border-bottom:1px solid #dce5ec; padding-bottom:8px; margin-bottom:14px; }
    .table { width:100%; border-collapse: collapse; margin-top: 12px; }
    .table th { background:#e9f1fa; padding:10px; text-align:left; border-bottom:2px solid #1ba7c7; }
    .table td { padding:10px; border-bottom:1px solid #ecf0f3; }
    .hero-image { width:100%; max-height:220px; object-fit:cover; border-radius:10px; margin-bottom:14px; }
    .hotel-card,.flight-box,.transfer-card { background:#fff; border-radius:14px; box-shadow:0 10px 36px rgba(15,23,42,0.08); padding:20px; margin-bottom:36px; page-break-inside: avoid; }
    .alert { color:#c81e1e; font-weight:700; text-align:right; margin-top:14px; }
    .note { background:#fff8d6; border-left:4px solid #ffcc00; padding:10px 12px; margin-top:12px; font-size:14px; }
    .muted { color:#64748b; }
    .align-right { text-align:right; }
    .flight-header { font-size:17px; font-weight:700; padding-bottom:12px; border-bottom:1px solid #e2e8f0; }
    .flight-segment { display:flex; justify-content:space-between; gap:16px; align-items:center; padding:12px 0; border-bottom:1px solid #eef2f7; }
    .flight-date { background:#004d26; color:#fff; padding:8px 10px; border-radius:8px; min-width:82px; text-align:center; }
    .flight-route { flex:1; text-align:center; }
    .flight-route .time { font-weight:700; }
    .flight-footer { background:#009e60; color:#fff; margin-top:12px; border-radius:10px; padding:12px 14px; display:flex; justify-content:space-between; gap:12px; }
    .transfer-title { text-align:center; text-transform:uppercase; border-bottom:2px solid #1ba7c7; padding-bottom:8px; margin-top:0; }
    .transfer-grid { display:grid; grid-template-columns: 160px 1fr; gap:8px 12px; margin-bottom:12px; }
    .page-break { page-break-before: always; }
    @media print {
      .content { padding: 90px 24px 70px; }
      .page-header,.page-footer { font-size:9pt; }
    }
  </style>
</head>
<body>
  <div class="page-header">
    <table class="brand-grid">
      <tr>
        <td class="header-cell" style="width:84px;">
          <div class="brand-mark">AT</div>
        </td>
        <td class="header-cell header-info">
          <span><strong>${escapeHtml(siteConfig.name)}</strong></span>
          <span>${escapeHtml(siteConfig.supportEmail)}</span>
          <span><strong>Tel:</strong> ${escapeHtml(siteConfig.phone)}</span>
        </td>
        <td class="header-cell align-right">
          Fecha: ${escapeHtml(data.generatedAt)}
        </td>
      </tr>
    </table>
  </div>

  <div class="content">
    <h2 style="text-align:center; color:#1ba7c7;">Solicitud de cotizacion</h2>
    <div>
      <p><strong>Cliente:</strong> ${escapeHtml(data.clientName)}${data.clientPhone ? ` - ${escapeHtml(data.clientPhone)}` : ""}</p>
      <p><strong>Destino:</strong> ${escapeHtml(data.destination)}</p>
      <p><strong>Fechas:</strong> Check-in: ${escapeHtml(data.checkIn)} &nbsp;&nbsp;&nbsp; Check-out: ${escapeHtml(data.checkOut)}</p>
      <p><strong>Ocupacion:</strong> ${data.adults} Adultos, ${data.minors} Menores${data.minorAges ? ` (${escapeHtml(data.minorAges)} anos)` : ""} &nbsp;&nbsp;&nbsp; <strong>Noches:</strong> ${data.nights}</p>
    </div>
    ${renderHotels(data.hotels)}
    ${renderFlights(data.flights)}
    ${renderTransfer(data.transfer)}
  </div>

  <div class="page-footer">${escapeHtml(footerNote)}</div>
</body>
</html>
  `.trim();
}
