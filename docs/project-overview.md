# Project Overview

## Producto

Alondra Travel MX conecta la cara comercial y la operación del viaje en una sola app:

1. promoción de paquetes
2. reserva directa o cotización personalizada
3. creación de pedido
4. cobro de anticipo o saldo
5. seguimiento desde portal del cliente
6. comunicación directa entre cliente y admin

## Enfoque operativo actual

- un solo admin gestiona ventas, pedidos, pagos y mensajes
- el cliente entra con cuenta automática y magic link
- el portal concentra seguimiento, pagos y dudas
- el panel admin concentra operación, cobranza y atención

## Flujos implementados hoy

### Reserva directa
- el cliente entra al catálogo
- si el paquete aplica tal cual, genera su reserva
- el sistema crea cliente, acceso de portal y pedido con calendario de cobro

### Cotización personalizada
- el cliente solicita una propuesta
- el admin crea la cotización
- el cliente puede verla en portal
- el admin puede convertirla a pedido

### Postventa y seguimiento
- el cliente revisa su viaje en portal
- paga desde Mercado Pago
- consulta documentos y updates
- escribe al admin desde inbox

## Dominios activos

### Público
- home
- paquetes
- promociones
- contacto
- cotizar
- reservar

### Portal
- resumen
- viajes
- pagos
- documentos
- inbox
- perfil

### Admin
- dashboard
- conversaciones
- pedidos
- cotizaciones
- pagos
- clientes
- leads y solicitudes

## Próximos pasos

- CRUD completo de catálogo sobre Prisma
- publicación real de documentos y vouchers
- aprobación del cliente para cotizaciones
- importación de datos desde Excel
