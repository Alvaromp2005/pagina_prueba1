import { useState, useEffect, useCallback, memo } from 'react';

/**
 * Componente para renderizar un campo individual del formulario dinámico
 * Soporta múltiples tipos de input y validaciones
 */
const DynamicFormField = ({
  parameter,
  value,
  onChange,
  onBlur,
  errors = [],
  showErrors = false,
}) => {
  const [localValue, setLocalValue] = useState(
    value || parameter.defaultValue || ''
  );

  // Sincronizar valor local con prop value
  useEffect(() => {
    setLocalValue(value || parameter.defaultValue || '');
  }, [value, parameter.defaultValue]);

  // Manejar cambios en el campo (solo actualizar valor, sin validación)
  const handleChange = useCallback(newValue => {
    setLocalValue(newValue);
  }, []);

  // Manejar cuando el campo pierde el foco (onBlur)
  const handleBlur = useCallback(() => {
    // Notificar el cambio al componente padre para onChange
    onChange(parameter.name, localValue);
    
    // Notificar el blur al componente padre para validación
    if (onBlur) {
      onBlur(parameter.name, localValue);
    }
  }, [parameter.name, onChange, onBlur, localValue]);

  // Validar campo con useCallback
  const validateField = useCallback(
    fieldValue => {
      const errors = [];
      const { validation = {}, required, type } = parameter;

      // Validación de campo requerido
      if (required) {
        // Para campos select, verificar si tiene un valor válido (no vacío y no el placeholder)
        if (type === 'select') {
          if (
            fieldValue === null ||
            fieldValue === undefined ||
            fieldValue === '' ||
            fieldValue === '-- Selecciona una opción --'
          ) {
            errors.push('Debes seleccionar una opción');
            return errors;
          }
        } else if (!fieldValue || fieldValue.toString().trim() === '') {
          errors.push('Este campo es requerido');
          return errors;
        }
      }

      // Si el campo está vacío y no es requerido, no validar más
      if (!fieldValue || fieldValue.toString().trim() === '') {
        return errors;
      }

      // Validaciones por tipo
      switch (type) {
        case 'email':
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(fieldValue)) {
            errors.push(validation?.message || 'Introduce un email válido');
          }
          break;

        case 'tel':
          const phonePattern = /^[\+]?[0-9\s\-\(\)]+$/;
          if (!phonePattern.test(fieldValue)) {
            errors.push(validation?.message || 'Introduce un teléfono válido');
          }
          break;

        case 'url':
          try {
            new URL(fieldValue);
          } catch {
            errors.push(validation?.message || 'Introduce una URL válida');
          }
          break;

        case 'number':
        case 'range':
        case 'percentage':
          const numValue = parseFloat(fieldValue);
          if (isNaN(numValue)) {
            errors.push('Debe ser un número válido');
          } else {
            if (validation?.min !== null && numValue < validation.min) {
              errors.push(`El valor mínimo es ${validation.min}`);
            }
            if (validation?.max !== null && numValue > validation.max) {
              errors.push(`El valor máximo es ${validation.max}`);
            }
          }
          break;
      }

      // Validación de patrón personalizado
      if (validation?.pattern && fieldValue) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(fieldValue)) {
          errors.push(validation?.message || 'Formato inválido');
        }
      }

      // Validación de longitud
      if (validation?.minLength && fieldValue.length < validation.minLength) {
        errors.push(`Mínimo ${validation.minLength} caracteres`);
      }
      if (validation?.maxLength && fieldValue.length > validation.maxLength) {
        errors.push(`Máximo ${validation.maxLength} caracteres`);
      }

      return errors;
    },
    [parameter]
  );

  // Manejar cambios sin validación en tiempo real
  const handleInputChange = useCallback(
    newValue => {
      handleChange(newValue);
    },
    [handleChange]
  );

  // Renderizar campo según el tipo
  const renderField = () => {
    const baseProps = {
      id: parameter.name,
      name: parameter.name,
      value: localValue,
      onChange: e => handleInputChange(e.target.value),
      onBlur: handleBlur,
      placeholder: parameter.placeholder,
      required: parameter.required,
      className: `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        showErrors && errors.length > 0 ? 'border-red-500' : ''
      }`,
    };

    switch (parameter.type) {
      case 'textarea':
        return (
          <textarea
            {...baseProps}
            rows={parameter.ui?.rows || 3}
            maxLength={parameter.validation?.maxLength}
          />
        );

      case 'select':
        return (
          <select {...baseProps}>
            {!parameter.required && (
              <option value="">-- Selecciona una opción --</option>
            )}
            {parameter.options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {parameter.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={parameter.name}
                  value={option.value}
                  checked={localValue === option.value}
                  onChange={e => handleInputChange(e.target.value)}
                  onBlur={handleBlur}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name={parameter.name}
              checked={localValue === true || localValue === 'true'}
              onChange={e => handleInputChange(e.target.checked)}
              onBlur={handleBlur}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span>{parameter.label}</span>
          </label>
        );

      case 'checkboxGroup':
        const selectedValues = Array.isArray(localValue) ? localValue : [];
        return (
          <div className="space-y-2">
            {parameter.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={selectedValues.includes(option.value)}
                  onChange={e => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value);
                    handleInputChange(newValues);
                  }}
                  onBlur={handleBlur}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <input
            type="file"
            id={parameter.name}
            name={parameter.name}
            onChange={e => handleInputChange(e.target.files)}
            onBlur={handleBlur}
            multiple={parameter.validation?.maxFiles > 1}
            accept={parameter.validation?.accept}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              {...baseProps}
              min={parameter.validation?.min || 0}
              max={parameter.validation?.max || 100}
              step={parameter.validation?.step || 1}
              className="w-full"
            />
            <div className="text-sm text-gray-600 text-center">
              Valor: {localValue}
            </div>
          </div>
        );

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              {...baseProps}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={localValue}
              onChange={e => handleChangeAndValidate(e.target.value)}
              placeholder="#000000"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'hidden':
        return <input type="hidden" name={parameter.name} value={localValue} />;

      default:
        // text, email, tel, url, password, number, date, datetime-local, time
        const inputProps = {
          ...baseProps,
          type: parameter.type,
        };

        // Añadir atributos específicos para números
        if (['number', 'range'].includes(parameter.type)) {
          const validation = parameter.validation || {};
          if (validation.min !== null && validation.min !== undefined)
            inputProps.min = validation.min;
          if (validation.max !== null && validation.max !== undefined)
            inputProps.max = validation.max;
          if (validation.step !== null && validation.step !== undefined)
            inputProps.step = validation.step;
        }

        return <input {...inputProps} />;
    }
  };

  // No renderizar campos hidden con label
  if (parameter.type === 'hidden') {
    return renderField();
  }

  return (
    <div
      className={`form-field ${parameter.ui?.width === 'half' ? 'w-1/2' : 'w-full'}`}
    >
      {/* Label */}
      {parameter.type !== 'checkbox' && (
        <label
          htmlFor={parameter.name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {parameter.ui?.icon && (
            <span className="mr-2">{parameter.ui.icon}</span>
          )}
          {parameter.label}
          {parameter.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Campo */}
      {renderField()}

      {/* Texto de ayuda */}
      {parameter.ui?.helpText && (
        <p className="mt-1 text-sm text-gray-500">{parameter.ui.helpText}</p>
      )}

      {/* Errores - solo mostrar si showErrors es true */}
      {showErrors && errors.length > 0 && (
        <div className="mt-1 space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(DynamicFormField);
