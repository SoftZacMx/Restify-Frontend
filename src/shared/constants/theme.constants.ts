/**
 * Constantes y tipos relacionados con el sistema de temas
 * Centraliza la configuración de temas para facilitar la extensión
 */

export type Theme = 'light' | 'dark';
// Extensible para futuros temas:
// export type Theme = 'light' | 'dark' | 'high-contrast' | 'auto';

export const THEME_STORAGE_KEY = 'restify-theme';

export const DEFAULT_THEME: Theme = 'light';

/**
 * Lista de temas disponibles
 * Facilita agregar nuevos temas en el futuro
 */
export const AVAILABLE_THEMES: Theme[] = ['light', 'dark'];

/**
 * Nombres legibles para los temas
 */
export const THEME_LABELS: Record<Theme, string> = {
  light: 'Modo Claro',
  dark: 'Modo Oscuro',
};

