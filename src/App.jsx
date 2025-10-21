// Librerías externas
import { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// Contextos
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import DataProvider from './contexts/DataContextProvider.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';

// Páginas
import DashboardPage from './pages/DashboardPage.jsx';
import { ResearchPage } from './pages/ResearchPage.jsx';
import WorkflowsPage from './pages/WorkflowsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import EmailConfirmationPage from './pages/EmailConfirmationPage.jsx';

// Componentes
import Navigation from './components/Navigation.jsx';
import SidebarNavigation from './components/SidebarNavigation.jsx';
import {
  GrantsComingSoon,
  EvaluationsComingSoon,
  NotificationsComingSoon,
  SettingsComingSoon,
} from './components/ComingSoonPage.jsx';
import DebugTestPanel from './components/SupabaseTest.jsx';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verificando autenticación...
          </h2>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Layout principal de la aplicación
const AppLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      <Navigation />
      <div className="app-content">
        {isAuthenticated && (
          <SidebarNavigation
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}
        <main
          className={`main-content ${isAuthenticated ? (sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded') : 'no-sidebar'}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

// Componente principal de la aplicación
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <DebugTestPanel />
            <AppLayout>
              <Routes>
                {/* Rutas públicas */}
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/confirm-email"
                  element={<EmailConfirmationPage />}
                />

                {/* Ruta por defecto */}
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />

                {/* Rutas principales */}
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Rutas protegidas */}
                <Route
                  path="/research"
                  element={
                    <ProtectedRoute>
                      <ResearchPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/workflows"
                  element={
                    <ProtectedRoute>
                      <WorkflowsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsComingSoon />
                    </ProtectedRoute>
                  }
                />

                {/* Rutas de páginas en desarrollo */}
                <Route path="/grants" element={<GrantsComingSoon />} />
                <Route
                  path="/evaluations"
                  element={<EvaluationsComingSoon />}
                />
                <Route
                  path="/notifications"
                  element={<NotificationsComingSoon />}
                />

                {/* Ruta 404 - redirigir al dashboard */}
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </AppLayout>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
