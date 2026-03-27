# Plan de Implementacion - Subscripcion Frontend

## Objetivo

Gestionar la UI de suscripcion para que el usuario pueda ver su estado, pagar, cancelar y reactivar su suscripcion. Bloquear el acceso al sistema cuando no tenga suscripcion activa.

> **Backend ya implementado.** Endpoints disponibles:
> - `GET /api/subscription/status` — estado de la suscripcion
> - `POST /api/subscription/checkout` — generar URL de pago
> - `POST /api/subscription/cancel` — cancelar al final del periodo
> - `POST /api/subscription/reactivate` — reactivar cancelacion pendiente

---

## Fase 1: Domain Layer (tipos y errores)

> **Dependencias:** Ninguna

### 1.1 Crear tipos de suscripcion

Archivo: `src/domain/types/subscription.types.ts`

```typescript
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED' | 'TRIALING';

export interface SubscriptionStatusResponse {
  exists: boolean;
  status: SubscriptionStatus | null;
  currentPeriodEnd: string | null;  // ISO date string
  cancelAtPeriodEnd: boolean;
  isActive: boolean;
  daysRemaining: number | null;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface CancelResponse {
  message: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export interface ReactivateResponse {
  message: string;
  cancelAtPeriodEnd: boolean;
}
```

---

## Fase 2: Infrastructure Layer (API)

> **Dependencias:** Fase 1

### 2.1 Crear repository de suscripcion

Archivo: `src/infrastructure/api/repositories/subscription.repository.ts`

Seguir el patron existente (clase singleton con `apiClient`):

```typescript
class SubscriptionRepository {
  async getStatus(): Promise<ApiResponse<SubscriptionStatusResponse>> {
    const { data } = await apiClient.get('/api/subscription/status');
    return data;
  }

  async createCheckout(input: { email: string; businessName: string }): Promise<ApiResponse<CheckoutResponse>> {
    const { data } = await apiClient.post('/api/subscription/checkout', input);
    return data;
  }

  async cancel(): Promise<ApiResponse<CancelResponse>> {
    const { data } = await apiClient.post('/api/subscription/cancel');
    return data;
  }

  async reactivate(): Promise<ApiResponse<ReactivateResponse>> {
    const { data } = await apiClient.post('/api/subscription/reactivate');
    return data;
  }
}

export const subscriptionRepository = new SubscriptionRepository();
```

---

## Fase 3: Application Layer (servicio)

> **Dependencias:** Fase 2

### 3.1 Crear servicio de suscripcion

Archivo: `src/application/services/subscription.service.ts`

```typescript
class SubscriptionService {
  async getStatus(): Promise<SubscriptionStatusResponse> {
    const response = await subscriptionRepository.getStatus();
    if (!response.success) throw new AppError(...);
    return response.data;
  }

  async createCheckout(email: string, businessName: string): Promise<CheckoutResponse> {
    const response = await subscriptionRepository.createCheckout({ email, businessName });
    if (!response.success) throw new AppError(...);
    return response.data;
  }

  async cancel(): Promise<CancelResponse> { ... }
  async reactivate(): Promise<ReactivateResponse> { ... }
}

export const subscriptionService = new SubscriptionService();
```

---

## Fase 4: Store de suscripcion

> **Dependencias:** Fase 3

### 4.1 Crear Zustand store

Archivo: `src/presentation/store/subscription.store.ts`

```typescript
interface SubscriptionState {
  status: SubscriptionStatusResponse | null;
  isLoading: boolean;
  fetchStatus: () => Promise<void>;
  clear: () => void;
}
```

Logica:
- `fetchStatus()` llama a `subscriptionService.getStatus()` y guarda el resultado
- Se llama al hacer login y periodicamente (cada 5 min o al volver a la ventana)
- `clear()` se llama al hacer logout
- **No se persiste en localStorage** — siempre se consulta al backend

---

## Fase 5: Componentes UI

> **Dependencias:** Fases 3, 4

### 5.1 Banner de estado de suscripcion

Archivo: `src/presentation/components/subscription/SubscriptionBanner.tsx`

Banner que se muestra en el layout principal segun el estado:

| Estado | Banner | Color |
|--------|--------|-------|
| `ACTIVE` + `cancelAtPeriodEnd: false` | No se muestra | — |
| `ACTIVE` + `cancelAtPeriodEnd: true` | "Tu suscripcion se cancelara en X dias. [Reactivar]" | Amarillo |
| `PAST_DUE` | "Tu pago fallo. Actualiza tu metodo de pago. [Actualizar]" | Rojo |

Usar componentes existentes: `Badge`, `Button` de shadcn/ui.

### 5.2 Pantalla de suscripcion bloqueante

Archivo: `src/presentation/pages/subscription/SubscriptionBlockedPage.tsx`

Pantalla completa que se muestra cuando no hay suscripcion activa (`EXPIRED`, `CANCELED`, `exists: false`). El usuario NO puede acceder a ninguna otra seccion.

Contenido:
- Logo de Restify
- Titulo: "Tu suscripcion ha vencido"
- Subtitulo: "Renueva para continuar usando Restify"
- Boton principal: "Suscribirme" → llama a `POST /checkout` → redirect a Stripe
- Boton secundario: "Cerrar sesion"
- Mostrar precio y que incluye (opcional)

### 5.3 Pagina de exito

Archivo: `src/presentation/pages/subscription/SubscriptionSuccessPage.tsx`

Pagina a la que Stripe redirige despues del pago exitoso.

Contenido:
- Icono de check verde
- "Pago exitoso"
- "Tu suscripcion esta activa"
- Redirect automatico al dashboard despues de 3 segundos
- Boton: "Ir al dashboard" (por si el redirect no funciona)

Logica:
1. Al montar, llamar `fetchStatus()` para actualizar el store
2. `setTimeout(() => navigate('/dashboard'), 3000)`

### 5.4 Pagina de cancelacion

Archivo: `src/presentation/pages/subscription/SubscriptionCancelPage.tsx`

Pagina a la que Stripe redirige si el usuario cancela el checkout.

Contenido:
- "No se realizo el pago"
- "Puedes intentar de nuevo cuando quieras"
- Boton: "Intentar de nuevo" → vuelve a crear checkout
- Boton: "Cerrar sesion"

### 5.5 Seccion de suscripcion en Settings (opcional)

Archivo: `src/presentation/pages/settings/SubscriptionSettings.tsx`

Panel dentro de la pagina de configuracion para que el ADMIN gestione la suscripcion:

- Estado actual (ACTIVE, dias restantes)
- Fecha del proximo cobro
- Boton "Cancelar suscripcion" (con dialogo de confirmacion)
- Si esta cancelada: Boton "Reactivar suscripcion"

Solo visible para rol `ADMIN`.

---

## Fase 6: Guardia de suscripcion

> **Dependencias:** Fases 4, 5

### 6.1 Crear SubscriptionGuard

Archivo: `src/presentation/components/subscription/SubscriptionGuard.tsx`

Similar a `PrivateRoute` pero valida la suscripcion:

```typescript
const SubscriptionGuard = ({ children }: { children: React.ReactNode }) => {
  const { status, isLoading, fetchStatus } = useSubscriptionStore();

  useEffect(() => {
    fetchStatus();
  }, []);

  if (isLoading) return <LoadingSpinner />;

  // Sin suscripcion activa → pantalla bloqueante
  if (!status?.isActive) {
    return <SubscriptionBlockedPage />;
  }

  return <>{children}</>;
};
```

### 6.2 Integrar en App.tsx

Envolver las rutas protegidas con el guard:

```tsx
<Route path="/dashboard" element={
  <PrivateRoute>
    <SubscriptionGuard>
      <DashboardPage />
    </SubscriptionGuard>
  </PrivateRoute>
} />
```

O mejor, un layout wrapper que aplique a todas las rutas protegidas:

```tsx
// Layout que incluye sidebar + banner + subscription guard
const ProtectedLayout = ({ children }) => (
  <PrivateRoute>
    <SubscriptionGuard>
      <MainLayout>
        <SubscriptionBanner />
        {children}
      </MainLayout>
    </SubscriptionGuard>
  </PrivateRoute>
);
```

### 6.3 Agregar rutas de suscripcion en App.tsx

```tsx
// Rutas publicas de suscripcion (sin guard)
<Route path="/subscription/success" element={<PrivateRoute><SubscriptionSuccessPage /></PrivateRoute>} />
<Route path="/subscription/cancel" element={<PrivateRoute><SubscriptionCancelPage /></PrivateRoute>} />
```

Estas rutas van FUERA del `SubscriptionGuard` pero dentro de `PrivateRoute` (necesitas estar logueado pero no necesitas suscripcion activa).

---

## Fase 7: Actualizar logout y login

> **Dependencias:** Fase 4

### 7.1 Actualizar flujo de login

En el flujo post-login (despues de autenticar exitosamente):

```typescript
// Despues de login exitoso
authStore.login(response);
await subscriptionStore.fetchStatus(); // Cargar estado de suscripcion
```

El `SubscriptionGuard` se encarga del resto — si no hay suscripcion activa, redirige automaticamente.

### 7.2 Actualizar logout

Limpiar el store de suscripcion al hacer logout:

```typescript
const logout = () => {
  authStore.logout();
  subscriptionStore.clear();
};
```

---

## Fase 8: Variables de entorno

> **Dependencias:** Ninguna

### 8.1 Agregar URLs de Stripe

Estas URLs se envian al backend en el checkout y son a donde Stripe redirige al usuario:

```env
# Ya existente
VITE_API_BASE_URL=http://localhost:3000

# Nuevas (usadas por el backend, pero definidas aqui para que el frontend las envie)
# No se necesitan como env vars del frontend - el backend las tiene
```

> **Nota:** Las `STRIPE_SUCCESS_URL` y `STRIPE_CANCEL_URL` se pueden manejar de dos formas:
> - **Opcion A:** El backend las tiene hardcodeadas o en su `.env` (actual)
> - **Opcion B:** El frontend las envia en el body del checkout request
>
> Recomendacion: Opcion B — el frontend envia las URLs porque sabe su propio dominio.

Si se elige Opcion B, actualizar el DTO del backend para aceptar `successUrl` y `cancelUrl` en el body.

---

## Resumen de archivos a crear

| # | Archivo | Fase |
|---|---------|------|
| 1 | `src/domain/types/subscription.types.ts` | 1 |
| 2 | `src/infrastructure/api/repositories/subscription.repository.ts` | 2 |
| 3 | `src/application/services/subscription.service.ts` | 3 |
| 4 | `src/presentation/store/subscription.store.ts` | 4 |
| 5 | `src/presentation/components/subscription/SubscriptionBanner.tsx` | 5 |
| 6 | `src/presentation/pages/subscription/SubscriptionBlockedPage.tsx` | 5 |
| 7 | `src/presentation/pages/subscription/SubscriptionSuccessPage.tsx` | 5 |
| 8 | `src/presentation/pages/subscription/SubscriptionCancelPage.tsx` | 5 |
| 9 | `src/presentation/pages/settings/SubscriptionSettings.tsx` | 5 |
| 10 | `src/presentation/components/subscription/SubscriptionGuard.tsx` | 6 |

## Archivos a modificar

| # | Archivo | Cambio | Fase |
|---|---------|--------|------|
| 1 | `src/App.tsx` | Agregar rutas de suscripcion + SubscriptionGuard | 6 |
| 2 | `src/presentation/components/layouts/MainLayout.tsx` | Agregar SubscriptionBanner | 5 |
| 3 | `src/presentation/store/auth.store.ts` | Limpiar subscription store en logout | 7 |

---

## Flujo visual completo

```
Usuario abre la app
  ↓
¿Tiene token? (PrivateRoute)
  No → /auth/login
  Si ↓
¿Tiene suscripcion activa? (SubscriptionGuard)
  No → SubscriptionBlockedPage
       [Suscribirme] → POST /checkout → Stripe Checkout → /subscription/success → /dashboard
  Si ↓
Dashboard normal
  + SubscriptionBanner (si cancelAtPeriodEnd o PAST_DUE)
  + Settings > Suscripcion (cancelar/reactivar)
```
