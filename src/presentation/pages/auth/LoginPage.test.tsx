import type { ReactElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/presentation/contexts/theme.context';
import LoginPage from './LoginPage';

const mockLogin = vi.fn();
const mockClearError = vi.fn();
const mockNavigate = vi.fn();
const mockAuthStoreGetState = vi.fn(() => ({ user: { rol: 'ADMIN' } }));

vi.mock('@/presentation/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: false,
    error: null,
    clearError: mockClearError,
  }),
}));

vi.mock('@/presentation/store/auth.store', () => ({
  useAuthStore: {
    getState: () => mockAuthStoreGetState(),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

/**
 * Wraps UI in ThemeProvider and MemoryRouter.
 * Use this for login-related tests so components have theme and routing context.
 */
function renderWithProviders(ui: ReactElement) {
  return render(
    <ThemeProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );
}

function renderLoginPage() {
  return renderWithProviders(<LoginPage />);
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password fields and sign in button', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('shows validation error when email is invalid', async () => {
    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const form = emailInput.closest('form');
    if (!form) throw new Error('Form not found');

    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    expect(await screen.findByText(/email inválido/i, {}, { timeout: 2000 })).toBeInTheDocument();
  });

  it('shows validation error when password is shorter than 6 characters', async () => {
    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const form = emailInput.closest('form');
    if (!form) throw new Error('Form not found');

    fireEvent.change(emailInput, { target: { value: 'admin@restify.com' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.submit(form);

    expect(await screen.findByText(/la contraseña debe tener al menos 6 caracteres/i, {}, { timeout: 2000 })).toBeInTheDocument();
  });

  it('calls login with credentials and navigates to dashboard on success', async () => {
    mockLogin.mockResolvedValue({ success: true });
    mockAuthStoreGetState.mockReturnValue({ user: { rol: 'ADMIN' } });

    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const form = emailInput.closest('form');
    if (!form) throw new Error('Form not found');

    fireEvent.change(emailInput, { target: { value: 'admin@restify.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@restify.com',
        password: 'password123',
      });
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('navigates to pos when user role is WAITER', async () => {
    mockLogin.mockResolvedValue({ success: true });
    mockAuthStoreGetState.mockReturnValue({ user: { rol: 'WAITER' } });

    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const form = emailInput.closest('form');
    if (!form) throw new Error('Form not found');

    fireEvent.change(emailInput, { target: { value: 'waiter@restify.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'waiter@restify.com',
        password: 'password123',
      });
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/pos');
    });
  });
});
