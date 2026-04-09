# Catalogos extendidos

Esta iteracion endurece el dominio comercial y operativo del catalogo para que hoteles, proveedores y paquetes no dependan de texto libre.

## Hoteles

Cada hotel ahora puede guardar:

- proveedor principal y clave legacy
- rating, tipo de propiedad y resumen corto
- telefono, horarios de check-in/check-out
- cargos adicionales y notas internas
- imagen principal
- flags estructurados de operacion:
  - alberca
  - spa
  - gym
  - acceso a playa
  - wifi
  - aire acondicionado
  - estacionamiento
  - acepta mascotas
- amenidades normalizadas
- planes de alimentos disponibles
- tipos de habitacion
- galeria de imagenes

## Proveedores

El proveedor ahora sirve como catalogo formal para:

- clave proveedor
- nombre comercial
- nombre visible
- estado
- contacto
- referencia para hoteles, paquetes, componentes y bookings

## Paquetes

El paquete sigue siendo comercial, no operativo. Debe concentrar:

- destino
- hotel base
- proveedor base
- plan base
- habitacion base
- ciudad de salida publicada
- precio desde
- ocupacion incluida
- condiciones de reserva inmediata
- base textual del precio publicado

## Cotizaciones

La cotizacion usa el catalogo estructurado para congelar un snapshot comercial:

- proveedor
- hotel
- clave hotel / proveedor
- plan
- habitacion
- fechas
- pagos
- vuelos y traslados

Ese snapshot queda en `proposalData`, `proposalHtml` y en `QuoteItem.metadata` para que futuros cambios de catalogo no modifiquen propuestas ya emitidas.
