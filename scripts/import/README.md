# Import pipeline

Este directorio queda reservado para scripts de importacion desde Excel.

Flujo recomendado:

1. Leer workbook con `xlsx`.
2. Normalizar hojas a estructuras staging.
3. Validar con `zod`.
4. Generar reporte de duplicados, filas invalidas y mapeos legacy.
5. Ejecutar upserts idempotentes hacia Prisma.
