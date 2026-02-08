# Guía para IA: setup y pruebas automatizadas

Este archivo es una guía de referencia para asistentes de IA (y desarrolladores) al inicializar el proyecto y al crear o ejecutar pruebas automatizadas. Consultar también `documentation/PLAN_PRUEBAS_AUTOMATIZADAS.md` para estrategia y ejemplos detallados.

---

## 1. Inicializar el proyecto (qué instalar y qué hacer)

### Requisitos previos

- **Node.js** (LTS recomendado, p. ej. 20+)
- **npm** (viene con Node)

### Pasos al clonar o abrir el proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Instalar navegadores de Playwright (solo si vas a correr E2E)
npx playwright install
```

### Variables de entorno (para dev y E2E)

- Copiar `.env.example` a `.env` y rellenar:
  - `VITE_API_BASE_URL`: URL del backend (ej. `http://localhost:3000`)
  - `VITE_WS_URL`: URL del WebSocket (suele ser la misma que la API)
- **E2E:** Los tests E2E de login y POS requieren que el **backend esté en marcha** y un usuario válido (p. ej. `admin@restify.com`).

---

## 2. Ejecutar pruebas

| Qué ejecutar | Comando | Requisito |
|--------------|---------|-----------|
| **Unitarias + componentes (Vitest)** | `npm run test` (watch) o `npm run test:run` (una vez) | Ninguno |
| **Cobertura Vitest** | `npm run test:coverage` | Ninguno |
| **E2E (Playwright)** | `npm run test:e2e` | Backend API en marcha; frontend se levanta solo con `npm run dev` si no está corriendo |
| **E2E con UI** | `npm run test:e2e:ui` | Igual que E2E |
| **Un solo archivo E2E** | `npx playwright test e2e/pos-takeout.spec.ts` | Igual que E2E |

- **Vitest** usa `vitest.config.ts`, setup en `src/test/setup.ts`, alias `@/` → `src/`.
- **Playwright** usa `playwright.config.ts`, tests en `e2e/*.spec.ts`, `baseURL` `http://localhost:5173`; el `webServer` puede arrancar la app con `npm run dev` si no hay servidor.

---

## 3. Dónde poner nuevas pruebas y cómo nombrarlas

| Tipo | Ubicación | Nombre archivo | Ejecución |
|------|-----------|----------------|------------|
| **E2E** | `e2e/` | `e2e/<modulo>-<flujo>.spec.ts` (ej. `pos-deferred-payment.spec.ts`) | `npx playwright test e2e/<archivo>` |
| **Unitario** | Mismo directorio que el código | `*.test.ts` o `*.test.tsx` (ej. `order.utils.test.ts`) | `npm run test` / `npm run test:run` |
| **Componente** | Junto a la página o componente | `*.test.tsx` (ej. `LoginPage.test.tsx`) | `npm run test` |

- **Vitest** incluye por defecto: `src/**/*.{test,spec}.{ts,tsx}` (ver `vitest.config.ts`).

---

## 4. Reglas rápidas al crear pruebas (para la IA)

### E2E (Playwright)

- **Login:** Si el flujo requiere sesión, hacer login en `beforeEach` (reutilizar helper o `page.goto`, fill, click).
- **Selectores:** Preferir `getByRole`, `getByLabel`, `getByText`. Para elementos repetidos o críticos usar `data-testid` en el componente y `getByTestId('id')` en el test.
- **Elementos ocultos (sr-only, etc.):** Si un control está oculto pero tiene `data-testid`, usar `.click({ force: true })` para activarlo.
- **Timeouts:** Flujos largos (POS, pago) pueden necesitar 60–90 s; en Playwright config o en el test con `test.setTimeout()`.
- **Datos:** No asumir nombres de productos o ítems fijos si vienen del backend; buscar por texto, rol o testid genérico.

### Unitarios y componentes (Vitest + RTL)

- **Mocks:** Mockear servicios, `useAuth`, `useNavigate`, store, etc.; no llamar a la API real.
- **Setup:** Los tests de componente pueden necesitar `MemoryRouter`, `QueryClientProvider`; existe `src/test/setup.ts` (jest-dom, localStorage, matchMedia).
- **Un test, un comportamiento:** Nombres descriptivos en español (ej. `it('muestra error cuando el email es inválido')`).

### Módulos con pruebas ya hechas

- **Auth:** E2E `e2e/login.spec.ts`, unit `loginSchema.test.ts`, componente `LoginPage.test.tsx`.
- **POS:** E2E `e2e/pos-takeout.spec.ts`, `pos-dine-in.spec.ts`, `pos-create-edit-pay.spec.ts`, `pos-deferred-payment.spec.ts`.
- **Orders:** E2E `e2e/orders.spec.ts`, componente `OrdersPage.test.tsx`; unit `order.utils.test.ts`.

### Módulos pendientes (solo Unit + Componente, no E2E)

Dashboard, Productos, Usuarios, Mesas, Gastos, Menú, Reportes, Settings. Ver tabla en `documentation/PLAN_PRUEBAS_AUTOMATIZADAS.md` (sección «Pruebas pendientes por módulo»).

---

## 5. Resumen de comandos para copiar/pegar

```bash
npm install
npx playwright install
cp .env.example .env
# Editar .env con VITE_API_BASE_URL y VITE_WS_URL

npm run test:run
npm run test:e2e
```

---

**Documentación completa:** `documentation/PLAN_PRUEBAS_AUTOMATIZADAS.md`
