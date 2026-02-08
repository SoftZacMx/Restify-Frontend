# Plan de implementación de pruebas automatizadas

Este documento describe la estrategia, herramientas, configuración y estado de las pruebas en el frontend Restify.

**Para IA / setup rápido:** Ver **[GUIA_IA_PRUEBAS_AUTOMATIZADAS.md](./GUIA_IA_PRUEBAS_AUTOMATIZADAS.md)** — qué instalar, qué hacer al inicializar el proyecto y cómo ejecutar/crear pruebas.

---

## Resumen para nuevos desarrolladores

### Tipos de pruebas prioritarios

1. **E2E (Playwright)** – Flujos críticos de negocio: POS y Órdenes. Dan confianza de que el usuario puede crear órdenes, editar, pagar y gestionar órdenes de punta a punta. Requieren backend en marcha.
2. **Unitarias (Vitest)** – Lógica de negocio, validaciones, servicios y utilidades. Rápidas y baratas de mantener; evitan regresiones en validaciones y cálculos.

Solo **POS** y **Orders** tienen pruebas E2E completas por ser el núcleo operativo. El resto de módulos (CRUD: productos, usuarios, mesas, gastos, menú, etc.) se cubren con **tests unitarios** y/o **tests de componentes**; no se priorizan E2E para CRUDs.

### Normas y estructura para nuevas pruebas

| Tipo        | Ubicación                          | Convención de nombres     | Ejecución           |
|------------|-------------------------------------|---------------------------|---------------------|
| **E2E**    | `e2e/*.spec.ts`                     | `e2e/<modulo>-<flujo>.spec.ts` | `npx playwright test e2e/<archivo>` |
| **Unitario** | `src/<ruta-del-modulo>/*.test.ts` o `*.test.tsx` | Mismo directorio que el código, sufijo `.test.ts(x)` | `npm run test` / `npm run test:run` |
| **Componente** | `src/presentation/.../*.test.tsx`   | Junto a la página o componente | `npm run test` |

- **Selectores E2E:** Preferir `getByRole`, `getByLabel`, `getByText`. Para elementos críticos y repetidos (ej. botón "Procesar Pago") usar `data-testid` en el componente y `getByTestId('id')` en el test.
- **Un test, un flujo o un comportamiento:** Cada test debe verificar una cosa clara; nombres descriptivos en español (ej. `it('muestra error cuando el email es inválido')`).
- **E2E:** Hacer login en `beforeEach` cuando el flujo requiera sesión; usar timeouts generosos (60–90 s) para flujos largos; no asumir datos fijos (ej. nombres de productos) si vienen del backend.
- **Unitarios:** Mockear servicios y store; no llamar a la API real. Tests aislados y deterministas.

### Comandos útiles

```bash
npm run test              # Vitest (unit + componentes), modo watch
npm run test:run          # Vitest, una ejecución
npm run test:coverage     # Vitest con cobertura
npm run test:e2e          # Playwright E2E (requiere backend)
npm run test:e2e:ui       # Playwright con UI paso a paso
npx playwright test e2e/pos-takeout.spec.ts   # Un solo archivo E2E
```

---

## Cambios recientes

- **E2E pago diferido (dividido):** Añadido `e2e/pos-deferred-payment.spec.ts`: crear orden → /orders → Pagar → dividir pago en dos métodos (Efectivo + Tarjeta), distribuir montos, Procesar Pago → orden Pagada.
- **Switch “Dividir pago” en E2E:** El checkbox del Switch tiene clase `sr-only` (oculto). En el test se usa `getByTestId('payment-split-toggle').click({ force: true })` para no depender de la visibilidad del elemento.
- **data-testid en pago:** En `PaymentMethods.tsx`: `payment-split-toggle` (Switch), `payment-amount-1` y `payment-amount-2` (inputs de monto) para localizar de forma estable en E2E.

---

## Estado actual de pruebas

### E2E (Playwright) – `e2e/`

| Archivo | Qué cubre |
|---------|-----------|
| `login.spec.ts` | Login: formulario visible; login exitoso y redirección a dashboard/POS. |
| `orders.spec.ts` | Órdenes: página visible, header, botones Nueva orden / Actualizar; listado o estado vacío. |
| `pos-takeout.spec.ts` | POS Para Llevar: tipo orden, cliente, productos por categoría (≥2 con extras), guardar, pagar (efectivo), redirección a /orders. |
| `pos-dine-in.spec.ts` | POS Para Comer Aquí: tipo orden, mesa disponible, productos por categoría (≥2 con extras), guardar, pagar, redirección. |
| `pos-create-edit-pay.spec.ts` | Crear orden → Ver/Editar en POS (tres puntos) → quitar ítem, agregar ítem → Guardar cambios → Pagar → /orders. |
| `pos-deferred-payment.spec.ts` | Pago diferido (dividido): crear orden → /orders → Pagar → POS pay view → dividir pago en dos métodos (Efectivo + Tarjeta), distribuir monto, Procesar Pago → orden queda Pagada. |

**Requisito E2E:** Backend API en marcha; usuario `admin@restify.com` (o el configurado); productos, categorías y (para dine-in) al menos una mesa disponible.

### Unitarios y componentes (Vitest) – `src/`

| Archivo | Qué cubre |
|---------|-----------|
| `src/test/smoke.test.ts` | Smoke: entorno Vitest y carga del proyecto. |
| `src/presentation/pages/auth/loginSchema.test.ts` | Schema de login: válido, email inválido, contraseña corta. |
| `src/presentation/pages/auth/LoginPage.test.tsx` | LoginPage: render, validación, llamada a login y navegación con mocks. |
| `src/presentation/pages/orders/OrdersPage.test.tsx` | OrdersPage: render, header, listado o estado vacío. |
| `src/shared/utils/order.utils.test.ts` | Utilidades de órdenes (formato, filtros, etc.). |

---

## Pruebas pendientes por módulo

Solo se listan módulos con código en `src/`. **E2E** = Playwright; **Unit** = Vitest (lógica/servicios); **Componente** = Vitest + RTL (páginas/componentes).

Los módulos marcados como **Pendiente** deben cubrirse con **Unit** y/o **Componente**; no se priorizan E2E para CRUDs.

| Módulo | Tipo recomendado | Estado | Notas |
|--------|------------------|--------|--------|
| **Auth (login)** | E2E, Unit, Componente | Hecho | login.spec, loginSchema.test, LoginPage.test |
| **POS** | E2E | Hecho | takeout, dine-in, create-edit-pay, deferred-payment |
| **Orders** | E2E, Componente | Hecho | orders.spec, OrdersPage.test |
| **Dashboard** | **Unit** / **Componente** | **Pendiente** | Servicio dashboard; opcional: render de DashboardPage |
| **Productos** | **Unit**, **Componente** | **Pendiente** | Servicios/validaciones; formularios ProductForm, listado |
| **Usuarios** | **Unit**, **Componente** | **Pendiente** | Servicios; formularios UserForm, listado |
| **Mesas (Tables)** | **Unit**, **Componente** | **Pendiente** | Servicios; formularios TableForm, listado |
| **Gastos (Expenses)** | **Unit**, **Componente** | **Pendiente** | Servicios; formularios y listado |
| **Menú (categorías e ítems)** | **Unit**, **Componente** | **Pendiente** | Servicios; formularios MenuCategoryForm, MenuItemForm |
| **Reportes** | **Unit**, **Componente** | **Pendiente** | Servicios de reportes; vista de filtros y resultados |
| **Settings** | **Componente** (opcional) | **Pendiente** | Bajo impacto; solo si hay lógica relevante |

**Resumen de pendientes:** Dashboard, Productos, Usuarios, Mesas, Gastos, Menú, Reportes y Settings. Tipo de pruebas: **Unit** (lógica, servicios, validaciones) y **Componente** (formularios, listados, páginas con RTL). No E2E para estos módulos.

---

## Setup completado (Fase 1 – configuración)

El entorno de pruebas está configurado y hay pruebas implementadas para Auth, POS, Orders y utilidades:

| Elemento | Ubicación |
|----------|-----------|
| Config Vitest + jsdom + coverage | `vitest.config.ts` (raíz) |
| Setup RTL (jest-dom) | `src/test/setup.ts` |
| Scripts | `package.json`: `test`, `test:run`, `test:coverage`, `test:e2e`, `test:e2e:ui` |
| Dependencias | Vitest, RTL, Playwright, @vitest/coverage-v8 (ver `package.json`) |

**Para nuevos desarrolladores:** Ver sección **Resumen para nuevos desarrolladores** y **Pruebas pendientes por módulo** al inicio del documento. Para ampliar cobertura, seguir los **Pasos para implementar** más abajo.

---

## Pasos para implementar (uno por uno)

Ir paso a paso para poder leer el código y entender qué está pasando. No ejecutar todo de golpe.

| Paso | Qué hacer | Qué aprendes |
|------|-----------|---------------|
| **Paso 1 – Smoke test** | Crear un test mínimo que solo compruebe que el entorno funciona (p. ej. `expect(1).toBe(1)` o un `describe`/`it` que importe algo del proyecto). | Cómo se ejecuta Vitest y que el alias `@/` y el setup cargan bien. |
| **Paso 2 – Test del schema de login (unitario)** | Exportar el schema de login (o moverlo a un archivo compartido). Crear `loginSchema.test.ts` con 2–3 tests: “acepta email y contraseña válidos”, “rechaza email inválido”, “rechaza contraseña corta”. | `describe`, `it`, `expect` y tests puros sin UI. |
| **Paso 3 – Test de componente: solo render** | En `LoginPage.test.tsx` hacer un test que solo **renderice** `LoginPage` (con wrappers: `MemoryRouter`, y si hace falta `QueryClientProvider`). Comprobar que existen los campos de email y contraseña y el botón “Iniciar Sesión” (`getByLabelText`, `getByRole`). Sin mocks de `useAuth` todavía; si falla al montar, vemos qué mock hace falta. | Cómo renderizar una página con RTL y qué wrappers necesita. |
| **Paso 4 – Mocks y helper de render** | Si en el paso 3 hace falta: mockear `useAuth` (y quizá `useNavigate`) con `vi.mock(...)`, y opcionalmente crear un helper `renderWithProviders(ui)` que envuelva en Router (y QueryClient si aplica). Un test que renderice de nuevo y compruebe lo mismo, pero ya con mocks. | Cómo aislar el componente del backend y del router. |
| **Paso 5 – Test de interacción: validación** | Un test donde el usuario escribe un email inválido (o deja campos vacíos), envía el formulario, y comprobamos que aparece el mensaje de error de Zod (“Email inválido” o “La contraseña debe tener al menos 6 caracteres”). Usar `userEvent` y `waitFor`/`findBy*`. | Cómo simular interacción de usuario y esperar mensajes en pantalla. |
| **Paso 6 – Test de flujo exitoso (opcional)** | Con mocks: que al enviar credenciales válidas se llame a `login` con esos datos y se llame a `navigate` con `/dashboard` o `/pos`. | Cómo testear comportamiento que depende del store y del router. |

**Orden sugerido:** Paso 1 → Paso 2 → Paso 3 → … Sin saltar; en cada paso revisar el código y el resultado antes de seguir.

---

## 1. Objetivos

- **Corto plazo (hecho):** Entorno de pruebas, login (unit + componente + E2E), POS (E2E Para Llevar / Para Comer Aquí / crear-editar-pagar), Orders (E2E + componente), utilidades de órdenes (unit).
- **Mediano plazo:** Añadir unit/componente a módulos CRUD (productos, usuarios, mesas, gastos, menú, reportes) según prioridad; integrar E2E en CI.
- **Largo plazo:** Cobertura mínima sostenible; no E2E para CRUDs salvo excepción justificada.

---

## 2. Herramientas recomendadas

| Capa | Herramienta | Uso |
|------|-------------|-----|
| **Runner + unit** | [Vitest](https://vitest.dev/) | Tests unitarios, mismos paths y `import.meta` que Vite. |
| **Componentes / integración** | [React Testing Library](https://testing-library.com/react) (RTL) | Renderizar componentes, simular interacción de usuario. |
| **E2E (flujo UI real)** | [Playwright](https://playwright.dev/) | Abrir navegador, simular login completo y navegación. |
| **Mocks de API** | [MSW](https://mswjs.io/) (opcional en fase 2) | Interceptar peticiones y devolver respuestas controladas. |

**Por qué Vitest:** Ya usas Vite; Vitest comparte config, alias `@/` y variables de entorno. No hace falta Jest.

**Por qué Playwright para E2E:** Buen soporte TypeScript, varios navegadores, grabador de acciones, paralelismo y reportes claros.

---

## 3. Fases de implementación

### Fase 1 (hecha): Configuración base + login + POS + Orders

- Vitest, RTL, Playwright configurados.
- Login: unit (schema), componente (LoginPage), E2E (login.spec).
- POS: E2E Para Llevar, Para Comer Aquí, crear-editar-pagar, pago diferido (dividir en dos métodos).
- Orders: E2E (orders.spec), componente (OrdersPage).
- Utilidades: order.utils.test.ts.

### Fase 2: CRUDs y CI

1. Añadir tests unitarios y/o de componente a módulos pendientes (productos, usuarios, mesas, gastos, menú, reportes) según prioridad.
2. (Opcional) MSW para mockear API en tests de componente.
3. Integrar en CI: `npm run test:run` y `npm run test:e2e` (E2E requiere backend en el pipeline).

### Fase 3: Cobertura y mantenimiento

1. Definir umbrales de cobertura mínima para unit/componente.
2. Mantener E2E de POS y Orders como regresión; no añadir E2E a CRUDs salvo excepción.

---

## 4. Configuración técnica

### 4.1 Dependencias a instalar

```bash
# Unit + componentes
npm i -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @vitest/coverage-v8

# E2E (fase 2)
npm i -D @playwright/test
npx playwright install
```

### 4.2 Vitest

- **Archivo:** `vitest.config.ts` en la raíz (o bloque `test` dentro de `vite.config.ts`).
- **Incluir:** `src/**/*.{test,spec}.{ts,tsx}`.
- **Environment:** `jsdom` para componentes.
- **Alias:** Mismo `@/` que en `vite.config.ts` (o importar `defineConfig` desde Vite y extender).
- **Globals (opcional):** `globals: true` si quieres `describe`/`it`/`expect` sin importar.
- **Coverage:** provider `v8`, reporter `text` (y luego `html` si quieres).

### 4.3 React Testing Library

- **Setup:** Crear `src/test/setup.ts` (o `vitest.setup.ts`) que ejecute `import '@testing-library/jest-dom'` para matchers como `toBeInTheDocument()`, `toHaveValue()`.
- En `vitest.config.ts` apuntar `setupFiles: ['src/test/setup.ts']`.
- **Wrappers:** Para componentes que usan Router, QueryClient o Theme, crear un helper `renderWithProviders(ui, { ... })` que envuelva en `MemoryRouter`, `QueryClientProvider`, etc., y usarlo en los tests de login.

### 4.4 Playwright (E2E)

- **Archivo:** `playwright.config.ts` en la raíz.
- **baseURL:** `http://localhost:5173` (o el puerto de `npm run dev`).
- **Proyectos:** chromium (suficiente para empezar).
- **Timeout:** por ejemplo 15s por test.
- Los tests E2E vivirán en `e2e/` o `tests/e2e/`, por ejemplo `e2e/login.spec.ts`.

### 4.5 Scripts en `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 5. Pruebas de login (diseño y ejemplos)

El login actual:

- **Página:** `LoginPage` con formulario (email, contraseña), validación con Zod, envío con `useAuth().login()`.
- **Flujo:** submit → `authService.login()` → si OK, `loginStore(data)` y `navigate(rol === 'WAITER' ? '/pos' : '/dashboard')`.
- **Elementos útiles para tests:** `id="email"`, `id="password"`, botón "Iniciar Sesión", mensaje de error con `role="alert"`, labels "Email" y "Contraseña".

### 5.1 Qué probar en login

| Tipo | Qué probar |
|------|------------|
| **Unit (lógica)** | Validación del schema (email inválido, password &lt; 6 caracteres). Comportamiento de `useAuth().login` con respuestas mock (éxito, error 401, error red). |
| **Componente** | LoginPage renderiza campos y botón; validación muestra errores; al enviar con datos válidos se llama a `login` y se navega (mockeando `useAuth` y `useNavigate`). |
| **E2E** | Usuario abre `/auth/login`, escribe email y contraseña, pulsa Iniciar Sesión; comprobar que la URL pasa a `/dashboard` o `/pos` y que aparece un elemento típico del dashboard (o POS). |

### 5.2 Ejemplo: test unitario del schema de login

```ts
// src/presentation/pages/auth/__tests__/loginSchema.test.ts
import { describe, it, expect } from 'vitest';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

describe('Login schema', () => {
  it('acepta email y contraseña válidos', () => {
    const result = loginSchema.safeParse({
      email: 'admin@restify.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza email inválido', () => {
    const result = loginSchema.safeParse({
      email: 'no-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza contraseña corta', () => {
    const result = loginSchema.safeParse({
      email: 'admin@restify.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });
});
```

(En el proyecto el schema está definido dentro de `LoginPage.tsx`; para este test habría que exportar el schema o moverlo a un módulo compartido.)

### 5.3 Ejemplo: test de componente LoginPage

- **Objetivo:** Ver que el formulario existe, que la validación muestra errores y que, con credenciales válidas mockeadas, se llama a `login` y se navega.
- **Mocks:** `vi.mock('@/presentation/hooks/useAuth')` para devolver `login`, `isLoading`, `error` controlados; `vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }))`.
- **Pasos:**
  1. Render con `renderWithProviders(<LoginPage />)` (incluyendo Router y, si hace falta, QueryClient).
  2. Buscar inputs por `label` o `placeholder` (RTL: `getByLabelText`, `getByPlaceholderText`) y el botón por texto "Iniciar Sesión".
  3. **Validación:** dejar email vacío o inválido, submit, y comprobar que aparece el mensaje de error del schema.
  4. **Éxito:** rellenar email y contraseña válidos, submit, y comprobar que `mockLogin` fue llamado con esos datos y que `mockNavigate` fue llamado con `/dashboard` o `/pos` según el rol que devuelva el mock del store.

```ts
// Ejemplo de estructura (src/presentation/pages/auth/__tests__/LoginPage.test.tsx)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/presentation/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el formulario de login', () => {
    renderLoginPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('muestra error de validación con email inválido', async () => {
    const user = userEvent.setup();
    renderLoginPage();
    await user.type(screen.getByLabelText(/email/i), 'no-email');
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('al enviar credenciales válidas llama a login y navega', async () => {
    mockLogin.mockResolvedValue({ success: true });
    // Mock del store para que user.rol sea 'ADMIN' y navigate reciba '/dashboard'
    const user = userEvent.setup();
    renderLoginPage();
    await user.type(screen.getByLabelText(/email/i), 'admin@restify.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'password123');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@restify.com',
        password: 'password123',
      });
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
```

Nota: en el código real, `LoginPage` usa `useAuthStore.getState().user` para decidir la ruta; en el test habría que mockear también el store para que `user?.rol === 'WAITER'` o no según el caso.

### 5.4 Ejemplo: E2E de login (Playwright)

- **Objetivo:** Un usuario real abre la app, escribe en los campos y pulsa Iniciar Sesión; comprobar que termina en dashboard (o POS) y que se ve algo esperado (por ejemplo título "Dashboard" o "Punto de venta").
- **Requisito:** Backend de login funcionando (o mock con MSW a nivel E2E si se configura).
- **Pasos:**
  1. `page.goto('/auth/login')`.
  2. `page.getByLabel('Email').fill('admin@restify.com')` (o el selector que sea estable).
  3. `page.getByLabel('Contraseña').fill('password123')`.
  4. `page.getByRole('button', { name: 'Iniciar Sesión' }).click()`.
  5. `expect(page).toHaveURL(/\/dashboard|\/pos/)` y/o `expect(page.getByText('Dashboard')).toBeVisible()`.

```ts
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('usuario puede iniciar sesión y llegar al dashboard', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByLabel(/email/i).fill('admin@restify.com');
    await page.getByLabel(/contraseña/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL(/\/(dashboard|pos)/);
    await expect(page.getByRole('heading', { name: /dashboard|punto de venta/i })).toBeVisible({ timeout: 10000 });
  });
});
```

---

## 6. Buenas prácticas (resumen)

- **Selectores:** Preferir `getByRole`, `getByLabelText`, `getByText`; evitar clases CSS o IDs que cambien.
- **Async:** Usar `findBy*` o `waitFor` para esperar a que aparezcan mensajes o navegación tras el submit.
- **Mocks:** Aislar la UI del backend en tests de componente; mockear `useAuth`, `authService` o el cliente HTTP según convenga.
- **Un test, un flujo:** Cada test debe verificar un comportamiento claro (ej.: "muestra error cuando el email es inválido").
- **Nomenclatura:** `describe('LoginPage')` / `it('muestra error de validación con email inválido')` para que los reportes sean legibles.

---

## 7. Orden sugerido para nuevas pruebas

1. Revisar **Pruebas pendientes por módulo** y elegir el módulo a cubrir.
2. Para **unitarios:** crear `*.test.ts` junto al servicio/util/schema; mockear dependencias; probar casos válidos e inválidos.
3. Para **componentes:** crear `*.test.tsx` junto a la página o componente; usar `renderWithProviders` si hace falta (Router, QueryClient); probar render, validaciones y acciones con mocks.
4. Para **E2E:** solo en POS u Orders; crear `e2e/<modulo>-<flujo>.spec.ts`; usar `beforeEach` con login si aplica; preferir `getByRole`/`getByLabel`/`data-testid`; no asumir datos fijos del backend.
5. Ejecutar `npm run test:run` y/o `npm run test:e2e` y comprobar que pasan.

Ver secciones **Resumen para nuevos desarrolladores** (normas y estructura) y **5. Pruebas de login** (ejemplos de unit, componente y E2E) como referencia.
