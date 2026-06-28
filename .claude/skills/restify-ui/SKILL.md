---
name: restify-ui
description: Use when building or modifying UI in Restify-Frontend (any work in src/presentation, src/application, src/infrastructure, src/domain, or new pages/components). Enforces stack, layered architecture, design tokens, shadcn-ui patterns, useCrudList for lists, RHF+Zod for forms, sonner for toasts, AppError handling, role-based visibility, and dark-mode-by-default. Skip for pure backend work or content-only edits.
---

# Restify Frontend — UI/UX Convention Skill

Esta guía es **prescriptiva**. Toda pantalla nueva o modificación visible debe seguir estas reglas para mantener uniformidad. No "improvises" estilos ni patrones — si dudás, reproducí lo que ya existe en `src/presentation/components/products/` o `src/presentation/components/expenses/`.

## 1. Stack obligatorio (no negociable)

| Categoría | Lib | Reglas |
|---|---|---|
| Framework | React 19 + Vite + TS | `"type": "module"` ESM. Strict TS. |
| Estilos | Tailwind + shadcn/ui (base `slate`) | CSS vars HSL en `index.css`. **Nunca** clases de color hardcodeadas (`bg-blue-600`). |
| Routing | `react-router-dom@7` | Rutas en `App.tsx`/`router.tsx`. |
| Estado global | `zustand` | Sólo para auth/sidebar/theme. Estado de UI local con `useState`. |
| Server state | `@tanstack/react-query@5` | Listas con `useQuery`. Mutaciones con `useMutation` + `invalidateQueries`. |
| Formularios | `react-hook-form` + `@hookform/resolvers` + `zod` | Schema en el archivo del form o en `domain/types`. |
| Toasts | `sonner` (vía `@/shared/utils/toast`) | Nunca llamar `toast()` directo desde componente. |
| Iconos | `lucide-react` | Tamaño `h-5 w-5` por defecto. |
| Charts | `recharts` | Para reportes. |
| HTTP | `axios` (vía `@/infrastructure/api/client`) | Interceptor convierte errores a `AppError`. |
| Realtime | `socket.io-client` | Vía `useWebSocket` hook. |

Si pensás agregar otra lib, no lo hagas sin pedir confirmación.

## 2. Arquitectura por capas (DDD-lite)

```
src/
├── domain/                 → tipos, entidades, errores. SIN imports de React/axios.
│   ├── entities/           ej. User.entity.ts
│   ├── interfaces/         contratos
│   ├── types/              re-exports + DTOs
│   └── errors/             AppError
├── application/
│   └── services/           orquesta repositorios, sin React
├── infrastructure/
│   └── api/
│       ├── client.ts       axios + interceptors (no tocar salvo motivo claro)
│       └── repositories/   *.repository.ts → 1 método por endpoint
├── presentation/
│   ├── pages/<feature>/    <Feature>Page.tsx
│   ├── components/
│   │   ├── ui/             shadcn primitives, no editar salvo bug
│   │   ├── layouts/        MainLayout, PublicLayout, SettingsLayout, Sidebar
│   │   └── <feature>/      componentes de la feature
│   ├── hooks/              hooks compartidos (`useCrudList`, `useDialogState`, ...)
│   ├── store/              zustand stores
│   └── contexts/           sólo si es realmente necesario
└── shared/
    ├── utils/              toast, error-handler, formatters
    ├── constants/          ROUTES, APP_TIMEZONE, etc.
    └── lib/                cn(), helpers de UI
```

### Flujo de datos (NO saltarse capas)

```
<Page> ─▶ useFeatureHook (o useCrudList) ─▶ featureService ─▶ featureRepository ─▶ apiClient ─▶ Backend
```

- Componentes **nunca** llaman a `apiClient` directo.
- Hooks **nunca** llaman a `repository` directo (siempre vía `service`).
- `domain` no importa de ninguna otra capa.

### Path aliases

Siempre `@/...`. Nunca rutas relativas largas (`../../..`).

```ts
import { ProductTable } from '@/presentation/components/products/ProductTable';
import { productService } from '@/application/services';
import type { ProductResponse } from '@/domain/types';
import { showSuccessToast } from '@/shared/utils/toast';
import { cn } from '@/shared/lib/utils';
```

Orden de imports: react/libs → `@/domain` → `@/application` → `@/infrastructure` → `@/presentation` → `@/shared` → relativos.

## 3. Design tokens — Tailwind + CSS vars

Las CSS vars viven en `src/index.css` y se mapean en `tailwind.config.js` a clases. **Usar siempre las clases tokenizadas**:

| Uso | Clase | NO usar |
|---|---|---|
| Fondo de página | `bg-background` (o `bg-slate-50 dark:bg-slate-900` para layouts) | `bg-white`, `bg-gray-100` |
| Card | `bg-card text-card-foreground` o `bg-white dark:bg-background-dark` | `bg-white` solo |
| Acción primaria | `bg-primary text-primary-foreground hover:bg-primary/90` | `bg-blue-600` |
| Acción peligrosa | `bg-destructive text-destructive-foreground` | `bg-red-600` |
| Texto secundario | `text-muted-foreground` o `text-slate-500 dark:text-slate-400` | `text-gray-600` |
| Bordes | `border border-border` o `border-slate-200 dark:border-slate-800` | `border-gray-200` |
| Inputs y selects con superficie | `bg-slate-100 dark:bg-slate-800` | `bg-white` |
| Header de tabla | `bg-slate-50 dark:bg-slate-800/50` | colores ad-hoc |

**Dark mode siempre**: cualquier clase de color visible debe tener su variante `dark:`. Si no la incluís, no merge.

**Border radius**: usar `rounded-lg` (0.5rem) para cards/inputs, `rounded-xl` (0.75rem) para contenedores grandes (tablas), `rounded-full` para chips/avatars.

**Tipografía**: la app usa Poppins (cargada en `body`). No declarar `font-family` por componente. Tamaños: `text-xs uppercase tracking-wider` para headers de tabla; `text-sm` para badges; `text-base` para botones por defecto; `text-lg`+ sólo para títulos de página.

## 4. Layouts y estructura de página

Toda página autenticada empieza así:

```tsx
<MainLayout>
  <div className="flex flex-col gap-6">
    {/* Header de página */}
    <header className="flex items-center justify-between px-4 pt-5">
      <div>
        <h1 className="text-2xl font-bold">Productos</h1>
        <p className="text-sm text-muted-foreground">Descripción breve</p>
      </div>
      <Button onClick={...}>
        <Plus className="mr-2 h-5 w-5" />
        Nuevo producto
      </Button>
    </header>

    {/* Filtros */}
    <ProductSearchBar filters={filters} onFiltersChange={setFilters} />

    {/* Contenido principal (tabla / cards / etc.) */}
    <ProductTable products={tableProducts} onProductAction={handleProductAction} isLoading={isLoading} />

    {/* Paginación */}
    <Pagination data={paginationData} onPageChange={...} pageSizeOptions={pageSizeOptions} onPageSizeChange={...} />
  </div>
</MainLayout>
```

`MainLayout` ya provee sidebar + scroll vertical + responsive sidebar collapse. **No manejes scroll/sidebar a mano.**

## 5. Patrón canónico — Página de listado CRUD

**Usá siempre `useCrudList`** de `@/presentation/hooks/useCrudList`. Encapsula query + filtros + paginación cliente + estado de modales.

Esqueleto de página:

```tsx
const filterAdapter = (filters: FooFilters) => ({ /* UI → API */ });
const clientFilter = (data: FooResponse[], filters: FooFilters) => { /* búsqueda local */ };

const FoosPage = () => {
  const {
    rawData, paginatedData, isLoading, error,
    filters, setFilters,
    paginationData, pageSizeOptions, handlePageChange, handlePageSizeChange,
    isCreateModalOpen, setIsCreateModalOpen,
    deleteDialog,
    invalidate,
  } = useCrudList<FooResponse, FooFilters>({
    queryKey: 'foos',
    queryFn: (apiFilters) => fooService.listFoos(apiFilters),
    initialFilters: { search: '' },
    filterAdapter,
    clientFilter,
  });

  // Manejo de error con toast
  React.useEffect(() => {
    if (error) showErrorToast('Error al cargar', error instanceof AppError ? error.message : '');
  }, [error]);

  // ... handlers de acciones (view/edit/delete)
};
```

Reglas:
- Nada de `useState` manual para `loading`/`error` cuando ya viene del query.
- Las mutaciones (`create`, `update`, `delete`) llaman al `service` y luego `invalidate()` para que el listado se refresque.
- El cuerpo de la página NO contiene lógica de fetch — sólo conexión entre hook y componentes.

## 6. Patrón canónico — Tabla

Estructura mínima de un componente `<Feature>Table.tsx`:

```tsx
<div className="px-4 py-5">
  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark">
    {/* Loading */}
    {isLoading && <div className="p-8 text-center text-slate-500 dark:text-slate-400">Cargando ...</div>}
    {/* Empty */}
    {!isLoading && data.length === 0 && <div className="p-8 text-center text-slate-500 dark:text-slate-400">No se encontraron resultados</div>}
    {/* Data */}
    {!isLoading && data.length > 0 && (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Columna</TableHead>
              {/* ... */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(row => (
              <TableRow key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <TableCell className="px-6 py-4">{row.field}</TableCell>
                {/* ... */}
              </TableCell>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </div>
</div>
```

Acciones por fila → `<DropdownMenu>` con ícono `<MoreVertical>`.
Estados → `<Badge>` con variantes; nunca texto plano coloreado.

## 7. Patrón canónico — Filtros

Componente separado `<Feature>SearchBar.tsx` que recibe `{ filters, onFiltersChange }`. Layout:

```tsx
<div className="flex flex-col md:flex-row gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
  {/* Search input con ícono Search dentro de pill bg-slate-100 dark:bg-slate-800, h-12, rounded-lg */}
  <div className="flex-grow">
    <label className="flex flex-col min-w-40 h-12 w-full">
      <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 dark:bg-slate-800">
        <div className="text-slate-500 dark:text-slate-400 flex items-center justify-center pl-4">
          <Search className="h-5 w-5" />
        </div>
        <Input className="border-none bg-transparent ..." />
      </div>
    </label>
  </div>
  {/* Selects de filtro: h-12 rounded-lg bg-slate-100 dark:bg-slate-800 min-w-[140px] */}
</div>
```

## 8. Patrón canónico — Forms

Estructura **3 archivos**: `<Feature>Form.tsx` (base), `Create<Feature>Form.tsx` (wrapper), `Edit<Feature>Form.tsx` (wrapper).

```tsx
// FooForm.tsx
const fooSchema = z.object({ name: z.string().min(1), ... });
type FooFormValues = z.infer<typeof fooSchema>;

export const FooForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FooFormValues>({
    resolver: zodResolver(fooSchema),
    defaultValues: initialData ?? { name: '', ... },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>
      {/* ... */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar'}</Button>
      </div>
    </form>
  );
};
```

Reglas:
- Schema Zod **siempre**. Mensajes en español.
- `defaultValues` resuelve la inicialización (no `useState` manual).
- Errores se muestran inline bajo el input (`text-sm text-destructive mt-1`).
- Botones: `variant="outline"` para cancelar, default para confirmar.
- Form siempre dentro de `<Dialog>` (modal) o de una página dedicada.

## 9. Modales / Diálogos

Usar `<Dialog>` de shadcn:

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Crear producto</DialogTitle>
      <DialogClose />
    </DialogHeader>
    <CreateProductForm onSubmit={...} onCancel={() => setIsOpen(false)} isLoading={isCreating} />
  </DialogContent>
</Dialog>
```

Para confirmaciones destructivas (delete) **siempre** `<ConfirmDialog>`:

```tsx
<ConfirmDialog
  open={deleteDialog.isOpen}
  onOpenChange={deleteDialog.setOpen}
  title="¿Eliminar producto?"
  description="Esta acción no se puede deshacer."
  confirmLabel="Eliminar"
  destructive
  isLoading={isDeleting}
  onConfirm={handleConfirmDelete}
/>
```

## 10. Notificaciones (toasts)

Sólo desde `@/shared/utils/toast`:

```ts
showSuccessToast('Producto creado');
showErrorToast('Error al crear producto', error.message);
showWarningToast('Stock bajo');
showInfoToast('Cargando...');
```

Nunca: `import { toast } from 'sonner'` directo en componentes.

## 11. Manejo de errores

- El interceptor de `apiClient` convierte axios errors a `AppError` (`@/domain/errors`).
- En componentes, `catch (error)` y `instanceof AppError` para extraer `message`.
- Errores de query → mostrar toast (`useEffect(() => { if (error) showErrorToast(...); }, [error])`).
- Errores de mutación → toast en `onError` o `try/catch` en handler.

```tsx
try {
  await fooService.createFoo(data);
  showSuccessToast('Foo creado');
  invalidate();
} catch (error) {
  showErrorToast('Error al crear', error instanceof AppError ? error.message : 'Intentalo de nuevo');
}
```

## 12. Navegación / sidebar / permisos

- Items del sidebar en `Sidebar.tsx`. Filtrá por rol con `useAuthStore().user?.rol`. Roles: `ADMIN`, `MANAGER`, `WAITER`, `CHEF` (+ `OWNER` si aparece).
- Rutas protegidas envueltas en `<PrivateRoute>` con `allowedRoles={[...]}`.
- En componentes/botones que requieren rol, esconder el botón con `if (rol !== 'ADMIN') return null;` o renderizar deshabilitado con tooltip explicativo.

## 13. Loading / Empty / Error states (los 3 son obligatorios)

Toda lista debe contemplar:
- **Loading** — mensaje "Cargando..." dentro del contenedor de la tabla, mismo estilo.
- **Empty** — mensaje "No se encontraron …" centrado, mismo contenedor.
- **Error** — toast (`useEffect` sobre `error` del query). NO renderizar página rota.

Para páginas enteras cargando (transición de ruta) usar `<PageLoader>`.

## 14. Realtime (websockets)

Usar `useWebSocket` hook. No suscribirse a sockets desde componentes random — siempre vía hook + service.

## 15. Sonidos / efectos

`use-sound` + `usePaymentSound`. Sólo donde se necesita feedback sensorial; consultá antes.

## 16. Naming

- **Archivos de componente**: `PascalCase.tsx` — `ProductTable.tsx`, `CreateProductForm.tsx`.
- **Hooks**: `useCamelCase.ts` — `useCrudList.ts`.
- **Servicios/repos**: `kebab-case.service.ts`, `kebab-case.repository.ts`.
- **Páginas**: `<Feature>Page.tsx` — `ProductsPage.tsx`, `ProductDetailPage.tsx`.
- **Tipos**: `<Feature>Response`, `<Feature>Request`, `<Feature>TableItem`, `<Feature>Filters`.

## 17. Anti-patrones (PRs con esto se rechazan)

| ❌ NO | ✅ Sí |
|---|---|
| `bg-blue-600`, `text-gray-700`, `bg-red-500` | `bg-primary`, `text-muted-foreground`, `bg-destructive` |
| Clase sin variante `dark:` | Siempre `dark:...` |
| `import { toast } from 'sonner'` en componente | `showSuccessToast` de utils |
| `axios.post(...)` en componente | `fooService.createFoo()` |
| `fetch('/api/...')` directo | `apiClient` vía repository |
| `useState`+`useEffect` para fetch | `useQuery` (TanStack) |
| Componente "god" de 600 líneas | Dividir: Form, Table, SearchBar, Pagination |
| Lógica de fetch en `<Page>` | Hook + service |
| Validación manual en form | RHF + zodResolver |
| Strings de error hardcodeadas en `if (error.message === '...')` | `AppError.code` |
| Estilos inline (`style={{...}}`) | Tailwind |
| `console.log` en producción | quitar antes de PR |
| Comentarios JSDoc redundantes (`/** Componente que renderiza foo */`) | Sólo cuando aporta WHY |

## 18. Checklist al crear una pantalla nueva

En orden:

1. **Tipos** en `domain/types/<feature>.ts`: Request, Response, Filters, TableItem.
2. **Repository** en `infrastructure/api/repositories/<feature>.repository.ts`: 1 método por endpoint, devuelve `ApiResponse<T>`.
3. **Service** en `application/services/<feature>.service.ts`: orquesta, transforma response a la forma que el UI quiere.
4. **Hook** (sólo si la lógica se reutiliza): `presentation/hooks/use<Feature>.ts`.
5. **Componentes** de feature en `presentation/components/<feature>/`:
   - `<Feature>SearchBar.tsx`
   - `<Feature>Table.tsx`
   - `<Feature>Form.tsx` + `Create<Feature>Form.tsx` + `Edit<Feature>Form.tsx`
   - `<Feature>Pagination.tsx` (sólo si necesitás algo distinto del genérico)
6. **Página** en `presentation/pages/<feature>/<Feature>Page.tsx` usando `useCrudList`.
7. **Detalle** (si aplica) `presentation/pages/<feature>/<Feature>DetailPage.tsx`.
8. **Ruta** en `App.tsx`/`router.tsx` con `<PrivateRoute>`.
9. **Sidebar item** en `Sidebar.tsx` con visibilidad por rol.
10. **Toast** en mutaciones (success + error).
11. **Loading/empty/error** los 3 estados.
12. **Dark mode** verificado.
13. **Lint** limpio (`npm run lint`).

## 19. Cuando dudes — copiá

Plantillas de referencia listas en el repo:

- **Listado CRUD completo**: `src/presentation/pages/products/ProductsPage.tsx` + `src/presentation/components/products/`.
- **Diálogo con form complejo**: `src/presentation/components/expenses/CreateExpenseDialog.tsx` + `MerchandiseExpenseForm.tsx`.
- **Hook reutilizable**: `src/presentation/hooks/useCrudList.ts`.
- **Layout**: `src/presentation/components/layouts/MainLayout.tsx`.

Si vas a crear algo nuevo, abrí esos archivos primero y replicá la estructura. Cualquier desvío necesita justificación.
