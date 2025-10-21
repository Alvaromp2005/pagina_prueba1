import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

/**
 * Modal de Autenticación
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onSuccess - Callback cuando la autenticación es exitosa
 * @param {Function} onShowToast - Función para mostrar notificaciones
 */
const AuthModal = ({ isOpen, onClose, onSuccess, onShowToast }) => {
  const [currentView, setCurrentView] = useState('login'); // 'login' | 'register'

  if (!isOpen) return null;

  const handleSuccess = (user, requiresConfirmation = false) => {
    onSuccess(user, requiresConfirmation);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Contenido del modal */}
        {currentView === 'login' ? (
          <LoginForm
            onSuccess={handleSuccess}
            onShowToast={onShowToast}
            onSwitchToRegister={() => setCurrentView('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onShowToast={onShowToast}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
