// Librerías externas
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

// Contextos
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

// Componentes
import { LoginForm, RegisterForm } from '../components/auth';
import EmailConfirmationBanner from '../components/EmailConfirmationBanner';

const LoginPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showConfirmationBanner, setShowConfirmationBanner] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { isAuthenticated, loading, needsConfirmation } = useAuth();
  const { showSuccess, showError } = useToast();

  // Redirigir si ya está autenticado
  if (isAuthenticated && !loading) {
    return <Navigate to="/" replace />;
  }

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verificando sesión...
          </h2>
        </div>
      </div>
    );
  }

  const handleAuthSuccess = user => {
    if (needsConfirmation) {
      setShowConfirmationBanner(true);
      setUserEmail(user?.email || '');
      showSuccess('Registro exitoso. Por favor confirma tu email.');
    } else {
      showSuccess(`¡Bienvenido${user?.email ? ` ${user.email}` : ''}!`);
    }
  };

  const handleRegistrationSuccess = (user, requiresConfirmation = false) => {
    if (requiresConfirmation) {
      setShowConfirmationBanner(true);
      setUserEmail(user?.email || '');
      setIsLoginMode(true); // Cambiar a modo login
    } else {
      handleAuthSuccess(user);
    }
  };

  const handleShowToast = (message, type) => {
    switch (type) {
      case 'SUCCESS':
        showSuccess(message);
        break;
      case 'ERROR':
        showError(message);
        break;
      default:
        showError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 SubvencionesAI
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-gray-600">
            {isLoginMode
              ? 'Accede a tu cuenta para gestionar subvenciones'
              : 'Únete para descubrir oportunidades de financiación'}
          </p>
        </div>

        {/* Email Confirmation Banner */}
        {showConfirmationBanner && userEmail && (
          <EmailConfirmationBanner userEmail={userEmail} />
        )}

        {/* Auth Form */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          {isLoginMode ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onShowToast={handleShowToast}
              onSwitchToRegister={() => {
                setShowConfirmationBanner(false);
                setIsLoginMode(false);
              }}
            />
          ) : (
            <RegisterForm
              onSuccess={handleRegistrationSuccess}
              onShowToast={handleShowToast}
              onSwitchToLogin={() => setIsLoginMode(true)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            {isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              {isLoginMode ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>

        {/* Additional Info */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Al continuar, aceptas nuestros términos de servicio y política de
            privacidad.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
