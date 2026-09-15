# Sistema de diseño — Restify Frontend

Referencia rápida para el equipo. La **fuente de verdad** son los tokens en
[`src/index.css`](../src/index.css) (variables CSS) mapeados en
[`tailwind.config.js`](../tailwind.config.js). Nunca uses colores crudos de
Tailwind (`slate`, `blue`, `green`…) ni HEX en el código: usa los tokens.
Una regla de ESLint bloquea los colores crudos automáticamente.

## Color

Todos los roles se definen como **canales HSL con `<alpha-value>`**, así que
aceptan opacidad: `bg-primary/10`, `text-fresco/60`, `border-apoyo/30`.

### Roles base (shadcn)
| Token | Uso |
|---|---|
| `background` / `foreground` | fondo de página (crema) / texto (carbón) |
| `card` / `card-foreground` | superficies y tarjetas |
| `primary` | acción / CTA (brasa). `primary-foreground` = texto encima |
| `secondary`, `muted`, `accent` | superficies neutras, texto suave, hover/selección |
| `border`, `input`, `ring` | hairline, bordes de input, anillo de foco |
| `destructive` | peligro / error. Variantes: `-foreground`, `-suave`, `-texto` |

### Roles de marca
| Token | Uso |
|---|---|
| `marca` | carbón: cabeceras, texto de marca |
| `fresco` (`-suave`, `-texto`) | verde huerto: éxito / activo / pagado |
| `apoyo` (`-suave`, `-texto`) | ámbar: advertencia / pendiente / apoyo |

**Convención de estado** (badges, dots, textos):
- éxito/activo → `fresco` · advertencia/pendiente → `apoyo` · error/cancelado → `destructive`
- por tono: fondo suave = `-suave`, texto legible = `-texto`, sólido/icono = token base.
- Ejemplo de chip: `bg-fresco-suave text-fresco-texto`.

### Serie categórica (gráficas y acentos)
`chart-1..6` (theme-aware). Para chips decorativos usa opacidad:
`bg-chart-5/15 text-chart-5`. En recharts, pasa `hsl(var(--chart-N))` como
`fill`/`stroke` (se adapta al tema); grid/ejes con `stroke-border`.

## Tipografía

Fuente **Manrope**. Escala semántica (usa estos, no `text-2xl font-bold` sueltos):

| Token | Tamaño / peso | Uso |
|---|---|---|
| `text-display` | 30px / 700 | números KPI grandes |
| `text-h1` | 24px / 700 | título de página |
| `text-h2` | 20px / 600 | sección |
| `text-h3` | 18px / 600 | título de card |
| `text-body` | 14px | cuerpo (peso libre) |
| `text-caption` | 12px | etiquetas / texto tenue (peso libre) |

## Elevación

Sombra neutra estándar: `shadow-sm` / `shadow-lg` / `shadow-xl`. Para glows de
color usa el token con opacidad: `shadow-fresco/10`, `shadow-apoyo/10`,
`shadow-primary/10`.

## Modo oscuro

Automático: los tokens ya traen su valor oscuro en el bloque `.dark` de
`index.css`. **No** agregues `dark:` manuales si usas tokens — se adaptan solos.

## Reglas

1. Nada de colores crudos de Tailwind ni HEX en className (lint lo bloquea).
2. Si agregas un color nuevo, defínelo en `index.css` como canales HSL
   (`H S% L%`) y mapéalo en el config con `hsl(var(--x) / <alpha-value>)`.
   En HEX plano la opacidad no funciona (el anillo cae al azul por defecto).
3. Usa la escala tipográfica para títulos; el cuerpo puede seguir con `text-sm`.
