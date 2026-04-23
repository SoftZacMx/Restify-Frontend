# Prompt: Fix de Zona Horaria (Frontend + Backend)

## Objetivo

Eliminar el bug por el cual el frontend calcula "hoy" en UTC (vía `toISOString()`) y el backend interpreta fechas `YYYY-MM-DD` como UTC medianoche, provocando que despues de las ~18:00 hora de Mexico se muestre el dia siguiente y no aparezcan las ordenes del dia.

**Solucion:** estandarizar a **instantes UTC absolutos derivados de una zona horaria de aplicacion explicita** (`America/Mexico_City`), usando `date-fns-tz` en ambos lados.

**Repos afectados:**
- `Restify-Frontend` (origen del bug — `order.utils.ts`, `OrdersPage.tsx`, `DashboardPage.tsx`)
- `Restify-API` (parseo de rangos — `list-orders.use-case.ts`, `get-reports-summary.use-case.ts`, `order.dto.ts`)

**Principios que NO se deben violar:**
- El frontend envia siempre **ISO 8601 completo con offset/Z** (no `YYYY-MM-DD`).
- El backend hace solo `new Date(isoString)`, sin concatenar `'T00:00:00.000Z'`.
- La zona horaria de la aplicacion es una **constante**, no `process.env.TZ` ni la del SO del cliente.
- Las columnas `DateTime` de Prisma/MySQL se tratan siempre como UTC.

---

## Fase 1: Preparacion y constantes compartidas

> **Dependencias:** Ninguna

### 1.1 Instalar `date-fns-tz` en el Frontend

```bash
cd Restify-Frontend
npm install date-fns-tz
```

### 1.2 Instalar `date-fns-tz` en el Backend

```bash
cd Restify-API
npm install date-fns-tz
```

### 1.3 Crear constante `APP_TIMEZONE` en el Frontend

Archivo: `Restify-Frontend/src/shared/constants/timezone.ts`

```typescript
export const APP_TIMEZONE = 'America/Mexico_City';
```

### 1.4 Crear constante `APP_TIMEZONE` en el Backend

Archivo: `Restify-API/src/shared/constants/timezone.ts`

```typescript
export const APP_TIMEZONE = 'America/Mexico_City';
```

### 1.5 Verificar convencion UTC en Prisma/MySQL

El connector MySQL de Prisma **no soporta** `connectionTimeZone` ni `timezone` como parametros de URL (a diferencia de JDBC/Hibernate). No modificar `DATABASE_URL`.

Verificaciones (solo lectura):
- El schema usa `DateTime` nativo (sin `@db.Date` ni `@db.Timestamp`), mapeado a `DATETIME` de MySQL.
- `new Date()` en Node es siempre un instante UTC internamente, independiente de `process.env.TZ`.
- Prisma serializa `Date` a UTC al escribir `DATETIME`. Por convencion del proyecto, **todo `DATETIME` se trata como UTC**.
- La TZ de la aplicacion (`APP_TIMEZONE`) solo se usa en el borde: al aceptar/emitir fechas locales del usuario. Nunca al consultar la DB.

---

## Fase 2: Frontend — helpers de fecha

> **Dependencias:** Fase 1

### 2.1 Reemplazar `getTodayDateString()`

Archivo: `Restify-Frontend/src/shared/utils/order.utils.ts` (linea ~299)

**Antes:**
```typescript
export const getTodayDateString = (): string => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};
```

**Despues:**
```typescript
import { formatInTimeZone } from 'date-fns-tz';
import { APP_TIMEZONE } from '@/shared/constants/timezone';

export const getTodayDateString = (): string => {
  return formatInTimeZone(new Date(), APP_TIMEZONE, 'yyyy-MM-dd');
};
```

### 2.2 Crear helper para limites de dia en UTC

Agregar en el mismo archivo:

```typescript
import { zonedTimeToUtc } from 'date-fns-tz';

export const getLocalDayBoundsUtc = (localYmd: string) => {
  return {
    dateFrom: zonedTimeToUtc(`${localYmd} 00:00:00.000`, APP_TIMEZONE).toISOString(),
    dateTo:   zonedTimeToUtc(`${localYmd} 23:59:59.999`, APP_TIMEZONE).toISOString(),
  };
};
```

### 2.3 Actualizar `getDefaultOrderFiltersForToday()`

En el mismo archivo (lineas ~354-355). Sustituir la construccion de `dateFrom`/`dateTo` por una llamada a `getLocalDayBoundsUtc(getTodayDateString())`.

### 2.4 Corregir comparacion en Dashboard

Archivo: `Restify-Frontend/src/pages/DashboardPage.tsx` (linea ~218)

Reemplazar `new Date().toISOString().split('T')[0]` por `getTodayDateString()`.

### 2.5 Auditoria global

Ejecutar en `Restify-Frontend/src`:
```bash
grep -rn "toISOString().slice(0, 10)\|toISOString().split('T')\[0\]" src/
```
Reemplazar cada hit por `getTodayDateString()` o `formatInTimeZone(..., APP_TIMEZONE, 'yyyy-MM-dd')` segun corresponda.

---

## Fase 3: Frontend — integracion en paginas

> **Dependencias:** Fase 2

### 3.1 `OrdersPage.tsx`

Linea ~48 — `getDefaultOrderFiltersForToday()` ya devolvera ISO UTC correcto, sin cambios adicionales. Verificar que el payload enviado al API tenga formato `2026-04-22T06:00:00.000Z` (no `2026-04-22`).

### 3.2 Display de fechas al usuario

Para cualquier fecha que se muestre en UI, usar `formatInTimeZone(iso, APP_TIMEZONE, 'dd/MM/yyyy HH:mm')`. Nunca `new Date(iso).toLocaleString()` sin tz explicita.

### 3.3 Date pickers

Revisar componentes de seleccion de rango (filtros manuales). Al emitir la fecha seleccionada, envolver con `getLocalDayBoundsUtc(ymd)` antes de enviar al API.

---

## Fase 4: Backend — parseo de rangos

> **Dependencias:** Fase 1

### 4.1 `list-orders.use-case.ts`

Archivo: `Restify-API/src/core/application/use-cases/orders/list-orders.use-case.ts` (lineas ~57-58)

Dejar solo:
```typescript
dateFrom: input.dateFrom ? new Date(input.dateFrom) : undefined,
dateTo:   input.dateTo   ? new Date(input.dateTo)   : undefined,
```

(El ISO completo que llega del frontend ya contiene el instante correcto.)

### 4.2 `get-reports-summary.use-case.ts`

Archivo: `Restify-API/src/core/application/use-cases/reports/get-reports-summary.use-case.ts` (lineas ~15-18)

**Eliminar** la concatenacion de `'T00:00:00.000Z'` / `'T23:59:59.999Z'`. El frontend ya envia el instante UTC.

### 4.3 Validacion en DTO

Archivo: `Restify-API/src/server/dtos/order.dto.ts` (lineas ~98-99)

Cambiar decorador de `@IsDateString()` (o date-only) a:
```typescript
@IsISO8601({ strict: true })
@IsOptional()
dateFrom?: string;
```
Asegurar que acepta `2026-04-22T06:00:00.000Z`.

### 4.4 Consistencia con `toDateKeyLocal`

Archivo: `Restify-API/src/core/infrastructure/database/repositories/reports-summary.repository.ts` (lineas ~35-40)

Usar `APP_TIMEZONE` de la constante en lugar de un string hardcoded. Verificar que agrupa por dia local usando la misma TZ que el resto del codigo.

---

## Fase 5: Base de datos

> **Dependencias:** Fase 1.5

### 5.1 Convencion documentada

Agregar al `README.md` del backend una seccion:
> Todas las columnas `DateTime` en Prisma son UTC. No interpretar directamente con zona local. Para agrupar/mostrar por dia, convertir con `date-fns-tz` usando `APP_TIMEZONE`.

### 5.2 Verificar `@default(now())`

Archivo: `Restify-API/src/core/infrastructure/database/prisma/schema.prisma` (linea ~67)

No requiere cambio de schema. Con `connectionTimeZone=UTC` en la URL, `now()` se escribe en UTC automaticamente. Verificar con:
```sql
SELECT date, NOW(), UTC_TIMESTAMP() FROM orders ORDER BY id DESC LIMIT 5;
```
`date` debe coincidir con `UTC_TIMESTAMP()`, no con `NOW()` local.

### 5.3 (Opcional) Auditoria de datos historicos

Si hay sospecha de registros escritos antes del fix con TZ del servidor (no UTC), generar un script que liste ordenes cuyo `date` no cuadre con `createdAt` / rango esperado. No ejecutar correcciones masivas sin validar una muestra.

---

## Fase 6: Testing y verificacion

> **Dependencias:** Fases 2-5

### 6.1 Unit tests de helpers

Archivo: `Restify-Frontend/src/shared/utils/__tests__/order.utils.test.ts`

Casos obligatorios:
- `getTodayDateString()` a las 23:50 MX devuelve la fecha local, no la de UTC.
- `getLocalDayBoundsUtc('2026-04-22')` devuelve `dateFrom = 2026-04-22T06:00:00.000Z` (en horario estandar; ajustar a `05:00` si aplica DST).
- Transicion de DST: primer dia de DST y ultimo dia de DST.

### 6.2 E2E de ordenes

Crear una orden a las 23:55 hora local Mexico. Recargar `OrdersPage` y verificar que aparece en la lista del dia en curso.

### 6.3 Rango de "hoy"

Verificar que el filtro devuelve ordenes creadas entre `00:00:00` y `23:59:59.999` hora local Mexico, inclusive. Contar manualmente contra la DB.

### 6.4 QA manual en staging

Ejecutar en staging en tres momentos del dia: 09:00, 17:00 y 23:30 hora MX. En los tres, la cabecera debe mostrar el mismo dia local y las ordenes listadas deben coincidir.

---

## Criterios de aceptacion

- Frontend jamas llama `toISOString().slice(0,10)` ni `.split('T')[0]` para calcular "hoy".
- Backend jamas concatena `'T00:00:00.000Z'` a un input de usuario.
- Las respuestas de `GET /orders?dateFrom=...&dateTo=...` incluyen exactamente las ordenes cuyo `date` cae en el dia local Mexico solicitado.
- Los tests unitarios de la Fase 6.1 pasan.
- En produccion, a las 23:30 MX del 2026-04-22, la UI muestra "22" y lista las ordenes del 22.
