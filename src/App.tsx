import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/presentation/components/ui/toaster';
import { ThemeProvider } from '@/presentation/contexts/theme.context';
import { PaletteProvider } from '@/presentation/contexts/palette.context';
import { SidebarProvider } from '@/presentation/contexts/sidebar.context';
import { WebSocketProvider } from '@/presentation/contexts/websocket.context';
import { ErrorBoundary } from '@/presentation/components/ErrorBoundary';
import { PrivateRoute } from '@/presentation/components/PrivateRoute';
import { SubscriptionGuard } from '@/presentation/components/subscription/SubscriptionGuard';
import { PageLoader } from '@/presentation/components/ui/PageLoader';

// Auth pages (estáticas - son el entry point)
import LoginPage from '@/presentation/pages/auth/LoginPage';
import RecoverPasswordPage from '@/presentation/pages/auth/RecoverPasswordPage';

// Lazy-loaded pages
const DashboardPage = lazy(() => import('@/presentation/pages/dashboard/DashboardPage'));
const OrdersPage = lazy(() => import('@/presentation/pages/orders/OrdersPage'));
const PosPage = lazy(() => import('@/presentation/pages/pos/PosPage'));
const TablesPage = lazy(() => import('@/presentation/pages/tables/TablesPage'));
const TableDetailPage = lazy(() => import('@/presentation/pages/tables/TableDetailPage'));
const MenuPage = lazy(() => import('@/presentation/pages/menu/MenuPage'));
const ExpensesPage = lazy(() => import('@/presentation/pages/expenses/ExpensesPage'));
const ExpenseDetailPage = lazy(() => import('@/presentation/pages/expenses/ExpenseDetailPage'));
const ReportsPage = lazy(() => import('@/presentation/pages/reports/ReportsPage'));
const UsersPage = lazy(() => import('@/presentation/pages/users/UsersPage'));
const UserDetailPage = lazy(() => import('@/presentation/pages/users/UserDetailPage'));
const ProductsPage = lazy(() => import('@/presentation/pages/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/presentation/pages/products/ProductDetailPage'));
const MenuItemsPage = lazy(() => import('@/presentation/pages/menu-items/MenuItemsPage'));
const MenuItemDetailPage = lazy(() => import('@/presentation/pages/menu-items/MenuItemDetailPage'));
const MenuCategoriesPage = lazy(() => import('@/presentation/pages/menu-categories/MenuCategoriesPage'));
const MenuCategoryDetailPage = lazy(() => import('@/presentation/pages/menu-categories/MenuCategoryDetailPage'));
const SettingsLayout = lazy(() => import('@/presentation/components/layouts/SettingsLayout'));
const SettingsGeneralPage = lazy(() => import('@/presentation/pages/settings/SettingsGeneralPage'));
const CompanyConfigPage = lazy(() => import('@/presentation/pages/settings/company/CompanyConfigPage'));
const SubscriptionSuccessPage = lazy(() => import('@/presentation/pages/subscription/SubscriptionSuccessPage'));
const SubscriptionCancelPage = lazy(() => import('@/presentation/pages/subscription/SubscriptionCancelPage'));
const PaymentResultPage = lazy(() => import('@/presentation/pages/payment/PaymentResultPage'));

// Protected routes config (PrivateRoute + SubscriptionGuard)
const protectedRoutes: { path: string; element: React.ReactNode }[] = [
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/orders', element: <OrdersPage /> },
  { path: '/pos', element: <PosPage /> },
  { path: '/tables', element: <TablesPage /> },
  { path: '/tables/:tableId', element: <TableDetailPage /> },
  { path: '/menu', element: <MenuPage /> },
  { path: '/expenses', element: <ExpensesPage /> },
  { path: '/expenses/:expenseId', element: <ExpenseDetailPage /> },
  { path: '/reports', element: <ReportsPage /> },
  { path: '/users', element: <UsersPage /> },
  { path: '/users/:userId', element: <UserDetailPage /> },
  { path: '/products', element: <ProductsPage /> },
  { path: '/products/:productId', element: <ProductDetailPage /> },
  { path: '/menu/items', element: <MenuItemsPage /> },
  { path: '/menu/items/:menuItemId', element: <MenuItemDetailPage /> },
  { path: '/menu/categories', element: <MenuCategoriesPage /> },
  { path: '/menu/categories/:categoryId', element: <MenuCategoryDetailPage /> },
];

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
                  <Suspense fallback={<PageLoader />}>
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
                      {protectedRoutes.map(({ path, element }) => (
                        <Route
                          key={path}
                          path={path}
                          element={
                            <PrivateRoute>
                              <SubscriptionGuard>
                                {element}
                              </SubscriptionGuard>
                            </PrivateRoute>
                          }
                        />
                      ))}
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
                  </Suspense>
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
