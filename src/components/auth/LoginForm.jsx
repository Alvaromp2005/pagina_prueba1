import { useState } from 'react';
import { authService } from '../../services/authService.js';
import { TOAST_TYPES } from '../../types/index.js';
import useFormValidation from '../../hooks/useFormValidation.js';
import useFormHandlers from '../../hooks/useFormHandlers.js';
import { FormInput, FormCheckbox } from '../forms/index.js';
import { VALIDATION_RULES } from '../../constants/formConstants.js';

/**
 * Componente de Login
 * @param {Function} onSuccess - Callback cuando el login es exitoso
 * @param {Function} onShowToast - Función para mostrar notificaciones
 * @param {Function} onSwitchToRegister - Callback para cambiar a registro
 */
const LoginForm = ({ onSuccess, onShowToast, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const {
    errors,
    validateField,
    validateForm,
    clearFieldError,
    setServerErrors,
  } = useFormValidation(VALIDATION_RULES.login);

  const { handleInputChange, handleBlur } = useFormHandlers(
    formData,
    setFormData,
    validateField,
    clearFieldError
  );

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.signIn(
        formData.email,
        formData.password,
        formData.rememberMe
      );

      if (result.success) {
        onShowToast(
          `¡Bienvenido ${result.user.full_name || result.user.email}!`,
          TOAST_TYPES.SUCCESS
        );
        onSuccess(result.user);
      } else {
        setServerErrors({ general: result.error });
        onShowToast(result.error, TOAST_TYPES.ERROR);
      }
    } catch (error) {
      const errorMessage = 'Error inesperado al iniciar sesión';
      setServerErrors({ general: errorMessage });
      onShowToast(errorMessage, TOAST_TYPES.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Iniciar Sesión
        </h2>
        <p className="text-gray-600">Accede a tu cuenta de SubvencionesAI</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error general */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={errors.email}
          placeholder="tu@email.com"
          required
          disabled={isLoading}
        />

        <FormInput
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={errors.password}
          placeholder="••••••••"
          required
          disabled={isLoading}
        />

        {/* Recordarme y enlace de contraseña */}
        <div className="flex items-center justify-between">
          <FormCheckbox
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            disabled={isLoading}
            className="mb-0"
          >
            <span className="text-sm text-gray-600">Recordarme</span>
          </FormCheckbox>

          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800"
            disabled={isLoading}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Iniciando sesión...
            </span>
          ) : (
            '🔐 Iniciar Sesión'
          )}
        </button>
      </form>

      {/* Enlace a registro */}
      <div className="text-center mt-6">
        <p className="text-gray-600">
          ¿No tienes cuenta?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-800 font-medium"
            disabled={isLoading}
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
