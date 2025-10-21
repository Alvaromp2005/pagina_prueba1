/**
 * Tipos y interfaces para la aplicación SubvencionesAI
 * Usando JSDoc para documentación de tipos en JavaScript
 */

/**
 * @typedef {Object} Grant
 * @property {string} id - ID único de la subvención
 * @property {string} title - Título de la subvención
 * @property {string} description - Descripción detallada
 * @property {string} source - Fuente (BOE, EUROPA, CDTI, REGIONAL)
 * @property {string} source_url - URL de la fuente original
 * @property {string} source_id - ID en la fuente original
 * @property {number} amount_min - Cantidad mínima
 * @property {number} amount_max - Cantidad máxima
 * @property {string} currency - Moneda (EUR por defecto)
 * @property {string} publication_date - Fecha de publicación
 * @property {string} deadline_date - Fecha límite
 * @property {string} start_date - Fecha de inicio
 * @property {string} end_date - Fecha de fin
 * @property {string} sector - Sector objetivo
 * @property {string} category - Categoría
 * @property {string} subcategory - Subcategoría
 * @property {string} geographic_scope - Ámbito geográfico
 * @property {string[]} regions - Regiones aplicables
 * @property {string[]} provinces - Provincias aplicables
 * @property {string[]} municipalities - Municipios aplicables
 * @property {string} target_company_size - Tamaño de empresa objetivo
 * @property {string[]} target_sectors - Sectores objetivo
 * @property {string} requirements - Requisitos
 * @property {string} exclusions - Exclusiones
 * @property {number} relevance_score - Puntuación de relevancia (0-10)
 * @property {number} urgency_score - Puntuación de urgencia (0-10)
 * @property {number} feasibility_score - Puntuación de factibilidad (0-10)
 * @property {number} overall_score - Puntuación general (0-10)
 * @property {string[]} keywords - Palabras clave
 * @property {string} language - Idioma
 * @property {string} status - Estado (ACTIVE, EXPIRED, DRAFT, CANCELLED)
 * @property {string} created_at - Fecha de creación
 * @property {string} updated_at - Fecha de actualización
 */

/**
 * @typedef {Object} ResearchProject
 * @property {string} id - ID único del proyecto
 * @property {string} name - Nombre del proyecto
 * @property {string} description - Descripción del proyecto
 * @property {string} status - Estado (DRAFT, ACTIVE, COMPLETED, CANCELLED)
 * @property {string[]} search_terms - Términos de búsqueda
 * @property {string[]} target_sectors - Sectores objetivo
 * @property {string} geographic_scope - Ámbito geográfico
 * @property {number} amount_range_min - Rango mínimo de cantidad
 * @property {number} amount_range_max - Rango máximo de cantidad
 * @property {string} deadline_from - Fecha límite desde
 * @property {string} deadline_to - Fecha límite hasta
 * @property {string} n8n_workflow_id - ID del workflow de n8n
 * @property {Object} workflow_config - Configuración del workflow
 * @property {number} total_grants_found - Total de subvenciones encontradas
 * @property {string} last_execution_at - Última ejecución
 * @property {string} next_execution_at - Próxima ejecución
 * @property {string} execution_frequency - Frecuencia de ejecución
 * @property {string} created_by - Creado por
 * @property {string} created_at - Fecha de creación
 * @property {string} updated_at - Fecha de actualización
 */

/**
 * @typedef {Object} ResearchExecution
 * @property {string} id - ID único de la ejecución
 * @property {string} research_project_id - ID del proyecto de investigación
 * @property {string} status - Estado (PENDING, RUNNING, COMPLETED, FAILED)
 * @property {string} started_at - Fecha de inicio
 * @property {string} completed_at - Fecha de finalización
 * @property {number} grants_found - Subvenciones encontradas
 * @property {number} new_grants - Nuevas subvenciones
 * @property {number} updated_grants - Subvenciones actualizadas
 * @property {string} execution_log - Log de ejecución
 * @property {string} error_message - Mensaje de error
 * @property {Object} config_snapshot - Snapshot de configuración
 */

/**
 * @typedef {Object} User
 * @property {string} id - ID único del usuario
 * @property {string} email - Email del usuario
 * @property {string} name - Nombre del usuario
 * @property {string} role - Rol (ADMIN, USER, VIEWER)
 * @property {Object} preferences - Preferencias del usuario
 * @property {string} created_at - Fecha de creación
 * @property {string} updated_at - Fecha de actualización
 * @property {string} last_login_at - Último login
 */

/**
 * @typedef {Object} SearchFilters
 * @property {string[]} sectors - Sectores a filtrar
 * @property {string[]} sources - Fuentes a filtrar
 * @property {string[]} locations - Ubicaciones a filtrar
 * @property {Object} amount_range - Rango de cantidades
 * @property {number} amount_range.min - Cantidad mínima
 * @property {number} amount_range.max - Cantidad máxima
 * @property {string[]} urgency_levels - Niveles de urgencia
 * @property {string} status - Estado a filtrar
 */

/**
 * @typedef {Object} N8nWorkflowConfig
 * @property {string} baseUrl - URL base de n8n
 * @property {string} webhookUrl - URL del webhook
 * @property {string} apiKey - API Key de n8n
 */

/**
 * @typedef {Object} SupabaseConfig
 * @property {string} url - URL de Supabase
 * @property {string} anonKey - Clave anónima de Supabase
 * @property {Object} tables - Configuración de tablas
 * @property {string} tables.grants - Tabla de subvenciones
 * @property {string} tables.researchProjects - Tabla de proyectos de investigación
 * @property {string} tables.researchExecutions - Tabla de ejecuciones
 * @property {string} tables.users - Tabla de usuarios
 */

/**
 * @typedef {Object} AppEnvironment
 * @property {string} ENVIRONMENT - Entorno actual (TEST/PRODUCTION)
 * @property {string} N8N_BASE_URL - URL base de n8n
 * @property {string} N8N_WEBHOOK_URL - URL del webhook de n8n
 * @property {string} N8N_API_KEY - API Key de n8n
 * @property {string} SUPABASE_URL - URL de Supabase
 * @property {string} SUPABASE_ANON_KEY - Clave anónima de Supabase
 * @property {string} SUPABASE_TABLE_NAME - Nombre de tabla actual
 * @property {number} APP_PORT - Puerto de la aplicación
 * @property {boolean} APP_DEBUG - Modo debug
 */

/**
 * @typedef {Object} ToastNotification
 * @property {string} message - Mensaje de la notificación
 * @property {string} type - Tipo (success, error, warning, info)
 * @property {number} duration - Duración en milisegundos
 * @property {boolean} autoClose - Si se cierra automáticamente
 */

/**
 * @typedef {Object} ResearchConfig
 * @property {string} name - Nombre de la investigación
 * @property {string} description - Descripción
 * @property {string[]} searchTerms - Términos de búsqueda
 * @property {string[]} targetSectors - Sectores objetivo
 * @property {string} geographicScope - Ámbito geográfico
 * @property {Object} amountRange - Rango de cantidades
 * @property {number} amountRange.min - Cantidad mínima
 * @property {number} amountRange.max - Cantidad máxima
 * @property {Object} deadlineRange - Rango de fechas límite
 * @property {string} deadlineRange.from - Fecha desde
 * @property {string} deadlineRange.to - Fecha hasta
 * @property {string[]} sources - Fuentes a buscar
 * @property {string} executionFrequency - Frecuencia de ejecución
 */

/**
 * @typedef {Object} WorkflowExecution
 * @property {string} id - ID de la ejecución
 * @property {string} workflowId - ID del workflow
 * @property {string} status - Estado de la ejecución
 * @property {string} startedAt - Fecha de inicio
 * @property {string} finishedAt - Fecha de finalización
 * @property {Object} data - Datos de la ejecución
 * @property {string} error - Error si existe
 */

/**
 * @typedef {Object} IntelligentFilterSuggestion
 * @property {string} type - Tipo de sugerencia
 * @property {string} value - Valor sugerido
 * @property {number} confidence - Nivel de confianza
 * @property {string} reason - Razón de la sugerencia
 */

/**
 * @typedef {Object} SearchInsight
 * @property {string} query - Consulta analizada
 * @property {string[]} extractedTerms - Términos extraídos
 * @property {string[]} suggestedSectors - Sectores sugeridos
 * @property {string[]} suggestedLocations - Ubicaciones sugeridas
 * @property {Object} suggestedAmountRange - Rango de cantidades sugerido
 * @property {number} confidence - Nivel de confianza general
 */

// Constantes de la aplicación
window.ENVIRONMENTS = {
  TEST: 'TEST',
  PRODUCTION: 'PRODUCTION',
};

window.EXECUTION_STATUS = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

window.USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  VIEWER: 'VIEWER',
};

// Para compatibilidad con imports ES6
// Las constantes están disponibles globalmente en window

// Definir constantes globalmente para compatibilidad con navegador
export const TOAST_TYPES = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  WARNING: 'WARNING',
  INFO: 'INFO',
};

export const GRANT_SOURCES = {
  BOE: 'BOE',
  EUROPA: 'EUROPA',
  CDTI: 'CDTI',
  REGIONAL: 'REGIONAL',
  MUNICIPAL: 'MUNICIPAL',
  PRIVADO: 'PRIVADO',
};

export const GRANT_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  DRAFT: 'DRAFT',
  CANCELLED: 'CANCELLED',
};

export const RESEARCH_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const NOTIFICATION_TYPES = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
  WEBHOOK: 'WEBHOOK',
};

export const NOTIFICATION_FREQUENCIES = {
  IMMEDIATE: 'IMMEDIATE',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
};

export const EXECUTION_FREQUENCIES = {
  MANUAL: 'MANUAL',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
};

export const GEOGRAPHIC_SCOPES = {
  LOCAL: 'LOCAL',
  PROVINCIAL: 'PROVINCIAL',
  REGIONAL: 'REGIONAL',
  NACIONAL: 'NACIONAL',
  EUROPEO: 'EUROPEO',
  INTERNACIONAL: 'INTERNACIONAL',
};

export const COMPANY_SIZES = {
  MICRO: 'MICRO',
  PEQUEÑA: 'PEQUEÑA',
  MEDIANA: 'MEDIANA',
  GRANDE: 'GRANDE',
  TODAS: 'TODAS',
};
