import type { ReactElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

async function fillCreateForm(user: ReturnType<typeof userEvent.setup>) {
  const nameInput = screen.getByLabelText(/^nombre\s*\*/i);
  const lastNameInput = screen.getByLabelText(/^apellido\s*\*/i);
  const emailInput = screen.getByLabelText(/^email\s*\*/i);
  const passwordInput = document.getElementById('password') as HTMLInputElement;

  await user.clear(nameInput);
  await user.type(nameInput, 'María');
  await user.clear(lastNameInput);
  await user.type(lastNameInput, 'González');
  await user.clear(emailInput);
  await user.type(emailInput, 'maria@test.com');
  await user.clear(passwordInput);
  await user.type(passwordInput, 'SecurePass123!');
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
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />);
    await screen.findByRole('heading', { name: /usuarios/i });

    await user.click(screen.getByRole('button', { name: /nuevo usuario/i }));

    expect(screen.getByRole('heading', { name: /crear nuevo usuario/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^nombre\s*\*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar usuario/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('cierra el modal al hacer clic en Cancelar', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />);
    await screen.findByRole('heading', { name: /usuarios/i });
    await user.click(screen.getByRole('button', { name: /nuevo usuario/i }));
    expect(screen.getByRole('heading', { name: /crear nuevo usuario/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /crear nuevo usuario/i })).not.toBeInTheDocument();
    });
    expect(mocks.createUser).not.toHaveBeenCalled();
  });

  it('llama a createUser y cierra el modal al enviar el formulario con datos válidos', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />);
    await screen.findByRole('heading', { name: /usuarios/i });
    await user.click(screen.getByRole('button', { name: /nuevo usuario/i }));

    await fillCreateForm(user);
    await user.click(screen.getByRole('button', { name: /guardar usuario/i }));

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
