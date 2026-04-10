import { siteConfig } from "@/config/site";
import { getEmailSettings } from "@/features/settings/server/settings-service";
import { escapeHtml, renderTemplate } from "@/features/settings/server/template-engine";
import { getDefaultSiteTemplateVariables } from "@/features/settings/server/template-settings";

export type QuoteHotelProposal = {
  supplierCode?: string;
  supplierName?: string;
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
            <tr><th>Proveedor</th><td>${escapeHtml(hotel.supplierName ?? "Por confirmar")}</td><th>Clave proveedor</th><td>${escapeHtml(hotel.supplierCode ?? "N/A")}</td></tr>
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

export async function renderQuoteProposalHtml(data: QuoteProposalData, input?: {
  quoteNumber?: string;
  quoteTitle?: string;
  subtotal?: string;
  discountTotal?: string;
  grandTotal?: string;
  depositRequired?: string;
  balanceDue?: string;
  validUntil?: string;
}) {
  const settings = await getEmailSettings();
  const footerNote =
    data.footerNote ?? "*Precio cotizado por el total en moneda mexicana, sujeto a disponibilidad y cambios sin previo aviso.";

  return renderTemplate(settings.templates.quoteProposalHtmlTemplate, {
    ...getDefaultSiteTemplateVariables(),
    quote_number: escapeHtml(input?.quoteNumber ?? ""),
    quote_title: escapeHtml(input?.quoteTitle ?? "Cotizacion de viaje"),
    generated_at: escapeHtml(data.generatedAt),
    client_name: escapeHtml(data.clientName),
    client_phone: data.clientPhone ? ` - ${escapeHtml(data.clientPhone)}` : "",
    destination: escapeHtml(data.destination),
    check_in: escapeHtml(data.checkIn),
    check_out: escapeHtml(data.checkOut),
    nights: String(data.nights),
    adults: String(data.adults),
    minors: String(data.minors),
    minor_ages: data.minorAges ? ` (${escapeHtml(data.minorAges)} anos)` : "",
    subtotal: escapeHtml(input?.subtotal ?? ""),
    discount_total: escapeHtml(input?.discountTotal ?? ""),
    grand_total: escapeHtml(input?.grandTotal ?? ""),
    deposit_required: escapeHtml(input?.depositRequired ?? ""),
    balance_due: escapeHtml(input?.balanceDue ?? ""),
    valid_until: escapeHtml(input?.validUntil ?? ""),
    footer_note: escapeHtml(footerNote),
    hotels_html: renderHotels(data.hotels),
    flights_html: renderFlights(data.flights),
    transfer_html: renderTransfer(data.transfer),
    support_email: escapeHtml(siteConfig.supportEmail),
    support_phone: escapeHtml(siteConfig.phone),
    site_name: escapeHtml(siteConfig.name),
  }).trim();
}
