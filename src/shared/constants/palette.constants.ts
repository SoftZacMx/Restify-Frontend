/**
 * Paletas de color para la UI
 * Cada paleta define primary, primary-foreground y ring para modo claro y oscuro.
 * Los valores son HSL sin "hsl()": "H S% L%"
 */

export type PaletteId = string;

export interface PaletteColors {
  primary: string;
  primaryForeground: string;
  ring: string;
}

export interface PaletteDefinition {
  id: PaletteId;
  name: string;
  description: string;
  /** Preview: color principal en hex para el swatch */
  previewHex: string;
  light: PaletteColors;
  dark: PaletteColors;
}

export const PALETTE_STORAGE_KEY = 'restify-palette';

export const DEFAULT_PALETTE_ID: PaletteId = 'ocean';

export const PALETTES: PaletteDefinition[] = [
  {
    id: 'ocean',
    name: 'Océano',
    description: 'Azul clásico, profesional',
    previewHex: '#607AFB',
    light: {
      primary: '221 83% 53%',
      primaryForeground: '210 40% 98%',
      ring: '221 83% 53%',
    },
    dark: {
      primary: '217 91% 60%',
      primaryForeground: '222 47% 11%',
      ring: '224 76% 48%',
    },
  },
  {
    id: 'forest',
    name: 'Bosque',
    description: 'Verde fresco, natural',
    previewHex: '#22c55e',
    light: {
      primary: '142 71% 45%',
      primaryForeground: '0 0% 100%',
      ring: '142 71% 45%',
    },
    dark: {
      primary: '142 71% 50%',
      primaryForeground: '0 0% 100%',
      ring: '142 71% 45%',
    },
  },
  {
    id: 'violet',
    name: 'Violeta',
    description: 'Púrpura moderno',
    previewHex: '#8b5cf6',
    light: {
      primary: '262 83% 58%',
      primaryForeground: '0 0% 100%',
      ring: '262 83% 58%',
    },
    dark: {
      primary: '263 70% 65%',
      primaryForeground: '222 47% 11%',
      ring: '263 70% 55%',
    },
  },
  {
    id: 'amber',
    name: 'Ámbar',
    description: 'Cálido y acogedor',
    previewHex: '#f59e0b',
    light: {
      primary: '38 92% 50%',
      primaryForeground: '0 0% 100%',
      ring: '38 92% 50%',
    },
    dark: {
      primary: '43 96% 56%',
      primaryForeground: '0 0% 100%',
      ring: '38 92% 50%',
    },
  },
  {
    id: 'rose',
    name: 'Rosa',
    description: 'Suave y distintivo',
    previewHex: '#f43f5e',
    light: {
      primary: '347 77% 50%',
      primaryForeground: '0 0% 100%',
      ring: '347 77% 50%',
    },
    dark: {
      primary: '350 89% 60%',
      primaryForeground: '0 0% 100%',
      ring: '347 77% 50%',
    },
  },
  {
    id: 'slate',
    name: 'Pizarra',
    description: 'Neutro y sobrio',
    previewHex: '#64748b',
    light: {
      primary: '215 16% 47%',
      primaryForeground: '0 0% 100%',
      ring: '215 16% 47%',
    },
    dark: {
      primary: '215 20% 55%',
      primaryForeground: '222 47% 11%',
      ring: '215 20% 50%',
    },
  },
];
