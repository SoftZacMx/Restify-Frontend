import type { Theme } from '@/shared/constants/theme.constants';

/**
 * Utilidades para el manejo de temas
 */

/**
 * Obtiene el tema inicial desde localStorage o preferencia del sistema
 */
export function getInitialTheme(): Theme {
  // Primero intenta obtener de localStorage
  const storedTheme = localStorage.getItem('restify-theme') as Theme | null;
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  // Si no hay tema guardado, usa la preferencia del sistema
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Aplica el tema al documento HTML
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}

/**
 * Guarda el tema en localStorage
 */
export function saveTheme(theme: Theme): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('restify-theme', theme);
}

