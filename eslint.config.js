import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// Familias de color crudas de Tailwind prohibidas: deben usarse los tokens del
// sistema de diseño (primary, fresco, apoyo, destructive, muted, chart-N, etc.).
const RAW_COLOR =
  '(bg|text|border(-[trblxyse])?|ring|ring-offset|from|to|via|divide|shadow|stroke|fill|decoration|outline)-(slate|gray|zinc|neutral|stone|blue|indigo|violet|purple|fuchsia|sky|cyan|teal|green|emerald|lime|red|rose|pink|amber|yellow|orange)-[0-9]'
const RAW_COLOR_MSG =
  'No uses colores crudos de Tailwind; usa los tokens del sistema de diseño (primary, fresco, apoyo, destructive, muted, chart-N…).'

// Tamaños de título crudos (text-3xl y mayores): deben usar la escala tipográfica
// del sistema (text-display / text-h1 / text-h2 / text-h3).
const RAW_TITLE = '\\btext-(3xl|4xl|5xl|6xl|7xl|8xl|9xl)\\b'
const RAW_TITLE_MSG =
  'No uses tamaños de título crudos; usa la escala tipográfica (text-display, text-h1, text-h2, text-h3).'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: `Literal[value=/${RAW_COLOR}/]`, message: RAW_COLOR_MSG },
        { selector: `TemplateElement[value.raw=/${RAW_COLOR}/]`, message: RAW_COLOR_MSG },
        { selector: `Literal[value=/${RAW_TITLE}/]`, message: RAW_TITLE_MSG },
        { selector: `TemplateElement[value.raw=/${RAW_TITLE}/]`, message: RAW_TITLE_MSG },
      ],
    },
  },
])
