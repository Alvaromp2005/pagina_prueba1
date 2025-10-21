import { useState, useCallback } from 'react';
import { ERROR_MESSAGES } from '../constants/formConstants';

/**
 * Hook personalizado para manejo de errores
 * Proporciona funciones para capturar, procesar y mostrar errores de manera consistente
 */
const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Procesa diferentes tipos de errores y devuelve un mensaje apropiado
   */
  const processError = useCallback(error => {
    console.error('Error capturado:', error);

    // Error de red
    if (!navigator.onLine) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    // Error de respuesta HTTP
    if (error?.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          return data?.message || 'Datos inválidos';
        case 401:
          return ERROR_MESSAGES.INVALID_CREDENTIALS;
        case 404:
          return ERROR_MESSAGES.USER_NOT_FOUND;
        case 409:
          return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
        case 422:
          return data?.message || 'Datos de entrada inválidos';
        case 429:
          return 'Demasiadas solicitudes. Intenta más tarde.';
        case 500:
          return 'Error del servidor. Intenta más tarde.';
        default:
          return data?.message || ERROR_MESSAGES.UNEXPECTED_ERROR;
      }
    }

    // Error de Supabase
    if (error?.code) {
      switch (error.code) {
        case 'invalid_credentials':
          return ERROR_MESSAGES.INVALID_CREDENTIALS;
        case 'email_already_exists':
        case 'user_already_registered':
          return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
        case 'weak_password':
          return ERROR_MESSAGES.WEAK_PASSWORD;
        case 'email_not_confirmed':
          return 'Por favor confirma tu email antes de iniciar sesión';
        case 'too_many_requests':
          return 'Demasiados intentos. Espera un momento.';
        default:
          return error.message || ERROR_MESSAGES.UNEXPECTED_ERROR;
      }
    }

    // Error de JavaScript estándar
    if (error instanceof Error) {
      return error.message || ERROR_MESSAGES.UNEXPECTED_ERROR;
    }

    // Error como string
    if (typeof error === 'string') {
      return error;
    }

    // Error desconocido
    return ERROR_MESSAGES.UNEXPECTED_ERROR;
  }, []);

  /**
   * Maneja errores de manera segura
   */
  const handleError = useCallback(
    (error, showToast = null) => {
      const errorMessage = processError(error);
      setError(errorMessage);
      setIsLoading(false);

      // Mostrar toast si se proporciona la función
      if (showToast) {
        showToast(errorMessage, 'error');
      }

      return errorMessage;
    },
    [processError]
  );

  /**
   * Ejecuta una función async de manera segura con manejo de errores
   */
  const executeWithErrorHandling = useCallback(
    async (asyncFunction, showToast = null) => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await asyncFunction();
        setIsLoading(false);
        return result;
      } catch (error) {
        const errorMessage = handleError(error, showToast);
        throw new Error(errorMessage);
      }
    },
    [handleError]
  );

  /**
   * Limpia el estado de error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reinicia el estado completo
   */
  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * Valida si hay conexión a internet
   */
  const testConnection = useCallback(() => {
    if (!navigator.onLine) {
      const errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
      setError(errorMessage);
      return false;
    }
    return true;
  }, []);

  return {
    error,
    isLoading,
    handleError,
    executeWithErrorHandling,
    clearError,
    reset,
    testConnection,
    processError,
  };
};

export default useErrorHandler;
