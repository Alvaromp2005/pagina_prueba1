/**
 * Componente reutilizable para inputs de formulario
 * @param {Object} props - Propiedades del componente
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.name - Nombre del campo
 * @param {string} props.type - Tipo de input (text, email, password, etc.)
 * @param {string} props.value - Valor actual del campo
 * @param {Function} props.onChange - Función para manejar cambios
 * @param {Function} props.onBlur - Función para manejar blur
 * @param {string} props.error - Mensaje de error
 * @param {string} props.placeholder - Placeholder del input
 * @param {boolean} props.required - Si el campo es requerido
 * @param {boolean} props.disabled - Si el campo está deshabilitado
 * @param {string} props.className - Clases CSS adicionales
 */
const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
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

  const inputClasses = `
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
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        className={inputClasses}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
