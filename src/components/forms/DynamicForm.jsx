import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import DynamicFormField from './DynamicFormField';

/**
 * Componente principal para formularios dinámicos
 * Genera formularios basados en metadatos de workflows de n8n
 */
const DynamicForm = memo(({
  parameters = [],
  onSubmit,
  onValidationChange,
  onDataChange,
  submitButtonText = 'Guardar Parámetros',
  loading = false,
  className = '',
  onFormValidated, // Nueva prop para notificar cuando el formulario es válido
}) => {
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [hasBeenValidated, setHasBeenValidated] = useState(false);

  // Inicializar datos del formulario
  useEffect(() => {
    const initialData = {};
    parameters.forEach(param => {
      // Para campos select, usar el defaultValue si existe, sino cadena vacía
      if (param.type === 'select' && param.defaultValue) {
        initialData[param.name] = param.defaultValue;
      } else {
        initialData[param.name] = param.defaultValue || '';
      }
    });
    setFormData(initialData);
  }, [parameters]);

  // Notificar cambios en formData al componente padre
  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData);
    }
  }, [formData, onDataChange]);

  // Función para validar un solo campo
  const validateSingleField = useCallback((param, value) => {
    const errors = [];

    // Validación de campos requeridos
    if (param.required) {
      // Para campos select, verificar si tiene un valor válido (no vacío y no el placeholder)
      if (param.type === 'select') {
        if (
          value === null ||
          value === undefined ||
          value === '' ||
          value === '-- Selecciona una opción --'
        ) {
          errors.push('Debes seleccionar una opción');
        }
      } else if (value === null || value === undefined || value === '') {
        errors.push('Este campo es requerido');
      }
    }

    // Validaciones específicas por tipo
    if (value !== null && value !== undefined && value !== '') {
      switch (param.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push('Formato de email inválido');
          }
          break;
        case 'number':
        case 'range':
        case 'percentage':
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors.push('Debe ser un número válido');
          } else {
            if (param.min !== undefined && numValue < param.min) {
              errors.push(`El valor mínimo es ${param.min}`);
            }
            if (param.max !== undefined && numValue > param.max) {
              errors.push(`El valor máximo es ${param.max}`);
            }
          }
          break;
        case 'url':
          try {
            new URL(value);
          } catch {
            errors.push('Debe ser una URL válida');
          }
          break;
        case 'text':
        case 'textarea':
          if (param.minLength && value.length < param.minLength) {
            errors.push(`Mínimo ${param.minLength} caracteres`);
          }
          if (param.maxLength && value.length > param.maxLength) {
            errors.push(`Máximo ${param.maxLength} caracteres`);
          }
          break;
      }

      // Validaciones personalizadas
      if (param.validation) {
        if (param.validation.pattern) {
          const regex = new RegExp(param.validation.pattern);
          if (!regex.test(value)) {
            errors.push(param.validation.message || 'Formato inválido');
          }
        }
      }
    }

    return errors;
  }, []);

  // Función para validar todos los campos
  const validateAllFields = useCallback(() => {
    const newFieldErrors = {};
    let allValid = true;

    parameters.forEach(param => {
      const value = formData[param.name];
      const errors = validateSingleField(param, value);
      
      if (errors.length > 0) {
        allValid = false;
      }
      
      newFieldErrors[param.name] = errors;
    });

    setFieldErrors(newFieldErrors);
    setIsValid(allValid);
    setHasBeenValidated(true);

    if (onValidationChange) {
      onValidationChange(allValid, newFieldErrors);
    }

    return allValid;
  }, [formData, parameters, onValidationChange, validateSingleField]);

  // Manejar cambios en los campos (sin validación en tiempo real)
  const handleFieldChange = useCallback(
    (fieldName, value) => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: value,
      }));
    },
    []
  );

  // Manejar validación individual de campo al perder el foco
  const handleFieldBlur = useCallback(
    (fieldName, value) => {
      // Actualizar formData
      setFormData(prev => ({
        ...prev,
        [fieldName]: value,
      }));

      // Validar solo este campo
      const param = parameters.find(p => p.name === fieldName);
      if (param) {
        const errors = validateSingleField(param, value);
        
        // Actualizar errores solo para este campo
        setFieldErrors(prev => ({
          ...prev,
          [fieldName]: errors,
        }));
      }
    },
    [parameters, validateSingleField]
  );

  // Manejar envío del formulario (solo guardar, no ejecutar)
  const handleSubmit = e => {
    e.preventDefault();

    // Validar todos los campos antes del envío
    const isFormValid = validateAllFields();

    // Notificar al componente padre sobre el estado de validación
    if (onFormValidated) {
      onFormValidated(isFormValid);
    }

    if (!isFormValid) {
      return;
    }

    // Procesar datos antes del envío
    const processedData = {};
    parameters.forEach(param => {
      let value = formData[param.name];

      // Procesar valores según el tipo
      switch (param.type) {
        case 'number':
        case 'range':
        case 'percentage':
          value = value !== '' ? parseFloat(value) : null;
          break;
        case 'checkbox':
          value = value === true || value === 'true';
          break;
        case 'file':
          // Para archivos, mantener el FileList o convertir a array
          if (value && value.length) {
            value = Array.from(value);
          }
          break;
        default:
          // Para strings, asegurar que no sean null/undefined
          if (value === null || value === undefined) {
            value = '';
          }
      }

      processedData[param.name] = value;
    });

    console.log('📤 DynamicForm - Datos procesados del formulario:', processedData);
    onSubmit(processedData);
  };

  // Agrupar y ordenar parámetros
  const groupedParameters = () => {
    // Agrupar por grupo
    const groups = {};
    parameters.forEach(param => {
      const groupName = param.group || 'default';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(param);
    });

    // Ordenar dentro de cada grupo
    Object.keys(groups).forEach(groupName => {
      groups[groupName].sort((a, b) => {
        const orderA = a.order || 999;
        const orderB = b.order || 999;
        return orderA - orderB;
      });
    });

    return groups;
  };

  const groups = groupedParameters();

  // Renderizar grupo de campos
  const renderGroup = (groupName, groupParams) => {
    const isDefaultGroup = groupName === 'default';

    return (
      <div key={groupName} className="form-group mb-6">
        {!isDefaultGroup && (
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            {groupName}
          </h3>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupParams.map(param => (
            <DynamicFormField
              key={param.name}
              parameter={param}
              value={formData[param.name]}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              errors={fieldErrors[param.name] || []}
              showErrors={hasBeenValidated}
            />
          ))}
        </div>
      </div>
    );
  };

  if (parameters.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No se encontraron parámetros para este formulario.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`dynamic-form space-y-6 ${className}`}
      noValidate
    >
      {/* Renderizar grupos */}
      {Object.entries(groups).map(([groupName, groupParams]) =>
        renderGroup(groupName, groupParams)
      )}

      {/* Botón de envío */}
      <div className="form-actions pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full px-6 py-3 rounded-md font-medium transition-colors duration-200
            ${
              !loading
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>💾</span>
              <span>{submitButtonText}</span>
            </div>
          )}
        </button>

        {/* Resumen de errores - solo mostrar si se ha validado */}
        {hasBeenValidated &&
          Object.keys(fieldErrors).some(key => fieldErrors[key].length > 0) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Errores en el formulario:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.entries(fieldErrors).map(([fieldName, errors]) => {
                  if (errors.length === 0) return null;
                  const param = parameters.find(p => p.name === fieldName);
                  return (
                    <li key={fieldName}>
                      <strong>{param?.label || fieldName}:</strong>{' '}
                      {errors.join(', ')}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
      </div>
    </form>
  );
});

// Agregar displayName para debugging
DynamicForm.displayName = 'DynamicForm';

export { DynamicForm };
export default DynamicForm;
