import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/presentation/components/ui/toaster';
import { ThemeProvider } from '@/presentation/contexts/theme.context';
import { PaletteProvider } from '@/presentation/contexts/palette.context';
import { SidebarProvider } from '@/presentation/contexts/sidebar.context';
import { WebSocketProvider } from '@/presentation/contexts/websocket.context';
import { ErrorBoundary } from '@/presentation/components/ErrorBoundary';

// Pages
import LoginPage from '@/presentation/pages/auth/LoginPage';
import RecoverPasswordPage from '@/presentation/pages/auth/RecoverPasswordPage';
import DashboardPage from '@/presentation/pages/dashboard/DashboardPage';
import OrdersPage from '@/presentation/pages/orders/OrdersPage';
import PosPage from '@/presentation/pages/pos/PosPage';
import TablesPage from '@/presentation/pages/tables/TablesPage';
import TableDetailPage from '@/presentation/pages/tables/TableDetailPage';
import MenuPage from '@/presentation/pages/menu/MenuPage';
import ExpensesPage from '@/presentation/pages/expenses/ExpensesPage';
import ExpenseDetailPage from '@/presentation/pages/expenses/ExpenseDetailPage';
import ReportsPage from '@/presentation/pages/reports/ReportsPage';
import UsersPage from '@/presentation/pages/users/UsersPage';
import UserDetailPage from '@/presentation/pages/users/UserDetailPage';
import ProductsPage from '@/presentation/pages/products/ProductsPage';
import ProductDetailPage from '@/presentation/pages/products/ProductDetailPage';
import MenuItemsPage from '@/presentation/pages/menu-items/MenuItemsPage';
import MenuItemDetailPage from '@/presentation/pages/menu-items/MenuItemDetailPage';
import MenuCategoriesPage from '@/presentation/pages/menu-categories/MenuCategoriesPage';
import MenuCategoryDetailPage from '@/presentation/pages/menu-categories/MenuCategoryDetailPage';
import SettingsLayout from '@/presentation/components/layouts/SettingsLayout';
import SettingsGeneralPage from '@/presentation/pages/settings/SettingsGeneralPage';
import CompanyConfigPage from '@/presentation/pages/settings/company/CompanyConfigPage';
import { PrivateRoute } from '@/presentation/components/PrivateRoute';
import { SubscriptionGuard } from '@/presentation/components/subscription/SubscriptionGuard';
import SubscriptionSuccessPage from '@/presentation/pages/subscription/SubscriptionSuccessPage';
import SubscriptionCancelPage from '@/presentation/pages/subscription/SubscriptionCancelPage';
import PaymentResultPage from '@/presentation/pages/payment/PaymentResultPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});


function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
      <PaletteProvider>
      <SidebarProvider>
        <QueryClientProvider client={queryClient}>
          <WebSocketProvider>
            <BrowserRouter>
              <Routes>
                {/* Auth routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/recover-password" element={<RecoverPasswordPage />} />

              {/* Payment result routes (public - customer redirected from MP after QR scan) */}
              <Route path="/payment/success" element={<PaymentResultPage />} />
              <Route path="/payment/failure" element={<PaymentResultPage />} />
              <Route path="/payment/pending" element={<PaymentResultPage />} />

              {/* Subscription routes (no guard - need access without active subscription) */}
              <Route
                path="/subscription/success"
                element={
                  <PrivateRoute>
                    <SubscriptionSuccessPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/subscription/cancel"
                element={
                  <PrivateRoute>
                    <SubscriptionCancelPage />
                  </PrivateRoute>
                }
              />

              {/* Protected routes (with subscription guard) */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <DashboardPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <OrdersPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/pos"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <PosPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/tables"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <TablesPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/tables/:tableId"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <TableDetailPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/menu"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <MenuPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <ExpensesPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/expenses/:expenseId"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <ExpenseDetailPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <ReportsPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <UsersPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/users/:userId"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <UserDetailPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <ProductsPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/products/:productId"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <ProductDetailPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/menu/items"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <MenuItemsPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/menu/items/:menuItemId"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <MenuItemDetailPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/menu/categories"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <MenuCategoriesPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/menu/categories/:categoryId"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <MenuCategoryDetailPage />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <SubscriptionGuard>
                      <SettingsLayout />
                    </SubscriptionGuard>
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to="/settings/company" replace />} />
                <Route path="company" element={<CompanyConfigPage />} />
                <Route path="general" element={<SettingsGeneralPage />} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/auth/login" replace />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
          </WebSocketProvider>
        </QueryClientProvider>
      </SidebarProvider>
      </PaletteProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
