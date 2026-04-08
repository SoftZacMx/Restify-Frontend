# Plan de Mejoras a Nivel Componentes

> **Fecha:** 2026-04-07
> **Proyecto:** Restify Frontend
> **Objetivo:** Aplicar buenas prácticas de React para mejorar mantenibilidad, reutilización y rendimiento de los componentes.

---

## Resumen por Fase

| Fase | Módulo | Prioridad | Problemas Principales |
|------|--------|-----------|----------------------|
| 1 | POS | P0 | Hook monolítico (800+ líneas), componente de 951 líneas, lógica de QR en componente |
| 2 | Orders | P1 | Página de 543 líneas, múltiples diálogos acoplados, filtros repetidos |
| 3 | Dashboard | P1 | Página de 653 líneas, secciones extraíbles, helpers inline |
| 4 | CRUD Pages (Products, Users, MenuItems, MenuCategories, Tables) | P2 | Patrón CRUD repetido 5 veces, formularios sin react-hook-form |
| 5 | Expenses + Reports | P2 | Instanciación de servicios en render, paginación manual |
| 6 | Transversal (Forms, Accesibilidad, Patrones compartidos) | P2 | 8+ formularios manuales, aria-labels faltantes, HTML no semántico |

---

## Fase 1 — POS

**Archivos principales:**
- `src/presentation/pages/pos/PosPage.tsx` (951 líneas)
- `src/presentation/hooks/usePos.ts` (~800 líneas)

### 1.1 Dividir el hook `usePos` en hooks enfocados

`usePos` es un "god hook" con 40+ variables de estado y 20+ handlers. Dividir en:

| Hook Nuevo | Responsabilidad | Estado que maneja |
|------------|----------------|-------------------|
| `usePosFetch` | Carga de datos (productos, mesas, categorías, órdenes) | queries de React Query |
| `useOrderBuilder` | Construcción del carrito y la orden | items, cantidades, extras, notas |
| `usePosPayment` | Estado y handlers de métodos de pago | método seleccionado, montos, split payment |
| `usePosMode` | Modo de operación y flujo de trabajo | modo (nueva orden / editar / mesa), navegación |

```tsx
// Antes (PosPage.tsx)
const { products, tables, cart, addToCart, removeFromCart,
        paymentState, handlePayment, selectedMethod1,
        selectedMethod2, ... } = usePos();

// Después (PosPage.tsx)
const { products, tables, categories } = usePosFetch();
const { cart, addToCart, removeFromCart, updateQuantity } = useOrderBuilder();
const { paymentState, selectedMethod, handlePayment } = usePosPayment();
const { mode, navigateToStep } = usePosMode();
```

### 1.2 Extraer flujo de pago QR a hook propio

La lógica de creación de QR, polling y resultado (líneas 142-209 de PosPage) está directamente en el componente.

Crear `useQrPaymentFlow`:

```tsx
// src/presentation/hooks/useQrPaymentFlow.ts
function useQrPaymentFlow() {
  // Creación de sesión QR
  // Polling de estado
  // Manejo de resultado (éxito/timeout/error)
  // Cleanup al desmontar
  return { startQrPayment, qrStatus, qrData, cancelQrPayment };
}
```

### 1.3 Extraer sub-componentes del PosPage

| Componente a extraer | Líneas aprox. | Descripción |
|----------------------|---------------|-------------|
| `PosProductGrid` | ~80 | Grid de productos con búsqueda y filtro por categoría |
| `PosOrderSummary` | ~60 | Resumen de la orden actual |
| `PosPaymentFlow` | ~120 | Flujo completo de pago (selección de método + confirmación) |
| `PosQrPaymentDialog` | ~80 | Modal del QR con polling y estados |

### 1.4 Reducir prop drilling en PaymentMethods

`PaymentMethods.tsx` recibe 9+ props. Usar un Context:

```tsx
// Antes
<PaymentMethods
  paymentState={paymentState}
  errors={errors}
  selectedMethod1={selectedMethod1}
  selectedMethod2={selectedMethod2}
  showSecondPaymentMethod={showSecondPaymentMethod}
  onShowSecondPaymentMethodChange={setShowSecondPaymentMethod}
  // ... más props
/>

// Después
<PosPaymentProvider value={{ paymentState, errors, methods }}>
  <PaymentMethods />
</PosPaymentProvider>
```

### 1.5 Memoizar callbacks no envueltos

- `handleMethod1ChangeWithQr` se recrea en cada render — envolver en `useCallback`.
- `handleAmountChange` en `PaymentMethods.tsx` — envolver en `useCallback`.

### Checklist Fase 1

- [ ] Dividir `usePos` en 4 hooks enfocados.
- [ ] Extraer `useQrPaymentFlow` con lógica de QR.
- [ ] Crear sub-componentes `PosProductGrid`, `PosOrderSummary`, `PosPaymentFlow`, `PosQrPaymentDialog`.
- [ ] Crear `PosPaymentContext` para eliminar prop drilling.
- [ ] Memoizar callbacks faltantes.
- [ ] Verificar que PosPage quede bajo 200 líneas.

---

## Fase 2 — Orders

**Archivos principales:**
- `src/presentation/pages/orders/OrdersPage.tsx` (543 líneas)

### 2.1 Extraer hook de filtrado y paginación

Las líneas 49-70 manejan múltiples estados de filtros. Extraer a:

```tsx
// src/presentation/hooks/useOrderFilters.ts
function useOrderFilters() {
  const [filters, setFilters] = useState<OrderFilters>(defaults);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Reset de página al cambiar filtros
  // Conversión de filtros UI → API

  return { filters, setFilters, pagination, setPagination, apiFilters };
}
```

### 2.2 Extraer componentes de diálogos

| Componente | Responsabilidad |
|------------|----------------|
| `OrderDetailDialog` | Ya existe, pero su state se maneja desde OrdersPage |
| `OrderDeleteConfirmation` | Diálogo de confirmación + lógica de eliminación |
| `OrderFiltersBar` | Barra de filtros con estado propio |

### 2.3 Extraer lógica de diálogos a hook

```tsx
// src/presentation/hooks/useDialogState.ts
function useDialogState<T>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((item: T) => { setData(item); setIsOpen(true); }, []);
  const close = useCallback(() => { setIsOpen(false); setData(null); }, []);

  return { isOpen, data, open, close };
}

// Uso en OrdersPage
const detailDialog = useDialogState<Order>();
const deleteDialog = useDialogState<Order>();
```

### Checklist Fase 2

- [ ] Crear `useOrderFilters` con filtrado y paginación.
- [ ] Crear `useDialogState` genérico (reutilizable en otras fases).
- [ ] Extraer `OrderFiltersBar` como componente.
- [ ] Extraer `OrderDeleteConfirmation` con lógica de eliminación.
- [ ] Verificar que OrdersPage quede bajo 200 líneas.

---

## Fase 3 — Dashboard

**Archivos principales:**
- `src/presentation/pages/dashboard/DashboardPage.tsx` (653 líneas)

### 3.1 Extraer secciones como componentes

| Componente | Descripción |
|------------|-------------|
| `DashboardKpiCards` | Tarjetas de métricas principales (ventas, órdenes, ticket promedio) |
| `SalesChart` | Visualización de ventas con gráficos (recharts) |
| `OccupiedTablesCard` | Sección de mesas ocupadas |
| `RecentOrdersSection` | Órdenes recientes/completadas |

### 3.2 Mover helpers a archivo de utilidades

Las funciones `getInitials`, `formatOrderTime`, `getOrderStatusLabel` (líneas 66-95) están definidas inline dentro del componente.

```
// Mover a:
src/shared/utils/dashboard.utils.ts
```

### 3.3 Memoizar cálculos derivados

- `maxBarTotal` (línea 117-120) no está memoizado.
- Las funciones helper se redefinen en cada render.

### Checklist Fase 3

- [ ] Extraer `DashboardKpiCards`, `SalesChart`, `OccupiedTablesCard`, `RecentOrdersSection`.
- [ ] Mover helpers a `dashboard.utils.ts`.
- [ ] Memoizar cálculos derivados.
- [ ] Verificar que DashboardPage quede bajo 150 líneas (composición de secciones).

---

## Fase 4 — CRUD Pages (Products, Users, MenuItems, MenuCategories, Tables)

**Archivos principales:**
- `src/presentation/pages/products/ProductsPage.tsx` (398 líneas)
- `src/presentation/pages/users/UsersPage.tsx` (408 líneas)
- `src/presentation/pages/menu-items/MenuItemsPage.tsx` (396 líneas)
- `src/presentation/pages/menu-categories/MenuCategoriesPage.tsx` (373 líneas)
- `src/presentation/pages/tables/TablesPage.tsx` (346 líneas)

### 4.1 Crear hook genérico `useCrudList`

Las 5 páginas repiten el mismo patrón: query de datos, filtros, paginación, modales de crear/editar/eliminar.

```tsx
// src/presentation/hooks/useCrudList.ts
interface UseCrudListOptions<T, F> {
  queryKey: string[];
  queryFn: (filters: F) => Promise<PaginatedResponse<T>>;
  initialFilters: F;
  itemsPerPage?: number;
}

function useCrudList<T, F>(options: UseCrudListOptions<T, F>) {
  // Query con React Query
  // Estado de filtros
  // Paginación
  // Estado de modales (crear, editar, eliminar)
  // Callbacks memoizados

  return {
    data, isLoading, error,
    filters, setFilters,
    pagination: { currentPage, totalPages, setPage },
    createModal: { isOpen, open, close },
    editModal: { isOpen, data, open, close },
    deleteModal: { isOpen, data, open, close },
  };
}
```

**Impacto estimado:** Cada página CRUD pasa de ~400 líneas a ~100-150 líneas.

### 4.2 Migrar formularios a react-hook-form + Zod

Todos los formularios (ProductForm, TableForm, MenuItemForm, UserForm, etc.) usan `useState` manual para `formData` y `errors`. Migrar a react-hook-form que ya está instalado pero no se usa en estos formularios.

```tsx
// Antes (ProductForm.tsx — ~130 líneas)
const [formData, setFormData] = useState<CreateProductRequest>(initial);
const [errors, setErrors] = useState<Record<string, string>>({});
const handleChange = (field, value) => { setFormData({...}); setErrors({...}); };
const validate = () => { /* validación manual campo por campo */ };

// Después (~40 líneas)
const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  price: z.number().positive('Precio debe ser positivo'),
  categoryId: z.string().min(1, 'Categoría requerida'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  defaultValues: initialData,
});
```

### 4.3 Corregir instanciación de servicios en render

En `UsersPage.tsx` (línea 47) y otros, el servicio se instancia dentro del componente:

```tsx
// Antes (se ejecuta en cada render)
const userService = new UserService();

// Después (singleton a nivel de módulo)
const userService = new UserService();
function UsersPage() { ... }
```

### Checklist Fase 4

- [ ] Crear hook `useCrudList<T, F>`.
- [ ] Refactorizar ProductsPage usando `useCrudList`.
- [ ] Refactorizar UsersPage usando `useCrudList`.
- [ ] Refactorizar MenuItemsPage usando `useCrudList`.
- [ ] Refactorizar MenuCategoriesPage usando `useCrudList`.
- [ ] Refactorizar TablesPage usando `useCrudList`.
- [ ] Migrar ProductForm a react-hook-form + Zod.
- [ ] Migrar TableForm a react-hook-form + Zod.
- [ ] Migrar MenuItemForm a react-hook-form + Zod.
- [ ] Migrar MenuCategoryForm a react-hook-form + Zod.
- [ ] Migrar UserForm a react-hook-form + Zod.
- [ ] Mover instanciación de servicios fuera del componente.

---

## Fase 5 — Expenses + Reports

**Archivos principales:**
- `src/presentation/pages/expenses/ExpensesPage.tsx` (278 líneas)
- `src/presentation/pages/expenses/ExpenseDetailPage.tsx` (297 líneas)
- `src/presentation/pages/reports/ReportsPage.tsx` (239 líneas)

### 5.1 Expenses: Aplicar `useDialogState` + `useCallback`

> **Nota:** `useCrudList` no aplica porque ExpensesPage tiene paginación del servidor (page/pageSize van al API). Se aplicó `useDialogState` para el delete dialog y `useCallback` en los handlers.

### 5.2 Reports: Memoizar handlers de generación

`handleGenerate` y `handleLoadSummary` envueltos en `useCallback` con sus dependencias (`filters` y `summaryFilters`).

> **Nota:** La instanciación de `ReportService` fuera del componente ya se hizo en la fase 4.3.

### 5.3 Expenses: Formularios de gastos — No aplica

> Los formularios de gastos (`ServiceExpenseForm`, `SalaryExpenseForm`, `MerchandiseExpenseForm`) son sub-formularios controlados por el padre (`CreateExpenseForm`) que comunican cambios con callbacks (`onAmountChange`, `onItemsChange`). No son forms standalone con su propio submit, por lo que migrarlos a react-hook-form individualmente no tiene sentido. El form padre es demasiado dinámico (campos condicionales por tipo de gasto, cálculos automáticos de totales) para una migración segura.

### Checklist Fase 5

- [x] Aplicar `useDialogState` + `useCallback` en ExpensesPage.
- [x] Mover instanciación de servicios fuera de componentes (fase 4.3).
- [x] Memoizar handlers en ReportsPage.
- [x] ~~Migrar formularios de gastos~~ — No aplica (sub-forms controlados).

---

## Fase 6 — Transversal (Patrones Compartidos, Accesibilidad)

> **Nota post-implementación:** `useDialogState` y `useCrudList` ya fueron creados e integrados en las fases 2 y 4. Los SearchBars por módulo tienen filtros demasiado diferentes entre sí (Products: search+status, Users: search+role+status, Tables: search+status+availability) — un componente genérico sería más complejo que lo que reemplaza. `<DataTable>` y `<FormModal>` tienen el mismo problema: cada módulo tiene una tabla y un modal con estructura distinta. Lo que sí tiene impacto real es el `<ConfirmDialog>` (idéntico en 6+ páginas) y las mejoras de accesibilidad.

### 6.1 Crear `<ConfirmDialog />` genérico

El bloque `AlertDialog` de eliminación se repite idéntico en 6+ páginas (~20 líneas cada vez). Extraer a un componente reutilizable:

```tsx
<ConfirmDialog
  open={deleteDialog.isOpen}
  onClose={deleteDialog.close}
  title="¿Eliminar producto?"
  description={<>Estás a punto de eliminar <strong>{name}</strong>. Esta acción no se puede deshacer.</>}
  confirmLabel="Eliminar"
  isLoading={isDeleting}
  onConfirm={handleConfirmDelete}
  variant="destructive"
/>
```

**Páginas que lo usarían:** ProductsPage, UsersPage, MenuItemsPage, MenuCategoriesPage, TablesPage, ExpensesPage, OrdersPage.

### 6.2 Accesibilidad — aria-labels

| Área | Cambio |
|------|--------|
| Formularios migrados (fase 4.2) | Agregar `aria-required` a campos obligatorios |
| Botones de acción en tablas | Agregar `aria-label` descriptivo (ej: `aria-label="Eliminar producto"`) |
| Inputs de búsqueda | Verificar que todos tengan `aria-label="Buscar..."` |
| Botones de pago (POS) | Agregar `aria-pressed` para método seleccionado |

### 6.3 HTML Semántico

Reemplazar `<div>` contenedores por `<main>`, `<section>`, `<header>` en las páginas principales.

```tsx
// Antes
<div className="...">
  <div className="...">Título</div>
  <div className="...">Contenido</div>
</div>

// Después
<main className="...">
  <header className="...">
    <h1>Título</h1>
  </header>
  <section className="...">
    Contenido
  </section>
</main>
```

### Checklist Fase 6

- [ ] Crear `<ConfirmDialog />` genérico y aplicar en las 6+ páginas.
- [ ] Agregar `aria-required` a campos obligatorios en formularios.
- [ ] Agregar `aria-label` a botones de acción en tablas.
- [ ] Agregar `aria-pressed` a botones de pago en POS.
- [ ] Reemplazar `<div>` contenedores por `<main>`, `<section>`, `<header>` donde corresponda.

---

## Orden de Implementación Recomendado

```
Fase 6 (Transversal) ─── Crear hooks y componentes genéricos primero
  │                       (useCrudList, useDialogState, SearchBar, ConfirmDialog, etc.)
  │
  ├── Fase 4 (CRUD Pages) ─── Refactorizar las 5 páginas usando los genéricos
  │
  ├── Fase 5 (Expenses + Reports) ─── Aplicar los mismos patrones
  │
  ├── Fase 2 (Orders) ─── Refactorizar con useDialogState y componentes extraídos
  │
  ├── Fase 3 (Dashboard) ─── Extraer secciones como componentes
  │
  └── Fase 1 (POS) ─── Refactorización más compleja, hacerla al final
                        cuando los patrones ya estén validados
```

> **Nota:** Aunque POS es prioridad P0 por complejidad, se recomienda implementarlo al final porque los patrones creados en las fases anteriores (hooks genéricos, componentes compartidos) se pueden reutilizar directamente en la refactorización del POS.

---

## Métricas de Éxito

| Métrica | Antes | Objetivo |
|---------|-------|----------|
| Líneas en PosPage.tsx | 951 | < 200 |
| Líneas en usePos.ts | ~800 | Dividido en 4 hooks de < 200 c/u |
| Líneas en DashboardPage.tsx | 653 | < 150 |
| Líneas en OrdersPage.tsx | 543 | < 200 |
| Líneas promedio CRUD pages | ~390 | < 150 |
| Formularios con react-hook-form | 2/10 | 10/10 |
| Atributos aria- en componentes | ~48 | 150+ |
