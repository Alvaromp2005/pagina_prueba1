import { useState } from 'react';
import { authService } from '../../services/authService.js';
import { TOAST_TYPES } from '../../types/index.js';
import useFormValidation from '../../hooks/useFormValidation.js';
import useFormHandlers from '../../hooks/useFormHandlers.js';
import { FormInput, FormSelect, FormCheckbox } from '../forms/index.js';
import {
  VALIDATION_RULES,
  COMPANY_TYPES,
} from '../../constants/formConstants.js';

/**
 * Componente de Registro
 * @param {Function} onSuccess - Callback cuando el registro es exitoso
 * @param {Function} onShowToast - Función para mostrar notificaciones
 * @param {Function} onSwitchToLogin - Callback para cambiar a login
 */
const RegisterForm = ({ onSuccess, onShowToast, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    companyType: 'PYME',
    sector: '',
    acceptTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const {
    errors,
    validateField,
    validateForm,
    clearFieldError,
    setServerErrors,
  } = useFormValidation(VALIDATION_RULES.register);

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
      const result = await authService.signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        companyName: formData.companyName,
        companyType: formData.companyType,
        sector: formData.sector,
      });

      if (result.success) {
        if (result.requiresConfirmation) {
          onShowToast(result.message, TOAST_TYPES.INFO);
          onSuccess(result.user, true);
        } else {
          onShowToast(
            `¡Bienvenido ${result.user.full_name}!`,
            TOAST_TYPES.SUCCESS
          );
          onSuccess(result.user, false);
        }
      } else {
        setServerErrors({ general: result.error });
        onShowToast(result.error, TOAST_TYPES.ERROR);
      }
    } catch (error) {
      const errorMessage = 'Error inesperado al registrarse';
      setServerErrors({ general: errorMessage });
      onShowToast(errorMessage, TOAST_TYPES.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
        <p className="text-gray-600">Únete a SubvencionesAI</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error general */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        <FormInput
          label="Nombre Completo"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={errors.fullName}
          placeholder="Juan Pérez"
          required
          disabled={isLoading}
        />

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

        <FormInput
          label="Confirmar Contraseña"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={errors.confirmPassword}
          placeholder="••••••••"
          required
          disabled={isLoading}
        />

        <FormInput
          label="Nombre de Empresa"
          name="companyName"
          type="text"
          value={formData.companyName}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={errors.companyName}
          placeholder="Mi Empresa S.L."
          disabled={isLoading}
        />

        <FormSelect
          label="Tipo de Empresa"
          name="companyType"
          value={formData.companyType}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={errors.companyType}
          options={COMPANY_TYPES}
          disabled={isLoading}
        />

        <FormInput
          label="Sector"
          name="sector"
          type="text"
          value={formData.sector}
          onChange={handleInputChange}
          onBlur={handleBlur}
          error={errors.sector}
          placeholder="Tecnología, Salud, Educación..."
          disabled={isLoading}
        />

        <FormCheckbox
          name="acceptTerms"
          checked={formData.acceptTerms}
          onChange={handleInputChange}
          error={errors.acceptTerms}
          required
          disabled={isLoading}
        >
          <span className="text-sm text-gray-600">
            Acepto los{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              términos y condiciones
            </a>{' '}
            y la{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              política de privacidad
            </a>
          </span>
        </FormCheckbox>

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
              Creando cuenta...
            </span>
          ) : (
            '🚀 Crear Cuenta'
          )}
        </button>
      </form>

      {/* Enlace a login */}
      <div className="text-center mt-6">
        <p className="text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 font-medium"
            disabled={isLoading}
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
