import { siteConfig } from "@/config/site";

export const emailTemplateTagGroups = [
  {
    title: "Comunes",
    tags: ["{{site_name}}", "{{support_email}}", "{{support_phone}}"],
  },
  {
    title: "Accion principal",
    tags: ["{{cta_label}}", "{{cta_url}}", "{{cta_button}}", "{{cta_link}}"],
  },
  {
    title: "Accion secundaria",
    tags: ["{{secondary_cta_label}}", "{{secondary_cta_url}}", "{{secondary_cta_link}}"],
  },
  {
    title: "Contenido",
    tags: ["{{greeting}}", "{{intro}}", "{{preview}}", "{{subject}}", "{{host}}"],
  },
] as const;

export const quoteTemplateTagGroups = [
  {
    title: "Marca y documento",
    tags: [
      "{{site_name}}",
      "{{support_email}}",
      "{{support_phone}}",
      "{{quote_number}}",
      "{{quote_title}}",
      "{{generated_at}}",
    ],
  },
  {
    title: "Cliente y viaje",
    tags: [
      "{{client_name}}",
      "{{client_phone}}",
      "{{destination}}",
      "{{check_in}}",
      "{{check_out}}",
      "{{nights}}",
      "{{adults}}",
      "{{minors}}",
      "{{minor_ages}}",
      "{{valid_until}}",
    ],
  },
  {
    title: "Montos y bloques",
    tags: [
      "{{subtotal}}",
      "{{discount_total}}",
      "{{grand_total}}",
      "{{deposit_required}}",
      "{{balance_due}}",
      "{{hotels_html}}",
      "{{flights_html}}",
      "{{transfer_html}}",
      "{{footer_note}}",
    ],
  },
  {
    title: "Hotel individual",
    tags: [
      "{{hotel_name}}",
      "{{hotel_code}}",
      "{{hotel_supplier_name}}",
      "{{hotel_supplier_code}}",
      "{{hotel_room_type}}",
      "{{hotel_meal_plan}}",
    ],
  },
] as const;

export function getDefaultMagicLinkEmailTemplate() {
  return {
    subject: "Tu acceso a {{site_name}}",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto">
        <p style="margin:0 0 16px">{{greeting}}</p>
        <h2 style="margin:0 0 12px;font-size:28px;color:#0f172a">Tu portal de viaje esta listo</h2>
        <p style="margin:0 0 16px">Haz clic en el siguiente boton para entrar a tu cuenta en {{host}}.</p>
        <p style="margin:24px 0">{{cta_button}}</p>
        <p style="margin:0 0 8px">Si el boton no abre, usa este enlace:</p>
        <p style="margin:0 0 20px;word-break:break-word">{{cta_link}}</p>
        <p style="margin:0;color:#64748b;font-size:14px">Soporte: <a href="mailto:{{support_email}}">{{support_email}}</a></p>
      </div>
    `.trim(),
  };
}

export function getDefaultConversationEmailTemplate() {
  return {
    subject: "{{site_name}} · {{preview}}",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto">
        <p style="margin:0 0 16px">{{greeting}}</p>
        <p style="margin:0 0 20px">{{preview}}</p>
        <p style="margin:24px 0">{{cta_button}}</p>
        <p style="margin:0 0 8px">Si el boton no abre, entra aqui:</p>
        <p style="margin:0;word-break:break-word">{{cta_link}}</p>
      </div>
    `.trim(),
  };
}

export function getDefaultPortalTrackingEmailTemplate() {
  return {
    subject: "{{site_name}} · Seguimiento de tu viaje",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto">
        <div style="padding:24px 0 12px">
          <p style="margin:0;font-size:14px;color:#0f766e;font-weight:700;letter-spacing:0.12em;text-transform:uppercase">{{site_name}}</p>
          <h2 style="margin:12px 0 0;font-size:28px;line-height:1.2;color:#0f172a">Seguimiento de tu viaje</h2>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:24px;padding:24px">
          <p style="margin:0 0 16px">{{greeting}}</p>
          <p style="margin:0 0 20px">{{intro}}</p>
          <p style="margin:24px 0">{{cta_button}}</p>
          <div>{{secondary_cta_link}}</div>
          <p style="margin:20px 0 8px;color:#475569;font-size:14px">Si el boton no abre, copia este enlace:</p>
          <p style="margin:0;word-break:break-word">{{cta_link}}</p>
        </div>
      </div>
    `.trim(),
  };
}

export function getDefaultQuoteProposalHtmlTemplate() {
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
          <span><strong>{{site_name}}</strong></span>
          <span>{{support_email}}</span>
          <span><strong>Tel:</strong> {{support_phone}}</span>
        </td>
        <td class="header-cell align-right">
          Fecha: {{generated_at}}
        </td>
      </tr>
    </table>
  </div>
  <div class="content">
    <h2 style="text-align:center; color:#1ba7c7;">Solicitud de cotizacion</h2>
    <div>
      <p><strong>Cliente:</strong> {{client_name}}{{client_phone}}</p>
      <p><strong>Destino:</strong> {{destination}}</p>
      <p><strong>Fechas:</strong> Check-in: {{check_in}} &nbsp;&nbsp;&nbsp; Check-out: {{check_out}}</p>
      <p><strong>Ocupacion:</strong> {{adults}} Adultos, {{minors}} Menores{{minor_ages}} &nbsp;&nbsp;&nbsp; <strong>Noches:</strong> {{nights}}</p>
    </div>
    {{hotels_html}}
    {{flights_html}}
    {{transfer_html}}
  </div>
  <div class="page-footer">{{footer_note}}</div>
</body>
</html>
  `.trim();
}

export function getDefaultQuotePdfTemplate() {
  return {
    documentTitle: "{{quote_title}}",
    documentSubtitle: "Documento comercial para seguimiento, aprobacion y pagos del viaje.",
    tripSectionTitle: "Datos del viaje",
    hotelsSectionTitle: "Hoteles",
    hotelsSectionSubtitle: "Detalles del hospedaje y condiciones comerciales.",
    flightsSectionTitle: "Vuelos",
    flightsSectionSubtitle: "Tramos incluidos en la propuesta.",
    transfersSectionTitle: "Traslados",
    transfersSectionSubtitle: "Servicio adicional de aeropuerto y hotel.",
    financialSummaryTitle: "Resumen financiero",
    financialSummaryNote: "Este documento sirve como referencia comercial para seguimiento y autorizacion.",
    footerNote: "{{footer_note}}",
  };
}

export function getDefaultSiteTemplateVariables() {
  return {
    site_name: siteConfig.name,
    support_email: siteConfig.supportEmail,
    support_phone: siteConfig.phone,
  };
}
