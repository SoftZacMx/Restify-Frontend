# Plan de Mejoras Prioritarias para Producción

> **Fecha:** 2026-04-07
> **Proyecto:** Restify Frontend
> **Objetivo:** Preparar el frontend para un lanzamiento seguro, optimizado y con visibilidad operativa.

---

## Resumen Ejecutivo

| # | Mejora | Categoría | Esfuerzo Estimado | Archivos Afectados |
|---|--------|-----------|-------------------|---------------------|
| 1 | Headers de seguridad en nginx | Seguridad | Bajo | `nginx.conf` |
| 2 | Lazy loading de rutas | Performance | Medio | `App.tsx`, páginas |
| 3 | Eliminar console.logs de producción | Seguridad | Bajo | 5 archivos + `vite.config.ts` |
| 4 | Refresh token + session timeout | Seguridad/UX | Alto | Auth store, API client, componentes |
| 5 | Integrar Sentry | Observabilidad | Medio | `main.tsx`, error boundary, API client |

---

## 1. Headers de Seguridad en Nginx

### Problema

El archivo `nginx.conf` actual no incluye headers de seguridad HTTP. Esto deja el frontend expuesto a:

- **Clickjacking** (sin X-Frame-Options)
- **XSS** (sin Content-Security-Policy)
- **Downgrade attacks** (sin HSTS)
- **MIME sniffing** (sin X-Content-Type-Options)

### Estado Actual

```nginx
# nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Implementación

Actualizar `nginx.conf` con la siguiente configuración:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # --- Headers de Seguridad ---
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Content-Security-Policy
    # Ajustar los dominios según el entorno (API, WebSocket, CDN, etc.)
    add_header Content-Security-Policy "
        default-src 'self';
        script-src 'self';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: blob:;
        font-src 'self';
        connect-src 'self' ${API_DOMAIN} ${WS_DOMAIN};
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
    " always;

    # HSTS (habilitar solo cuando se confirme HTTPS en producción)
    # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # --- Compresión Gzip ---
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # --- Cache de Assets Estáticos ---
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # --- SPA Fallback ---
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Pasos

1. Actualizar `nginx.conf` con los headers de seguridad.
2. Reemplazar `${API_DOMAIN}` y `${WS_DOMAIN}` con los dominios reales o usar variables de entorno de nginx con `envsubst`.
3. Habilitar HSTS una vez que se confirme que el entorno usa HTTPS.
4. Verificar los headers con `curl -I https://tu-dominio.com` o [securityheaders.com](https://securityheaders.com).
5. Hacer pruebas funcionales (login, WebSocket, carga de imágenes) para confirmar que el CSP no bloquea recursos legítimos.

### Verificación

- [ ] `X-Frame-Options: SAMEORIGIN` presente en response headers.
- [ ] `Content-Security-Policy` presente y no bloquea funcionalidad.
- [ ] Compresión gzip activa (verificar con `Content-Encoding: gzip` en responses).
- [ ] Assets en `/assets/` sirven `Cache-Control: public, immutable`.

---

## 2. Lazy Loading de Rutas

### Problema

Todas las páginas se importan estáticamente en `App.tsx`. Esto significa que el bundle inicial incluye el código de todas las páginas, aunque el usuario solo visite una. Impacta directamente el First Contentful Paint (FCP) y Time to Interactive (TTI).

### Estado Actual

```typescript
// App.tsx - Importaciones estáticas actuales
import { DashboardPage } from '@/presentation/pages/dashboard/DashboardPage';
import { OrdersPage } from '@/presentation/pages/orders/OrdersPage';
import { LoginPage } from '@/presentation/pages/auth/LoginPage';
// ... más de 15 páginas importadas estáticamente
```

### Implementación

**Paso 1: Crear un componente de loading fallback**

Crear `src/presentation/components/ui/PageLoader.tsx`:

```tsx
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
```

**Paso 2: Convertir imports estáticos a lazy imports en `App.tsx`**

```typescript
import { lazy, Suspense } from 'react';
import { PageLoader } from '@/presentation/components/ui/PageLoader';

// Páginas públicas (pueden quedarse estáticas por ser el entry point)
import { LoginPage } from '@/presentation/pages/auth/LoginPage';

// Páginas protegidas - lazy loading
const DashboardPage = lazy(() => import('@/presentation/pages/dashboard/DashboardPage'));
const OrdersPage = lazy(() => import('@/presentation/pages/orders/OrdersPage'));
const PosPage = lazy(() => import('@/presentation/pages/pos/PosPage'));
const TablesPage = lazy(() => import('@/presentation/pages/tables/TablesPage'));
const MenuPage = lazy(() => import('@/presentation/pages/menu/MenuPage'));
const ReportsPage = lazy(() => import('@/presentation/pages/reports/ReportsPage'));
const SettingsPage = lazy(() => import('@/presentation/pages/settings/SettingsPage'));
const UsersPage = lazy(() => import('@/presentation/pages/users/UsersPage'));
const ProductsPage = lazy(() => import('@/presentation/pages/products/ProductsPage'));
const ExpensesPage = lazy(() => import('@/presentation/pages/expenses/ExpensesPage'));
// ... todas las demás páginas protegidas
```

**Paso 3: Envolver rutas en `<Suspense>`**

```tsx
// Opción A: Suspense global (más simple)
<PrivateRoute>
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      {/* ... */}
    </Routes>
  </Suspense>
</PrivateRoute>

// Opción B: Suspense por ruta (más granular)
<Route
  path="/dashboard"
  element={
    <Suspense fallback={<PageLoader />}>
      <DashboardPage />
    </Suspense>
  }
/>
```

**Paso 4: Asegurar exports default en cada página**

Cada página lazy-loaded necesita un `export default`. Si actualmente usan named exports, agregar:

```typescript
// Al final de cada página
export default DashboardPage;
```

### Pasos

1. Crear el componente `PageLoader`.
2. Agregar `export default` a cada página que no lo tenga.
3. Reemplazar imports estáticos por `lazy()` en `App.tsx`.
4. Envolver las rutas en `<Suspense>`.
5. Ejecutar `npm run build` y comparar el tamaño del chunk principal antes y después.
6. Probar la navegación completa para confirmar que no hay errores de carga.

### Verificación

- [ ] `npm run build` genera chunks separados por ruta (verificar en `dist/assets/`).
- [ ] El chunk principal es significativamente más pequeño.
- [ ] La navegación entre páginas funciona sin errores.
- [ ] El loading spinner aparece brevemente al cargar una ruta nueva.

---

## 3. Eliminar Console.logs de Producción

### Problema

Hay `console.log` y `console.warn` en código de producción que exponen información interna: respuestas de API, estado de autenticación y datos de debug.

### Archivos Afectados

| Archivo | Línea | Contenido |
|---------|-------|-----------|
| `src/infrastructure/api/repositories/company.repository.ts` | 8 | `console.log('[Company API] GET /api/company response:', result)` |
| `src/application/services/company.service.ts` | 16 | `console.log('[Company Service] company data:', response.data)` |
| `src/infrastructure/api/repositories/report.repository.ts` | 34 | `console.log('[generateReport] Respuesta de la API:', body)` |
| `src/presentation/pages/dashboard/DashboardPage.tsx` | 67 | `console.log('[Dashboard] Respuesta del API:', dashboard)` |
| `src/presentation/components/PrivateRoute.tsx` | 43 | `console.warn('[Auth] PrivateRoute → redirect to login')` |

### Implementación

**Enfoque recomendado: Eliminar en código + strip automático en build como safety net.**

**Paso 1: Eliminar manualmente los console.log de los archivos listados arriba.**

**Paso 2: Agregar strip automático en `vite.config.ts` como red de seguridad:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: false, // No exponer source maps en producción
    minify: 'esbuild',
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
```

**Paso 3 (Opcional): Agregar regla de ESLint para prevenir futuros console.log:**

En el archivo de configuración de ESLint, agregar:

```javascript
rules: {
  'no-console': ['warn', { allow: ['error'] }],
}
```

### Pasos

1. Eliminar los 5 `console.log`/`console.warn` identificados.
2. Agregar `esbuild.drop` en `vite.config.ts` para strip automático.
3. Agregar regla `no-console` en ESLint.
4. Ejecutar `npm run build` y verificar que no hay console.log en el bundle resultante.

### Verificación

- [ ] `grep -r "console.log" dist/` no retorna resultados.
- [ ] La app funciona correctamente sin los logs.
- [ ] ESLint marca warnings en nuevos `console.log`.

---

## 4. Refresh Token + Session Timeout

### Problema

- El JWT se almacena en localStorage sin manejo de expiración.
- Si el token expira, el usuario es redirigido a login sin aviso, perdiendo cualquier trabajo en progreso.
- No hay logout por inactividad, el token persiste indefinidamente en localStorage.

### Estado Actual

```typescript
// auth.store.ts
login: (data) => set({
  user: data.user,
  token: data.token,    // Se guarda el token sin verificar expiración
  isAuthenticated: true,
}),
```

```typescript
// client.ts - Solo maneja 401 reactivamente
if (error.response?.status === 401) {
  // Redirect a login
}
```

### Implementación

> **Nota:** Esta mejora requiere coordinación con el backend. Los pasos del frontend asumen que el backend implementará un endpoint de refresh token (ej: `POST /api/auth/refresh`).

**Paso 1: Coordinar con backend la implementación de refresh tokens**

El backend debe:
- Emitir un refresh token (HttpOnly cookie) junto al access token en el login.
- Exponer un endpoint `POST /api/auth/refresh` que rote el refresh token y devuelva un nuevo access token.
- El access token debe tener una expiración corta (15-30 min).

**Paso 2: Implementar interceptor de refresh en el API client**

Actualizar `src/infrastructure/api/client.ts`:

```typescript
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/api/auth/refresh');
        const newToken = data.token;

        useAuthStore.getState().updateToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

**Paso 3: Agregar `updateToken` al auth store**

```typescript
// auth.store.ts
updateToken: (token: string) => set({ token }),
```

**Paso 4: Implementar session timeout por inactividad**

Crear `src/presentation/hooks/useSessionTimeout.ts`:

```typescript
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/presentation/store/auth.store';

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutos
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'];

export function useSessionTimeout() {
  const logout = useAuthStore((s) => s.logout);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        logout();
        window.location.href = '/auth/login';
      }, INACTIVITY_LIMIT);
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );
    resetTimer();

    return () => {
      clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [logout]);
}
```

**Paso 5: Usar el hook en el layout principal**

```typescript
// En el layout o componente raíz de las rutas protegidas
useSessionTimeout();
```

### Pasos

1. **Backend:** Implementar endpoint `POST /api/auth/refresh` con rotación de refresh token.
2. **Frontend:** Agregar `updateToken` al auth store.
3. **Frontend:** Implementar el interceptor de refresh en `client.ts`.
4. **Frontend:** Crear hook `useSessionTimeout`.
5. **Frontend:** Integrar el hook en el layout protegido.
6. Probar flujo completo: login → trabajo normal → expiración de access token → refresh automático → inactividad → logout.

### Verificación

- [ ] Un access token expirado se renueva automáticamente sin interrumpir al usuario.
- [ ] Requests concurrentes durante refresh se encolan y reenvían correctamente.
- [ ] Después de 30 min de inactividad, el usuario es redirigido a login.
- [ ] Si el refresh token también expiró, el usuario es redirigido a login.

---

## 5. Integrar Sentry (Error Tracking)

### Problema

Sin un sistema de monitoreo de errores, los fallos en producción son invisibles. Los usuarios experimentan errores que el equipo no puede diagnosticar hasta que alguien reporta manualmente.

### Implementación

**Paso 1: Instalar el SDK de Sentry**

```bash
npm install @sentry/react
```

**Paso 2: Inicializar Sentry en `main.tsx`**

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE, // 'development' | 'production'
  enabled: import.meta.env.PROD,      // Solo en producción
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,     // Ocultar texto sensible en replays
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 0.2,       // 20% de transacciones para performance
  replaysSessionSampleRate: 0, // No grabar sesiones normales
  replaysOnErrorSampleRate: 1, // Grabar 100% de sesiones con error
});
```

**Paso 3: Agregar Sentry Error Boundary**

Actualizar el error boundary existente para reportar a Sentry:

```tsx
import * as Sentry from '@sentry/react';

// Envolver el App con el error boundary de Sentry
<Sentry.ErrorBoundary
  fallback={({ error, resetError }) => (
    <ErrorFallback error={error} onReset={resetError} />
  )}
>
  <App />
</Sentry.ErrorBoundary>
```

**Paso 4: Capturar errores de API en el interceptor**

Agregar en `client.ts`:

```typescript
import * as Sentry from '@sentry/react';

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status >= 500) {
      Sentry.captureException(error, {
        extra: {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
        },
      });
    }
    // ... manejo existente
  }
);
```

**Paso 5: Agregar contexto de usuario**

En el auth store, al hacer login:

```typescript
import * as Sentry from '@sentry/react';

login: (data) => {
  Sentry.setUser({
    id: data.user.id,
    email: data.user.email,
  });
  set({ user: data.user, token: data.token, isAuthenticated: true });
},

logout: () => {
  Sentry.setUser(null);
  set({ user: null, token: null, isAuthenticated: false });
},
```

**Paso 6: Agregar variable de entorno**

En `.env.example`:

```
VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

### Pasos

1. Crear proyecto en [sentry.io](https://sentry.io) y obtener el DSN.
2. Instalar `@sentry/react`.
3. Inicializar Sentry en `main.tsx`.
4. Integrar `Sentry.ErrorBoundary` en el tree de React.
5. Agregar captura de errores 5xx en el interceptor de Axios.
6. Agregar contexto de usuario en login/logout.
7. Agregar `VITE_SENTRY_DSN` a `.env.example` y a las variables de entorno del deploy.
8. Hacer deploy y verificar que los errores aparecen en el dashboard de Sentry.

### Verificación

- [ ] Errores no capturados aparecen en Sentry con stack trace completo.
- [ ] Errores 5xx de la API se registran con URL y status.
- [ ] El usuario logueado aparece asociado al error en Sentry.
- [ ] Los replays de sesiones con error se graban correctamente.
- [ ] En desarrollo, Sentry no envía eventos (`enabled: import.meta.env.PROD`).

---

## Orden de Implementación Recomendado

```
Semana 1:
  ├── [1] Headers de seguridad en nginx     (no requiere cambios de código React)
  ├── [3] Eliminar console.logs             (cambio rápido, bajo riesgo)
  └── [2] Lazy loading de rutas             (independiente, mejora inmediata)

Semana 2:
  ├── [5] Integrar Sentry                   (independiente del backend)
  └── [4] Refresh token + session timeout   (requiere coordinación con backend)
```

---

## Notas Adicionales

- Antes de implementar el punto 4, confirmar con el equipo de backend la estrategia de refresh tokens.
- Después de implementar todos los puntos, ejecutar un análisis con [securityheaders.com](https://securityheaders.com) y [Lighthouse](https://developer.chrome.com/docs/lighthouse/) para validar las mejoras.
- Considerar agregar `vite-plugin-visualizer` al proceso de build para monitorear el tamaño del bundle después del lazy loading.
