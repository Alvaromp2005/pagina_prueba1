import { ErrorHandler, ERROR_TYPES } from '../utils/ErrorHandler.js';

/**
 * Servicio para interactuar con n8n usando datos simulados
 * Proporciona datos de ejemplo mientras se resuelven los problemas de CORS
 */
class N8nMcpService {
  constructor() {
    // Datos simulados basados en la respuesta real del MCP
    this.mockWorkflows = [
      {
        id: 'YsZWXrE3RrB7rSvn',
        name: 'Generador Diagramas Corregido',
        active: false,
        isArchived: true,
        createdAt: '2025-09-18T14:30:15.186Z',
        updatedAt: '2025-09-19T07:59:05.256Z',
        tags: [],
        nodeCount: 9,
      },
      {
        id: 'YUFa14LLGwyJQZpz',
        name: 'Test Workflow - Integración Interface',
        active: false,
        isArchived: false,
        createdAt: '2025-09-19T09:30:48.025Z',
        updatedAt: '2025-09-19T09:30:48.025Z',
        tags: [],
        nodeCount: 2,
      },
      {
        id: 'FD1cPFpG743Xu6Fb',
        name: 'WaveResearchBOE',
        active: false,
        isArchived: false,
        createdAt: '2025-09-09T14:06:18.158Z',
        updatedAt: '2025-09-15T08:36:02.957Z',
        tags: [],
        nodeCount: 19,
      },
      {
        id: 'WvImke5VykzvPcul',
        name: '🤖 On-Page SEO Audit',
        active: false,
        isArchived: false,
        createdAt: '2025-09-18T11:27:35.577Z',
        updatedAt: '2025-09-18T11:27:35.577Z',
        tags: [
          {
            id: 'zGillYo7OjPKocCy',
            name: 'SEO',
          },
        ],
        nodeCount: 13,
      },
      {
        id: 'Wr7TgXSFOtwLZvyG',
        name: 'Generador de diagramas de arquitectura',
        active: false,
        isArchived: false,
        createdAt: '2025-09-08T09:39:03.867Z',
        updatedAt: '2025-09-18T15:52:56.405Z',
        tags: [
          {
            id: '7teAhsXHY0vsYOpH',
            name: 'diagram-generation',
          },
          {
            id: 'KPsWHKUP4OrDwVb5',
            name: 'automation',
          },
          {
            id: 'xsKDRkXAP3NYl4ff',
            name: 'architecture',
          },
        ],
        nodeCount: 12,
      },
    ];
  }

  /**
   * Simula una llamada al servidor MCP con delay realista
   */
  async simulateMcpCall(data, delay = 500) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: data,
        });
      }, delay);
    });
  }

  /**
   * Obtiene la lista de workflows usando datos simulados
   */
  async getWorkflows(limit = 100) {
    try {
      ErrorHandler.logInfo('Obteniendo workflows (datos simulados)...');

      // Simular llamada con delay realista
      const result = await this.simulateMcpCall({
        workflows: this.mockWorkflows.slice(0, limit),
        returned: Math.min(this.mockWorkflows.length, limit),
        hasMore: this.mockWorkflows.length > limit,
      });

      if (result.success && result.data) {
        const workflows = result.data.workflows || [];
        ErrorHandler.logInfo(
          'Workflows obtenidos (simulados):',
          workflows.length
        );
        return ErrorHandler.createSuccessResponse(workflows);
      } else {
        throw new Error('No se pudieron obtener workflows simulados');
      }
    } catch (error) {
      ErrorHandler.logError('Error obteniendo workflows simulados:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error obteniendo workflows simulados',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Obtiene todos los workflows (simulados)
   */
  async getAllWorkflows() {
    try {
      ErrorHandler.logInfo('Obteniendo todos los workflows (simulados)...');

      const result = await this.simulateMcpCall({
        workflows: this.mockWorkflows,
        returned: this.mockWorkflows.length,
        hasMore: false,
      });

      if (result.success && result.data) {
        const workflows = result.data.workflows || [];
        ErrorHandler.logInfo(
          'Total workflows obtenidos (simulados):',
          workflows.length
        );
        return ErrorHandler.createSuccessResponse(workflows);
      } else {
        throw new Error('No se pudieron obtener todos los workflows simulados');
      }
    } catch (error) {
      ErrorHandler.logError(
        'Error obteniendo todos los workflows simulados:',
        error
      );
      return ErrorHandler.createErrorResponse(
        error.message || 'Error obteniendo todos los workflows simulados',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Obtiene detalles de un workflow específico (simulado)
   */
  async getWorkflow(workflowId) {
    try {
      const workflow = this.mockWorkflows.find(w => w.id === workflowId);

      if (!workflow) {
        throw new Error('Workflow no encontrado');
      }

      const result = await this.simulateMcpCall(workflow, 300);

      if (result.success && result.data) {
        return ErrorHandler.createSuccessResponse(result.data);
      } else {
        throw new Error('No se pudo obtener el workflow simulado');
      }
    } catch (error) {
      ErrorHandler.logError('Error obteniendo workflow simulado:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error obteniendo workflow simulado',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Activa o desactiva un workflow (simulado)
   */
  async toggleWorkflow(workflowId, active) {
    try {
      const workflowIndex = this.mockWorkflows.findIndex(
        w => w.id === workflowId
      );

      if (workflowIndex === -1) {
        throw new Error('Workflow no encontrado');
      }

      // Actualizar el estado en los datos simulados
      this.mockWorkflows[workflowIndex].active = active;
      this.mockWorkflows[workflowIndex].updatedAt = new Date().toISOString();

      const result = await this.simulateMcpCall(
        {
          id: workflowId,
          active: active,
          message: `Workflow ${active ? 'activado' : 'desactivado'} exitosamente`,
        },
        400
      );

      if (result.success) {
        ErrorHandler.logInfo(
          `Workflow ${workflowId} ${active ? 'activado' : 'desactivado'} (simulado)`
        );
        return ErrorHandler.createSuccessResponse(result.data);
      } else {
        throw new Error('No se pudo cambiar el estado del workflow simulado');
      }
    } catch (error) {
      ErrorHandler.logError(
        'Error cambiando estado del workflow simulado:',
        error
      );
      return ErrorHandler.createErrorResponse(
        error.message || 'Error cambiando estado del workflow simulado',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Prueba la conexión (simulada)
   */
  async testConnection() {
    try {
      ErrorHandler.logInfo('Probando conexión (simulada)...');

      const result = await this.simulateMcpCall(
        {
          status: 'ok',
          apiUrl: 'https://n8n.wavext.es:8443',
          workflowCount: this.mockWorkflows.length,
        },
        300
      );

      if (result.success) {
        ErrorHandler.logInfo('✅ Conexión simulada exitosa');
        return ErrorHandler.createSuccessResponse({
          connected: true,
          method: 'Simulado',
          mcpData: result.data,
        });
      } else {
        throw new Error('Simulación de conexión falló');
      }
    } catch (error) {
      ErrorHandler.logError('❌ Error en conexión simulada:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error probando conexión simulada',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }
}

// Instancia global del servicio MCP
export const n8nMcpService = new N8nMcpService();
