# Setup local

## Variables mínimas

1. Copia `.env.example` a `.env`
2. Configura al menos:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `SEED_SUPERADMIN_EMAIL`
   - `SEED_SUPERADMIN_PASSWORD`
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `RESEND_API_KEY` si quieres magic links reales por correo

## Comandos

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Credenciales seed del admin

- Email: `admin@alondratravelmx.com`
- Password: `ChangeMe123!`

## Flujo de acceso

- Admin: entra por credenciales en `/login`
- Cliente: entra con su email y recibe magic link

## Notas

- Si `RESEND_API_KEY` no está configurado, los correos se simulan en consola.
- Si `MERCADO_PAGO_ACCESS_TOKEN` no está configurado, la creación de links de pago fallará.
- Después de cambiar `prisma/schema.prisma`, vuelve a correr `npm run db:generate` y `npm run db:push`.
