import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde el archivo .env del directorio backend
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configuración del servidor backend
export const SERVER_CONFIG = {
  PORT: process.env.PROXY_PORT || 3000,
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:8000', 'http://localhost:8001'],
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Configuración de N8N (solo para backend)
export const N8N_BACKEND_CONFIG = {
  BASE_URL: process.env.N8N_BASE_URL || process.env.VITE_N8N_BASE_URL,
  API_KEY: process.env.N8N_API_KEY || process.env.VITE_N8N_API_KEY,
  WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || process.env.VITE_N8N_WEBHOOK_URL,
  BASIC_AUTH: {
    USERNAME: (process.env.N8N_BASIC_AUTH_USERNAME || process.env.VITE_N8N_BASIC_AUTH_USERNAME)?.replace(/"/g, ''),
    PASSWORD: (process.env.N8N_BASIC_AUTH_PASSWORD || process.env.VITE_N8N_BASIC_AUTH_PASSWORD)?.replace(/"/g, ''),
  },
};

// Configuración de Supabase (solo para backend - service role)
export const SUPABASE_BACKEND_CONFIG = {
  URL: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
};

// Configuración de autenticación (backend)
export const AUTH_CONFIG = {
  ENABLED: process.env.AUTH_ENABLED === 'true',
  PROVIDER: process.env.AUTH_PROVIDER || 'supabase',
  REDIRECT_URL: process.env.AUTH_REDIRECT_URL || 'http://localhost:8000/auth/callback',
  SESSION_DURATION: parseInt(process.env.AUTH_SESSION_DURATION) || 86400,
  REMEMBER_ME_DURATION: parseInt(process.env.AUTH_REMEMBER_ME_DURATION) || 2592000,
};

// Configuración de base de datos
export const DATABASE_CONFIG = {
  ENVIRONMENT: process.env.ENVIRONMENT || 'TEST',
  TABLE_NAME: process.env.SUPABASE_TABLE_NAME || 'grants_test',
};

// Configuración de APIs externas
export const EXTERNAL_APIS = {
  BOE_API_URL: process.env.BOE_API_URL || 'https://www.boe.es/datosabiertos/api',
  EUROPA_API_URL: process.env.EUROPA_API_URL || 'https://ec.europa.eu/info/funding-tenders/opportunities/rest',
  CDTI_API_URL: process.env.CDTI_API_URL || 'https://www.cdti.es/api',
};

// Configuración de IA
export const AI_CONFIG = {
  ENABLED: process.env.AI_EVALUATION_ENABLED === 'true',
  PROVIDER: process.env.AI_MODEL_PROVIDER || 'openai',
  MODEL_NAME: process.env.AI_MODEL_NAME || 'gpt-4',
  API_KEY: process.env.AI_API_KEY,
};

console.log('🔧 Configuración del backend cargada:');
console.log('- Puerto del servidor:', SERVER_CONFIG.PORT);
console.log('- N8N Base URL:', N8N_BACKEND_CONFIG.BASE_URL);
console.log('- Tiene N8N API Key:', !!N8N_BACKEND_CONFIG.API_KEY);
console.log('- Tiene credenciales N8N básicas:', !!(N8N_BACKEND_CONFIG.BASIC_AUTH.USERNAME && N8N_BACKEND_CONFIG.BASIC_AUTH.PASSWORD));
console.log('- Supabase URL:', SUPABASE_BACKEND_CONFIG.URL);
console.log('- Entorno:', DATABASE_CONFIG.ENVIRONMENT);