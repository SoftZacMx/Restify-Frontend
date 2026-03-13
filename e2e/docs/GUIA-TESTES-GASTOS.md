# Guía: creación de pruebas E2E para el módulo de Gastos

Esta guía ordena las tareas para cubrir los flujos y casos faltantes del módulo de gastos, por **fases** y **orden de dependencias**.

---

## Resumen de dependencias entre fases

```
Fase 1 (Documentación) ──┬──► Fase 2 (Estructura)
                         │
                         ├──► Fase 3 (Validaciones)
                         │
                         ├──► Fase 4 (Otros tipos de gasto)
                         │
                         └──► Fase 5 (Listado y filtros) ──► Fase 6 (Errores y bordes)
                                                                    │
                                                                    ▼
                                                           Fase 7 (Consolidación)
```

- **Fase 1** no depende de ninguna otra; el resto usa su salida (documentación).
- **Fase 2** debe estar hecha antes de 3, 4, 5 y 6.
- **Fase 5** se apoya en tener al menos un gasto creado (flujo actual o Fase 4).
- **Fase 7** se hace al final, cuando ya existan las pruebas de las fases anteriores.

---

## Fase 1: Documentación y requisitos

**Objetivo:** Tener claro qué hace la UI y la API para no adivinar en los tests.

**Dependencias:** Ninguna.

| Orden | Tarea | Detalle |
|-------|--------|--------|
| 1.1 | Documentar formularios por tipo de gasto | **Servicios del negocio**, **Renta**, **Servicios públicos** y **Otros** usan el **mismo formulario**: solo monto (sin selector de empleado). **Salarios** añade el botón **Seleccionar empleado** (diálogo) para indicar a quién se le pagó. **Compra de mercancía** es distinto (ítems/productos) y ya está cubierto. |
| 1.2 | Documentar mensajes de validación | Título vacío, título > 200 caracteres, método de pago, fecha, “al menos un ítem”. Incluir el texto exacto o un patrón (ej. “superar 200”). |
| 1.3 | Definir reglas de cantidad/precio | Si cantidad o precio 0 o negativo están permitidos; si no, qué mensaje o comportamiento se muestra. |
| 1.4 | Documentar respuesta de la API al guardar | Código 200/201 y cuerpo en éxito; códigos y cuerpo en error (400, 500, red). Qué muestra la UI en cada caso (toast, mensaje en formulario). |
| 1.5 | Documentar filtros del listado | Qué filtros existen (tipo, rango de fechas, método de pago), cómo se activan (botones, inputs) y qué filas muestran/ocultan. |

**Entregable:** Notas o doc (ej. en `e2e/docs/expenses-behavior.md`) con lo anterior.

---

## Fase 2: Estructura del spec y setup compartido

**Objetivo:** Un solo archivo de tests bien organizado y con helpers reutilizables.

**Dependencias:** Ninguna (recomendable tener Fase 1 para nombrar bien los `describe`).

| Orden | Tarea | Detalle |
|-------|--------|--------|
| 2.1 | Agrupar tests en `describe` por tema | Por ejemplo: `Página y listado`, `Compra de mercancía`, `Otros tipos de gasto`, `Validaciones`, `Listado y filtros`, `Errores y bordes`. |
| 2.2 | Mantener un único `beforeEach` a nivel Expenses | Login y, si aplica, navegación base; que todos los tests partan del mismo estado. |
| 2.3 | Extraer helpers reutilizables | Por ejemplo: “abrir Nuevo Gasto”, “rellenar datos generales (título, fecha, método)”, “guardar y esperar éxito”. Usarlos en tests de mercancía y en los nuevos. |
| 2.4 | Revisar selectores | Preferir `data-testid`, `getByRole`, `getByLabel`; reducir dependencia de `.first()` o clases CSS donde sea posible. |

**Entregable:** `expenses.spec.ts` reorganizado y con helpers listos para reutilizar en las siguientes fases.

---

## Fase 3: Validaciones adicionales

**Objetivo:** Cubrir validaciones que aún no tienen test.

**Dependencias:** Fase 2 (estructura y helpers).

| Orden | Tarea | Detalle |
|-------|--------|--------|
| 3.1 | Test: título con más de 200 caracteres | Rellenar título con 201+ caracteres, intentar guardar; comprobar que el formulario sigue visible y que aparece el mensaje documentado en 1.2. |
| 3.2 | Test: cantidad o precio 0/negativo (si aplica) | Si el negocio lo impide: en un gasto de mercancía, poner 0 en cantidad o precio y comprobar mensaje o que no se guarde (según 1.3). Si está permitido, omitir o documentar. |

**Entregable:** Tests de validación nuevos pasando y documentación actualizada si cambia algo.

---

## Fase 4: Otros tipos de gasto

**Objetivo:** Al menos un test de flujo completo por cada tipo de gasto distinto a “Compra de mercancía”.

**Dependencias:** Fase 2 (estructura y helpers); Fase 1 para saber campos de cada tipo.

**Comportamiento por tipo:**

- **Servicios del negocio**, **Renta**, **Servicios públicos** y **Otros** → mismo flujo: solo monto (como “Servicios del negocio”). No hay selector de empleado.
- **Salarios** → mismo flujo de monto + **obligatorio** usar el botón **Seleccionar empleado** (diálogo) para elegir a quién se le pagó.
- **Compra de mercancía** → flujo distinto (ítems/productos); ya cubierto en tests.

| Orden | Tarea | Detalle |
|-------|--------|--------|
| 4.1 | Test: crear gasto “Servicios del negocio” y guardar | Abrir Nuevo Gasto, elegir tipo, rellenar título, fecha, método de pago y monto; guardar; comprobar éxito y que el gasto aparece en la lista. |
| 4.2 | Test: crear gasto “Renta” y guardar | Mismo patrón que 4.1: tipo Renta, mismos campos (título, fecha, método, monto), guardar, ver en lista. |
| 4.3 | Test: crear gasto “Servicios públicos” y guardar | Igual que 4.1/4.2 para Servicios públicos. |
| 4.4 | Test: crear gasto “Otros” y guardar | Igual que 4.1: tipo Otros, mismos campos (solo monto, sin empleado), guardar y comprobar en lista. |
| 4.5 | Test: crear gasto “Salarios” y guardar | Tipo Salarios; rellenar título, fecha, método y monto; **abrir “Seleccionar empleado”, elegir un empleado en el diálogo y confirmar**; guardar; comprobar éxito y que el gasto aparece en la lista. |

**Entregable:** Un test por tipo de gasto, reutilizando helpers de Fase 2.

---

## Fase 5: Listado y filtros

**Objetivo:** Comprobar que el listado y los filtros se comportan como está documentado.

**Dependencias:** Fase 2; existencia de al menos un gasto (del flujo actual de mercancía o de Fase 4).

| Orden | Tarea | Detalle |
|-------|--------|--------|
| 5.1 | Test: filtrar por tipo “Servicios del negocio” | Aplicar filtro (según 1.5); comprobar que solo aparecen gastos de ese tipo (o que el gasto creado en 4.1 aparece). |
| 5.2 | Test: filtrar por tipo “Compra de mercancía” | Ya cubierto en el test principal; opcionalmente añadir assert explícito de que al quitar el filtro aparecen más filas. |
| 5.3 | Test: filtrar por rango de fechas | Si existe filtro de fechas: elegir rango que incluya un gasto creado; comprobar que aparece. Cambiar a rango donde no haya gastos y comprobar lista vacía o mensaje. |
| 5.4 | Test: filtrar por método de pago | Si existe: seleccionar método (ej. Transferencia) y comprobar que los gastos mostrados tienen ese método. |
| 5.5 | Test: estado vacío del listado | Con un filtro que no devuelva resultados (o en un entorno sin gastos), comprobar mensaje o estado “no hay gastos” según 1.5. |

**Entregable:** Tests de filtros y listado pasando.

---

## Fase 6: Errores y casos borde

**Objetivo:** Fallos de API y comportamiento del cierre del modal.

**Dependencias:** Fase 2.

| Orden | Tarea | Detalle |
|-------|--------|--------|
| 6.1 | Test: cerrar modal con botón “Cerrar” (X) | Abrir Nuevo Gasto, rellenar algo sin guardar; pulsar Cerrar; comprobar que el modal se cierra y no se crea gasto (lista sin el título usado). |
| 6.2 | Test: error al guardar (API/red) | Según 1.4: simular error (backend caído, 500 o mock). Intentar guardar; comprobar que se muestra el mensaje esperado y que el formulario no se cierra como si hubiera éxito. |

**Nota:** 6.2 puede requerir configuración (proxy, mock server o env) para forzar el error; documentar cómo se hace en el proyecto.

**Entregable:** Tests de cierre y de error al guardar pasando.

---

## Fase 7: Consolidación y mantenimiento

**Objetivo:** Dejar la suite estable y fácil de mantener.

**Dependencias:** Fases 2 a 6 realizadas.

| Orden | Tarea | Detalle |
|-------|--------|--------|
| 7.1 | Revisar duplicación de pasos | Identificar pasos repetidos entre tests; extraer a helpers o `beforeEach` donde tenga sentido. |
| 7.2 | Sustituir `waitForTimeout` por esperas explícitas | Donde haya `waitForTimeout`, intentar reemplazar por `expect(...).toBeVisible()` o `waitFor` sobre estado concreto. |
| 7.3 | Revisar selectores frágiles | Buscar `.first()` o selectores por clase que puedan romperse; usar `data-testid` o roles si hace falta tocar componentes. |
| 7.4 | Documentar requisitos de ejecución | En el spec o en un README: backend levantado, usuario, si algún test requiere datos (productos, mesas) o mock de API. |
| 7.5 | Ejecutar suite completa y anotar flakiness | Correr varias veces; si algún test falla de forma intermitente, anotar y corregir (esperas, selectores, datos). |

**Entregable:** Suite estable, menos duplicación y documentación de requisitos de ejecución.

---

## Orden sugerido de ejecución de fases

1. **Fase 1** (documentación).  
2. **Fase 2** (estructura y helpers).  
3. **Fase 3** (validaciones).  
4. **Fase 4** (otros tipos de gasto).  
5. **Fase 5** (listado y filtros).  
6. **Fase 6** (errores y bordes).  
7. **Fase 7** (consolidación).

Las fases 3, 4, 5 y 6 pueden avanzar en paralelo una vez Fase 2 esté hecha; solo 5 depende de tener gastos creados (flujo actual o Fase 4). Fase 7 siempre al final.

---

## Anexo: Tipos de gasto y formularios

| Tipo | Formulario | Diferencia |
|------|------------|------------|
| Servicios del negocio | Monto único | — |
| Servicios públicos | Monto único | Igual que Servicios del negocio |
| Renta | Monto único | Igual que Servicios del negocio |
| Otros | Monto único | Igual que Servicios del negocio (sin selector de empleado) |
| **Salarios** | Monto + **Seleccionar empleado** | Obligatorio elegir empleado en el diálogo (a quién se le pagó) |
| Compra de mercancía | Ítems (productos, cantidades, unidades) | Ya cubierto en tests |

Los tests para Servicios del negocio, Renta, Servicios públicos y Otros pueden reutilizar el mismo flujo (título, fecha, método de pago, monto). Solo Salarios añade el paso de abrir el diálogo y seleccionar empleado.

---

## Anexo: Flujo «Servicios del negocio»

Requisitos para el tipo de gasto **Servicios del negocio** (y para Renta, Servicios públicos y Otros; usar en Fase 1 y en los tests de Fase 4):

| Campo | Obligatorio | Reglas / notas |
|-------|-------------|----------------|
| Título del gasto | Sí | — |
| Tipo de gasto | Sí | Valor: **Servicios del negocio** |
| Fecha | Sí | — |
| Descripción / Notas | No | Opcional |
| Método de pago | Sí | — |
| Cantidad pagada (monto) | Sí | Debe ser **mayor a 0** |

**Cálculos:**

- Calcular IVA si aplica; por ahora en el proyecto **no se aplica IVA en ninguna parte**.
- **Subtotal** y **Total a pagar** deben ser **iguales** (sin IVA).

**Formato de números en el proyecto:**

- Usar **coma como separador de miles** y **punto como decimal**.
- Ejemplo correcto: **3,000.20** (tres mil con 20 centavos).
- No usar formato tipo 3.000,20 (punto miles, coma decimal). Ajustar todos los lugares que muestren montos para que sigan el formato 3,000.20.
