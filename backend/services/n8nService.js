
import fetch from 'node-fetch';
import { N8N_BACKEND_CONFIG } from '../config/environment.js';
import { createN8nAuthHeaders } from '../middleware/auth.js';

class N8nBackendService {
  constructor() {
    // Normalizar la URL base eliminando barra final si existe
    this.baseUrl = N8N_BACKEND_CONFIG.BASE_URL.replace(/\/$/, '');
    // Usar la función createN8nAuthHeaders() para obtener headers actualizados
    console.log(`🔧 Configurando N8nBackendService con URL base: ${this.baseUrl}`);
  }

  /**
   * Activar o desactivar un workflow
   */
  async setWorkflowActive(workflowId, active) {
    try {
      // Obtener el workflow actual
      const workflowDetails = await this.getWorkflowById(workflowId);
      if (!workflowDetails.success) {
        throw new Error(`No se pudo obtener el workflow ${workflowId}: ${workflowDetails.error}`);
      }
      const workflowData = workflowDetails.data;
      // Actualizar el campo active
      workflowData.active = active;
      // Hacer PUT a la API de n8n
      const headers = this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(workflowData),
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      return {
        success: true,
        data,
        message: `Workflow ${active ? 'activado' : 'desactivado'} correctamente`
      };
    } catch (error) {
      console.error('Error al activar/desactivar workflow:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener headers de autenticación actualizados
   */
  getHeaders() {
    return createN8nAuthHeaders();
  }

  /**
   * Obtener lista de workflows
   */
  async getWorkflows() {
    try {
      const headers = this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
        total: data.data?.length || 0
      };
    } catch (error) {
      console.error('Error al obtener workflows:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Probar conexión con N8N
   */
  async testConnection() {
    try {
      const headers = this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        method: 'GET',
        headers,
      });

      const isConnected = response.ok;
      const statusCode = response.status;

      return {
        success: true,
        connected: isConnected,
        statusCode,
        message: isConnected 
          ? 'Conexión exitosa con N8N' 
          : `Error de conexión: ${response.statusText}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error al probar conexión:', error);
      return {
        success: false,
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Actualizar workflow
   */
  async updateWorkflow(workflowId, workflowData) {
    try {
      const headers = this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(workflowData),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        message: 'Workflow actualizado correctamente'
      };
    } catch (error) {
      console.error('Error al actualizar workflow:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Ejecutar workflow usando webhook
   * N8N no tiene endpoint público para ejecutar workflows, se debe usar webhook
   */
  async executeWorkflow(workflowId, inputData = {}) {
    try {
      console.log(`🚀 Ejecutando workflow ${workflowId} con datos:`, JSON.stringify(inputData, null, 2));
      
      // Primero obtener los detalles del workflow para encontrar el webhook
      const workflowDetails = await this.getWorkflowById(workflowId);
      if (!workflowDetails.success) {
        throw new Error(`No se pudo obtener el workflow ${workflowId}: ${workflowDetails.error}`);
      }

      // Buscar el nodo webhook en el workflow
      const webhookNode = workflowDetails.data.nodes?.find(node => 
        node.type === 'n8n-nodes-base.webhook'
      );

      if (!webhookNode) {
        throw new Error(`El workflow ${workflowId} no tiene un trigger de webhook configurado`);
      }

      const webhookPath = webhookNode.parameters?.path;
      if (!webhookPath) {
        throw new Error(`El webhook del workflow ${workflowId} no tiene un path configurado`);
      }

      // Construir la URL del webhook
      const webhookUrl = `${this.baseUrl}/webhook/${webhookPath}`;
      
      console.log(`📡 URL del webhook: ${webhookUrl}`);
      
      // Forzar el uso de POST para enviar datos en el body correctamente
      // Esto asegura que los parámetros del formulario lleguen en el body y no en query string
      const httpMethod = 'POST';
      console.log(`📤 Método HTTP forzado a: ${httpMethod} (para enviar datos en body)`);

      // Preparar headers básicos (sin autenticación para webhooks públicos)
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Siempre enviar datos en el body usando POST
      const response = await fetch(webhookUrl, {
        method: httpMethod,
        headers,
        body: JSON.stringify(inputData),
      });

      console.log(`📊 Status de respuesta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error en la ejecución del webhook:`, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Workflow ejecutado exitosamente via webhook:', data);
      
      return {
        success: true,
        data,
        workflowId,
        webhookPath,
        method: httpMethod,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error al ejecutar workflow via webhook:', error);
      throw new Error(`Error ejecutando workflow via webhook: ${error.message}`);
    }
  }



  /**
   * Obtener detalles de un workflow específico
   */
  async getWorkflowById(workflowId) {
    try {
      const headers = this.getHeaders();
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error al obtener workflow:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new N8nBackendService();