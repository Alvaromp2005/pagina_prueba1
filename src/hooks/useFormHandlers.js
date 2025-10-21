import { useCallback } from 'react';

/**
 * Hook personalizado para manejar formularios
 * Proporciona funciones comunes para el manejo de formularios
 * @param {Object} formData - Datos actuales del formulario
 * @param {Function} setFormData - Función para actualizar los datos del formulario
 * @param {Function} validateField - Función opcional para validar campos
 * @param {Function} clearFieldError - Función opcional para limpiar errores de campo
 */
const useFormHandlers = (
  formData,
  setFormData,
  validateField,
  clearFieldError
) => {
  // Manejador genérico para cambios en inputs
  const handleInputChange = useCallback(
    (name, value) => {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));

      // Limpiar error del campo si existe la función
      if (clearFieldError) {
        clearFieldError(name);
      }
    },
    [setFormData, clearFieldError]
  );

  // Manejador para eventos de cambio estándar
  const handleChange = useCallback(
    e => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === 'checkbox' ? checked : value;
      handleInputChange(name, fieldValue);
    },
    [handleInputChange]
  );

  // Manejador para eventos blur (validación al salir del campo)
  const handleBlur = useCallback(
    name => {
      if (validateField) {
        validateField(name, formData[name]);
      }
    },
    [validateField, formData]
  );

  // Función para resetear el formulario
  const resetForm = useCallback(
    (initialData = {}) => {
      setFormData(initialData);
    },
    [setFormData]
  );

  // Función para actualizar múltiples campos a la vez
  const updateFields = useCallback(
    fields => {
      setFormData(prev => ({
        ...prev,
        ...fields,
      }));
    },
    [setFormData]
  );

  // Función para obtener el valor de un campo específico
  const getFieldValue = useCallback(
    name => {
      return formData[name] || '';
    },
    [formData]
  );

  // Función para verificar si un campo tiene valor
  const hasFieldValue = useCallback(
    name => {
      const value = formData[name];
      return value !== undefined && value !== null && value !== '';
    },
    [formData]
  );

  return {
    handleInputChange,
    handleChange,
    handleBlur,
    resetForm,
    updateFields,
    getFieldValue,
    hasFieldValue,
  };
};

export default useFormHandlers;
