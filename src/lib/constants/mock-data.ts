export type MarketingPackage = {
  id: string;
  slug: string;
  name: string;
  destination: string;
  location: string;
  summary: string;
  description: string;
  duration: string;
  priceFrom: number;
  travelType: string;
  featured?: boolean;
  highlight: string;
  heroImage: string;
  gallery: string[];
  tags: string[];
  includedTravelers: string;
  directBookable: boolean;
  reservationNote: string;
};

export type PromotionCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  discountLabel: string;
  validUntil: string;
};

export const marketingPackages: MarketingPackage[] = [
  {
    id: "pkg-cancun",
    slug: "escapada-cancun-all-inclusive",
    name: "Escapada Cancun All Inclusive",
    destination: "Cancun",
    location: "Caribe Mexicano",
    summary: "4 noches frente al mar con traslados, hotel all inclusive y asistencia antes de viajar.",
    description:
      "Ideal para parejas o familias que buscan descanso, playa y una experiencia fluida desde la cotizacion hasta la entrega de vouchers.",
    duration: "5 dias / 4 noches",
    priceFrom: 12990,
    travelType: "Playa",
    featured: true,
    highlight: "Anticipo desde $3,500 MXN",
    heroImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=900&q=80",
    ],
    tags: ["All inclusive", "Traslados", "Playa"],
    includedTravelers: "2 adultos",
    directBookable: true,
    reservationNote: "Si viajan 2 adultos bajo estas condiciones, pueden reservar de inmediato.",
  },
  {
    id: "pkg-riviera",
    slug: "riviera-maya-familiar",
    name: "Riviera Maya Familiar",
    destination: "Riviera Maya",
    location: "Quintana Roo",
    summary: "Hotel familiar, desayunos, traslados y agenda pensada para viajar con ninos.",
    description:
      "Una opcion comoda para familias que quieren disfrutar el Caribe con una planeacion clara, pagos flexibles y documentos centralizados.",
    duration: "6 dias / 5 noches",
    priceFrom: 15450,
    travelType: "Familiar",
    featured: true,
    highlight: "Promocion vigente para verano",
    heroImage:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    ],
    tags: ["Familiar", "Desayuno incluido", "Asistencia"],
    includedTravelers: "2 adultos y 2 menores",
    directBookable: true,
    reservationNote: "Reservable tal cual para una familia de 2 adultos y 2 menores.",
  },
  {
    id: "pkg-pdc",
    slug: "playa-del-carmen-romantico",
    name: "Playa del Carmen Romantico",
    destination: "Playa del Carmen",
    location: "Riviera Maya",
    summary: "Paquete boutique para luna de miel, aniversario o escapada en pareja.",
    description:
      "Una propuesta pensada para parejas que quieren una estancia especial, traslados privados y acompanamiento durante toda la reserva.",
    duration: "4 dias / 3 noches",
    priceFrom: 18900,
    travelType: "Luna de miel",
    highlight: "Upgrade sujeto a disponibilidad",
    heroImage:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=900&q=80",
    ],
    tags: ["Parejas", "Boutique", "Traslado privado"],
    includedTravelers: "2 adultos",
    directBookable: true,
    reservationNote: "Ideal para pareja; si cambian viajeros o condiciones, conviene cotizacion personalizada.",
  },
];

export const promotions: PromotionCard[] = [
  {
    id: "promo-verano",
    slug: "verano-caribe",
    title: "Verano Caribe MX",
    description: "Descuento de lanzamiento para paquetes seleccionados del Caribe mexicano.",
    discountLabel: "Hasta 12% OFF",
    validUntil: "31 de agosto de 2026",
  },
  {
    id: "promo-anticipo",
    slug: "anticipo-flexible",
    title: "Anticipo Flexible",
    description: "Reserva con anticipo desde 25% en viajes con salida dentro de 90 dias.",
    discountLabel: "Desde 25% de anticipo",
    validUntil: "15 de septiembre de 2026",
  },
];

export const adminStats = [
  { label: "Leads nuevos", value: "24", hint: "7 llegaron hoy" },
  { label: "Cotizaciones abiertas", value: "18", hint: "5 requieren seguimiento" },
  { label: "Pedidos activos", value: "12", hint: "3 por documentar" },
  { label: "Cobranza pendiente", value: "$126,480", hint: "MXN balance pendiente" },
];

export const portalTrips = [
  {
    id: "ord-demo-1",
    title: "Escapada Cancun All Inclusive",
    status: "Anticipo pagado",
    balance: "$9,490 MXN",
    departure: "12 ago 2026",
  },
  {
    id: "ord-demo-2",
    title: "Riviera Maya Familiar",
    status: "Documentos pendientes",
    balance: "$0 MXN",
    departure: "03 dic 2026",
  },
];

export const quoteBuilderSections = [
  {
    title: "Datos del cliente",
    description: "Nombre, contacto, origen del viaje y canal de entrada.",
  },
  {
    title: "Viajeros",
    description: "Adultos, menores, edades y perfiles de viaje.",
  },
  {
    title: "Conceptos",
    description: "Hospedaje, vuelos, traslados, tours y cargos adicionales.",
  },
  {
    title: "Cobranza",
    description: "Anticipo, saldo, vigencia y condiciones visibles al cliente.",
  },
];

export const quoteLineItems = [
  ["Hospedaje 4 noches", "2", "$4,250", "$8,500"],
  ["Traslado aeropuerto - hotel", "1", "$1,200", "$1,200"],
  ["Seguro de viaje", "2", "$495", "$990"],
  ["Fee administrativo", "1", "$350", "$350"],
];

export const orderTimeline = [
  { title: "Pedido confirmado", detail: "El cliente acepto la propuesta y se genero el pedido." },
  { title: "Anticipo recibido", detail: "Pago parcial registrado y saldo actualizado." },
  { title: "Documentos pendientes", detail: "Falta cargar voucher de hotel y resumen final." },
];
