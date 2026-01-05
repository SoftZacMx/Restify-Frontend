import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/presentation/contexts/theme.context';
import { Button } from './button';
import { cn } from '@/shared/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'icon' | 'minimal';
}

/**
 * Componente para alternar entre modo claro y oscuro
 */
export function ThemeToggle({ className, variant = 'default' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={cn('h-9 w-9 p-0', className)}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors',
          className
        )}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={toggleTheme}
      className={cn('gap-2', className)}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          <span>Modo Claro</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span>Modo Oscuro</span>
        </>
      )}
    </Button>
  );
}

