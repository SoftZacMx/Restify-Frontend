import type { PaletteId } from '@/shared/constants/palette.constants';
import { DEFAULT_PALETTE_ID, PALETTE_STORAGE_KEY, PALETTES } from '@/shared/constants/palette.constants';
import type { Theme } from '@/shared/constants/theme.constants';

/**
 * Obtiene la paleta inicial desde localStorage
 */
export function getInitialPaletteId(): PaletteId {
  if (typeof window === 'undefined') return DEFAULT_PALETTE_ID;
  const stored = localStorage.getItem(PALETTE_STORAGE_KEY) as PaletteId | null;
  if (stored && PALETTES.some((p) => p.id === stored)) return stored;
  return DEFAULT_PALETTE_ID;
}

/**
 * Guarda la paleta en localStorage
 */
export function savePaletteId(paletteId: PaletteId): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PALETTE_STORAGE_KEY, paletteId);
}

/**
 * Aplica las variables CSS de la paleta al documento
 */
export function applyPalette(paletteId: PaletteId, theme: Theme): void {
  if (typeof document === 'undefined') return;

  const palette = PALETTES.find((p) => p.id === paletteId);
  if (!palette) return;

  const root = document.documentElement;
  const colors = theme === 'dark' ? palette.dark : palette.light;

  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-foreground', colors.primaryForeground);
  root.style.setProperty('--ring', colors.ring);
}
