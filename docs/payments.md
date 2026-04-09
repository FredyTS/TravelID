# Payments Flow

## Objetivo

Permitir que el cliente pague su anticipo o saldo directamente desde su portal, usando una pasarela enfocada en México.

## Pasarela actual

`Mercado Pago`

La app genera una preferencia hospedada y redirige al cliente a Mercado Pago para completar el cobro.

## Flujo actual

1. El pedido tiene uno o más `PaymentSchedule` pendientes.
2. Desde el portal del cliente o desde el detalle del pedido en admin se genera un link de pago.
3. El backend crea una preferencia en Mercado Pago.
4. Se registra o actualiza un `Payment` en estado `PENDING`.
5. Mercado Pago notifica el resultado al webhook.
6. El sistema consulta el pago real, actualiza el `Payment` y recalcula:
   - `Order.paidTotal`
   - `Order.balanceDue`
   - `Order.status`
   - `PaymentSchedule.status`

## Variables necesarias

```env
MERCADO_PAGO_ACCESS_TOKEN=""
MERCADO_PAGO_WEBHOOK_SECRET=""
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Rutas relacionadas

- `POST /api/orders/[id]/checkout`
- `POST /api/payments/mercadopago/webhook`

## Notas de implementación

- `MANUAL` sigue disponible como proveedor para conciliación offline.
- El botón de pago principal vive en el portal del cliente.
- El admin también puede generar el link desde el detalle del pedido.

## Pendientes siguientes

- exponer un flujo de recibos visibles en portal
- soportar reintentos y expiración visible de links
- registrar comprobantes manuales desde admin
- endurecer validación de webhook según la configuración final de Mercado Pago
