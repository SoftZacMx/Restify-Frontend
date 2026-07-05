# Plan de implementación — Multi-tenancy en el Frontend

> **Doble propósito:** este documento es a la vez el plan y el prompt de ejecución. Cada fase es
> **atómica**: compila (`npx tsc --noEmit`), pasa lint (`npm run lint`) y se puede mergear sola sin
> romper la app. Implementar y revisar en orden.
>
> **Regla transversal (innegociable):** todo el código sigue las convenciones de
> `.claude/skills/restify-ui` (capas `Page → hook/service → repository → apiClient`, design tokens,
> dark mode, RHF+Zod, toasts vía `@/shared/utils/toast`, `useCrudList` para listas). Sin
> sobreingeniería, sin librerías nuevas. Cuando dudes, copiá el patrón de `products` o `branches`.

## Objetivo

El backend ya es multi-tenant (ver `Restify-API/docs/PLAN_MULTI_TENANCY.md`, ~82% completo). El
**frontend va atrás**: el módulo CRUD de sucursales (`/branches`) y el signup con organización ya
existen, pero falta toda la **operación multi-sucursal del día a día**. Este plan cierra esa brecha.

### El problema central (y por qué dicta el orden)

Al hacer login/signup, el backend devuelve la **sucursal activa** (`branch` en el JWT) y la lista de
**sucursales accesibles** (`branches[]` en el body). **Hoy el frontend descarta ambos:**
`LoginResponse` (`src/domain/types/index.ts:29`) solo conserva `user` + `token`, y el `auth.store`
no guarda ninguna noción de sucursal. Por eso el frontend "no sabe en qué sucursal estás".

> **Sucursal activa** = la sucursal en la que el usuario está operando ahora. **No** es lo mismo que
> el `status: 'active'` de una sucursal (eso es "no deshabilitada").

Sin resolver esto primero (**Fase 0**), nada puede "apuntar a la sucursal" — ni migrar la pantalla
de Company, ni el switcher, ni la config por sucursal. Es el cimiento.

### Flujo de selección de sucursal (decisión de producto)

El backend **siempre** asigna una sucursal por defecto en el token al hacer login (el POS la exige;
sin ella, las rutas operativas fallan con `TENANT_BRANCH_REQUIRED`). **No tocamos el backend.** En su
lugar, el frontend controla la experiencia:

- **El usuario debe elegir explícitamente su sucursal antes de operar** cuando tiene **más de una**
  accesible. La app **no avanza** a las pantallas principales hasta que haya una sucursal elegida.
- Si el usuario tiene **una sola** sucursal, se entra directo (sin pantalla de selección): la única
  disponible es la elegida automáticamente.
- La sucursal por defecto que manda el backend **no decide a dónde entra el usuario**; solo mantiene
  el token operativo. El frontend la sobrescribe con `switch-branch` cuando el usuario elige.
- **La elección se persiste.** En un refresh (F5) con una sucursal ya elegida, se entra directo a
  ella; **no** se vuelve a mostrar la selección. La pantalla de selección reaparece solo en un login
  nuevo (sin elección previa) o cuando el usuario pide **explícitamente** cambiar de sucursal.

Esto convierte la Fase 2 en "pantalla de selección al entrar + opción de cambiar después", y hace que
la Fase 0 deba distinguir dos cosas: la sucursal **del token** (default técnico) y la sucursal
**elegida y persistida** (la que gobierna la navegación).

## Contrato del backend (ya existente — no se modifica)

| Método | Ruta | Para qué | Notas |
|--------|------|----------|-------|
| POST | `/api/auth/login` | Login | Devuelve `{ token, user, branches?[] }`; JWT trae `branch` activo |
| POST | `/api/auth/signup` | Alta pública | Devuelve `{ token, user, organization, branch }` |
| POST | `/api/auth/switch-branch` | Cambiar sucursal activa | Body `{ branchId }` → `{ token }` nuevo. Valida acceso (403/404) |
| POST/GET | `/api/auth/verify-email` | Verificar email | GET con `?token=` (link); POST con `{ token }` (frontend) |
| POST | `/api/auth/resend-verification` | Reenviar verificación | Rate-limited, anti-enumeración (200 uniforme) |
| POST | `/api/users/:id/reset-password` | Reset password de empleado | Solo owner/admin |
| GET/PATCH | `/api/branches/:id` | Detalle/edición de sucursal | Reemplaza a `/api/company` (eliminado) |
| POST | `/api/organization/close` | Cerrar organización | Solo owner; body `{ confirmationName }` |
| POST | `/api/organization/reactivate` | Reactivar (≤30 días) | Ruta pública; re-valida email+password |
| POST | `/api/uploads` | Subir imagen | `multipart/form-data`: `file` + `kind` (`branch_logo`/`org_logo`/`product_image`/`menu_item_image`) → `{ url, key }` |
| GET | `/api/config` | Config pública | `{ billingEnabled, environment, apiVersion }` |

**`/api/company` fue ELIMINADO en el backend multi-tenant.** Toda referencia del frontend a esa ruta
queda rota contra el deploy nuevo (404). La Fase 1 la elimina.

## Decisiones de alcance

- **`branchIds` se asignan vía CRUD de usuarios** (Fase 3), no en el signup.
- **`ticketConfig`** (config de ticket térmico) hoy vive en la pantalla de Company; se migra a la
  config de la sucursal activa (Fase 1), ya que `Branch` también tiene `ticketConfig`.
- **`paymentConfig`** sigue fuera de alcance de estos formularios (se administra en su propio módulo).
- **Onboarding wizard completo** (primer producto/empleado guiado) queda **fuera**; solo se cubre lo
  que el plan de backend lista como necesario para go-live.

## Orden de fases

| Fase | Nombre | Estado | Riesgo | Bloqueante para |
|------|--------|--------|--------|-----------------|
| **0** | Sucursal activa en el cliente | ✅ Implementada | Medio | Todo lo demás |
| **1** | Migrar Company → Branch (config por sucursal) | ✅ Implementada | Medio | — (arregla ruta rota) |
| **2** | Selección de sucursal al entrar + cambio explícito | ✅ Implementada | Medio | Operación multi-sucursal |
| **3** | `branchIds` en gestión de usuarios | ⏳ Pendiente | Bajo | — |
| **4** | Cuenta + verificación de email | ⏳ Pendiente | Bajo | — |
| **5** | Org settings + cerrar/reactivar org | ⏳ Pendiente | Bajo | — |
| **6** | Subida de imágenes (`/api/uploads`) | ⏳ Pendiente | Bajo | — |

**Fases 0 y 1 son el mínimo** para que la app funcione contra el backend multi-tenant. Las demás son
aditivas y pueden entregarse por separado.

---

## FASE 0 — Sucursal activa en el cliente ✅ Implementada

**Objetivo:** que el frontend capture y guarde (1) la **lista de sucursales accesibles** y (2) la
**sucursal elegida**, distinguiéndola de la sucursal por defecto que manda el token.

**Atómica porque:** solo agrega estado y tipos; ninguna pantalla cambia de comportamiento todavía
(la pantalla de selección y los consumidores llegan en fases siguientes). La app sigue funcionando.

### Concepto: dos sucursales distintas

- **Sucursal del token** (`branch` en el JWT): el default técnico que el backend siempre asigna.
  Mantiene el token operativo, pero **no** decide a dónde entra el usuario.
- **Sucursal elegida** (`selectedBranchId`, persistida): la que el usuario seleccionó
  explícitamente (Fase 2). Es la que gobierna la navegación. Es `null` tras un login nuevo hasta que
  el usuario elija (o se auto-elige si solo hay una sucursal).

### Tareas

1. **Tipos** — `src/domain/types/index.ts`:
   - Extender `LoginResponse` con `branches?: Array<{ id: string; name: string }>` (el backend ya lo
     manda; ver `login.use-case.ts:141`).
   - Confirmar que `SignupResponse` ya trae `branch: { id, name }` (sí, línea 80) y `organization`.
   - Añadir un tipo `AccessibleBranch = { id: string; name: string }` reutilizable.
2. **Store** — `src/presentation/store/auth.store.ts`:
   - Añadir al estado:
     - `branches: AccessibleBranch[]` — lista de sucursales accesibles.
     - `selectedBranchId: string | null` — la sucursal **elegida y persistida** (gobierna navegación).
   - En `login(data)`:
     - `branches = data.branches ?? []`.
     - Si `branches.length <= 1` → auto-elegir: `selectedBranchId = branches[0]?.id ?? null` (no hay
       nada que elegir).
     - Si `branches.length > 1` → `selectedBranchId = null` (forzará la pantalla de selección).
   - Acción `selectBranch(branchId, token)`: setea `selectedBranchId = branchId` y reemplaza `token`
     con el nuevo que devuelve `switch-branch` (Fase 2).
   - Acción `clearSelectedBranch()`: pone `selectedBranchId = null` (para "cambiar de sucursal"
     explícito → reabre la selección).
   - `logout()`: limpiar `branches` y `selectedBranchId`.
   - Incluir `branches` y `selectedBranchId` en `partialize` (persisten en localStorage). No hace falta
     versionar/migrar: es una beta sin datos de usuarios reales que proteger.
   - El alta (signup) puebla lo mismo: con una sola sucursal recién creada, `selectedBranchId` queda
     auto-elegido (entra directo).
3. **Hook** — `src/presentation/hooks/useActiveBranch.ts`:
   - Devuelve `{ selectedBranchId, selectedBranch, branches, hasMultipleBranches, needsBranchSelection }`.
   - `selectedBranch` = `branches.find(b => b.id === selectedBranchId) ?? null`.
   - `needsBranchSelection` = `branches.length > 1 && selectedBranchId == null` (lo usa la Fase 2 para
     bloquear la navegación).

### Criterio de aceptación

- Login como owner con **varias** sucursales → `branches` tiene la lista completa y
  `selectedBranchId === null` (`needsBranchSelection === true`).
- Login con **una sola** sucursal → `selectedBranchId` queda auto-elegido (`needsBranchSelection ===
  false`), sin pantalla de selección.
- El estado sobrevive a un refresh (persistido) y se limpia en logout.
- `npx tsc --noEmit` y `npm run lint` limpios. Ninguna pantalla existente cambia de comportamiento
  todavía (el bloqueo de navegación es de la Fase 2).

---

## FASE 1 — Migrar Company → Branch (config por sucursal) ✅ Implementada

**Objetivo:** que la pantalla de configuración del negocio lea/escriba la **sucursal activa** vía
`branchService`, y eliminar todo rastro de `/api/company` (ruta muerta en el backend nuevo).

**Atómica porque:** se apoya en la sucursal activa de Fase 0; reemplaza un origen de datos por otro
sin cambiar el resto de la app.

**Depende de:** Fase 0 (necesita `selectedBranchId`).

### Contexto — qué consume `company` hoy (3 lugares)

1. `src/presentation/pages/settings/company/CompanyConfigPage.tsx` — pantalla de ajustes (datos del
   negocio + `ticketConfig` vía `TicketThermalConfigCard`).
2. `src/presentation/pages/pos/PosPage.tsx:463` — solo el `company.name` para el ticket.
3. `src/presentation/hooks/pos/useQrPaymentFlow.ts:93` — ídem (`companyName`).

### Tareas

1. **Reapuntar la pantalla** — `CompanyConfigPage.tsx`:
   - Reemplazar `companyService.getCompany()` por `branchService.getBranch(selectedBranchId)` (de
     Fase 0) y el submit por `branchService.updateBranch(selectedBranchId, payload)`.
   - Reutilizar lo máximo posible del `BranchForm` existente; la diferencia es que esta pantalla
     **sí** incluye `TicketThermalConfigCard` (la edición de `ticketConfig`), que el `BranchForm` del
     módulo CRUD no tiene. Decidir: (a) agregar `ticketConfig` como sección opcional del `BranchForm`,
     o (b) mantener esta pantalla con su propio form. Preferir (a) si no infla el componente.
   - El `query key` pasa de `['company']` a `['branches', selectedBranchId, 'detail']` (coherente con el
     resto). Invalidar tras guardar.
2. **POS** — `PosPage.tsx` y `useQrPaymentFlow.ts`:
   - Sustituir `companyService.getCompany().name` por el nombre de la sucursal activa
     (`useActiveBranch().selectedBranch?.name`, ya en memoria — evita un fetch extra). Mantener el
     `?? undefined` defensivo que ya existe.
3. **Eliminar el módulo Company**:
   - Borrar `src/application/services/company.service.ts`,
     `src/infrastructure/api/repositories/company.repository.ts`,
     `src/domain/types/company.types.ts` y sus re-exports en `index.ts` de services y types.
   - Quitar `CompanyResponse`/`UpsertCompanyRequest` de donde se importen.
4. **Ruta y navegación**:
   - Mantener la URL `/settings/company` **o** renombrar a `/settings/branch` (decisión cosmética; si
     se renombra, redirigir la vieja para no romper bookmarks). Actualizar `SettingsLayout.tsx`,
     `Sidebar.tsx` y `App.tsx` según corresponda.
   - El título/labels pasan de "Compañía"/"negocio" a "Sucursal" donde aplique.

### Criterio de aceptación

- `/settings/company` (o `/settings/branch`) carga los datos de la sucursal activa y los guarda vía
  `PATCH /api/branches/:id`. Cero llamadas a `/api/company` en toda la app
  (`grep -rn "api/company" src` → vacío).
- El ticket del POS sigue mostrando el nombre correcto (ahora el de la sucursal).
- La edición de `ticketConfig` sigue funcionando.
- `npx tsc --noEmit` y `npm run lint` limpios.

---

## FASE 2 — Selección de sucursal al entrar + cambio explícito ✅ Implementada

**Objetivo:** obligar a elegir sucursal cuando hay más de una (bloqueando la navegación hasta
hacerlo), entrar directo cuando hay una sola, persistir la elección, y permitir cambiarla luego de
forma explícita. Todo apoyado en `switch-branch`.

**Atómica porque:** se apoya en el estado de Fase 0; agrega una pantalla + un guard de ruta + una
llamada. Con una sola sucursal, el usuario no nota ningún cambio (entra directo, como hoy).

**Depende de:** Fase 0 (`branches`, `selectedBranchId`, `needsBranchSelection`).

### Estructura de componentes (3 niveles, patrón `products`)

Cada fila de sucursal es un **componente aparte** para que sea reutilizable (misma vista sirve para
"seleccionar al entrar" y "cambiar después") y **extensible sin tocar la página**: si luego se quiere
mostrar dirección, badge u otro dato, solo se modifica `BranchSelectItem`.

```text
src/presentation/
├── pages/branch-selection/
│   └── SelectBranchPage.tsx        ← pantalla: layout, título, botones, lógica de selección/switch
└── components/branch-selection/
    ├── BranchSelectList.tsx         ← lista: mapea branches + maneja cuál está seleccionada
    └── BranchSelectItem.tsx         ← UNA fila: ícono + nombre + estado (reutilizable/extensible)
```

`BranchSelectItem` recibe props acotadas para poder crecer sin romper a sus padres:

```tsx
interface BranchSelectItemProps {
  branch: AccessibleBranch;          // { id, name } — lo único que hoy provee el login
  selected: boolean;
  onSelect: (id: string) => void;
  // Extensiones futuras (opcionales, sin tocar la página): subtitle?, disabled?, icon?
}
```

> **Diseño de referencia:** existe el mockup **"Seleccionar Sucursal"** en el proyecto Stitch "Login
> de RESTIFY" (dark mode, ya alineado con la app). Muestra ícono + nombre + una línea de dirección;
> como el login solo entrega `id` + `name`, la **versión inicial** implementa solo **ícono + nombre**
> (la dirección queda como extensión futura vía `subtitle`, si se decide traer `GET /api/branches`).

### Tareas

1. **Repository/Service** — agregar `switchBranch(branchId)` que llama `POST /api/auth/switch-branch`
   y devuelve el nuevo `{ token }`. Ubicarlo en `auth.repository.ts` + `auth.service.ts`.
2. **Pantalla de selección** — `src/presentation/pages/branch-selection/SelectBranchPage.tsx` +
   `components/branch-selection/{BranchSelectList,BranchSelectItem}.tsx` (ver estructura arriba):
   - La página lista las `branches` accesibles vía `BranchSelectList` (que renderiza un
     `BranchSelectItem` por sucursal). Diseño centrado, dark mode (patrón de las pantallas de auth).
   - Al confirmar la selección: llama `authService.switchBranch(id)`, guarda token + elección vía
     `selectBranch` (Fase 0), invalida queries operativas (ver tarea 4) y navega a la vista principal.
   - Manejar `BRANCH_FORBIDDEN`/`BRANCH_DISABLED` con toast claro.
3. **Guard de navegación** — bloquear la app hasta que haya sucursal elegida:
   - En el wrapper de rutas protegidas (`PrivateRoute`/layout): si `needsBranchSelection` es `true`,
     **redirigir a `/select-branch`** y no renderizar las pantallas principales.
   - Si `selectedBranchId` ya existe (incluido tras refresh, porque está persistido) → acceso normal,
     sin volver a preguntar.
   - Ruta `/select-branch` protegida (requiere sesión) pero **fuera** del bloqueo (es la salida del
     bloqueo). Si el usuario llega ahí con una sola sucursal o ya elegida → redirigir a la principal.
4. **Invalidación de queries operativas** (helper reutilizable, usado al elegir y al cambiar):
   - `queryClient.invalidateQueries` para `['orders']`, `['menu']`/`['menu-items']`, `['tables']`,
     `['products']`, `['expenses']`, `['branches', id, 'detail']`, dashboard/reportes. (Listar los
     query keys reales del repo.)
5. **Cambiar de sucursal (explícito)** — `BranchSwitcher` en `Sidebar.tsx`/header:
   - Visible solo si `hasMultipleBranches`. Opción "Cambiar de sucursal" → `clearSelectedBranch()`
     (Fase 0), lo que dispara el guard y lleva de vuelta a `/select-branch`.
   - (Alternativa: el switcher cambia directo sin pasar por la pantalla; preferir reusar
     `/select-branch` para no duplicar UI.)

### Criterio de aceptación

- Login como usuario con 2+ sucursales → cae en `/select-branch` y **no puede** navegar a otras
  rutas hasta elegir. Al elegir, entra y los datos operativos corresponden a esa sucursal.
- Login con 1 sucursal → entra directo, nunca ve `/select-branch`.
- Refresh (F5) con sucursal ya elegida → entra directo a ella, sin volver a preguntar.
- "Cambiar de sucursal" desde el menú → reabre la selección; al elegir otra, los datos se recargan.
- Sucursal sin acceso/deshabilitada → toast claro (no error genérico).
- `npx tsc --noEmit` y `npm run lint` limpios.

---

## FASE 3 — `branchIds` en gestión de usuarios

**Objetivo:** que el owner asigne sucursales a empleados (roles ≠ owner/admin) al crearlos/editarlos.

**Atómica porque:** agrega un campo al form de usuarios; el backend ya acepta `branchIds`.

**Depende de:** Fase 0 (lista de sucursales para poblar el selector).

### Tareas

1. **Tipos** — agregar `branchIds?: string[]` a los request de crear/editar usuario y exponerlo en la
   respuesta de `GET /api/users/:id` (el backend ya lo devuelve).
2. **Form** — `src/presentation/components/users/UserForm.tsx`:
   - Agregar un **MultiSelect** de sucursales (de `branches` del store), visible solo cuando el rol
     seleccionado **no** es OWNER/ADMIN (esos acceden a todas; el backend lo cubre).
   - Precargar los `branchIds` actuales en modo edición.
   - Validación Zod: si rol ≠ owner/admin, exigir al menos una sucursal (alinear con el backend).
3. **Service/Repository** — pasar `branchIds` en create/update de usuarios.

### Criterio de aceptación

- Crear un waiter con 2 sucursales asignadas → el backend crea 2 filas `UserBranchAccess`; al re-abrir
  el usuario aparecen marcadas.
- Cambiar el rol a admin oculta el selector (no se envían `branchIds`).
- `npx tsc --noEmit` y `npm run lint` limpios.

---

## FASE 4 — Cuenta y verificación de email

**Objetivo:** cubrir el cambio de contraseña forzado y el flujo de verificación de email que el
backend ya expone.

**Atómica porque:** son pantallas/flujos independientes; se pueden entregar en sub-PRs (4a cuenta,
4b verificación).

### Tareas

1. **Cambio de password forzado** (`mustChangePassword`):
   - El `User` ya trae `mustChangePassword` (`index.ts:17`). Tras login, si es `true`, redirigir a una
     pantalla de cambio de contraseña obligatorio (usar el endpoint `set-password` ya existente) antes
     de dejar entrar al resto de la app.
2. **Página "Mi cuenta"** — `src/presentation/pages/settings/account/AccountPage.tsx`:
   - Datos del usuario (nombre, email, rol — solo lectura lo que no es editable) + cambio de
     contraseña voluntario.
3. **Verificación de email**:
   - **Banner** (en `MainLayout` o dashboard) cuando `user.emailVerified === false`, con botón
     "Reenviar correo" → `POST /api/auth/resend-verification`.
   - **Página** `src/presentation/pages/auth/VerifyEmailPage.tsx` para el link del correo
     (`/verify-email?token=...`) → `POST /api/auth/verify-email` con el token → feedback de éxito /
     ya verificado / token inválido. Ruta **pública**.
   - Tras verificar, refrescar el `user` (el flag `emailVerified` cambia en el próximo login/refresh).

### Criterio de aceptación

- Un usuario con `mustChangePassword` no puede usar la app sin cambiar su contraseña.
- El banner aparece solo si el email no está verificado y desaparece tras verificar.
- El link del correo verifica correctamente; un token expirado/invalid muestra mensaje claro; una
  segunda visita muestra "ya verificado" sin error.
- `npx tsc --noEmit` y `npm run lint` limpios.

---

## FASE 5 — Org settings + cerrar/reactivar organización

**Objetivo:** pantalla de organización y los flujos de cierre/reactivación.

**Atómica porque:** pantallas nuevas, aditivas; no tocan el flujo operativo.

### Tareas

1. **Org settings** — `src/presentation/pages/settings/organization/OrganizationPage.tsx`:
   - Mostrar nombre de la organización y plan (solo owner). Editar lo que el backend permita.
2. **Cerrar organización** (solo owner):
   - Sección "Zona de peligro" con `ConfirmDialog` que pide escribir el `confirmationName` (= nombre
     de la org). Llama `POST /api/organization/close`. Tras cerrar → logout + mensaje.
   - Contemplar `ORGANIZATION_NAME_MISMATCH`, `ORGANIZATION_ALREADY_CLOSED`.
3. **Reactivar organización** (ruta pública):
   - Pantalla/flujo que re-valida email + password (el JWT viejo queda invalidado) y llama
     `POST /api/organization/reactivate`. Contemplar `ORGANIZATION_REACTIVATION_EXPIRED` (>30 días).

### Criterio de aceptación

- El owner puede ver la organización, cerrarla (con confirmación por nombre) y reactivarla dentro de
  la ventana. Errores de borde mostrados como toast claro.
- Roles no-owner no ven las acciones destructivas.
- `npx tsc --noEmit` y `npm run lint` limpios.

---

## FASE 6 — Subida de imágenes (`POST /api/uploads`)

**Objetivo:** reemplazar los inputs de URL de texto por subida real de archivos.

**Atómica porque:** mejora aditiva; cada input de imagen se migra por separado.

### Tareas

1. **Componente reutilizable** — `src/presentation/components/ui/image-upload.tsx`:
   - Input de archivo (acepta jpeg/png/webp, ≤5MB), preview, y subida vía `multipart/form-data` a
     `POST /api/uploads` con el `kind` correspondiente → recibe `{ url, key }`.
   - Manejar `INVALID_IMAGE_TYPE` (400), `IMAGE_SIZE_EXCEEDS_LIMIT` (413), `IMAGE_UPLOAD_FAILED` (500).
   - Repository/service nuevo `uploads.repository.ts` + `uploads.service.ts`.
2. **Conectar** en:
   - Logo de sucursal (`kind: 'branch_logo'`) — en la config de sucursal (Fase 1).
   - Logo de organización (`kind: 'org_logo'`) — en org settings (Fase 5).
   - Imagen de producto (`kind: 'product_image'`) y de menú (`kind: 'menu_item_image'`).
   - En cada recurso, guardar la `url` devuelta en el `POST`/`PATCH` existente (el backend persiste
     `imageUrl` en Product/MenuItem; la sucursal/org en su `logoUrl`).

### Criterio de aceptación

- Subir un logo/imagen válida la guarda y se refleja; tipo inválido o >5MB muestran error claro.
- Los inputs de URL de texto quedan reemplazados (o conviven como fallback si se decide).
- `npx tsc --noEmit` y `npm run lint` limpios.

---

## Orden de PRs sugerido

| PR | Fase | Riesgo | Notas |
|----|------|--------|-------|
| 1 | Fase 0 | Medio | Cimiento: sucursal activa en store + tipos. Sin cambios visibles |
| 2 | Fase 1 | Medio | Migra Company→Branch; elimina `/api/company`. **Desbloquea el deploy nuevo** |
| 3 | Fase 2 | Medio | Selección de sucursal al entrar + cambio explícito |
| 4 | Fase 3 | Bajo | `branchIds` en usuarios |
| 5 | Fase 4 | Bajo | Cuenta + verificación email (sub-divisible) |
| 6 | Fase 5 | Bajo | Org settings + close/reactivate |
| 7 | Fase 6 | Bajo | Subida de imágenes |

**Regla:** Fases 0 y 1 deben ir juntas o muy seguidas — la Fase 1 es la que arregla la pantalla rota
contra el backend multi-tenant, pero no funciona sin la Fase 0.

## Checklist por fase (recordatorio de la skill `restify-ui`)

- [ ] Sin colores hardcodeados; clases tokenizadas + variante `dark:`.
- [ ] No se saltan capas (`Page → hook/service → repository → apiClient`).
- [ ] `domain` no importa de otras capas.
- [ ] Listas con `useCrudList`; mutaciones con `invalidate()`.
- [ ] Forms con RHF + Zod; errores inline en español.
- [ ] Toasts solo vía `@/shared/utils/toast`.
- [ ] Los 3 estados (loading/empty/error) en toda lista.
- [ ] Visibilidad por rol en acciones sensibles.
- [ ] `npx tsc --noEmit` y `npm run lint` limpios.
