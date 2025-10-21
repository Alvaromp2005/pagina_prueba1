/**
 * Componente reutilizable para checkboxes de formulario
 * @param {Object} props - Propiedades del componente
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.name - Nombre del campo
 * @param {boolean} props.checked - Si está marcado
 * @param {Function} props.onChange - Función para manejar cambios
 * @param {Function} props.onBlur - Función para manejar blur
 * @param {string} props.error - Mensaje de error
 * @param {boolean} props.required - Si el campo es requerido
 * @param {boolean} props.disabled - Si el campo está deshabilitado
 * @param {string} props.className - Clases CSS adicionales
 * @param {React.ReactNode} props.children - Contenido personalizado del label
 */
const FormCheckbox = ({
  label,
  name,
  checked,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  children,
}) => {
  const handleChange = e => {
    if (onChange) {
      onChange(name, e.target.checked);
    }
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur(name);
    }
  };

  const checkboxClasses = `
    h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
    ${className}
  `.trim();

  return (
    <div className="mb-4">
      <div className="flex items-start">
        <input
          type="checkbox"
          name={name}
          checked={checked || false}
          onChange={handleChange}
          onBlur={handleBlur}
          className={checkboxClasses}
          disabled={disabled}
          required={required}
        />
        <div className="ml-3">
          {(label || children) && (
            <label
              className={`text-sm text-gray-700 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              {children || label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-1 ml-7">{error}</p>}
    </div>
  );
};

export default FormCheckbox;
