import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { PaletteId } from '@/shared/constants/palette.constants';
import { PALETTES } from '@/shared/constants/palette.constants';
import { getInitialPaletteId, savePaletteId, applyPalette } from '@/shared/utils/palette.utils';
import { useTheme } from '@/presentation/contexts/theme.context';

interface PaletteContextType {
  paletteId: PaletteId;
  setPaletteId: (id: PaletteId) => void;
  palettes: typeof PALETTES;
}

const PaletteContext = createContext<PaletteContextType | undefined>(undefined);

interface PaletteProviderProps {
  children: ReactNode;
}

/**
 * Provider de paleta de colores.
 * Aplica las variables CSS (--primary, --primary-foreground, --ring) según la paleta y el tema actual.
 * Debe estar dentro de ThemeProvider para leer el tema.
 */
export function PaletteProvider({ children }: PaletteProviderProps) {
  const { theme } = useTheme();
  const [paletteId, setPaletteIdState] = useState<PaletteId>(getInitialPaletteId);

  useEffect(() => {
    applyPalette(paletteId, theme);
  }, [paletteId, theme]);

  const setPaletteId = (id: PaletteId) => {
    setPaletteIdState(id);
    savePaletteId(id);
  };

  return (
    <PaletteContext.Provider value={{ paletteId, setPaletteId, palettes: PALETTES }}>
      {children}
    </PaletteContext.Provider>
  );
}

export function usePalette() {
  const context = useContext(PaletteContext);
  if (context === undefined) {
    throw new Error('usePalette must be used within a PaletteProvider');
  }
  return context;
}
