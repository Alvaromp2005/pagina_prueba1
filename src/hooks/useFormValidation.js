import { useState, useCallback } from 'react';
import { VALIDATION_RULES } from '../constants/formConstants.js';

/**
 * Hook personalizado para manejo de validación de formularios
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Object} validationSchema - Esquema de validación personalizado
 * @returns {Object} - Objeto con valores, errores y funciones de manejo
 */
const useFormValidation = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Función para validar un campo específico
  const validateField = useCallback(
    (fieldName, value, allValues = values) => {
      const fieldRules =
        validationSchema[fieldName] || VALIDATION_RULES[fieldName];
      if (!fieldRules) return null;

      // Validación requerida
      if (fieldRules.required && (!value || value.toString().trim() === '')) {
        return typeof fieldRules.required === 'string'
          ? fieldRules.required
          : `${fieldName} es requerido`;
      }

      // Validación de longitud mínima
      if (
        fieldRules.minLength &&
        value &&
        value.length < fieldRules.minLength
      ) {
        return (
          fieldRules.minLengthMessage ||
          `Debe tener al menos ${fieldRules.minLength} caracteres`
        );
      }

      // Validación de patrón (regex)
      if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
        return fieldRules.patternMessage || 'Formato inválido';
      }

      // Validación personalizada
      if (fieldRules.validate && typeof fieldRules.validate === 'function') {
        return fieldRules.validate(value, allValues);
      }

      // Validación especial para confirmación de contraseña
      if (fieldName === 'confirmPassword' && value !== allValues.password) {
        return fieldRules.matchMessage || 'Las contraseñas no coinciden';
      }

      // Validación para checkbox de términos
      if (fieldName === 'acceptTerms' && !value) {
        return fieldRules.required;
      }

      return null;
    },
    [validationSchema, values]
  );

  // Función para validar todo el formulario
  const validateForm = useCallback(
    (valuesToValidate = values) => {
      const newErrors = {};
      let isValid = true;

      // Validar todos los campos definidos en el esquema
      const fieldsToValidate =
        Object.keys(validationSchema).length > 0
          ? Object.keys(validationSchema)
          : Object.keys(valuesToValidate);

      fieldsToValidate.forEach(fieldName => {
        const error = validateField(
          fieldName,
          valuesToValidate[fieldName],
          valuesToValidate
        );
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [validateField, validationSchema, values]
  );

  // Función para manejar cambios en los campos
  const handleChange = useCallback(
    (fieldName, value) => {
      setValues(prev => ({ ...prev, [fieldName]: value }));

      // Limpiar error del campo cuando el usuario empiece a escribir
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: null }));
      }

      // Marcar el campo como tocado
      setTouched(prev => ({ ...prev, [fieldName]: true }));
    },
    [errors]
  );

  // Función para manejar blur (cuando el usuario sale del campo)
  const handleBlur = useCallback(
    fieldName => {
      setTouched(prev => ({ ...prev, [fieldName]: true }));

      // Validar el campo al salir de él
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      }
    },
    [validateField, values]
  );

  // Función para resetear el formulario
  const resetForm = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
    },
    [initialValues]
  );

  // Función para establecer errores externos (del servidor)
  const setServerErrors = useCallback(serverErrors => {
    setErrors(prev => ({ ...prev, ...serverErrors }));
  }, []);

  // Función para verificar si un campo tiene error y ha sido tocado
  const getFieldError = useCallback(
    fieldName => {
      return touched[fieldName] && errors[fieldName] ? errors[fieldName] : null;
    },
    [touched, errors]
  );

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    validateField,
    resetForm,
    setServerErrors,
    getFieldError,
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0,
  };
};

export default useFormValidation;
