/**
 * ErrorHandler centralizado para manejo consistente de errores
 * Proporciona un formato estándar para respuestas de servicios
 */

// Tipos de errores
export const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  SERVER: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

// Niveles de logging
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

/**
 * Clase principal para manejo de errores
 */
export class ErrorHandler {
  /**
   * Crea una respuesta de error estandarizada
   * @param {string} message - Mensaje de error
   * @param {string} type - Tipo de error (ERROR_TYPES)
   * @param {*} originalError - Error original (opcional)
   * @param {*} data - Datos adicionales (opcional)
   * @returns {Object} Respuesta estandarizada
   */
  static createErrorResponse(
    message,
    type = ERROR_TYPES.UNKNOWN,
    originalError = null,
    data = null
  ) {
    const errorResponse = {
      success: false,
      error: {
        message,
        type,
        timestamp: new Date().toISOString(),
      },
      data,
    };

    // En desarrollo, incluir stack trace
    if (import.meta.env.DEV && originalError) {
      errorResponse.error.stack = originalError.stack;
      errorResponse.error.originalMessage = originalError.message;
    }

    return errorResponse;
  }

  /**
   * Crea una respuesta de éxito estandarizada
   * @param {*} data - Datos de respuesta
   * @param {string} message - Mensaje opcional
   * @returns {Object} Respuesta estandarizada
   */
  static createSuccessResponse(data, message = null) {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Maneja errores de red/HTTP
   * @param {Error} error - Error de red
   * @returns {Object} Respuesta de error estandarizada
   */
  static handleNetworkError(error) {
    let message = 'Error de conexión';
    let type = ERROR_TYPES.NETWORK;

    if (error.code === 'NETWORK_ERROR') {
      message = 'No se pudo conectar al servidor';
    } else if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          message = 'No autorizado. Por favor, inicia sesión nuevamente';
          type = ERROR_TYPES.AUTHENTICATION;
          break;
        case 403:
          message = 'No tienes permisos para realizar esta acción';
          type = ERROR_TYPES.AUTHORIZATION;
          break;
        case 404:
          message = 'Recurso no encontrado';
          type = ERROR_TYPES.NOT_FOUND;
          break;
        case 500:
          message = 'Error interno del servidor';
          type = ERROR_TYPES.SERVER;
          break;
        default:
          message = `Error del servidor (${status})`;
          type = ERROR_TYPES.SERVER;
      }
    }

    return this.createErrorResponse(message, type, error);
  }

  /**
   * Maneja errores de validación
   * @param {Object} validationErrors - Errores de validación
   * @returns {Object} Respuesta de error estandarizada
   */
  static handleValidationError(validationErrors) {
    return this.createErrorResponse(
      'Errores de validación',
      ERROR_TYPES.VALIDATION,
      null,
      validationErrors
    );
  }

  /**
   * Logger centralizado
   * @param {string} level - Nivel de log
   * @param {string} message - Mensaje
   * @param {*} data - Datos adicionales
   */
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();

    // En producción, solo mostrar errores y warnings
    if (
      import.meta.env.PROD &&
      (level === LOG_LEVELS.DEBUG || level === LOG_LEVELS.INFO)
    ) {
      return;
    }

    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(`[${timestamp}] ERROR:`, message, data);
        break;
      case LOG_LEVELS.WARN:
        console.warn(`[${timestamp}] WARN:`, message, data);
        break;
      case LOG_LEVELS.INFO:
        console.info(`[${timestamp}] INFO:`, message, data);
        break;
      case LOG_LEVELS.DEBUG:
        console.log(`[${timestamp}] DEBUG:`, message, data);
        break;
      default:
        console.log(`[${timestamp}] LOG:`, message, data);
    }
  }

  /**
   * Métodos de conveniencia para logging
   */
  static logError(message, data = null) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }

  static logWarn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  static logInfo(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  static logDebug(message, data = null) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }

  /**
   * Wrapper para funciones async con manejo de errores
   * @param {Function} asyncFn - Función async
   * @param {string} context - Contexto para logging
   * @returns {Function} Función wrapeada
   */
  static wrapAsync(asyncFn, context = 'Unknown') {
    return async (...args) => {
      try {
        const result = await asyncFn(...args);
        return this.createSuccessResponse(result);
      } catch (error) {
        this.logError(`Error en ${context}:`, error);

        if (error.response) {
          return this.handleNetworkError(error);
        }

        return this.createErrorResponse(
          error.message || 'Error desconocido',
          ERROR_TYPES.UNKNOWN,
          error
        );
      }
    };
  }
}

// Export por defecto
export default ErrorHandler;
