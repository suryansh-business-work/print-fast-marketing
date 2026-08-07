import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Layout } from './components/Layout';
import { useAuth } from './hooks/useAuth';
import { UserRole } from './types/user.types';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import Vendors from './pages/Vendors/Vendors';
import Reports from './pages/Reports/Reports';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import Campaigns from './pages/Campaigns/Campaigns';
import CampaignDetail from './pages/Campaigns/CampaignDetail';
import Integrations from './pages/Integrations/Integrations';
import Products from './pages/Products/Products';
import Postcards from './pages/Postcards/Postcards';
import Clients from './pages/Clients/Clients';
import ROASDashboard from './pages/ROASDashboard/ROASDashboard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(...roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Protected routes with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={[UserRole.GOD_USER, UserRole.ADMIN_USER]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendors"
            element={
              <ProtectedRoute roles={[UserRole.GOD_USER, UserRole.ADMIN_USER]}>
                <Vendors />
              </ProtectedRoute>
            }
          />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/postcards" element={<Postcards />} />
          <Route path="/clients" element={<Clients />} />
          <Route
            path="/roas-dashboard"
            element={
              <ProtectedRoute roles={[UserRole.VENDOR_USER]}>
                <ROASDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/integrations"
            element={
              <ProtectedRoute roles={[UserRole.GOD_USER, UserRole.ADMIN_USER, UserRole.VENDOR_USER]}>
                <Integrations />
              </ProtectedRoute>
            }
          />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute roles={[UserRole.GOD_USER]}>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
