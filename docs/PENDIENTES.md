# Pendientes

**Módulo branches (frontend) — 2 detalles:**
1. Botón "Ver detalle" no hace nada (stub).
2. Error `BRANCH_LIMIT_REACHED` muestra mensaje genérico, no uno claro.

**Multi-tenancy (frontend) — funciones sin UI (el backend ya está listo):**
3. Asignar sucursales (`branchIds`) a empleados en el formulario de usuarios.
4. Verificación de email: página + banner + reenviar.
5. ~~Cambio de contraseña forzado (`mustChangePassword`).~~ ✅ Hecho.
6. ~~Reset de contraseña de empleados desde la UI.~~ ✅ Hecho.
7. ~~Cerrar / reactivar organización desde la UI.~~ ✅ Hecho.
   - ✅ Cerrar: "Zona de peligro" en Ajustes > General (solo owner), con confirmación por nombre.
   - ✅ Reactivar: pantalla pública `/auth/reactivate-organization` (email + password), enlace desde el login.
8. Wizard de onboarding (timezone, logo, primer producto, primer empleado).
9. Subida real de logo/imágenes (hoy es solo pegar una URL).
10. Ocultar paywall si `billingEnabled=false`.

**QA:**
11. Tests E2E + del módulo branches + rollout.
