# Guía Frontend - Pagar Orden

Este documento es la **única guía** para que el frontend implemente el flujo de pago de una orden. Usa un solo endpoint: el backend crea el pago, actualiza la orden y, si aplica, libera la mesa en una sola transacción.

**Base URL:** `http://localhost:3000/api`

---

## Índice

1. [Endpoint y método](#endpoint-y-método)
2. [Request](#request)
3. [Response](#response)
4. [Interfaces TypeScript](#interfaces-typescript)
5. [Validaciones](#validaciones)
6. [Liberación de mesa](#liberación-de-mesa)
7. [Errores](#errores)
8. [Ejemplo de implementación](#ejemplo-de-implementación)

---

## Endpoint y método

| Operación | Método | Endpoint |
|-----------|--------|----------|
| **Pagar orden** | `POST` | `/api/orders/:order_id/pay` |

- **`:order_id`** es el UUID de la orden a pagar.
- **Autenticación:** `Authorization: Bearer <token>`.

---

## Request

```http
POST /api/orders/:order_id/pay
Content-Type: application/json
Authorization: Bearer <token>
```

**Body (JSON):**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `paymentMethod` | `'CASH' \| 'TRANSFER' \| 'CARD_PHYSICAL'` | Sí | Método de pago. |
| `amount` | `number` | Sí | Monto pagado. Debe coincidir con el total de la orden (tolerancia 0.01). Máx. 2 decimales. |
| `transferNumber` | `string` | No | Referencia de transferencia. Solo para `TRANSFER`. Máx. 100 caracteres. |

**Ejemplo:**

```json
{
  "paymentMethod": "CASH",
  "amount": 264.78
}
```

**Con transferencia:**

```json
{
  "paymentMethod": "TRANSFER",
  "amount": 264.78,
  "transferNumber": "REF-123"
}
```

---

## Response

### 200 OK

```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "orderId": "550e8400-e29b-41d4-a716-446655440005",
      "amount": 264.78,
      "status": "SUCCEEDED",
      "paymentMethod": "CASH",
      "createdAt": "2026-01-31T12:35:00.000Z"
    },
    "order": {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "status": true,
      "paymentMethod": 1
    },
    "tableReleased": true
  }
}
```

- **`payment`:** Pago creado (siempre `status: "SUCCEEDED"` en éxito).
- **`order`:** Orden actualizada (`status: true` = pagada; `paymentMethod`: 1 = Cash, 2 = Transfer, 3 = Card).
- **`tableReleased`:** `true` si la orden era **Local** con mesa asignada y el backend liberó la mesa en la misma transacción.

---

## Interfaces TypeScript

```typescript
// Request para pagar orden
interface PayOrderRequest {
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD_PHYSICAL';
  amount: number;           // Debe coincidir con order.total (tolerancia 0.01)
  transferNumber?: string;  // Opcional, solo para TRANSFER (máx 100 chars)
}

// Respuesta del endpoint
interface PayOrderResult {
  payment: {
    id: string;
    orderId: string;
    amount: number;
    status: string;         // "SUCCEEDED"
    paymentMethod: string;
    createdAt: string;     // ISO 8601
  };
  order: {
    id: string;
    status: boolean;       // true = pagada
    paymentMethod: number | null;  // 1: Cash, 2: Transfer, 3: Card
  };
  tableReleased: boolean;  // true si se liberó la mesa (Local + mesa asignada)
}
```

---

## Validaciones

- La orden debe existir (`:order_id` válido).
- La orden no debe estar ya pagada.
- **`amount`** debe coincidir con el total de la orden (tolerancia 0.01). Si no coincide, el backend responde con `PAYMENT_AMOUNT_MISMATCH`.
- **`paymentMethod`** debe ser exactamente `CASH`, `TRANSFER` o `CARD_PHYSICAL`.
- **`amount`** positivo, máximo 2 decimales.
- **`transferNumber`** opcional; si se envía, máximo 100 caracteres.

---

## Liberación de mesa

- Si la orden tiene **`origin: "Local"`** y **`tableId`** asignado, el backend marca la mesa como disponible (`availabilityStatus: true`) **en la misma transacción** que el pago.
- El frontend no debe llamar a ningún endpoint extra para liberar la mesa; basta con usar este endpoint de pago.
- En la respuesta, **`tableReleased: true`** indica que la mesa se liberó; úsalo para actualizar la UI (por ejemplo, quitar la mesa de “ocupada”).

---

## Errores

El API devuelve errores con estructura:

```json
{
  "success": false,
  "error": {
    "code": "CODIGO_ERROR",
    "message": "Descripción"
  }
}
```

| Código | HTTP | Descripción |
|--------|------|-------------|
| `ORDER_NOT_FOUND` | 404 | La orden no existe. |
| `ORDER_ALREADY_PAID` | 400 | La orden ya está pagada. |
| `PAYMENT_AMOUNT_MISMATCH` | 400 | El `amount` no coincide con el total de la orden. |
| Errores de validación (body) | 400 | Campos inválidos (por ejemplo `paymentMethod` no permitido, `amount` negativo). |

**Ejemplo de manejo en el frontend:**

```typescript
if (!res.ok) {
  const err = await res.json();
  switch (err.error?.code) {
    case 'ORDER_NOT_FOUND':
      showError('Orden no encontrada');
      break;
    case 'ORDER_ALREADY_PAID':
      showError('Esta orden ya fue pagada');
      break;
    case 'PAYMENT_AMOUNT_MISMATCH':
      showError('El monto debe coincidir con el total de la orden');
      break;
    default:
      showError(err.error?.message || 'Error al procesar el pago');
  }
  return;
}
```

---

## Ejemplo de implementación

```typescript
const payOrder = async (
  orderId: string,
  orderTotal: number,
  method: 'CASH' | 'TRANSFER' | 'CARD_PHYSICAL',
  transferNumber?: string
) => {
  const body: PayOrderRequest = {
    paymentMethod: method,
    amount: orderTotal,
  };
  if (method === 'TRANSFER' && transferNumber) {
    body.transferNumber = transferNumber;
  }

  const res = await fetch(`/api/orders/${orderId}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    // Manejar errores (ORDER_NOT_FOUND, ORDER_ALREADY_PAID, PAYMENT_AMOUNT_MISMATCH, etc.)
    throw new Error(json.error?.message ?? 'Error al pagar');
  }

  const data = json.data as PayOrderResult;
  // data.payment, data.order, data.tableReleased
  if (data.tableReleased) {
    // Actualizar estado de mesas en la UI
  }
  return data;
};
```

---

**Resumen:** Para pagar una orden, el frontend solo debe usar **`POST /api/orders/:order_id/pay`** con `paymentMethod`, `amount` y opcionalmente `transferNumber`. El backend se encarga del pago, actualización de la orden y liberación de mesa cuando aplica.
