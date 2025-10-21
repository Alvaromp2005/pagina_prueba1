import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmEmail } from '../services/emailConfirmationService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const EmailConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { showToast } = useToast();
  const [status, setStatus] = useState('confirming'); // confirming, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmUserEmail = async () => {
      // Obtener el token de confirmación de la URL
      const token = searchParams.get('token') || searchParams.get('token_hash');

      if (!token) {
        setStatus('error');
        setMessage('Token de confirmación no encontrado en la URL.');
        return;
      }

      try {
        const result = await confirmEmail(token);

        if (result.success) {
          setStatus('success');
          setMessage(
            '¡Email confirmado exitosamente! Redirigiendo al dashboard...'
          );

          showToast('Email confirmado exitosamente', 'success');

          // Redirigir al dashboard después de 2 segundos
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(
            result.error ||
              'Error confirmando el email. El enlace puede haber expirado.'
          );
          showToast('Error confirmando email', 'error');
        }
      } catch (error) {
        console.error('Error en confirmación:', error);
        setStatus('error');
        setMessage('Error inesperado confirmando el email.');
        showToast('Error inesperado', 'error');
      }
    };

    confirmUserEmail();
  }, [searchParams, navigate, showToast]);

  const handleReturnToLogin = () => {
    navigate('/login');
  };

  const handleRetryConfirmation = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {status === 'confirming' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Confirmando Email
              </h2>
              <p className="text-gray-600">
                Por favor espera mientras confirmamos tu dirección de email...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Email Confirmado!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="animate-pulse text-blue-600">
                <p>Redirigiendo al dashboard...</p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-red-500 text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Error de Confirmación
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="space-y-3">
                <button
                  onClick={handleRetryConfirmation}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Intentar Nuevamente
                </button>

                <button
                  onClick={handleReturnToLogin}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Volver al Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;
