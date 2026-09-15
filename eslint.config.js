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
      ],
    },
  },
])
