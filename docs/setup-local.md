# Setup local

## Variables

1. Copia `.env.example` a `.env`
2. Configura al menos:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `SEED_SUPERADMIN_EMAIL`
   - `SEED_SUPERADMIN_PASSWORD`

## Comandos

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Credenciales seed

- Email: `admin@alondratravelmx.com`
- Password: `ChangeMe123!`

## Pendientes de integracion

- Conectar login UI a `signIn`
- Conectar Stripe checkout session
- Generar URLs firmadas reales para R2/S3
- Agregar importadores desde Excel
