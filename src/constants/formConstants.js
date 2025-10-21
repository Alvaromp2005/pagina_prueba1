// Constantes para formularios y validaciones

// Tipos de empresa disponibles
export const COMPANY_TYPES = [
  { value: 'STARTUP', label: 'Startup' },
  { value: 'PYME', label: 'PYME' },
  { value: 'GRANDE', label: 'Gran Empresa' },
  { value: 'AUTONOMO', label: 'Autónomo' },
  { value: 'INVESTIGADOR', label: 'Investigador' },
  { value: 'CONSULTOR', label: 'Consultor' },
];

// Reglas de validación
export const VALIDATION_RULES = {
  email: {
    required: 'El email es requerido',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Email inválido',
  },
  password: {
    required: 'La contraseña es requerida',
    minLength: 6,
    minLengthMessage: 'La contraseña debe tener al menos 6 caracteres',
  },
  confirmPassword: {
    required: 'Confirmar contraseña es requerido',
    matchMessage: 'Las contraseñas no coinciden',
  },
  fullName: {
    required: 'El nombre completo es requerido',
    minLength: 2,
    minLengthMessage: 'El nombre debe tener al menos 2 caracteres',
  },
  acceptTerms: {
    required: 'Debes aceptar los términos y condiciones',
  },
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  UNEXPECTED_ERROR: 'Error inesperado. Inténtalo de nuevo.',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  USER_NOT_FOUND: 'Usuario no encontrado',
  EMAIL_ALREADY_EXISTS: 'El email ya está registrado',
  WEAK_PASSWORD: 'La contraseña es muy débil',
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  REGISTER_SUCCESS: 'Registro exitoso',
  PROFILE_UPDATED: 'Perfil actualizado exitosamente',
  EMAIL_SENT: 'Email enviado exitosamente',
};
