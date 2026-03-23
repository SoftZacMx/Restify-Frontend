import type { ReactElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/presentation/contexts/theme.context';
import { SidebarProvider } from '@/presentation/contexts/sidebar.context';
import OrdersPage from './OrdersPage';

const emptyListResult = {
  orders: [] as unknown[],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  summary: { totalOrdersPending: 0, totalOrdersPaid: 0 },
};
const mockListOrders = vi.fn().mockResolvedValue(emptyListResult);
const mockListTables = vi.fn().mockResolvedValue([]);
const mockGetOrderById = vi.fn();
const mockGetTableById = vi.fn();

vi.mock('@/application/services', () => ({
  orderService: {
    listOrders: (...args: unknown[]) => mockListOrders(...args),
    getOrderById: (...args: unknown[]) => mockGetOrderById(...args),
    markOrderAsDelivered: vi.fn(),
    deleteOrder: vi.fn(),
  },
  tableService: {
    listTables: (...args: unknown[]) => mockListTables(...args),
    getTableById: (...args: unknown[]) => mockGetTableById(...args),
  },
  ticketService: {
    printSaleTicket: vi.fn(),
    printKitchenTicket: vi.fn(),
  },
}));

vi.mock('@/presentation/contexts/websocket.context', () => ({
  useWebSocketContext: () => ({
    isConnected: true,
    connectionId: 'test-connection-id',
  }),
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
          <MemoryRouter>
            {ui}
          </MemoryRouter>
        </SidebarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListOrders.mockResolvedValue(emptyListResult);
    mockListTables.mockResolvedValue([]);
  });

  it('renders page title and main actions', async () => {
    renderWithProviders(<OrdersPage />);

    expect(await screen.findByRole('heading', { name: /órdenes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /actualizar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nueva orden/i })).toBeInTheDocument();
  });

  it('shows empty state when there are no orders', async () => {
    renderWithProviders(<OrdersPage />);

    expect(await screen.findByText(/no hay órdenes/i)).toBeInTheDocument();
    expect(screen.getByText(/las órdenes aparecerán aquí cuando se creen/i)).toBeInTheDocument();
  });

  it('shows filter toggle button', async () => {
    renderWithProviders(<OrdersPage />);

    expect(await screen.findByRole('button', { name: /mostrar filtros/i })).toBeInTheDocument();
  });
});
