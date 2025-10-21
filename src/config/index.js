// Configuración principal de la aplicación
import {
  ENVIRONMENTS,
  API_CONFIG,
  SUPABASE_CONFIG,
  N8N_CONFIG,
  UI_CONFIG,
  VALIDATION_CONFIG,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_STATES,
  DEV_CONFIG,
  PROD_CONFIG,
} from './constants.js';

// Configuración por defecto (usando variables de entorno)
// NOTA: Variables sensibles como API keys y credenciales han sido removidas del frontend
// Estas ahora se manejan exclusivamente en el backend por seguridad
const DEFAULT_CONFIG = {
  // Solo URL base para mostrar en UI, las credenciales están en el backend
  N8N_BASE_URL:
    import.meta.env.VITE_N8N_BASE_URL || 'https://n8n.wavext.es:8443/',
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || ENVIRONMENTS.TEST,
  APP_PORT: parseInt(import.meta.env.VITE_APP_PORT) || 8000,
  APP_DEBUG: import.meta.env.VITE_APP_DEBUG === 'true' || true,
};

// Función para cargar configuración desde variables de entorno
export const loadEnvConfig = async () => {
  // Ahora DEFAULT_CONFIG ya usa variables de entorno, así que simplemente lo retornamos
  console.log('Configuración cargada:', {
    supabaseUrl: DEFAULT_CONFIG.SUPABASE_URL,
    environment: DEFAULT_CONFIG.ENVIRONMENT,
  });

  return DEFAULT_CONFIG;
};

// Función para obtener configuración de tablas según el entorno
const getTableConfig = (environment, envConfig) => {
  const baseConfig = {
    url: envConfig.SUPABASE_URL,
    // Las claves sensibles se manejan en el backend
  };

  if (environment === ENVIRONMENTS.TEST) {
    return {
      ...baseConfig,
      tables: {
        grants: SUPABASE_CONFIG.TABLES.GRANTS_TEST,
        users: SUPABASE_CONFIG.TABLES.USERS,
        profiles: SUPABASE_CONFIG.TABLES.PROFILES,
      },
    };
  }

  return {
    ...baseConfig,
    tables: {
      grants: SUPABASE_CONFIG.TABLES.GRANTS,
      users: SUPABASE_CONFIG.TABLES.USERS,
      profiles: SUPABASE_CONFIG.TABLES.PROFILES,
    },
  };
};

// Clase principal de configuración
class AppConfig {
  constructor() {
    this.config = null;
    this.initialized = false;
  }

  async initialize() {
    this.config = await loadEnvConfig();
    this.initialized = true;

    // Aplicar configuración específica del entorno
    if (this.isProductionEnvironment) {
      Object.assign(this.config, PROD_CONFIG);
    } else {
      Object.assign(this.config, DEV_CONFIG);
    }

    console.log('AppConfig inicializada:', {
      environment: this.environment,
      debug: this.config.APP_DEBUG,
    });
  }

  get environment() {
    return this.config?.ENVIRONMENT || ENVIRONMENTS.TEST;
  }

  get isTestEnvironment() {
    return this.environment === ENVIRONMENTS.TEST;
  }

  get isDevelopmentEnvironment() {
    return this.environment === ENVIRONMENTS.DEVELOPMENT;
  }

  get isProductionEnvironment() {
    return this.environment === ENVIRONMENTS.PRODUCTION;
  }

  get supabaseConfig() {
    // Solo configuración no sensible para el frontend
    // La clave anónima se maneja en el backend por seguridad
    return getTableConfig(this.environment, {
      SUPABASE_URL: this.config?.SUPABASE_URL,
      // SUPABASE_ANON_KEY removida del frontend por seguridad
    });
  }

  get n8nConfig() {
    // Solo configuración no sensible para el frontend
    // Las credenciales y endpoints sensibles se manejan en el backend
    return {
      baseUrl: this.config?.N8N_BASE_URL,
      // Todas las operaciones n8n ahora van a través del backend
      ...N8N_CONFIG,
    };
  }

  switchEnvironment(newEnvironment) {
    if (Object.values(ENVIRONMENTS).includes(newEnvironment)) {
      this.config.ENVIRONMENT = newEnvironment;
      console.log(`Entorno cambiado a: ${newEnvironment}`);

      // Recargar configuración específica del entorno
      if (this.isProductionEnvironment) {
        Object.assign(this.config, PROD_CONFIG);
      } else {
        Object.assign(this.config, DEV_CONFIG);
      }
    } else {
      console.error(`Entorno inválido: ${newEnvironment}`);
    }
  }
}

// Instancia singleton
export const appConfig = new AppConfig();

// Exportar todas las constantes
export {
  ENVIRONMENTS,
  API_CONFIG,
  SUPABASE_CONFIG,
  N8N_CONFIG,
  UI_CONFIG,
  VALIDATION_CONFIG,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_STATES,
  DEV_CONFIG,
  PROD_CONFIG,
};

// Exportar configuración por defecto
export { DEFAULT_CONFIG };

// Función de utilidad para verificar si la app está inicializada
export const isAppConfigInitialized = () => appConfig.initialized;

// Función de utilidad para obtener configuración actual
export const getCurrentConfig = () => appConfig.config;

// Función de utilidad para obtener entorno actual
export const getCurrentEnvironment = () => appConfig.environment;
