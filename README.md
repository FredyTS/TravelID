# Alondra Travel MX

Plataforma web full-stack para una agencia de viajes enfocada en:

- promocionar paquetes vacacionales
- captar leads y solicitudes
- generar cotizaciones personalizadas
- convertir cotizaciones a pedidos
- gestionar reservas y pagos
- dar seguimiento al viaje desde un portal del cliente

## Qué incluye hoy

### Cara pública
- home comercial con imágenes y promociones
- catálogo de paquetes
- detalle de paquete con galería
- flujo de `reserva directa` cuando el paquete aplica tal cual
- flujo de `cotización personalizada` cuando cambian viajeros o condiciones
- páginas de promociones, contacto y FAQ

### Cara interna
- login administrativo
- panel de administración
- creación de cotizaciones
- listado y detalle de cotizaciones
- conversión de cotización a pedido
- listado y detalle de pedidos

### Plataforma
- `Next.js` App Router
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui`
- `Prisma + PostgreSQL`
- `NextAuth`
- scaffold de Stripe webhook
- estructura preparada para portal del cliente, documentos y pagos

## Regla comercial actual

Cada paquete publicado puede indicar para cuántos viajeros aplica el precio mostrado.

- Si al cliente le funcionan esas condiciones, puede ir por `reserva directa`.
- Si necesita cambiar número de adultos, menores, edades, fechas, origen o condiciones, debe pasar por `cotización personalizada`.

## Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS v4`
- `Prisma`
- `PostgreSQL`
- `NextAuth`
- `Stripe`

## Estructura principal

```text
src/
  app/
    (public)/
    (auth)/
    admin/
    portal/
    api/
  components/
  features/
    auth/
    orders/
    quotes/
    catalog/
  lib/
  config/
prisma/
docs/
scripts/
```

## Cómo correrlo localmente

1. Copia `.env.example` a `.env`
2. Configura al menos estas variables:

```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/alondra_travel_mx?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="un-secreto-largo"
SEED_SUPERADMIN_EMAIL="admin@alondratravelmx.com"
SEED_SUPERADMIN_PASSWORD="ChangeMe123!"
```

3. Instala dependencias:

```bash
npm install
```

4. Genera Prisma Client:

```bash
npm run db:generate
```

5. Crea/actualiza el esquema en la base:

```bash
npm run db:push
```

6. Carga datos base:

```bash
npm run db:seed
```

7. Levanta la app:

```bash
npm run dev
```

## Acceso inicial al admin

- URL: [http://localhost:3000/login](http://localhost:3000/login)
- Email: `admin@alondratravelmx.com`
- Password: `ChangeMe123!`

Puedes cambiar estas credenciales desde `.env` antes de correr el seed.

## Scripts útiles

```bash
npm run dev
npm run lint
npm run build
npm run db:generate
npm run db:push
npm run db:seed
```

## Estado actual del desarrollo

Ya funciona:
- scaffold comercial del sitio
- persistencia básica de reserva directa
- persistencia de solicitudes de cotización
- creación de cotización desde admin
- conversión de cotización a pedido
- lectura real de cotizaciones y pedidos desde Prisma

Pendiente siguiente:
- checkout real con Stripe
- registro automático de pagos y saldo
- portal cliente conectado a datos reales
- catálogo administrable desde base de datos
- documentos y vouchers reales

## Documentación adicional

- Guía de arranque local: [docs/setup-local.md](./docs/setup-local.md)
- Resumen funcional del proyecto: [docs/project-overview.md](./docs/project-overview.md)
- Flujo de pagos: [docs/payments.md](./docs/payments.md)
