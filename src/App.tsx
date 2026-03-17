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

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <PrivateRoute>
                    <OrdersPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/pos"
                element={
                  <PrivateRoute>
                    <PosPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tables"
                element={
                  <PrivateRoute>
                    <TablesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tables/:tableId"
                element={
                  <PrivateRoute>
                    <TableDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/menu"
                element={
                  <PrivateRoute>
                    <MenuPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <PrivateRoute>
                    <ExpensesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/expenses/:expenseId"
                element={
                  <PrivateRoute>
                    <ExpenseDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <ReportsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <UsersPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users/:userId"
                element={
                  <PrivateRoute>
                    <UserDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <PrivateRoute>
                    <ProductsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/products/:productId"
                element={
                  <PrivateRoute>
                    <ProductDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/menu/items"
                element={
                  <PrivateRoute>
                    <MenuItemsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/menu/items/:menuItemId"
                element={
                  <PrivateRoute>
                    <MenuItemDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/menu/categories"
                element={
                  <PrivateRoute>
                    <MenuCategoriesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/menu/categories/:categoryId"
                element={
                  <PrivateRoute>
                    <MenuCategoryDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <SettingsLayout />
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
