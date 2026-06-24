# Plan de implementación — Módulo CRUD de Sucursales (Branches) en el Frontend

> **Doble propósito:** este documento es a la vez el plan de implementación y el prompt
> de ejecución. Cada fase es **atómica**: compila (`npx tsc --noEmit`), pasa lint
> (`npm run lint`) y se puede mergear sola sin romper nada. Implementar y revisar en orden.
>
> **Regla transversal (innegociable):** todo el código debe ser legible para personas y
> seguir las convenciones del repo descritas en `.claude/skills/restify-ui`. Sin
> sobreingeniería, sin librerías nuevas, sin saltarse capas
> (`Page → hook/service → repository → apiClient`). Dark mode siempre. Tokens de color, no
> colores hardcodeados.

## Objetivo

Hoy el frontend **no tiene** ninguna pantalla para gestionar sucursales: no existe
`pages/branches/`, ni `branch.repository.ts` (admin), ni `branch.service.ts`, ni tipos
`Branch*`, ni ítem de sidebar. El backend, en cambio, ya expone un módulo de branches
completo. Este plan construye la UI de administración de sucursales que consume ese backend.

## Contrato del backend (ya existente — no se modifica salvo Fase 6)

Todos bajo `/api/branches`, con `AuthMiddleware.authenticate` + multi-tenancy por
organización (el `organizationId` sale del JWT, el frontend nunca lo envía).

| Método | Ruta | Roles | Body / Query | Respuesta |
|--------|------|-------|--------------|-----------|
| GET | `/api/branches` | cualquiera autenticado | `?includeDisabled=true\|false` | `BranchListItem[]` |
| GET | `/api/branches/:branch_id` | cualquiera autenticado | — | `BranchDetail` |
| POST | `/api/branches` | OWNER, ADMIN | `CreateBranchBody` | `BranchDetail` |
| PATCH | `/api/branches/:branch_id` | OWNER, ADMIN | `UpdateBranchBody` (partial) | `BranchDetail` |
| POST | `/api/branches/:branch_id/disable` | OWNER, ADMIN | — | `BranchDetail` (status `disabled`) |
| POST | `/api/branches/:branch_id/enable` | OWNER, ADMIN | — | `BranchDetail` (status `active`) |

**Forma de las respuestas** (tal cual las serializa el backend):

```ts
// GET /api/branches  → lista
interface BranchListItem {
  id: string;
  name: string;
  city: string;
  state: string;
  status: 'active' | 'disabled';
  assignedUsersCount: number;
  lastOrderAt: string | null;   // ISO 8601 o null
}

// GET/POST/PATCH/disable/enable  → detalle
interface BranchDetail {
  id: string;
  organizationId: string;
  name: string;
  state: string;
  city: string;
  street: string;
  exteriorNumber: string;
  phone: string;
  rfc: string | null;
  logoUrl: string | null;
  startOperations: string | null;   // "HH:mm"
  endOperations: string | null;     // "HH:mm"
  timezone: string;                  // default "America/Mexico_City"
  currency: string;                  // default "MXN"
  ticketConfig: unknown | null;
  paymentConfig: string | null;      // JSON serializado (NO renderizar crudo)
  hasPaymentConfig: boolean;         // derivado; usar este, no parsear paymentConfig
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
  // ⚠️ NO incluye `slug` (ver Fase 6)
}
```

**Campos de escritura aceptados** (`createBranchSchema`; `update` es el mismo en `partial`):

| Campo | Tipo | Requerido (create) | Límite |
|-------|------|--------------------|--------|
| `name` | string | sí | 1–200 |
| `state` | string | sí | 1–100 |
| `city` | string | sí | 1–100 |
| `street` | string | sí | 1–200 |
| `exteriorNumber` | string | sí | 1–20 |
| `phone` | string | sí | 1–30 |
| `rfc` | string \| null | no | ≤20 |
| `logoUrl` | string (URL) \| null | no | ≤500, URL válida |
| `startOperations` | string \| null | no | `HH:mm` |
| `endOperations` | string \| null | no | `HH:mm` |
| `timezone` | string | no (default CDMX) | 1–64 |
| `currency` | string | no | 1–8 |
| `ticketConfig` | objeto \| null | no | — |
| `paymentConfig` | string \| null | no | ≤10000 |

**Errores conocidos** (`AppError.code` que el frontend debe contemplar):
`BRANCH_NOT_FOUND`, `BRANCH_LIMIT_REACHED` (al crear o re-activar cuando se alcanzó el tope
del plan: FREE=3, PRO=10), `BRANCH_ALREADY_DISABLED`, `BRANCH_ALREADY_ACTIVE`, `FORBIDDEN`.

## Principios y decisiones de alcance

- **No hay paginación en el backend**: `GET /api/branches` devuelve todas las sucursales
  accesibles. Se usa paginación/filtrado **del lado del cliente** (igual que otras listas
  del repo vía `useCrudList`). No inventar query params que el backend no soporta.
- **El "borrado" es soft, vía disable/enable.** No existe DELETE. La UI ofrece
  "Deshabilitar" / "Habilitar", no "Eliminar".
- **Roles:** crear/editar/deshabilitar/habilitar solo `OWNER` y `ADMIN`. Listar y ver
  detalle, cualquier rol autenticado (pero el backend ya filtra qué sucursales ve cada uno).
  Los botones de mutación se ocultan para roles sin permiso.
- **`paymentConfig` y `ticketConfig` quedan FUERA de alcance** de los formularios de este
  módulo (se administran en `settings/payments`). Aquí solo se muestra el indicador
  `hasPaymentConfig` como lectura.
- **El slug / URL pública** depende de un cambio de backend (Fase 6). Se aísla al final para
  que el módulo CRUD se pueda entregar sin bloquearse.
- **Patrón de referencia obligatorio:** copiar la estructura de `products`
  (`pages/products/ProductsPage.tsx` + `components/products/*` + `useCrudList`). Ante la
  duda, replicar productos.

## Alcance

- **Fases 1–5:** módulo CRUD de sucursales (frontend puro, sin tocar backend).
- **Fase 6:** exponer URL pública por slug (requiere un pequeño cambio de backend primero).
- **Fuera de alcance:** edición de `paymentConfig`/`ticketConfig`, dominios/subdominios,
  asignación de usuarios a sucursales (`UserBranchAccess`) desde esta UI.

---

## FASE 1 — Tipos de dominio y repositorio

**Objetivo:** que el frontend conozca el contrato de branches y sepa llamar a cada endpoint.
Capa de datos pura, sin React.

**Atómica porque:** solo agrega tipos y un repositorio nuevos; nada los consume aún.

### Tareas

1. **Tipos** — `src/domain/types/branch.ts`:
   - `BranchStatus = 'active' | 'disabled'`.
   - `BranchListItem`, `BranchDetail` (espejo exacto de las respuestas del backend de arriba).
   - `CreateBranchRequest`, `UpdateBranchRequest` (campos de escritura; `Update` = `Partial`).
   - `BranchFilters` (estado de UI: `search: string`, `includeDisabled: boolean`).
   - Re-exportar desde `src/domain/types/index.ts` si ese es el patrón del repo.
2. **Repositorio** — `src/infrastructure/api/repositories/branch.repository.ts`:
   - Un método por endpoint, usando el `apiClient` autenticado (NO `publicApiClient`):
     `listBranches(includeDisabled)`, `getBranch(id)`, `createBranch(body)`,
     `updateBranch(id, body)`, `disableBranch(id)`, `enableBranch(id)`.
   - Cada método devuelve `response.data.data` tipado (igual que los repos existentes).
   - **Nombre de archivo:** `branch.repository.ts` (no confundir con `public-branch.repository.ts`).

### Criterio de aceptación

- `npx tsc --noEmit` limpio.
- Los tipos reflejan 1:1 las respuestas del backend (incluido `hasPaymentConfig`, sin `slug`).
- El repo usa el cliente autenticado y respeta el patrón de los demás repos.

---

## FASE 2 — Servicio de aplicación

**Objetivo:** una capa fina que orqueste el repositorio y transforme datos a la forma que el
UI quiere (siguiendo la regla "hooks nunca llaman al repository directo").

**Atómica porque:** es código nuevo sin consumidores.

### Tareas

1. **Servicio** — `src/application/services/branch.service.ts`:
   - Métodos espejo del repo (`listBranches`, `getBranch`, `createBranch`, `updateBranch`,
     `disableBranch`, `enableBranch`).
   - Aquí va cualquier transformación de presentación que no pertenezca al componente
     (ej. normalizar `lastOrderAt` a algo formateado si se decide; si no hace falta, el
     servicio simplemente delega — mantenerlo fino, no agregar lógica vacía por simetría).
   - Registrar/exportar desde `src/application/services/index.ts` si ese es el patrón.

### Criterio de aceptación

- El servicio no importa React ni axios directamente (solo el repositorio).
- `npx tsc --noEmit` limpio.

---

## FASE 3 — Listado de sucursales (página + tabla + filtros)

**Objetivo:** pantalla de listado funcional con los 3 estados (loading/empty/error),
búsqueda, filtro activas/deshabilitadas y paginación cliente.

**Atómica porque:** entrega una vista de solo lectura completa; las mutaciones llegan en
Fase 4. Se puede mergear y ya aporta valor (ver sucursales).

### Tareas

1. **Componentes de feature** en `src/presentation/components/branches/`:
   - `BranchSearchBar.tsx` — input de búsqueda por nombre/ciudad + toggle/select
     "Incluir deshabilitadas". Layout y estilos copiados de `ProductSearchBar`.
   - `BranchTable.tsx` — columnas: Nombre, Ciudad/Estado, Usuarios asignados
     (`assignedUsersCount`), Último pedido (`lastOrderAt` formateado o "—"), Estado
     (`<Badge>` `active`/`disabled`), y una columna de acciones (`<DropdownMenu>` con
     `<MoreVertical>`; en Fase 4 se llenan las acciones, aquí al menos "Ver detalle").
   - Estados loading/empty dentro del contenedor de la tabla, mismo estilo que `ProductTable`.
2. **Página** — `src/presentation/pages/branches/BranchesPage.tsx`:
   - Usar `useCrudList<BranchListItem, BranchFilters>`:
     - `queryKey: 'branches'`.
     - `queryFn: (apiFilters) => branchService.listBranches(apiFilters.includeDisabled)`.
     - `initialFilters: { search: '', includeDisabled: false }`.
     - `filterAdapter` → mapea `includeDisabled` al parámetro del servicio.
     - `clientFilter` → filtra por `search` sobre `name`/`city` (búsqueda local).
   - Header de página con título "Sucursales" + botón "Nueva sucursal" (visible solo
     OWNER/ADMIN; en Fase 4 se conecta al modal — aquí puede quedar deshabilitado o abrir
     un placeholder, preferible dejar el botón ya colocado).
   - Manejo de error de query con `showErrorToast` vía `useEffect`.
3. **Ruta** — `src/App.tsx`:
   - Agregar `BranchesPage` como `lazy(...)`.
   - Ruta protegida `{ path: '/branches', element: <BranchesPage /> }` dentro de
     `protectedRoutes` (envuelta por `PrivateRoute` + `SubscriptionGuard`).
4. **Sidebar** — `Sidebar.tsx`:
   - Ítem "Sucursales" con ícono `lucide-react` (ej. `Store` o `Building2`), apuntando a
     `/branches`. Visible según rol si el patrón del sidebar lo hace (al menos para
     OWNER/ADMIN/MANAGER).

### Criterio de aceptación

- `/branches` lista las sucursales de la organización del usuario.
- Búsqueda local filtra por nombre/ciudad; el toggle muestra/oculta deshabilitadas
  (re-consultando con `includeDisabled`).
- Loading, empty y error implementados; dark mode correcto.
- El ítem de sidebar navega a la página.

---

## FASE 4 — Crear y editar sucursal (formularios + modales)

**Objetivo:** alta y edición de sucursales con validación, conectadas a las mutaciones del
backend.

**Atómica porque:** se apoya en el listado de Fase 3 ya mergeado; agrega los flujos de
escritura y refresca la lista al terminar.

### Tareas

1. **Formulario base** — `src/presentation/components/branches/BranchForm.tsx`:
   - `react-hook-form` + `zodResolver`. Schema Zod local que refleje los límites del backend
     (ver tabla de campos de escritura). Mensajes en español.
   - Campos: `name`, `state`, `city`, `street`, `exteriorNumber`, `phone` (requeridos);
     `rfc`, `logoUrl`, `startOperations`, `endOperations` (`type="time"`), `timezone`
     (con default CDMX), `currency` (opcional). **No** incluir `paymentConfig`/`ticketConfig`.
   - Errores inline bajo cada input (`text-sm text-destructive mt-1`).
   - Botones: "Cancelar" (`variant="outline"`) y submit con estado `isLoading`.
2. **Wrappers** — `CreateBranchForm.tsx` y `EditBranchForm.tsx` (siguiendo el patrón de 3
   archivos de `products`). `Edit` recibe `initialData` desde el `BranchDetail`.
3. **Modales** en `BranchesPage`:
   - `<Dialog>` para crear (botón "Nueva sucursal").
   - `<Dialog>` para editar (acción "Editar" de la fila → primero `getBranch(id)` para traer
     el detalle completo, ya que la lista no trae todos los campos).
4. **Mutaciones** con `@tanstack/react-query` `useMutation` (o el patrón de servicio + `invalidate()`
   que use `useCrudList`):
   - `createBranch` → toast éxito + `invalidate()` + cerrar modal.
   - `updateBranch` → ídem.
   - Manejo de errores con `AppError.code`: en especial `BRANCH_LIMIT_REACHED` debe mostrar
     un mensaje claro ("Alcanzaste el límite de sucursales de tu plan").
5. **Visibilidad por rol:** botones "Nueva sucursal" y "Editar" ocultos si el rol no es
   OWNER/ADMIN (`useAuthStore().user?.rol`).

### Criterio de aceptación

- Crear una sucursal válida la agrega a la lista sin recargar (gracias a `invalidate`).
- Editar persiste cambios y refleja el detalle correcto.
- Validaciones del form coinciden con las del backend (no se puede enviar `name` vacío, URL
  de logo inválida, etc.).
- `BRANCH_LIMIT_REACHED` se muestra como toast comprensible, no como error genérico.
- Roles sin permiso no ven los botones de escritura.

---

## FASE 5 — Habilitar / deshabilitar sucursal

**Objetivo:** el soft-delete del backend expuesto en la UI.

**Atómica porque:** agrega dos acciones sobre la infraestructura ya construida.

### Tareas

1. **Acciones en `BranchTable`** (dentro del `<DropdownMenu>` de la fila):
   - "Deshabilitar" cuando `status === 'active'`.
   - "Habilitar" cuando `status === 'disabled'`.
   - Ambas solo visibles para OWNER/ADMIN.
2. **Confirmación** con `<ConfirmDialog>`:
   - Deshabilitar es la acción "destructiva" (`destructive`, texto claro: la sucursal dejará
     de operar / su menú público dejará de estar disponible).
   - Habilitar puede confirmarse sin variante destructiva.
3. **Mutaciones:** `disableBranch(id)` / `enableBranch(id)` → toast + `invalidate()`.
   - Contemplar `BRANCH_ALREADY_DISABLED` / `BRANCH_ALREADY_ACTIVE` (caso de carrera) y
     `BRANCH_LIMIT_REACHED` al re-habilitar (mensaje claro).

### Criterio de aceptación

- Deshabilitar mueve la sucursal a estado `disabled` (visible solo con el filtro activado).
- Habilitar la regresa a `active`.
- La lista se refresca tras la acción; los errores de borde se muestran como toast claro.

---

## FASE 6 — Exponer la URL pública por slug (requiere cambio de backend)

**Objetivo:** mostrar y copiar la URL pública `/menu/<slug>` de cada sucursal, cerrando lo
que en el plan de slug quedó como "Fase 7 opcional".

**Atómica porque:** mejora aditiva sobre el módulo ya funcional. Solo se puede hacer DESPUÉS
del prerrequisito de backend.

### Prerrequisito de backend (bloqueante)

El `BranchDetailResponse` **hoy no incluye `slug`**
(`Restify-API/src/core/application/mappers/branch-response.mapper.ts`). Para mostrar la URL
hace falta uno de estos cambios mínimos en el API:

- **Opción recomendada:** agregar `slug: branch.slug` a `BranchDetailResponse` (y al tipo
  `BranchDetail` del frontend en Fase 1). Es un campo no sensible y ya existe en la entidad.

Sin este cambio, esta fase no puede implementarse; las Fases 1–5 no dependen de él.

### Tareas (frontend, una vez hecho el backend)

1. **Tipo:** agregar `slug: string | null` a `BranchDetail` en `src/domain/types/branch.ts`.
2. **UI en el detalle/edición de la sucursal:**
   - Mostrar la URL pública construida como `${window.location.origin}/menu/${slug}` (solo si
     `slug` existe y la sucursal está activa).
   - Botón "Copiar" (usar `navigator.clipboard.writeText` + `showSuccessToast`).
   - (Opcional) Botón "Generar QR" reutilizando `qrcode.react` (ya presente en el repo); no
     agregar librerías.

### Criterio de aceptación

- El dueño ve y copia la URL pública de cada sucursal activa.
- Si una sucursal no tiene slug (caso legacy sin backfill), la UI no rompe (oculta la sección).

---

## Orden de PRs sugerido

| PR | Fases | Riesgo | Notas |
|----|-------|--------|-------|
| 1 | Fase 1 | Muy bajo | Tipos + repo; sin consumidores |
| 2 | Fase 2 | Muy bajo | Servicio fino |
| 3 | Fase 3 | Bajo | Listado read-only + ruta + sidebar |
| 4 | Fase 4 | Medio | Alta/edición con formularios |
| 5 | Fase 5 | Bajo | Disable/enable |
| 6 | Fase 6 | Bajo | Requiere PR de backend (slug en detail) primero |

**Regla de despliegue:** las Fases 1–5 son frontend puro y pueden ir directo. La Fase 6
requiere que el cambio de backend (slug en `BranchDetailResponse`) esté desplegado antes.

## Checklist por fase (recordatorio de la skill `restify-ui`)

- [ ] Sin colores hardcodeados; clases tokenizadas + variante `dark:`.
- [ ] No se saltan capas (`Page → hook/service → repository → apiClient`).
- [ ] `domain` no importa de otras capas.
- [ ] Listas con `useCrudList`; mutaciones con `invalidate()`.
- [ ] Forms con RHF + Zod; errores inline en español.
- [ ] Toasts solo vía `@/shared/utils/toast`.
- [ ] Los 3 estados (loading/empty/error) en toda lista.
- [ ] Visibilidad por rol en acciones de escritura.
- [ ] `npx tsc --noEmit` y `npm run lint` limpios.
