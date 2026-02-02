# Guía Frontend - Tickets (kitchen-ticket y sale-ticket)

Guía para consumir los endpoints de **tickets** desde el frontend: **kitchen-ticket** (cocina) y **sale-ticket** (cliente). Los datos se usan para imprimir o mostrar en pantalla; la impresión la realiza el frontend (p. ej. `window.print()` o envío a impresora térmica).

**Base URL:** `http://localhost:3000/api`

---

## Índice

1. [Contexto: kitchen-ticket vs sale-ticket](#contexto-kitchen-ticket-vs-sale-ticket)
2. [Endpoints](#endpoints)
3. [Kitchen ticket (cocina)](#kitchen-ticket-cocina)
4. [Sale ticket (cliente)](#sale-ticket-cliente)
5. [Interfaces TypeScript](#interfaces-typescript)
6. [Uso: impresión y visualización](#uso-impresión-y-visualización)
7. [Errores y autenticación](#errores-y-autenticación)
8. [Ejemplo de implementación](#ejemplo-de-implementación)

---

## Contexto: kitchen-ticket vs sale-ticket

| Ticket            | Uso        | Contenido principal                                                                 |
|-------------------|------------|-------------------------------------------------------------------------------------|
| **kitchen-ticket**| Cocina     | Mesa, id de orden, productos con cantidades y extras. **Sin precios.**             |
| **sale-ticket**   | Cliente    | Fecha, mesa, cliente, productos y extras con precio, total por línea, subtotal, IVA, propina, total, método de pago, entregado. |

Ambos se obtienen por **orden** (`order_id`). No hay body; solo `GET` con el id de la orden en la URL.

---

## Endpoints

| Operación              | Método | Endpoint                                              |
|------------------------|--------|--------------------------------------------------------|
| Ticket cocina          | `GET`  | `/api/orders/:order_id/ticket/kitchen-ticket`         |
| Ticket cliente (venta) | `GET`  | `/api/orders/:order_id/ticket/sale-ticket`            |

Requieren **autenticación**: `Authorization: Bearer <token>`.

---

## Kitchen ticket (cocina)

**Request**

```http
GET /api/orders/:order_id/ticket/kitchen-ticket
Authorization: Bearer <token>
```

`:order_id` es el UUID de la orden.

**Response 200**

El backend devuelve el payload dentro de `data`:

```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440001",
    "tableNumber": 1,
    "items": [
      {
        "name": "Hamburguesa clásica",
        "quantity": 2,
        "extras": [
          { "name": "Queso extra", "quantity": 1 }
        ],
        "note": "Sin cebolla"
      },
      {
        "name": "Refresco",
        "quantity": 2,
        "extras": [],
        "note": null
      }
    ]
  }
}
```

| Campo         | Tipo     | Descripción                                                                 |
|---------------|----------|-----------------------------------------------------------------------------|
| `orderId`     | `string` | UUID de la orden.                                                           |
| `tableNumber` | `number` \| `null` | Número de mesa; `null` si la orden no tiene mesa (“Sin mesa”).     |
| `items`       | `array`  | Lista de ítems: nombre, cantidad, extras (nombre + cantidad), nota opcional. |

**Uso en cocina:** Mostrar/imprimir mesa, orden e ítems con extras y notas, sin precios.

---

## Sale ticket (cliente)

**Request**

```http
GET /api/orders/:order_id/ticket/sale-ticket
Authorization: Bearer <token>
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440001",
    "date": "2026-01-31T15:30:00.000Z",
    "tableNumber": 1,
    "client": "Juan Pérez",
    "note": null,
    "items": [
      {
        "name": "Hamburguesa clásica",
        "quantity": 2,
        "price": 8.50,
        "lineTotal": 17.00,
        "extras": [
          { "name": "Queso extra", "quantity": 1, "price": 1.50 }
        ],
        "note": "Sin cebolla"
      }
    ],
    "subtotal": 18.50,
    "iva": 2.22,
    "tip": 2.00,
    "total": 22.72,
    "paymentMethod": "Efectivo",
    "delivered": false
  }
}
```

| Campo           | Tipo     | Descripción                                                                 |
|-----------------|----------|-----------------------------------------------------------------------------|
| `orderId`       | `string` | UUID de la orden.                                                           |
| `date`          | `string` | Fecha/hora de la orden (ISO 8601).                                          |
| `tableNumber`   | `number` \| `null` | Número de mesa; `null` si no aplica.                                |
| `client`        | `string` \| `null` | Nombre del cliente si existe.                                       |
| `note`          | `string` \| `null` | Nota general de la orden.                                           |
| `items`         | `array`  | Ítems: nombre, cantidad, precio unitario, total por línea, extras con precio. |
| `subtotal`      | `number` | Subtotal.                                                                   |
| `iva`           | `number` | IVA.                                                                        |
| `tip`           | `number` | Propina.                                                                    |
| `total`         | `number` | Total.                                                                      |
| `paymentMethod` | `string` | "Efectivo", "Transferencia", "Tarjeta" o "Pago dividido".                    |
| `delivered`     | `boolean`| Si la orden está marcada como entregada.                                   |

**Uso para el cliente:** Mostrar/imprimir comprobante con fecha, ítems con precios, totales, método de pago y estado de entrega.

---

## Interfaces TypeScript

```typescript
// --- Kitchen ticket ---
export interface KitchenTicketExtraItem {
  name: string;
  quantity: number;
}

export interface KitchenTicketOrderItem {
  name: string;
  quantity: number;
  extras: KitchenTicketExtraItem[];
  note?: string | null;
}

export interface KitchenTicketResponse {
  orderId: string;
  tableNumber: number | null;
  items: KitchenTicketOrderItem[];
}

// --- Sale ticket ---
export interface SaleTicketExtraItem {
  name: string;
  quantity: number;
  price: number;
}

export interface SaleTicketOrderItem {
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
  extras: SaleTicketExtraItem[];
  note?: string | null;
}

export interface SaleTicketResponse {
  orderId: string;
  date: string;
  tableNumber: number | null;
  client: string | null;
  note: string | null;
  items: SaleTicketOrderItem[];
  subtotal: number;
  iva: number;
  tip: number;
  total: number;
  paymentMethod: string;
  delivered: boolean;
}

// Respuesta estándar del backend
export interface TicketApiResponse<T> {
  success: boolean;
  data: T;
}
```

---

## Uso: impresión y visualización

1. **Obtener datos:** Llamar a `GET .../ticket/kitchen-ticket` o `GET .../ticket/sale-ticket` con el `order_id` de la orden actual.
2. **Renderizar:** Montar un componente o plantilla (HTML/React/Vue) con los campos del `data` (mesa, ítems, totales, etc.).
3. **Imprimir:**
   - **Navegador:** Mostrar la vista del ticket en una ventana o sección y usar `window.print()` (opcionalmente con CSS `@media print`).
   - **Impresora térmica:** Enviar el mismo `data` a un servicio o driver que formatee e imprima (el backend solo devuelve JSON).

Para “Sin mesa” en cualquiera de los dos tickets, comprobar `tableNumber === null` y mostrar el texto que prefieras (ej. “Sin mesa” o “Para llevar”).

---

## Errores y autenticación

- **401 Unauthorized:** Token ausente o inválido.
- **404 Not Found:** Orden no existe (`ORDER_NOT_FOUND`). Comprobar que `order_id` sea un UUID válido y que la orden exista.

---

## Ejemplo de implementación

```typescript
const API_BASE = 'http://localhost:3000/api';

async function getKitchenTicket(orderId: string, token: string): Promise<KitchenTicketResponse> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/ticket/kitchen-ticket`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error('Orden no encontrada');
    if (res.status === 401) throw new Error('No autorizado');
    throw new Error('Error al obtener ticket de cocina');
  }
  const json = await res.json();
  if (!json.success || !json.data) throw new Error('Respuesta inválida');
  return json.data;
}

async function getSaleTicket(orderId: string, token: string): Promise<SaleTicketResponse> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/ticket/sale-ticket`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error('Orden no encontrada');
    if (res.status === 401) throw new Error('No autorizado');
    throw new Error('Error al obtener ticket de venta');
  }
  const json = await res.json();
  if (!json.success || !json.data) throw new Error('Respuesta inválida');
  return json.data;
}

// Ejemplo: imprimir ticket cocina tras crear/abrir una orden
const kitchenData = await getKitchenTicket(orderId, authToken);
// ... renderizar en DOM y window.print() o enviar a impresora
```
