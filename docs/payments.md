# Payments Flow

## Objetivo

Permitir cobrar anticipo o saldo desde un pedido usando Stripe Checkout.

## Flujo actual

1. El admin entra al detalle de un pedido.
2. En cada `PaymentSchedule` pendiente puede iniciar un checkout Stripe.
3. Se crea una `Checkout Session`.
4. Se registra un `Payment` en estado `PENDING`.
5. Stripe llama al webhook `checkout.session.completed`.
6. El sistema actualiza el `Payment` a `SUCCEEDED`.
7. Se recalcula:
   - `Order.paidTotal`
   - `Order.balanceDue`
   - `Order.status`
   - `PaymentSchedule.status`

## Variables necesarias

```env
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Rutas relacionadas

- `POST /api/orders/[id]/checkout`
- `POST /api/stripe/webhook`

## Pendientes

- exponer checkout también desde el portal del cliente
- soportar pagos parciales custom
- soportar refunds administrativos
- mostrar recibos y comprobantes al cliente
