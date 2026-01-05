import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/presentation/components/ui/toaster';
import { ThemeProvider } from '@/presentation/contexts/theme.context';
import { SidebarProvider } from '@/presentation/contexts/sidebar.context';

// Pages
import LoginPage from '@/presentation/pages/auth/LoginPage';
import DashboardPage from '@/presentation/pages/dashboard/DashboardPage';
import OrdersPage from '@/presentation/pages/orders/OrdersPage';
import TableMapPage from '@/presentation/pages/tables/TableMapPage';
import MenuPage from '@/presentation/pages/menu/MenuPage';
import ExpensesPage from '@/presentation/pages/expenses/ExpensesPage';
import ReportsPage from '@/presentation/pages/reports/ReportsPage';
import UsersPage from '@/presentation/pages/users/UsersPage';
import UserDetailPage from '@/presentation/pages/users/UserDetailPage';
import SettingsPage from '@/presentation/pages/settings/SettingsPage';
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
      <SidebarProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
            {/* Auth routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            
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
              path="/tables"
              element={
                <PrivateRoute>
                  <TableMapPage />
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
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
          </Routes>
            <Toaster />
          </BrowserRouter>
        </QueryClientProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
