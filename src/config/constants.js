// Constantes centralizadas de la aplicación

// Entornos disponibles
export const ENVIRONMENTS = {
  DEVELOPMENT: 'DEVELOPMENT',
  TEST: 'TEST',
  PRODUCTION: 'PRODUCTION',
};

// Configuración de API (obtenida desde variables de entorno)
export const API_CONFIG = {
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000, // 30 segundos
  RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
  RETRY_DELAY: parseInt(import.meta.env.VITE_API_RETRY_DELAY) || 1000, // 1 segundo
};

// Configuración de Supabase (obtenida desde variables de entorno)
// NOTA: ANON_KEY removida del frontend por seguridad - se maneja en el backend
export const SUPABASE_CONFIG = {
  URL: import.meta.env.VITE_SUPABASE_URL,
  // ANON_KEY removida del frontend por seguridad
  TABLES: {
    GRANTS:
      import.meta.env.VITE_SUPABASE_TABLE_GRANTS_PRODUCTION ||
      'subvenciones_wavext',
    GRANTS_TEST:
      import.meta.env.VITE_SUPABASE_TABLE_GRANTS_TEST ||
      'subvenciones_wavext_test',
    USERS: import.meta.env.VITE_SUPABASE_TABLE_USERS || 'users',
    PROFILES: import.meta.env.VITE_SUPABASE_TABLE_PROFILES || 'profiles',
  },
  POLICIES: {
    RLS_ENABLED: true,
  },
};

// Configuración del servidor proxy
export const PROXY_CONFIG = {
  PORT: parseInt(import.meta.env.VITE_PROXY_PORT) || 3000,
  BASE_URL: import.meta.env.VITE_PROXY_BASE_URL || 'http://localhost:3000',
  CORS: {
    ORIGINS: [
      import.meta.env.VITE_APP_URL || 'http://localhost:8000',
      'http://localhost:8001', // Puerto alternativo
    ],
  },
};

// Configuración de n8n (obtenida desde variables de entorno)
// NOTA: Credenciales sensibles removidas del frontend por seguridad - se manejan en el backend
export const N8N_CONFIG = {
  BASE_URL: import.meta.env.VITE_N8N_BASE_URL,
  // API_KEY, WEBHOOK_URL y BASIC_AUTH removidos del frontend por seguridad
  ENDPOINTS: {
    WEBHOOK:
      import.meta.env.VITE_N8N_WEBHOOK_ENDPOINT ||
      '/webhook-test/waveresearch-trigger',
    API: import.meta.env.VITE_N8N_API_ENDPOINT || '/api/v1',
  },
  WORKFLOWS: {
    BOE_RESEARCH:
      import.meta.env.VITE_N8N_WORKFLOW_BOE_RESEARCH || 'boe-research-workflow',
    DATA_PROCESSING:
      import.meta.env.VITE_N8N_WORKFLOW_DATA_PROCESSING ||
      'data-processing-workflow',
  },
};

// Configuración de UI (obtenida desde variables de entorno)
export const UI_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE:
      parseInt(import.meta.env.VITE_UI_PAGINATION_DEFAULT_PAGE_SIZE) || 10,
    MAX_PAGE_SIZE:
      parseInt(import.meta.env.VITE_UI_PAGINATION_MAX_PAGE_SIZE) || 100,
  },
  TOAST: {
    DEFAULT_DURATION:
      parseInt(import.meta.env.VITE_UI_TOAST_DEFAULT_DURATION) || 5000,
    ERROR_DURATION:
      parseInt(import.meta.env.VITE_UI_TOAST_ERROR_DURATION) || 8000,
    SUCCESS_DURATION:
      parseInt(import.meta.env.VITE_UI_TOAST_SUCCESS_DURATION) || 3000,
  },
  DEBOUNCE: {
    SEARCH_DELAY:
      parseInt(import.meta.env.VITE_UI_DEBOUNCE_SEARCH_DELAY) || 300,
    INPUT_DELAY: parseInt(import.meta.env.VITE_UI_DEBOUNCE_INPUT_DELAY) || 500,
  },
};

// Configuración de validación (obtenida desde variables de entorno)
export const VALIDATION_CONFIG = {
  PASSWORD: {
    MIN_LENGTH:
      parseInt(import.meta.env.VITE_VALIDATION_PASSWORD_MIN_LENGTH) || 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: false,
  },
  EMAIL: {
    MAX_LENGTH:
      parseInt(import.meta.env.VITE_VALIDATION_EMAIL_MAX_LENGTH) || 254,
  },
  FORMS: {
    MAX_FILE_SIZE:
      parseInt(import.meta.env.VITE_VALIDATION_MAX_FILE_SIZE) ||
      5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['.pdf', '.doc', '.docx', '.txt'],
  },
};

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  RESEARCH: '/research',
  PROFILE: '/profile',
  EMAIL_CONFIRMATION: '/email-confirmation',
};

// Mensajes de error estándar
export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    'Error de conexión. Por favor, verifica tu conexión a internet.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  FORBIDDEN: 'Acceso denegado.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  SERVER_ERROR: 'Error interno del servidor. Por favor, inténtalo más tarde.',
  VALIDATION_ERROR: 'Los datos proporcionados no son válidos.',
  TIMEOUT_ERROR: 'La operación ha tardado demasiado tiempo.',
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
  REGISTER_SUCCESS: 'Registro completado exitosamente',
  UPDATE_SUCCESS: 'Información actualizada correctamente',
  DELETE_SUCCESS: 'Elemento eliminado correctamente',
  SAVE_SUCCESS: 'Cambios guardados correctamente',
};

// Estados de carga
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Configuración de desarrollo (obtenida desde variables de entorno)
export const DEV_CONFIG = {
  ENABLE_LOGS: import.meta.env.VITE_DEV_ENABLE_LOGS === 'true',
  ENABLE_DEBUG_PANEL: import.meta.env.VITE_DEV_ENABLE_DEBUG_PANEL === 'true',
  MOCK_API_DELAY: parseInt(import.meta.env.VITE_DEV_MOCK_API_DELAY) || 0,
};

// Configuración de producción
export const PROD_CONFIG = {
  ENABLE_LOGS: false,
  ENABLE_DEBUG_PANEL: false,
  MOCK_API_DELAY: 0,
};

// URLs de APIs externas (obtenidas desde variables de entorno)
export const EXTERNAL_APIS = {
  BOE:
    import.meta.env.VITE_BOE_API_URL || 'https://www.boe.es/datosabiertos/api',
  EUROPA:
    import.meta.env.VITE_EUROPA_API_URL ||
    'https://ec.europa.eu/info/funding-tenders/opportunities/rest',
  CDTI: import.meta.env.VITE_CDTI_API_URL || 'https://www.cdti.es/api',
};

// Configuración de filtros por defecto (obtenida desde variables de entorno)
export const DEFAULT_FILTERS = {
  AMOUNT: {
    MIN: parseInt(import.meta.env.VITE_DEFAULT_AMOUNT_MIN) || 0,
    MAX: parseInt(import.meta.env.VITE_DEFAULT_AMOUNT_MAX) || 1000000,
  },
  LOCATION: {
    SEARCH_RADIUS_KM:
      parseInt(import.meta.env.VITE_DEFAULT_SEARCH_RADIUS_KM) || 50,
  },
  DATE: {
    RANGE_MONTHS: 12,
  },
};

// Configuración de notificaciones (obtenida desde variables de entorno)
export const NOTIFICATION_CONFIG = {
  ENABLED: import.meta.env.VITE_NOTIFICATIONS_ENABLED === 'true',
  CHECK_INTERVAL:
    parseInt(import.meta.env.VITE_NOTIFICATIONS_CHECK_INTERVAL) ||
    5 * 60 * 1000, // 5 minutos
  TYPES: {
    NEW_GRANTS: 'new_grants',
    DEADLINE_REMINDER: 'deadline_reminder',
    STATUS_UPDATE: 'status_update',
  },
};

// Configuración de IA para evaluación de grants (obtenida desde variables de entorno)
// NOTA: API_KEY removida del frontend por seguridad - se maneja en el backend
export const AI_CONFIG = {
  ENABLED: import.meta.env.VITE_AI_EVALUATION_ENABLED === 'true',
  MODEL: {
    PROVIDER: import.meta.env.VITE_AI_MODEL_PROVIDER || 'openai',
    NAME: import.meta.env.VITE_AI_MODEL_NAME || 'gpt-4',
    // API_KEY removida del frontend por seguridad
  },
  EVALUATION: {
    CONFIDENCE_THRESHOLD: 0.7,
    MAX_TOKENS: 1000,
  },
};
