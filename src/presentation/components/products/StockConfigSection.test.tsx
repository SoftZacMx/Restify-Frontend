import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/presentation/contexts/theme.context';
import { StockConfigSection } from './StockConfigSection';
import type { UnitOfMeasure, UpdateStockConfigRequest } from '@/domain/types';

function renderSection(props: {
  initialTrackStock?: boolean;
  initialUnitOfMeasure?: UnitOfMeasure | null;
  initialMinStockAlert?: number | null;
  onSave?: (config: UpdateStockConfigRequest) => Promise<void>;
  isSaving?: boolean;
} = {}) {
  return render(
    <ThemeProvider>
      <StockConfigSection
        initialTrackStock={props.initialTrackStock ?? false}
        initialUnitOfMeasure={props.initialUnitOfMeasure ?? null}
        initialMinStockAlert={props.initialMinStockAlert ?? null}
        onSave={props.onSave ?? vi.fn().mockResolvedValue(undefined)}
        isSaving={props.isSaving}
      />
    </ThemeProvider>
  );
}

describe('StockConfigSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cuando trackStock=false, no muestra el select de unidad ni el input de mínimo', () => {
    renderSection({ initialTrackStock: false });
    expect(screen.queryByText(/unidad de medida/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/stock mínimo de alerta/i)).not.toBeInTheDocument();
  });

  it('cuando trackStock=true, muestra el select de unidad y el input de mínimo', () => {
    renderSection({
      initialTrackStock: true,
      initialUnitOfMeasure: 'KG',
      initialMinStockAlert: 5,
    });
    expect(screen.getByText(/unidad de medida/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stock mínimo de alerta/i)).toBeInTheDocument();
  });

  it('al activar el toggle, los campos dependientes aparecen', async () => {
    const user = userEvent.setup();
    renderSection({ initialTrackStock: false });

    expect(screen.queryByText(/unidad de medida/i)).not.toBeInTheDocument();

    const toggle = screen.getByLabelText(/trackear stock/i);
    await user.click(toggle);

    expect(screen.getByText(/unidad de medida/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stock mínimo de alerta/i)).toBeInTheDocument();
  });

  it('el botón "Guardar configuración" arranca deshabilitado cuando no hay cambios', () => {
    renderSection({
      initialTrackStock: true,
      initialUnitOfMeasure: 'KG',
      initialMinStockAlert: 5,
    });
    const button = screen.getByRole('button', { name: /guardar configuración/i });
    expect(button).toBeDisabled();
  });

  it('el botón se habilita al cambiar el toggle', async () => {
    const user = userEvent.setup();
    renderSection({ initialTrackStock: false });

    const button = screen.getByRole('button', { name: /guardar configuración/i });
    expect(button).toBeDisabled();

    const toggle = screen.getByLabelText(/trackear stock/i);
    await user.click(toggle);

    expect(button).toBeEnabled();
  });

  it('si trackStock=true sin unidad, click en guardar muestra error inline y NO llama onSave', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    // Arrancamos en false y activamos el toggle (queda sin unidad seleccionada).
    renderSection({ initialTrackStock: false, onSave });

    const toggle = screen.getByLabelText(/trackear stock/i);
    await user.click(toggle);

    const button = screen.getByRole('button', { name: /guardar configuración/i });
    await user.click(button);

    expect(screen.getByText(/seleccioná una unidad de medida/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('al cambiar el mínimo y guardar (trackStock ya activo) llama onSave con el payload correcto', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    renderSection({
      initialTrackStock: true,
      initialUnitOfMeasure: 'KG',
      initialMinStockAlert: 5,
      onSave,
    });

    const minInput = screen.getByLabelText(/stock mínimo de alerta/i) as HTMLInputElement;
    await user.clear(minInput);
    await user.type(minInput, '12');

    const button = screen.getByRole('button', { name: /guardar configuración/i });
    expect(button).toBeEnabled();
    await user.click(button);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      trackStock: true,
      unitOfMeasure: 'KG',
      minStockAlert: 12,
    });
  });

  it('al desactivar el toggle, el payload manda trackStock=false con unidad y mínimo en null', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    renderSection({
      initialTrackStock: true,
      initialUnitOfMeasure: 'KG',
      initialMinStockAlert: 5,
      onSave,
    });

    const toggle = screen.getByLabelText(/trackear stock/i);
    await user.click(toggle); // off

    const button = screen.getByRole('button', { name: /guardar configuración/i });
    await user.click(button);

    expect(onSave).toHaveBeenCalledWith({
      trackStock: false,
      unitOfMeasure: null,
      minStockAlert: null,
    });
  });

  it('mínimo vacío se traduce a null en el payload', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    renderSection({
      initialTrackStock: true,
      initialUnitOfMeasure: 'KG',
      initialMinStockAlert: 5,
      onSave,
    });

    const minInput = screen.getByLabelText(/stock mínimo de alerta/i) as HTMLInputElement;
    await user.clear(minInput);
    // No tipeamos nada — queda vacío

    const button = screen.getByRole('button', { name: /guardar configuración/i });
    await user.click(button);

    expect(onSave).toHaveBeenCalledWith({
      trackStock: true,
      unitOfMeasure: 'KG',
      minStockAlert: null,
    });
  });

  it('isSaving=true deshabilita el botón aunque haya cambios', async () => {
    const user = userEvent.setup();
    renderSection({ initialTrackStock: false, isSaving: true });

    const toggle = screen.getByLabelText(/trackear stock/i);
    await user.click(toggle);

    const button = screen.getByRole('button', { name: /guardando/i });
    expect(button).toBeDisabled();
  });
});
