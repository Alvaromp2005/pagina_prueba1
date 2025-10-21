/**
 * Componente reutilizable para selects de formulario
 * @param {Object} props - Propiedades del componente
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.name - Nombre del campo
 * @param {string} props.value - Valor actual del campo
 * @param {Function} props.onChange - Función para manejar cambios
 * @param {Function} props.onBlur - Función para manejar blur
 * @param {string} props.error - Mensaje de error
 * @param {Array} props.options - Opciones del select [{value, label}]
 * @param {string} props.placeholder - Placeholder del select
 * @param {boolean} props.required - Si el campo es requerido
 * @param {boolean} props.disabled - Si el campo está deshabilitado
 * @param {string} props.className - Clases CSS adicionales
 */
const FormSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  options = [],
  placeholder = 'Selecciona una opción',
  required = false,
  disabled = false,
  className = '',
}) => {
  const handleChange = e => {
    if (onChange) {
      onChange(name, e.target.value);
    }
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur(name);
    }
  };

  const selectClasses = `
    w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${error ? 'border-red-500' : 'border-gray-300'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        className={selectClasses}
        disabled={disabled}
        required={required}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormSelect;
