import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { ThemeToggle } from '@/presentation/components/ui/theme-toggle';
import { useTheme } from '@/presentation/contexts/theme.context';
import { usePalette } from '@/presentation/contexts/palette.context';
import { Palette, Sun, Moon } from 'lucide-react';
import { cn } from '@/shared/utils';

const SettingsPage = () => {
  const { theme } = useTheme();
  const { paletteId, setPaletteId, palettes } = usePalette();

  return (
    <MainLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Ajustes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personaliza la apariencia de la aplicación.
          </p>
        </div>

        {/* Tema: claro / oscuro */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-slate-500" />
              ) : (
                <Sun className="h-5 w-5 text-slate-500" />
              )}
              Tema
            </CardTitle>
            <CardDescription>
              Elige entre modo claro u oscuro para la interfaz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle variant="default" />
          </CardContent>
        </Card>

        {/* Paleta de colores */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5 text-primary" />
              Paleta de colores
            </CardTitle>
            <CardDescription>
              Selecciona una paleta; el color principal se aplicará a botones, enlaces y acentos en toda la app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {palettes.map((palette) => {
                const isSelected = paletteId === palette.id;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => setPaletteId(palette.id)}
                    className={cn(
                      'flex flex-col items-stretch rounded-xl border-2 p-4 text-left transition-all hover:shadow-md',
                      isSelected
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md ring-2 ring-primary/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50'
                    )}
                  >
                    <div
                      className="h-10 w-full rounded-lg mb-3 shadow-inner"
                      style={{ backgroundColor: palette.previewHex }}
                    />
                    <span className="font-medium text-slate-900 dark:text-white text-sm">
                      {palette.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {palette.description}
                    </span>
                    {isSelected && (
                      <span className="mt-2 text-xs font-medium text-primary">Seleccionada</span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
