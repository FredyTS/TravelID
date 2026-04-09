# Alondra Travel MX

Plataforma web full-stack para una agencia de viajes enfocada en vender paquetes, convertir cotizaciones en pedidos, cobrar anticipos y dar seguimiento al viaje desde un portal del cliente.

## Qué incluye hoy

### Sitio público
- home comercial para promocionar paquetes
- catálogo con detalle, promociones y CTA de WhatsApp
- reserva directa cuando el paquete aplica tal cual
- cotización personalizada cuando cambian condiciones

### Portal del cliente
- acceso por email con magic link
- dashboard con pedidos, saldo, documentos y mensajes
- detalle de viaje con pagos, actualizaciones, documentos e inbox
- historial de pagos y documentos visibles

### Panel admin
- dashboard operativo con métricas reales
- catalogos extendidos para hoteles, proveedores, planes, amenidades y habitaciones
- gestión de cotizaciones y pedidos
- cotizaciones con propuesta HTML detallada para cliente
- inbox de conversaciones cliente-admin
- detalle de pedido con cobranza, timeline, documentos y mensajes

### Plataforma
- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS v4`
- `Prisma + PostgreSQL`
- `Auth.js / NextAuth`
- `Mercado Pago`
- `Resend`

## Stack y arquitectura

- monolito modular full-stack
- `App Router`
- `Prisma` para acceso a datos
- `PostgreSQL` como base principal
- `Mercado Pago` para cobros en México
- `Resend` para magic links y avisos

## Variables de entorno

Copia `.env.example` a `.env` y configura al menos esto:

```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/alondra_travel_mx?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="un-secreto-largo"

SEED_SUPERADMIN_EMAIL="admin@alondratravelmx.com"
SEED_SUPERADMIN_PASSWORD="ChangeMe123!"

MERCADO_PAGO_ACCESS_TOKEN=""
MERCADO_PAGO_WEBHOOK_SECRET=""
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=""

RESEND_API_KEY=""
EMAIL_FROM="Alondra Travel MX <noreply@alondratravelmx.com>"
```

## Cómo correrlo localmente

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Acceso inicial

Admin:
- URL: [http://localhost:3000/login](http://localhost:3000/login)
- Email: `admin@alondratravelmx.com`
- Password: `ChangeMe123!`

Cliente:
- entra en la misma pantalla con su email
- recibe un magic link para abrir su portal

## Scripts útiles

```bash
npm run dev
npm run lint
npm run build
npm run db:generate
npm run db:push
npm run db:seed
```

## Estado funcional actual

Ya está cubierto:
- home comercial y catálogo público
- catalogo interno enriquecido para hoteles y paquetes
- reserva directa y solicitud de cotización
- creación de cotizaciones desde admin
- generación de propuesta HTML guardada dentro de la cotización
- conversión de cotización a pedido
- portal del cliente con pagos, documentos y mensajes
- inbox admin-cliente
- integración base de Mercado Pago por preferencia hospedada

Pendientes siguientes:
- CRUD completo de catálogo desde base de datos
- publicación de documentos y vouchers desde admin
- aprobación del cliente sobre cotización desde portal
- importación inicial desde Excel

## Documentación adicional

- [Arranque local](./docs/setup-local.md)
- [Resumen funcional](./docs/project-overview.md)
- [Catalogos extendidos](./docs/catalog-model.md)
- [Pagos](./docs/payments.md)
