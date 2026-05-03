import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/presentation/contexts/theme.context';
import { StockTable } from './StockTable';
import type { StockTableItem } from '@/domain/types';

function buildItem(overrides: Partial<StockTableItem> = {}): StockTableItem {
  return {
    productId: 'prod-1',
    name: 'Pollo',
    description: null,
    unitOfMeasure: 'KG',
    stockActual: 5,
    averageCost: 200,
    minStockAlert: 2,
    trackStock: true,
    isLowStock: false,
    health: 'healthy',
    ...overrides,
  };
}

function renderTable(props: Partial<React.ComponentProps<typeof StockTable>> = {}) {
  return render(
    <ThemeProvider>
      <StockTable
        items={props.items ?? []}
        isLoading={props.isLoading}
        onViewHistory={props.onViewHistory}
      />
    </ThemeProvider>
  );
}

describe('StockTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza estado de carga cuando isLoading=true', () => {
    renderTable({ isLoading: true });
    expect(screen.getByText(/cargando stock/i)).toBeInTheDocument();
  });

  it('renderiza estado vacío cuando no hay items', () => {
    renderTable({ items: [] });
    expect(screen.getByText(/no hay productos trackeados/i)).toBeInTheDocument();
  });

  it('renderiza una fila por item con su nombre y unidad', () => {
    renderTable({
      items: [
        buildItem({ productId: 'p-1', name: 'Pollo', stockActual: 5, unitOfMeasure: 'KG' }),
        buildItem({ productId: 'p-2', name: 'Pan baguette', stockActual: 30, unitOfMeasure: 'PCS' }),
      ],
    });

    expect(screen.getByText('Pollo')).toBeInTheDocument();
    expect(screen.getByText('Pan baguette')).toBeInTheDocument();
    // Stock con unidad — "5 kg" y "30 pcs"
    expect(screen.getByText(/5 kg/i)).toBeInTheDocument();
    expect(screen.getByText(/30 pcs/i)).toBeInTheDocument();
  });

  it('muestra la etiqueta de estado correcta según health', () => {
    renderTable({
      items: [
        buildItem({ productId: 'p-1', health: 'healthy' }),
        buildItem({ productId: 'p-2', health: 'warning' }),
        buildItem({ productId: 'p-3', health: 'critical' }),
      ],
    });

    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText(/cerca del mínimo/i)).toBeInTheDocument();
    expect(screen.getByText(/bajo mínimo/i)).toBeInTheDocument();
  });

  it('muestra "—" cuando minStockAlert es null', () => {
    renderTable({
      items: [buildItem({ minStockAlert: null })],
    });
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('muestra el costo promedio formateado en MXN', () => {
    renderTable({
      items: [buildItem({ averageCost: 200 })],
    });
    // Intl puede usar espacios non-breaking, así que matcheo flexible.
    expect(screen.getByText(/\$200/)).toBeInTheDocument();
  });

  it('llama a onViewHistory con el productId al click en "Ver historial"', async () => {
    const onViewHistory = vi.fn();
    const user = userEvent.setup();

    renderTable({
      items: [buildItem({ productId: 'prod-99', name: 'Lechuga' })],
      onViewHistory,
    });

    const button = screen.getByRole('button', { name: /ver historial de lechuga/i });
    await user.click(button);

    expect(onViewHistory).toHaveBeenCalledTimes(1);
    expect(onViewHistory).toHaveBeenCalledWith('prod-99');
  });

  it('renderiza la descripción del producto cuando está presente', () => {
    renderTable({
      items: [buildItem({ description: 'Pollo orgánico de granja' })],
    });
    expect(screen.getByText(/pollo orgánico de granja/i)).toBeInTheDocument();
  });

  it('muestra "(sin unidad)" cuando el producto no tiene unitOfMeasure', () => {
    renderTable({
      items: [buildItem({ unitOfMeasure: null })],
    });
    expect(screen.getByText(/\(sin unidad\)/i)).toBeInTheDocument();
  });
});
