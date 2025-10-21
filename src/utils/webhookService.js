import { ErrorHandler } from './ErrorHandler';

/**
 * Servicio para manejar el envío de datos a webhooks de n8n
 * Especializado en formularios dinámicos
 */
export class WebhookService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Método sendWebhookData para mantener compatibilidad
   * @deprecated Usar executeWorkflow del hook useWorkflows en su lugar
   * @param {string} workflowId - ID del workflow
   * @param {Object} data - Datos a enviar
   * @returns {Promise<Object>} - Resultado de la ejecución
   */
  async sendWebhookData(workflowId, data) {
    console.warn('⚠️ sendWebhookData está deprecado. Usar executeWorkflow del hook useWorkflows.');
    return {
      success: false,
      error: 'Método deprecado. Usar executeWorkflow del hook useWorkflows.'
    };
  }

  /**
   * Envía datos de formulario dinámico a un webhook de n8n
   * @param {string} webhookUrl - URL del webhook
   * @param {Object} formData - Datos del formulario
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<Object>} - Resultado de la ejecución
   */
  static async sendFormData(webhookUrl, formData, metadata = {}) {
    try {
      const payload = {
        // Datos del formulario
        ...formData,

        // Metadatos del sistema
        _metadata: {
          source: 'dynamic-form',
          timestamp: new Date().toISOString(),
          workflowId: metadata.workflowId,
          workflowName: metadata.workflowName,
          formVersion: '1.0',
          ...metadata,
        },
      };

      console.log('Enviando datos a webhook:', {
        url: webhookUrl,
        payload: payload,
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'N8N-Interface-Dynamic-Form/1.0',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`
        );
      }

      let result;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = {
          message: await response.text(),
          status: response.status,
        };
      }

      ErrorHandler.logInfo('Webhook ejecutado exitosamente:', result);

      return {
        success: true,
        data: result,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      ErrorHandler.logError('Error enviando datos al webhook:', error);

      return {
        success: false,
        error: error.message || 'Error enviando datos al webhook',
        details: error,
      };
    }
  }

  /**
   * Construye la URL del webhook basada en la configuración del workflow
   * @param {Object} workflow - Objeto workflow
   * @param {string} baseUrl - URL base de n8n
   * @returns {string|null} - URL del webhook o null si no se encuentra
   */
  static buildWebhookUrl(workflow, baseUrl) {
    if (!workflow || !workflow.nodes || !Array.isArray(workflow.nodes)) {
      return null;
    }

    // Buscar nodo webhook
    const webhookNode = workflow.nodes.find(
      node => node.type && node.type.toLowerCase().includes('webhook')
    );

    if (!webhookNode || !webhookNode.parameters) {
      return null;
    }

    const path =
      webhookNode.parameters.path || webhookNode.parameters.webhookPath;

    if (!path) {
      return null;
    }

    // Construir URL completa
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${cleanBaseUrl}/webhook${cleanPath}`;
  }

  /**
   * Valida que los datos del formulario cumplan con los requisitos del webhook
   * @param {Object} formData - Datos del formulario
   * @param {Array} parameters - Parámetros esperados
   * @returns {Object} - Resultado de la validación
   */
  static validateFormData(formData, parameters = []) {
    const errors = [];
    const warnings = [];

    // Validar campos requeridos
    parameters.forEach(param => {
      if (param.required) {
        const value = formData[param.name];

        if (value === null || value === undefined || value === '') {
          errors.push(`El campo '${param.label || param.name}' es requerido`);
        }
      }
    });

    // Validar tipos de datos
    parameters.forEach(param => {
      const value = formData[param.name];

      if (value !== null && value !== undefined && value !== '') {
        switch (param.type) {
          case 'email': {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push(
                `El campo '${param.label || param.name}' debe ser un email válido`
              );
            }
            break;
          }

          case 'number':
          case 'range':
          case 'percentage':
            if (isNaN(parseFloat(value))) {
              errors.push(
                `El campo '${param.label || param.name}' debe ser un número válido`
              );
            }
            break;

          case 'url':
            try {
              new URL(value);
            } catch {
              errors.push(
                `El campo '${param.label || param.name}' debe ser una URL válida`
              );
            }
            break;
        }
      }
    });

    // Verificar campos no definidos en parámetros
    Object.keys(formData).forEach(key => {
      if (!key.startsWith('_') && !parameters.find(p => p.name === key)) {
        warnings.push(
          `Campo '${key}' no está definido en los parámetros del workflow`
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Procesa archivos del formulario para envío
   * @param {Object} formData - Datos del formulario
   * @returns {Promise<Object>} - Datos procesados
   */
  static async processFiles(formData) {
    const processedData = { ...formData };

    for (const [key, value] of Object.entries(formData)) {
      if (
        value instanceof FileList ||
        (Array.isArray(value) && value[0] instanceof File)
      ) {
        const files = Array.from(value);

        // Convertir archivos a base64 para envío
        const processedFiles = await Promise.all(
          files.map(async file => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  data: reader.result.split(',')[1], // Remover prefijo data:
                  lastModified: file.lastModified,
                });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          })
        );

        processedData[key] = processedFiles;
      }
    }

    return processedData;
  }

  /**
   * Crea un payload optimizado para n8n
   * @param {Object} formData - Datos del formulario
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Object} - Payload optimizado
   */
  static createN8nPayload(formData, metadata = {}) {
    return {
      // Datos principales en el nivel raíz para fácil acceso en n8n
      ...formData,

      // Información del sistema en un objeto separado
      system: {
        source: 'dynamic-form-interface',
        timestamp: new Date().toISOString(),
        workflowId: metadata.workflowId,
        workflowName: metadata.workflowName,
        version: '1.0',
        userAgent: navigator.userAgent,
        ...metadata,
      },
    };
  }
}

export default WebhookService;
