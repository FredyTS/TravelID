export const siteConfig = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Alondra Travel MX",
  description:
    "Plataforma de ventas, cotizaciones, reservas y portal del cliente para una agencia de viajes moderna en Mexico.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/5215555555555",
  supportEmail: "hola@alondratravelmx.com",
  phone: "+52 55 5555 5555",
  locale: "es-MX",
};
