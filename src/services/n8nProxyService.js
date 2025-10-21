import { ErrorHandler, ERROR_TYPES } from '../utils/ErrorHandler.js';
import { PROXY_CONFIG } from '../config/constants.js';

/**
 * Servicio para interactuar con n8n a través del servidor proxy
 * Evita problemas de CORS haciendo peticiones al proxy local
 */
class N8nProxyService {
  constructor() {
    this.proxyBaseUrl = PROXY_CONFIG.BASE_URL;
  }

  /**
   * Obtiene la lista de workflows disponibles
   */
  async getWorkflows() {
    try {
      ErrorHandler.logInfo('Obteniendo workflows a través del proxy...');

      const response = await fetch(`${this.proxyBaseUrl}/api/n8n/workflows`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Error de red' }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        ErrorHandler.logInfo(
          '✅ Workflows obtenidos exitosamente:',
          result.data?.length || 0
        );
        return ErrorHandler.createSuccessResponse(result.data || []);
      } else {
        throw new Error(result.error || 'Error desconocido del proxy');
      }
    } catch (error) {
      ErrorHandler.logError('❌ Error obteniendo workflows:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error obteniendo workflows',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Activa o desactiva un workflow
   */
  async toggleWorkflow(workflowId, active) {
    try {
      ErrorHandler.logInfo(
        `Cambiando estado del workflow ${workflowId} a ${active ? 'activo' : 'inactivo'}...`
      );

      const response = await fetch(
        `${this.proxyBaseUrl}/api/n8n/workflows/${workflowId}/activate`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ active }),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Error de red' }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        ErrorHandler.logInfo(
          `✅ Workflow ${active ? 'activado' : 'desactivado'} exitosamente`
        );
        return ErrorHandler.createSuccessResponse(result.data);
      } else {
        throw new Error(result.error || 'Error desconocido del proxy');
      }
    } catch (error) {
      ErrorHandler.logError('❌ Error cambiando estado del workflow:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error cambiando estado del workflow',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Prueba la conectividad con n8n a través del proxy
   */
  async testConnection() {
    try {
      ErrorHandler.logInfo('Probando conexión con n8n a través del proxy...');

      const response = await fetch(`${this.proxyBaseUrl}/api/n8n/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        ErrorHandler.logInfo('✅ Conexión con proxy exitosa');
        return ErrorHandler.createSuccessResponse({ connected: true });
      } else {
        throw new Error(`Proxy no disponible: ${response.status}`);
      }
    } catch (error) {
      ErrorHandler.logError('❌ Error conectando con proxy:', error);
      return ErrorHandler.createErrorResponse(
        'No se pudo conectar con el proxy de n8n',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Ejecuta un workflow específico por ID
   */
  async executeWorkflow(workflowId, inputData = {}) {
    try {
      ErrorHandler.logInfo(
        `🚀 Ejecutando workflow ${workflowId} a través del proxy...`
      );

      // Formatear los datos según las especificaciones de N8N
      const formattedData = this._formatWorkflowInputData(inputData);
      
      console.log('📤 Datos formateados para envío:', formattedData);

      const response = await fetch(
        `${this.proxyBaseUrl}/api/n8n/workflows/${workflowId}/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Error de red' }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        ErrorHandler.logInfo('✅ Workflow ejecutado exitosamente via proxy');
        return ErrorHandler.createSuccessResponse({
          ...result.data,
          executionId: result.executionId || result.data?.executionId,
          timestamp: result.timestamp || new Date().toISOString()
        });
      } else {
        throw new Error(result.error || 'Error ejecutando workflow');
      }
    } catch (error) {
      ErrorHandler.logError('❌ Error ejecutando workflow via proxy:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error ejecutando workflow',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Formatea los datos de entrada para N8N
   */
  _formatWorkflowInputData(inputData) {
    console.log('🔧 n8nProxyService._formatWorkflowInputData - Datos de entrada:', inputData);
    
    // Si no hay datos de entrada, usar estructura básica
    if (!inputData || Object.keys(inputData).length === 0) {
      const basicData = {
        timestamp: new Date().toISOString(),
        source: 'frontend-hook'
      };
      console.log('📤 n8nProxyService._formatWorkflowInputData - Datos básicos:', basicData);
      return basicData;
    }

    // Si ya viene en formato N8N, devolverlo tal como está
    if (inputData.data && inputData.data.main) {
      console.log('📤 n8nProxyService._formatWorkflowInputData - Formato N8N detectado');
      return inputData;
    }

    // PRESERVAR todos los parámetros del formulario y añadir metadatos del sistema
    const formattedData = {
      // IMPORTANTE: Preservar TODOS los datos del formulario primero
      ...inputData,
      // Añadir metadatos del sistema sin sobrescribir los datos del usuario
      _system: {
        timestamp: new Date().toISOString(),
        source: 'frontend-hook'
      }
    };

    console.log('📤 n8nProxyService._formatWorkflowInputData - Datos formateados finales:', formattedData);
    return formattedData;
  }

  /**
   * Verifica si el servidor proxy está disponible
   */
  async checkProxyHealth() {
    try {
      const response = await fetch(`${this.proxyBaseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Proxy no disponible: ${response.status}`);
      }

      const result = await response.json();
      ErrorHandler.logInfo('✅ Servidor proxy disponible:', result);
      return ErrorHandler.createSuccessResponse(result);
    } catch (error) {
      ErrorHandler.logError('❌ Servidor proxy no disponible:', error);
      return ErrorHandler.createErrorResponse(
        'Servidor proxy no disponible. Asegúrate de ejecutar: npm run proxy',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Obtiene información de configuración del proxy
   */
  getConfigInfo() {
    return {
      proxyUrl: this.proxyBaseUrl,
      proxyAvailable: true, // Se verificará dinámicamente
    };
  }
}

// Instancia global del servicio proxy
export const n8nProxyService = new N8nProxyService();
