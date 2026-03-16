import type { ReactElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/presentation/contexts/theme.context';
import { SidebarProvider } from '@/presentation/contexts/sidebar.context';
import UsersPage from './UsersPage';
import type { User } from '@/domain/types';

const mocks = vi.hoisted(() => ({
  listUsers: vi.fn(),
  createUser: vi.fn(),
}));

vi.mock('@/application/services/user.service', () => ({
  UserService: vi.fn().mockImplementation(() => ({
    listUsers: mocks.listUsers,
    createUser: mocks.createUser,
    getUserById: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    reactivateUser: vi.fn(),
  })),
}));

vi.mock('@/shared/utils/toast', () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function renderWithProviders(ui: ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <MemoryRouter>{ui}</MemoryRouter>
        </SidebarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function fillCreateForm() {
  fireEvent.change(screen.getByLabelText(/^nombre\s*\*/i), { target: { value: 'María' } });
  fireEvent.change(screen.getByLabelText(/^apellido\s*\*/i), { target: { value: 'González' } });
  fireEvent.change(screen.getByLabelText(/^email\s*\*/i), { target: { value: 'maria@test.com' } });
  const password = document.getElementById('password') as HTMLInputElement;
  fireEvent.change(password, { target: { value: 'SecurePass123!' } });
}

describe('UsersPage (integración)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listUsers.mockResolvedValue([]);
    mocks.createUser.mockResolvedValue({ id: 'new-1', name: 'María', last_name: 'González', email: 'maria@test.com' } as User);
  });

  it('renderiza título, botón Nuevo Usuario y tabla', async () => {
    renderWithProviders(<UsersPage />);

    expect(await screen.findByRole('heading', { name: /usuarios/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nuevo usuario/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(mocks.listUsers).toHaveBeenCalled();
    });
    expect(screen.getByText(/no se encontraron usuarios/i)).toBeInTheDocument();
  });

  it('abre el modal de crear usuario al hacer clic en Nuevo Usuario', async () => {
    renderWithProviders(<UsersPage />);
    await screen.findByRole('heading', { name: /usuarios/i });

    fireEvent.click(screen.getByRole('button', { name: /nuevo usuario/i }));

    expect(screen.getByRole('heading', { name: /crear nuevo usuario/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^nombre\s*\*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar usuario/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('cierra el modal al hacer clic en Cancelar', async () => {
    renderWithProviders(<UsersPage />);
    await screen.findByRole('heading', { name: /usuarios/i });
    fireEvent.click(screen.getByRole('button', { name: /nuevo usuario/i }));
    expect(screen.getByRole('heading', { name: /crear nuevo usuario/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /crear nuevo usuario/i })).not.toBeInTheDocument();
    });
    expect(mocks.createUser).not.toHaveBeenCalled();
  });

  it('llama a createUser y cierra el modal al enviar el formulario con datos válidos', async () => {
    renderWithProviders(<UsersPage />);
    await screen.findByRole('heading', { name: /usuarios/i });
    fireEvent.click(screen.getByRole('button', { name: /nuevo usuario/i }));

    fillCreateForm();
    fireEvent.click(screen.getByRole('button', { name: /guardar usuario/i }));

    await waitFor(() => {
      expect(mocks.createUser).toHaveBeenCalledTimes(1);
    });
    expect(mocks.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'María',
        last_name: 'González',
        email: 'maria@test.com',
        password: 'SecurePass123!',
      })
    );
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /crear nuevo usuario/i })).not.toBeInTheDocument();
    });
  });

  it('muestra lista de usuarios cuando la API devuelve datos', async () => {
    const users: User[] = [
      {
        id: 'u1',
        name: 'Ana',
        last_name: 'López',
        second_last_name: null,
        email: 'ana@test.com',
        phone: null,
        status: true,
        rol: 'WAITER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    mocks.listUsers.mockResolvedValue(users);

    renderWithProviders(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /ana lópez/i })).toBeInTheDocument();
      expect(screen.getByText('ana@test.com')).toBeInTheDocument();
    });
  });
});
