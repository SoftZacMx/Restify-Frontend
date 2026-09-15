# Reglas del proyecto — Restify Frontend

Guía **prescriptiva y única** para humanos e IAs (Claude, Cursor, etc.). Toda
pantalla nueva o modificación visible debe seguirla. Si dudás, reproducí lo que
ya existe en `src/presentation/components/products/` o `.../expenses/`.

## Cómo escribir código
- La solución más simple posible, sin sacrificar seguridad ni escalabilidad.
- Código legible por sí solo. Nombres semánticos en variables, funciones,
  componentes y archivos.
- Comentarios al mínimo: solo el "por qué" en puntos no obvios. Nunca narrar
  lo que el código ya dice.
- Identificadores en inglés; comentarios en español.
- No dupliques componentes: si algo se repite, extrae uno compartido.

## Verifica tu trabajo (córrelo antes de dar por hecho un cambio)
- `npm run lint`   → bloquea colores crudos de Tailwind (falla si los usas)
- `npm run build`  → typecheck + compilación
- `npx vitest run` → tests unitarios

## 1. Stack obligatorio (no negociable)
| Categoría | Lib | Reglas |
|---|---|---|
| Framework | React 19 + Vite + TS | ESM, strict TS |
| Estilos | Tailwind + shadcn/ui | CSS vars HSL en `index.css`. Solo tokens, nunca color crudo |
| Routing | `react-router-dom@7` | Rutas en `App.tsx`/`router.tsx` |
| Estado global | `zustand` | Solo auth/sidebar/theme. UI local con `useState` |
| Server state | `@tanstack/react-query@5` | Listas con `useQuery`; mutaciones con `useMutation` + `invalidateQueries` |
| Formularios | `react-hook-form` + `zod` | Schema en el form o en `domain/types` |
| Toasts | `sonner` vía `@/shared/utils/toast` | Nunca `toast()` directo |
| Iconos | `lucide-react` | `h-5 w-5` por defecto |
| Charts | `recharts` | Series con `hsl(var(--chart-N))` |
| HTTP | `axios` vía `@/infrastructure/api/client` | El interceptor convierte errores a `AppError` |
| Realtime | `socket.io-client` | Vía `useWebSocket` |

Antes de agregar otra lib, pedí confirmación.

## 2. Arquitectura por capas (no saltarse capas)
```
src/
├── domain/          tipos, entidades, errores (AppError). SIN React/axios.
├── application/services/   orquesta repositorios, sin React
├── infrastructure/api/     client.ts / public-client.ts + repositories/
├── presentation/    pages/, components/ (+ ui/ shadcn), hooks/, store/, contexts/
└── shared/          utils/, constants/, lib/, schemas/ (Zod)
```
Flujo: `<Page> → useHook (o useCrudList) → service → repository → apiClient → Backend`
- Componentes **nunca** llaman a `apiClient`; hooks **nunca** a `repository` (siempre vía `service`); `domain` no importa de otras capas.
- Imports con alias `@/...`, nunca `../../..`. Orden: libs → domain → application → infrastructure → presentation → shared.

## 3. Sistema de diseño (OBLIGATORIO — ver docs/SISTEMA_DISENO.md)
- **Prohibido color crudo de Tailwind y HEX.** El lint lo bloquea.
  ❌ `text-slate-500` `bg-white` `border-slate-200` `#3b82f6`
  ✅ `text-muted-foreground` `bg-card` `border-border` `text-chart-4`
- Roles: `background`/`foreground`, `card`, `primary` (CTA), `secondary`,
  `muted`, `accent`, `border`, `destructive`, y de marca `fresco`/`apoyo`/`marca`/`chart-1..6`.
- **Estado**: éxito=`fresco`, advertencia=`apoyo`, error=`destructive`
  (fondo `-suave`, texto `-texto`, sólido/icono = base). Ej. chip: `bg-fresco-suave text-fresco-texto`.
- **Modo oscuro automático**: los tokens ya traen su valor oscuro. **No** agregues `dark:` manual si usás tokens.
- **Tipografía** (Manrope): usá la escala, no tamaños sueltos.
  ❌ `text-2xl font-bold`  ✅ `text-h1` (`display`/`h1`/`h2`/`h3`; cuerpo `text-body`/`text-caption`).
- **Radio**: `rounded-lg` cards/inputs, `rounded-xl` contenedores grandes, `rounded-full` chips/avatars.
- **TRAMPA**: si agregás un color nuevo, definilo en `index.css` como canales HSL
  (`H S% L%`) y mapealo con `hsl(var(--x) / <alpha-value>)`. En HEX plano la opacidad NO funciona.

## 4. Layout de página
`MainLayout` provee sidebar + scroll + responsive; no lo manejes a mano.
```tsx
<MainLayout>
  <div className="flex flex-col gap-6">
    <header className="flex items-center justify-between px-4 pt-5">
      <div>
        <h1 className="text-h1 text-foreground">Productos</h1>
        <p className="text-sm text-muted-foreground">Descripción breve</p>
      </div>
      <Button onClick={...}><Plus className="mr-2 h-5 w-5" />Nuevo producto</Button>
    </header>
    <ProductSearchBar filters={filters} onFiltersChange={setFilters} />
    <ProductTable products={...} onProductAction={...} isLoading={isLoading} />
    <Pagination data={paginationData} onPageChange={...} onPageSizeChange={...} />
  </div>
</MainLayout>
```

## 5. Listado CRUD — usá `useCrudList` (`@/presentation/hooks`)
Encapsula query + filtros + paginación + estado de modales.
```tsx
const { paginatedData, isLoading, error, filters, setFilters,
  paginationData, handlePageChange, isCreateModalOpen, setIsCreateModalOpen,
  deleteDialog, invalidate } = useCrudList<FooResponse, FooFilters>({
    queryKey: 'foos', queryFn: (f) => fooService.listFoos(f),
    initialFilters: { search: '' }, filterAdapter, clientFilter });
React.useEffect(() => { if (error) showErrorToast('Error al cargar', error instanceof AppError ? error.message : ''); }, [error]);
```
- Nada de `useState` manual de `loading`/`error` cuando viene del query.
- Mutaciones llaman al `service` y luego `invalidate()`.
- La página NO contiene lógica de fetch: solo conecta hook y componentes.

## 6. Tabla (`<Feature>Table.tsx`)
```tsx
<div className="px-4 py-5">
  <div className="overflow-hidden rounded-xl border border-border bg-card">
    {isLoading && <div className="p-8 text-center text-muted-foreground">Cargando…</div>}
    {!isLoading && data.length === 0 && <div className="p-8 text-center text-muted-foreground">No se encontraron resultados</div>}
    {!isLoading && data.length > 0 && (
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Columna</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(row => (
            <TableRow key={row.id} className="hover:bg-muted/50">
              <TableCell className="px-6 py-4">{row.field}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </div>
</div>
```
Acciones por fila → `<DropdownMenu>` con `<MoreVertical>`. Estados → `<Badge>`, nunca texto plano coloreado.

## 7. Filtros (`<Feature>SearchBar.tsx`, recibe `{ filters, onFiltersChange }`)
Search input y selects con superficie `bg-muted`, `h-12`, `rounded-lg`, borde inferior `border-b border-border`.

## 8. Forms — 3 archivos: `<Feature>Form.tsx` (base) + `Create…` + `Edit…`
```tsx
const fooSchema = z.object({ name: z.string().min(1) });
export const FooForm = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(fooSchema), defaultValues: initialData ?? { name: '' } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Guardando…' : 'Guardar'}</Button>
      </div>
    </form>
  );
};
```
- Zod siempre, mensajes en español. `defaultValues` inicializa (no `useState`). Errores inline bajo el input.

## 9. Diálogos
- Crear/editar dentro de `<Dialog>` de shadcn.
- Confirmaciones destructivas **siempre** con `<ConfirmDialog … destructive>`.

## 10. Toasts — solo desde `@/shared/utils/toast`
`showSuccessToast` / `showErrorToast` / `showWarningToast` / `showInfoToast`. Nunca `import { toast } from 'sonner'` en componentes.

## 11. Errores
- El interceptor de `apiClient` convierte axios errors a `AppError` (`@/domain/errors`).
- En componentes: `catch (error)` + `instanceof AppError` para el `message`. Nunca compares `error.message === '...'`; usá `AppError.code`.
- Query error → toast en `useEffect`. Mutación → toast en `catch`/`onError`.

## 12. Navegación / permisos
- Sidebar en `Sidebar.tsx`, filtrado por rol (`useAuthStore().user?.rol`): `ADMIN`, `MANAGER`, `WAITER`, `CHEF` (+ `OWNER`).
- Rutas protegidas con `<PrivateRoute allowedRoles={[...]}>`. Botones por rol: esconder o deshabilitar con tooltip.

## 13. Estados obligatorios en toda lista
**Loading**, **Empty** y **Error** (toast). Nunca renderizar una página rota. Transición de ruta → `<PageLoader>`.

## 14. Naming
- Componentes `PascalCase.tsx`; hooks `useCamelCase.ts`; servicios/repos `kebab-case.service.ts`/`.repository.ts`; páginas `<Feature>Page.tsx`; tipos `<Feature>Response/Request/Filters/TableItem`.

## 15. Anti-patrones (PRs con esto se rechazan)
| ❌ NO | ✅ Sí |
|---|---|
| `bg-blue-600`, `text-slate-700`, `#hex` | `bg-primary`, `text-muted-foreground`, `text-chart-4` |
| `dark:` manual sobre tokens | tokens (se adaptan solos) |
| `text-2xl font-bold` para títulos | `text-h1`/`h2`/`h3` |
| `import { toast } from 'sonner'` en componente | `showSuccessToast` de utils |
| `axios`/`fetch` en componente | `service` → `repository` → `apiClient` |
| `useState`+`useEffect` para fetch | `useQuery` |
| Componente "god" de 600 líneas | dividir: Form, Table, SearchBar, Pagination |
| Validación manual en form | RHF + zodResolver |
| Estilos inline `style={{...}}` | Tailwind |
| `console.log` en producción | quitar antes de PR |
| JSDoc redundante | solo el "por qué" |

## 16. Checklist de pantalla nueva
1. Tipos en `domain/types`. 2. Repository (1 método/endpoint). 3. Service.
4. Hook si se reutiliza. 5. Componentes de feature (SearchBar/Table/Form+Create+Edit).
6. Página con `useCrudList`. 7. Detalle si aplica. 8. Ruta con `<PrivateRoute>`.
9. Item de sidebar por rol. 10. Toasts en mutaciones. 11. Loading/empty/error.
12. Modo oscuro verificado. 13. `npm run lint` limpio.

## 17. Cuando dudes — copiá
- Listado CRUD: `src/presentation/pages/products/` + `components/products/`.
- Diálogo con form: `components/expenses/CreateExpenseDialog.tsx`.
- Hook: `presentation/hooks/useCrudList.ts`. Layout: `components/layouts/MainLayout.tsx`.
