import { appConfig } from '../config/index.js';
import { ErrorHandler, ERROR_TYPES } from '../utils/ErrorHandler.js';
import { PROXY_CONFIG } from '../config/constants.js';

/**
 * Servicio para interactuar con n8n a través del backend
 * NOTA: Todas las operaciones ahora van a través del backend por seguridad
 * Las credenciales sensibles se manejan exclusivamente en el backend
 */
class N8nService {
  constructor() {
    this.config = null;
    this.backendUrl = PROXY_CONFIG.BASE_URL; // URL del backend
  }

  /**
   * Inicializa el servicio con la configuración actual
   */
  initialize() {
    if (!appConfig.initialized) {
      throw new Error(
        'AppConfig debe ser inicializado antes de usar N8nService'
      );
    }
    this.config = appConfig.n8nConfig;
  }

  /**
   * Ejecuta un workflow mediante webhook a través del backend
   */
  async executeWorkflowByWebhook(searchParams) {
    if (!this.config) {
      this.initialize();
    }

    try {
      // Ahora enviamos la petición al backend en lugar de directamente a n8n
      const response = await fetch(`${this.backendUrl}/api/n8n/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerms: searchParams.terms || [],
          dateRange: searchParams.dateRange || {},
          categories: searchParams.categories || [],
          minAmount: searchParams.minAmount || 0,
          maxAmount: searchParams.maxAmount || 1000000,
          sources: searchParams.sources || ['BOE', 'EUROPA', 'CDTI'],
          geographic_scope: searchParams.geographic_scope || 'NACIONAL',
          environment: appConfig.environment,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      ErrorHandler.logInfo('Workflow ejecutado exitosamente:', result);
      return ErrorHandler.createSuccessResponse(result);
    } catch (error) {
      ErrorHandler.logError('Error ejecutando workflow:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error ejecutando workflow',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Obtiene la lista de workflows disponibles a través del backend
   */
  async getWorkflows() {
    if (!this.config) {
      this.initialize();
    }

    try {
      const response = await fetch(`${this.backendUrl}/api/n8n/workflows`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`
        );
      }

      const workflows = await response.json();
      ErrorHandler.logInfo('Workflows obtenidos:', workflows.data?.length || 0);
      return ErrorHandler.createSuccessResponse(workflows.data || []);
    } catch (error) {
      ErrorHandler.logError('Error obteniendo workflows:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error obteniendo workflows',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Obtiene el estado de un workflow específico a través del backend
   */
  async getWorkflowStatus(workflowId) {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/n8n/workflows/${workflowId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const workflow = await response.json();
      return ErrorHandler.createSuccessResponse(workflow);
    } catch (error) {
      ErrorHandler.logError('Error obteniendo estado del workflow:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error obteniendo estado del workflow',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Obtiene las ejecuciones de un workflow a través del backend
   */
  async getWorkflowExecutions(workflowId, limit = 10) {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/n8n/workflows/${workflowId}/executions?limit=${limit}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const executions = await response.json();
      return ErrorHandler.createSuccessResponse(executions.data || []);
    } catch (error) {
      ErrorHandler.logError('Error obteniendo ejecuciones:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error obteniendo ejecuciones del workflow',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Activa/desactiva un workflow a través del backend
   */
  async toggleWorkflow(workflowId, active) {
    try {
      const response = await fetch(
        `${this.backendUrl}/api/n8n/workflows/${workflowId}/toggle`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ active }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return ErrorHandler.createSuccessResponse(result);
    } catch (error) {
      ErrorHandler.logError('Error cambiando estado del workflow:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error cambiando estado del workflow',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Ejecuta un workflow específico a través del backend
   */
  async executeWorkflow(workflowId, inputData = {}) {
    try {
      const formattedData = this._formatWorkflowInputData(inputData);
      
      const response = await fetch(
        `${this.backendUrl}/api/n8n/workflows/${workflowId}/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const execution = await response.json();
      return ErrorHandler.createSuccessResponse(execution);
    } catch (error) {
      ErrorHandler.logError('Error ejecutando workflow:', error);
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
    console.log('🔧 n8nService._formatWorkflowInputData - Datos de entrada:', inputData);
    
    // Si no hay datos de entrada, usar estructura básica
    if (!inputData || Object.keys(inputData).length === 0) {
      const basicData = {
        timestamp: new Date().toISOString(),
        source: 'frontend-hook',
        environment: this.environment
      };
      console.log('📤 n8nService._formatWorkflowInputData - Datos básicos:', basicData);
      return basicData;
    }

    // Si ya viene en formato N8N, devolverlo tal como está
    if (inputData.data && inputData.data.main) {
      console.log('📤 n8nService._formatWorkflowInputData - Formato N8N detectado');
      return inputData;
    }

    // PRESERVAR todos los parámetros del formulario y añadir metadatos del sistema
    const formattedData = {
      // IMPORTANTE: Preservar TODOS los datos del formulario primero
      ...inputData,
      // Añadir metadatos del sistema sin sobrescribir los datos del usuario
      _system: {
        timestamp: new Date().toISOString(),
        source: 'frontend-hook',
        environment: this.environment
      }
    };

    console.log('📤 n8nService._formatWorkflowInputData - Datos formateados finales:', formattedData);
    return formattedData;
  }

  /**
   * Crea y ejecuta una investigación completa a través del backend
   */
  async createAndExecuteResearch(researchConfig) {
    try {
      const response = await fetch(`${this.backendUrl}/api/n8n/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(researchConfig),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return ErrorHandler.createSuccessResponse(result);
    } catch (error) {
      ErrorHandler.logError('Error creando investigación:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error creando y ejecutando investigación',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Verifica si hay credenciales disponibles (ahora siempre true ya que se manejan en el backend)
   */
  _hasApiCredentials() {
    return true; // Las credenciales se manejan en el backend
  }

  /**
   * Obtiene el método de autenticación (informativo)
   */
  _getAuthMethod() {
    return 'backend'; // Todas las operaciones van a través del backend
  }

  /**
   * Prueba la conexión con la API a través del backend
   */
  async _testApiConnection() {
    try {
      const response = await fetch(`${this.backendUrl}/api/n8n/health`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      ErrorHandler.logError('Error probando conexión API:', error);
      return false;
    }
  }

  /**
   * Prueba la conexión con webhook a través del backend
   */
  async _testWebhookConnection() {
    try {
      const response = await fetch(`${this.backendUrl}/api/n8n/webhook/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      });

      return response.ok;
    } catch (error) {
      ErrorHandler.logError('Error probando conexión webhook:', error);
      return false;
    }
  }

  /**
   * Prueba la conexión general con n8n a través del backend
   */
  async testConnection() {
    const apiTest = await this._testApiConnection();
    const webhookTest = await this._testWebhookConnection();

    return {
      api: apiTest,
      webhook: webhookTest,
      overall: apiTest && webhookTest,
    };
  }

  /**
   * Obtiene información de configuración (sin credenciales sensibles)
   */
  getConfigInfo() {
    return {
      baseUrl: this.config?.baseUrl || 'No configurado',
      backendUrl: this.backendUrl,
      hasCredentials: this._hasApiCredentials(),
      authMethod: this._getAuthMethod(),
    };
  }
}

// Instancia global del servicio
export const n8nService = new N8nService();
