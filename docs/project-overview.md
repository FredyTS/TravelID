# Project Overview

## Producto

Alondra Travel MX es una plataforma para vender paquetes vacacionales y gestionar el ciclo comercial completo:

1. descubrimiento del paquete
2. reserva directa o solicitud de cotización
3. generación de pedido
4. pagos
5. seguimiento previo al viaje

## Enfoque de negocio

El foco principal del sistema es comercial y operativo:

- vender paquetes ya armados
- permitir cotizaciones personalizadas cuando el paquete no encaja
- gestionar pedidos y su avance
- mantener trazabilidad del cliente, la cotización y el pedido

## Flujos implementados hoy

### 1. Reserva directa
- el cliente entra al catálogo
- ve un paquete con precio publicado para una ocupación específica
- si le funciona tal cual, inicia una reserva directa
- el sistema crea un `order` con calendario de cobro base

### 2. Cotización personalizada
- el cliente solicita cotización desde web
- el admin crea una cotización desde panel
- la cotización se guarda en base de datos
- el admin puede convertirla a pedido

### 3. Gestión interna
- el admin entra al panel
- revisa cotizaciones
- convierte una cotización a pedido
- consulta estado financiero y conceptos del pedido

## Arquitectura

### Estilo
Monolito modular sobre Next.js.

### Principios
- UI separada de lógica comercial
- Prisma como capa de persistencia
- features por dominio
- rutas públicas y privadas claramente separadas

## Dominios actuales

### Público
- home
- paquetes
- promociones
- contacto
- cotizar
- reservar

### Admin
- dashboard
- cotizaciones
- pedidos
- clientes
- leads e inquiries

### Plataforma
- autenticación
- permisos
- prisma
- seeds
- endpoints

## Base de datos

El esquema Prisma ya contempla:

- usuarios y roles
- clientes
- leads e inquiries
- destinos, hoteles y paquetes
- cotizaciones e ítems
- pedidos e ítems
- pagos y schedules
- documentos
- auditoría y activity logs

## Próximas fases sugeridas

### Fase siguiente inmediata
- Stripe checkout real
- persistencia de pagos
- actualización automática de saldo

### Después
- portal del cliente real sobre DB
- CRUD real de catálogo
- documentos y vouchers
- carga inicial desde Excel
