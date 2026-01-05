import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Theme } from '@/shared/constants/theme.constants';
import { getInitialTheme, applyTheme, saveTheme } from '@/shared/utils/theme.utils';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

/**
 * Provider para el contexto de tema
 * Maneja la persistencia y aplicación del tema
 */
export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme || getInitialTheme());

  // Aplicar tema al HTML cuando cambia
  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Escuchar cambios en la preferencia del sistema (opcional)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Solo actualizar si no hay tema guardado en localStorage
      if (!localStorage.getItem('restify-theme')) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Siempre renderizar el Provider para que el contexto esté disponible
  // El tema se aplica inmediatamente en el useEffect
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para usar el contexto de tema
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

