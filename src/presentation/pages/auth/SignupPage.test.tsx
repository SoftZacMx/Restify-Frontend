import type { ReactElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/presentation/contexts/theme.context';
import SignupPage from './SignupPage';

const mockSignup = vi.fn();
const mockClearError = vi.fn();
const mockNavigate = vi.fn();
const mockGetPlans = vi.fn();
const mockCreateCheckout = vi.fn();

const PLAN_MONTHLY = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Mensual',
  billingPeriod: 'MONTHLY' as const,
  price: 322000,
};
const PLAN_ANNUAL = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Anual',
  billingPeriod: 'ANNUAL' as const,
  price: 3112300,
};

vi.mock('@/presentation/hooks/useAuth', () => ({
  useAuth: () => ({
    signup: mockSignup,
    isLoading: false,
    error: null,
    clearError: mockClearError,
  }),
}));

vi.mock('@/application/services/subscription.service', () => ({
  subscriptionService: {
    getPlans: (...args: unknown[]) => mockGetPlans(...args),
    createCheckout: (...args: unknown[]) => mockCreateCheckout(...args),
  },
}));

vi.mock('@/shared/utils/toast', () => ({
  showErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
  showWarningToast: vi.fn(),
  showInfoToast: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderWithProviders(ui: ReactElement) {
  return render(
    <ThemeProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );
}

function change(container: HTMLElement, selector: string, value: string) {
  const input = container.querySelector(selector);
  if (!input) throw new Error(`No se encontró el campo ${selector}`);
  fireEvent.change(input, { target: { value } });
}

/** Completa el paso 1 (owner + organización) y avanza al paso 2. */
async function submitOwnerStep(container: HTMLElement) {
  change(container, '#name', 'Juan');
  change(container, '#lastName', 'Pérez');
  change(container, '#email', `owner-${Date.now()}@example.com`);
  change(container, '#organizationName', 'Mi Restaurante');
  change(container, '#password', 'Test1234');
  change(container, '#confirmPassword', 'Test1234');
  fireEvent.submit(container.querySelector('form')!);
  await screen.findByText('Primera Sucursal');
}

/** Completa el paso 2 (sucursal) y avanza al paso 3 (plan). */
async function submitBranchStep(container: HTMLElement) {
  change(container, '#branchName', 'Sucursal Centro');
  change(container, '#state', 'Jalisco');
  change(container, '#city', 'Guadalajara');
  change(container, '#street', 'Av. Juárez');
  change(container, '#exteriorNumber', '123');
  change(container, '#phone', '3312345678');
  fireEvent.submit(container.querySelector('form')!);
  await screen.findByText('Elige tu Plan');
}

/** Recorre los 3 pasos del wizard y deja la vista en el paso de plan. */
async function goToPlanStep(container: HTMLElement) {
  await submitOwnerStep(container);
  await submitBranchStep(container);
  await screen.findByText('Mensual');
}

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPlans.mockResolvedValue([PLAN_MONTHLY, PLAN_ANNUAL]);
  });

  it('muestra el copy de prueba de 45 días sin tarjeta en cada plan', async () => {
    const { container } = renderWithProviders(<SignupPage />);

    await goToPlanStep(container);

    expect(screen.getAllByText('45 días gratis · sin tarjeta')).toHaveLength(2);
    // Ya no existe un plan "Gratis" ni precios en $0.
    expect(screen.queryByText('Gratis')).not.toBeInTheDocument();
  });

  it('registra sin ir a checkout y navega al dashboard', async () => {
    mockSignup.mockResolvedValue({ success: true });
    const { container } = renderWithProviders(<SignupPage />);

    await goToPlanStep(container);

    const submit = screen.getByRole('button', { name: /completar registro/i });
    await waitFor(() => expect(submit).not.toBeDisabled());
    fireEvent.click(submit);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledTimes(1);
    });
    expect(mockSignup).toHaveBeenCalledWith(
      expect.objectContaining({
        planId: PLAN_MONTHLY.id,
        user: expect.objectContaining({ name: 'Juan', lastName: 'Pérez' }),
        organization: { name: 'Mi Restaurante' },
      })
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
    // El registro ya no dispara un checkout de pago.
    expect(mockCreateCheckout).not.toHaveBeenCalled();
  });
});
