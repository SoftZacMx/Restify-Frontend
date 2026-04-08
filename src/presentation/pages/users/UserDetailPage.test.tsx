import type { ReactElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/presentation/contexts/theme.context';
import { SidebarProvider } from '@/presentation/contexts/sidebar.context';
import UserDetailPage from './UserDetailPage';
import type { User } from '@/domain/types';

const mockUser: User = {
  id: 'user-1',
  name: 'Ana',
  last_name: 'López',
  second_last_name: 'Martínez',
  email: 'ana@test.com',
  phone: '5511223344',
  status: true,
  rol: 'MANAGER',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mocks = vi.hoisted(() => ({
  getUserById: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock('@/application/services/user.service', () => ({
  UserService: vi.fn().mockImplementation(() => ({
    listUsers: vi.fn(),
    createUser: vi.fn(),
    getUserById: mocks.getUserById,
    updateUser: mocks.updateUser,
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

function renderWithProviders(ui: ReactElement, route = '/users/user-1') {
  const queryClient = createTestQueryClient();
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path="/users/:userId" element={ui} />
            </Routes>
          </MemoryRouter>
        </SidebarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

describe('UserDetailPage (integración)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserById.mockResolvedValue(mockUser);
    mocks.updateUser.mockResolvedValue({ ...mockUser, name: 'Ana María' });
  });

  it('carga y muestra el detalle del usuario', async () => {
    renderWithProviders(<UserDetailPage />);

    expect(await screen.findByText(/cargando información del usuario/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(mocks.getUserById).toHaveBeenCalledWith('user-1');
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /ana lópez martínez/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /editar usuario/i })).toBeInTheDocument();
  });

  it('abre el modal de edición al hacer clic en Editar Usuario', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserDetailPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /ana lópez martínez/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /editar usuario/i }));

    expect(screen.getByRole('heading', { name: /editar usuario/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
      expect(screen.getByDisplayValue('López')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ana@test.com')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /actualizar usuario/i })).toBeInTheDocument();
  });

  it('cierra el modal al hacer clic en Cancelar', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserDetailPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /ana lópez martínez/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /editar usuario/i }));
    expect(screen.getByRole('heading', { name: /editar usuario/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /editar usuario/i })).not.toBeInTheDocument();
    });
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it('llama a updateUser y cierra el modal al guardar cambios', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserDetailPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /ana lópez martínez/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /editar usuario/i }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
    });
    const nameInput = screen.getByLabelText(/^nombre\s*\*/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Ana María');
    await user.click(screen.getByRole('button', { name: /actualizar usuario/i }));

    await waitFor(() => {
      expect(mocks.updateUser).toHaveBeenCalledWith('user-1', expect.objectContaining({ name: 'Ana María' }));
    });
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /editar usuario/i })).not.toBeInTheDocument();
    });
  });

  it('muestra usuario no encontrado cuando no hay userId o la API falla', async () => {
    mocks.getUserById.mockResolvedValue(null);

    renderWithProviders(<UserDetailPage />, '/users/user-1');

    await waitFor(() => {
      expect(mocks.getUserById).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByText(/usuario no encontrado/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /volver a usuarios/i })).toBeInTheDocument();
  });
});
