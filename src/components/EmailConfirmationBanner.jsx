import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const EmailConfirmationBanner = ({ userEmail }) => {
  const { resendConfirmation, resendingEmail } = useAuth();
  const { showToast } = useToast();
  const [lastResendTime, setLastResendTime] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const handleResendEmail = async () => {
    // Verificar si ya se envió recientemente (cooldown de 60 segundos)
    const now = Date.now();
    if (lastResendTime && now - lastResendTime < 60000) {
      const remainingTime = Math.ceil((60000 - (now - lastResendTime)) / 1000);
      showToast(
        `Espera ${remainingTime} segundos antes de reenviar`,
        'warning'
      );
      return;
    }

    try {
      const result = await resendConfirmation(userEmail);

      if (result.success) {
        showToast('Email de confirmación reenviado exitosamente', 'success');
        setLastResendTime(now);

        // Iniciar countdown
        let timeLeft = 60;
        setCountdown(timeLeft);

        const timer = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);

          if (timeLeft <= 0) {
            clearInterval(timer);
            setCountdown(0);
          }
        }, 1000);
      } else {
        showToast(result.error || 'Error reenviando email', 'error');
      }
    } catch (error) {
      console.error('Error reenviando email:', error);
      showToast('Error inesperado reenviando email', 'error');
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Confirmación de Email Pendiente
          </h3>

          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Hemos enviado un email de confirmación a{' '}
              <strong>{userEmail}</strong>. Por favor revisa tu bandeja de
              entrada y haz clic en el enlace para activar tu cuenta.
            </p>

            <div className="mt-3 flex items-center space-x-4">
              <button
                onClick={handleResendEmail}
                disabled={resendingEmail || countdown > 0}
                className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                  resendingEmail || countdown > 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
                } transition-colors`}
              >
                {resendingEmail ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enviando...
                  </>
                ) : countdown > 0 ? (
                  `Reenviar en ${countdown}s`
                ) : (
                  '📧 Reenviar Email'
                )}
              </button>

              <span className="text-xs text-yellow-600">
                ¿No encuentras el email? Revisa tu carpeta de spam.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationBanner;
