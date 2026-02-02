# Guía Frontend - Dashboard

Guía de implementación para el frontend del **dashboard**: un único endpoint que devuelve ventas del día, ventas de los últimos 7 días (por día), órdenes activas, mesas ocupadas, órdenes recientes y últimas órdenes completadas.

**Base URL:** `http://localhost:3000/api`

---

## Índice

1. [Contexto](#contexto)
2. [Endpoint](#endpoint)
3. [Respuesta del dashboard](#respuesta-del-dashboard)
4. [Interfaces TypeScript](#interfaces-typescript)
5. [Uso en la UI](#uso-en-la-ui)
6. [Gráficos (ventas últimos 7 días)](#gráficos-ventas-últimos-7-días)
7. [Errores y autenticación](#errores-y-autenticación)
8. [Ejemplo de implementación](#ejemplo-de-implementación)

---

## Contexto

El dashboard agrega en una sola llamada la información necesaria para una vista principal:

| Sección | Descripción |
|--------|-------------|
| **Ventas hoy** | Suma del `total` de todas las órdenes **pagadas** (`status: true`) del día actual (UTC). |
| **Ventas últimos 7 días** | Total y desglose por día (últimos 7 días calendario). Cada día incluye `date` (YYYY-MM-DD), `day` (nombre del día en inglés) y `total` para gráficos. |
| **Órdenes activas** | Órdenes **no pagadas** (`status: false`). Incluye `count` y lista de hasta 20 ítems con resumen (id, total, fecha, origen, mesa, estado, entregado). |
| **Mesas ocupadas** | Mesas con `availabilityStatus: false`. Incluye `count` y lista con `id` y `numberTable`. |
| **Órdenes recientes** | Últimas 10 órdenes (cualquier estado), ordenadas por fecha descendente. |
| **Últimas completadas** | Últimas 5 órdenes **pagadas y entregadas** (`status: true`, `delivered: true`). |

Todas las fechas en la respuesta están en formato ISO 8601. Los totales son números (moneda).

---

## Endpoint

| Operación | Método | Endpoint |
|-----------|--------|----------|
| Obtener dashboard | `GET` | `/api/dashboard` |

No lleva query params ni body. Requiere **autenticación**: `Authorization: Bearer <token>`.

**Request**

```http
GET /api/dashboard
Authorization: Bearer <token>
```

---

## Respuesta del dashboard

**Response 200**

La API devuelve el payload dentro de `data` (según el formato estándar del backend). La estructura de `data` es:

```json
{
  "success": true,
  "data": {
    "salesToday": 1250.50,
    "salesLast7Days": {
      "total": 8750.00,
      "byDay": [
        { "date": "2026-01-25", "day": "Sunday", "total": 1100.00 },
        { "date": "2026-01-26", "day": "Monday", "total": 980.50 },
        { "date": "2026-01-27", "day": "Tuesday", "total": 1200.00 },
        { "date": "2026-01-28", "day": "Wednesday", "total": 1350.00 },
        { "date": "2026-01-29", "day": "Thursday", "total": 1180.00 },
        { "date": "2026-01-30", "day": "Friday", "total": 1789.50 },
        { "date": "2026-01-31", "day": "Saturday", "total": 1250.50 }
      ]
    },
    "activeOrders": {
      "count": 3,
      "items": [
        {
          "id": "order-uuid-1",
          "total": 450.00,
          "date": "2026-01-31T14:30:00.000Z",
          "origin": "local",
          "tableId": "table-uuid-1",
          "tableNumber": 1,
          "status": false,
          "delivered": false
        }
      ]
    },
    "occupiedTables": {
      "count": 2,
      "items": [
        { "id": "table-uuid-1", "numberTable": 1 },
        { "id": "table-uuid-2", "numberTable": 3 }
      ]
    },
    "recentOrders": [
      {
        "id": "order-uuid-1",
        "total": 450.00,
        "date": "2026-01-31T14:30:00.000Z",
        "origin": "local",
        "tableId": "table-uuid-1",
        "tableNumber": 1,
        "status": false,
        "delivered": false
      }
    ],
    "lastCompletedOrders": [
      {
        "id": "order-uuid-2",
        "total": 320.00,
        "date": "2026-01-31T13:00:00.000Z",
        "origin": "local",
        "tableId": "table-uuid-2",
        "tableNumber": 3,
        "status": true,
        "delivered": true
      }
    ]
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `salesToday` | `number` | Suma de totales de órdenes pagadas hoy. |
| `salesLast7Days.total` | `number` | Suma de totales de órdenes pagadas en los últimos 7 días. |
| `salesLast7Days.byDay` | `array` | 7 elementos: `date` (YYYY-MM-DD), `day` (Sunday..Saturday), `total` (número). |
| `activeOrders.count` | `number` | Cantidad de órdenes no pagadas. |
| `activeOrders.items` | `array` | Hasta 20 resúmenes de órdenes activas. |
| `occupiedTables.count` | `number` | Cantidad de mesas ocupadas. |
| `occupiedTables.items` | `array` | Lista de mesas ocupadas (`id`, `numberTable`). |
| `recentOrders` | `array` | Últimas 10 órdenes (cualquier estado). |
| `lastCompletedOrders` | `array` | Últimas 5 órdenes pagadas y entregadas. |

Cada resumen de orden incluye: `id`, `total`, `date` (ISO), `origin`, `tableId`, `tableNumber` (opcional, número de mesa cuando aplica), `status`, `delivered`.

---

## Interfaces TypeScript

```typescript
export interface DashboardOrderSummary {
  id: string;
  total: number;
  date: string; // ISO 8601
  origin: string;
  tableId: string | null;
  tableNumber?: number | null;
  status: boolean;
  delivered: boolean;
}

export interface DashboardSalesByDayItem {
  date: string;   // YYYY-MM-DD
  day: string;    // Sunday, Monday, ...
  total: number;
}

export interface DashboardSalesLast7Days {
  total: number;
  byDay: DashboardSalesByDayItem[];
}

export interface DashboardActiveOrders {
  count: number;
  items: DashboardOrderSummary[];
}

export interface DashboardOccupiedTable {
  id: string;
  numberTable: number;
}

export interface DashboardOccupiedTables {
  count: number;
  items: DashboardOccupiedTable[];
}

export interface DashboardResponse {
  salesToday: number;
  salesLast7Days: DashboardSalesLast7Days;
  activeOrders: DashboardActiveOrders;
  occupiedTables: DashboardOccupiedTables;
  recentOrders: DashboardOrderSummary[];
  lastCompletedOrders: DashboardOrderSummary[];
}

// Respuesta envuelta por el backend
export interface DashboardApiResponse {
  success: boolean;
  data: DashboardResponse;
}
```

---

## Uso en la UI

- **Ventas hoy:** Mostrar `data.salesToday` formateado como moneda (ej. “$1,250.50”).
- **Ventas últimos 7 días:** Total con `data.salesLast7Days.total`; gráfico de barras o líneas con `data.salesLast7Days.byDay` (eje X: `date` o `day`, eje Y: `total`).
- **Órdenes activas:** Contador `data.activeOrders.count` y lista/tabla con `data.activeOrders.items`; enlace a detalle de orden usando `item.id`.
- **Mesas ocupadas:** Contador `data.occupiedTables.count` y lista de “Mesa N” usando `item.numberTable`.
- **Órdenes recientes:** Lista con `data.recentOrders`; mostrar total, fecha, origen, mesa (si `tableNumber` existe) y estado (pagada/entregada según `status` y `delivered`).
- **Últimas completadas:** Lista con `data.lastCompletedOrders`; mismo formato que resumen de orden, enlace a `GET /api/orders/:id` si se necesita detalle.

Para mostrar “Mesa N” en cualquier resumen de orden, usar `order.tableNumber ?? 'Sin mesa'` (o similar) cuando `tableId` sea null.

---

## Gráficos (ventas últimos 7 días)

`salesLast7Days.byDay` está ordenado por día (de hace 7 días a hoy). Ejemplo con etiquetas en español:

```typescript
const dayNamesEs: Record<string, string> = {
  Sunday: 'Dom', Monday: 'Lun', Tuesday: 'Mar', Wednesday: 'Mié',
  Thursday: 'Jue', Friday: 'Vie', Saturday: 'Sáb'
};

const chartLabels = data.salesLast7Days.byDay.map((d) => dayNamesEs[d.day] ?? d.day);
const chartValues = data.salesLast7Days.byDay.map((d) => d.total);
```

Puedes usar `date` para ordenación o tooltips (ej. “2026-01-31: $1,250.50”).

---

## Errores y autenticación

- **401 Unauthorized:** Token ausente o inválido. Redirigir a login o renovar token.
- **500:** Error interno. Mostrar mensaje genérico y opción de reintentar.

El endpoint no usa query params; en el futuro se podrían añadir (por ejemplo `dateFrom`, `dateTo`) si el backend lo soporta.

---

## Ejemplo de implementación

```typescript
const API_BASE = 'http://localhost:3000/api';

async function getDashboard(token: string): Promise<DashboardResponse> {
  const res = await fetch(`${API_BASE}/dashboard`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('No autorizado');
    throw new Error('Error al cargar el dashboard');
  }
  const json = await res.json();
  if (!json.success || !json.data) throw new Error('Respuesta inválida');
  return json.data;
}

// Uso en componente
const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
useEffect(() => {
  getDashboard(authToken).then(setDashboard).catch(console.error);
}, [authToken]);
```

Para polling o actualización periódica, llamar a `getDashboard` cada X segundos o tras ciertas acciones (por ejemplo, después de crear/pagar una orden o liberar una mesa).
