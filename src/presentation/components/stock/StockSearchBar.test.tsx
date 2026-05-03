import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/presentation/contexts/theme.context';
import { StockSearchBar } from './StockSearchBar';
import type { StockListFilters } from '@/domain/types';

function renderSearchBar(props: {
  filters?: StockListFilters;
  onFiltersChange?: (filters: StockListFilters) => void;
} = {}) {
  return render(
    <ThemeProvider>
      <StockSearchBar
        filters={props.filters ?? { search: '', lowStockOnly: false }}
        onFiltersChange={props.onFiltersChange ?? vi.fn()}
      />
    </ThemeProvider>
  );
}

describe('StockSearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el input de búsqueda y el toggle de bajo mínimo', () => {
    renderSearchBar();
    expect(screen.getByPlaceholderText(/buscar producto por nombre/i)).toBeInTheDocument();
    expect(screen.getByText(/solo bajo mínimo/i)).toBeInTheDocument();
  });

  it('refleja el valor inicial del filtro de búsqueda en el input', () => {
    renderSearchBar({ filters: { search: 'pollo', lowStockOnly: false } });
    const input = screen.getByPlaceholderText(/buscar producto por nombre/i) as HTMLInputElement;
    expect(input.value).toBe('pollo');
  });

  it('refleja el estado inicial del toggle cuando lowStockOnly=true', () => {
    renderSearchBar({ filters: { search: '', lowStockOnly: true } });
    const checkbox = screen.getByLabelText(/solo bajo mínimo/i) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('llama a onFiltersChange con el search actualizado al tipear', async () => {
    const onFiltersChange = vi.fn();
    const user = userEvent.setup();

    renderSearchBar({
      filters: { search: '', lowStockOnly: false },
      onFiltersChange,
    });

    const input = screen.getByPlaceholderText(/buscar producto por nombre/i);
    await user.type(input, 'a');

    // userEvent.type emite un evento por carácter; verificamos el último.
    expect(onFiltersChange).toHaveBeenCalledWith({ search: 'a', lowStockOnly: false });
  });

  it('preserva lowStockOnly al cambiar la búsqueda', async () => {
    const onFiltersChange = vi.fn();
    const user = userEvent.setup();

    renderSearchBar({
      filters: { search: '', lowStockOnly: true },
      onFiltersChange,
    });

    const input = screen.getByPlaceholderText(/buscar producto por nombre/i);
    await user.type(input, 'x');

    expect(onFiltersChange).toHaveBeenCalledWith({ search: 'x', lowStockOnly: true });
  });

  it('llama a onFiltersChange con lowStockOnly=true al activar el toggle', async () => {
    const onFiltersChange = vi.fn();
    const user = userEvent.setup();

    renderSearchBar({
      filters: { search: 'pollo', lowStockOnly: false },
      onFiltersChange,
    });

    const checkbox = screen.getByLabelText(/solo bajo mínimo/i);
    await user.click(checkbox);

    expect(onFiltersChange).toHaveBeenCalledWith({ search: 'pollo', lowStockOnly: true });
  });

  it('llama a onFiltersChange con lowStockOnly=false al desactivar el toggle', async () => {
    const onFiltersChange = vi.fn();
    const user = userEvent.setup();

    renderSearchBar({
      filters: { search: '', lowStockOnly: true },
      onFiltersChange,
    });

    const checkbox = screen.getByLabelText(/solo bajo mínimo/i);
    await user.click(checkbox);

    expect(onFiltersChange).toHaveBeenCalledWith({ search: '', lowStockOnly: false });
  });
});
