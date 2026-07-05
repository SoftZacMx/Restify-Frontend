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
import SignupPage from '@/presentation/pages/auth/SignupPage';
import RecoverPasswordPage from '@/presentation/pages/auth/RecoverPasswordPage';
import ChangePasswordPage from '@/presentation/pages/auth/ChangePasswordPage';
import ReactivateOrganizationPage from '@/presentation/pages/auth/ReactivateOrganizationPage';
import VerifyEmailPage from '@/presentation/pages/auth/VerifyEmailPage';

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
const BranchesPage = lazy(() => import('@/presentation/pages/branches/BranchesPage'));
const ProductsPage = lazy(() => import('@/presentation/pages/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/presentation/pages/products/ProductDetailPage'));
const MenuItemsPage = lazy(() => import('@/presentation/pages/menu-items/MenuItemsPage'));
const MenuItemDetailPage = lazy(() => import('@/presentation/pages/menu-items/MenuItemDetailPage'));
const MenuCategoriesPage = lazy(() => import('@/presentation/pages/menu-categories/MenuCategoriesPage'));
const MenuCategoryDetailPage = lazy(() => import('@/presentation/pages/menu-categories/MenuCategoryDetailPage'));
const SettingsLayout = lazy(() => import('@/presentation/components/layouts/SettingsLayout'));
const SettingsGeneralPage = lazy(() => import('@/presentation/pages/settings/SettingsGeneralPage'));
const CompanyConfigPage = lazy(() => import('@/presentation/pages/settings/company/CompanyConfigPage'));
const PaymentConfigPage = lazy(() => import('@/presentation/pages/settings/payments/PaymentConfigPage'));
const SubscriptionSuccessPage = lazy(() => import('@/presentation/pages/subscription/SubscriptionSuccessPage'));
const SubscriptionCancelPage = lazy(() => import('@/presentation/pages/subscription/SubscriptionCancelPage'));
const PaymentResultPage = lazy(() => import('@/presentation/pages/payment/PaymentResultPage'));
const SelectBranchPage = lazy(() => import('@/presentation/pages/branch-selection/SelectBranchPage'));
const PublicMenuPage = lazy(() => import('@/presentation/pages/public-menu/PublicMenuPage'));
const PublicCheckoutPage = lazy(() => import('@/presentation/pages/public-checkout/PublicCheckoutPage'));
const PublicOrderTrackingPage = lazy(() => import('@/presentation/pages/public-tracking/PublicOrderTrackingPage'));

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
  { path: '/branches', element: <BranchesPage /> },
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
      retry: (failureCount, error: any) => {
        // No reintentar 401 (no auth) ni 403 (subscription expirada / forbidden)
        const status = error?.statusCode ?? error?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 1;
      },
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
                      <Route path="/auth/signup" element={<SignupPage />} />
                      <Route path="/auth/recover-password" element={<RecoverPasswordPage />} />
                      <Route path="/auth/reactivate-organization" element={<ReactivateOrganizationPage />} />

                      {/* Verificación de email: el usuario llega desde el link del correo */}
                      <Route path="/verify-email" element={<VerifyEmailPage />} />

                      {/* Public routes (no auth, no subscription guard) */}
                      <Route path="/menu/:slug" element={<PublicMenuPage />} />
                      <Route path="/menu/:slug/checkout" element={<PublicCheckoutPage />} />
                      <Route path="/public/pedido/:trackingToken" element={<PublicOrderTrackingPage />} />

                      {/* Payment result routes (public - customer redirected from MP after QR scan) */}
                      <Route path="/payment/success" element={<PaymentResultPage />} />
                      <Route path="/payment/failure" element={<PaymentResultPage />} />
                      <Route path="/payment/pending" element={<PaymentResultPage />} />

                      {/* Cambio de contraseña forzado (mustChangePassword): requiere sesión pero
                          NO subscription guard — cambiar la clave no debe depender de la suscripción */}
                      <Route
                        path="/auth/change-password"
                        element={
                          <PrivateRoute>
                            <ChangePasswordPage />
                          </PrivateRoute>
                        }
                      />

                      {/* Selección de sucursal (auth pero sin subscription guard: elegir sucursal
                          no debe depender del estado de la suscripción) */}
                      <Route
                        path="/select-branch"
                        element={
                          <PrivateRoute>
                            <SelectBranchPage />
                          </PrivateRoute>
                        }
                      />

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
                        <Route path="payments" element={<PaymentConfigPage />} />
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
