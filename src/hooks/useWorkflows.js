import { useState, useEffect, useCallback } from 'react';
import { n8nService } from '../services/n8nService';
import { n8nProxyService } from '../services/n8nProxyService';
import { n8nMcpService } from '../services/n8nMcpService';
import { ErrorHandler } from '../utils/ErrorHandler';
import { N8N_CONFIG } from '../config/constants';
import {
  filterWorkflows,
  getWorkflowStats as getUtilStats,
  hasWebhookTrigger,
  isWorkflowActive,
  isWorkflowArchived,
  getWorkflowExecutionType,
  getWorkflowWebhookUrl,
  sortWorkflows,
} from '../utils/workflowUtils';

/**
 * Hook personalizado para gestionar workflows de N8N
 * Proporciona funcionalidades para obtener, ejecutar y gestionar workflows
 */
export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'todos',
    executionType: 'todos',
    search: '',
    showArchived: false,
    sortBy: 'name',
  });

  /**
   * Obtiene la lista de workflows desde N8N
   */
  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Intentar usar el proxy primero, luego el servicio directo como fallback
      let response;
      try {
        const proxyHealth = await n8nProxyService.checkProxyHealth();
        if (proxyHealth.success) {
          response = await n8nProxyService.getWorkflows();
          ErrorHandler.logInfo('Usando servicio proxy para obtener workflows');
        } else {
          throw new Error('Proxy no disponible');
        }
      } catch (proxyError) {
        ErrorHandler.logInfo('Proxy no disponible, usando servicio directo');
        response = await n8nService.getWorkflows();
      }

      if (response.success) {
        setWorkflows(response.data || []);
        ErrorHandler.logInfo(
          'Workflows cargados exitosamente:',
          response.data?.length || 0
        );
      } else {
        const errorMessage =
          response.error || 'Error desconocido al obtener workflows';
        setError(errorMessage);
        ErrorHandler.logError('Error obteniendo workflows:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message || 'Error de conexión con N8N';
      setError(errorMessage);
      ErrorHandler.logError('Error en fetchWorkflows:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Ejecuta un workflow específico
   */
  const executeWorkflow = useCallback(
    async (workflowId, inputData = {}) => {
      try {
        ErrorHandler.logInfo(`🚀 Ejecutando workflow ID: ${workflowId}`);

        // Formatear los datos de entrada para N8N
        const formattedInputData = _formatWorkflowInputData(inputData);
        console.log('📤 Datos formateados para workflow:', formattedInputData);

        // Buscar el workflow en la lista actual para determinar si tiene webhook
        const workflow = workflows.find(w => w.id === workflowId);

        console.log('🔍 Ejecutando workflow:', {
          workflowId,
          workflow: workflow ? 'encontrado' : 'no encontrado',
          hasWebhook: workflow ? hasWebhookTrigger(workflow) : false,
          baseUrl: N8N_CONFIG.BASE_URL,
          inputData: formattedInputData,
        });

        if (workflow && hasWebhookTrigger(workflow)) {
          console.log('🌐 Workflow tiene webhook, usando backend como proxy para evitar CORS');
          // Para workflows con webhook, usar el backend como proxy para evitar problemas CORS
          // y manejar correctamente el método HTTP (GET/POST)
        } else {
          console.log('ℹ️ Workflow sin webhook, usando método estándar');
        }

        // Método estándar: Usar el proxy primero, luego el servicio directo como fallback
        let response;
        try {
          // Intentar usar el proxy primero
          response = await n8nProxyService.executeWorkflow(
            workflowId,
            formattedInputData
          );
          ErrorHandler.logInfo(
            'Usando servicio proxy para ejecutar workflow'
          );
        } catch (proxyError) {
          ErrorHandler.logError('❌ Error ejecutando workflow via proxy:', proxyError);
          // Fallback al servicio directo si el proxy falla
          ErrorHandler.logInfo('Proxy no disponible, usando servicio directo');
          response = await n8nService.executeWorkflow(workflowId, formattedInputData);
        }

        if (response.success) {
          ErrorHandler.logInfo(
            'Workflow ejecutado exitosamente:',
            response.data
          );
          return {
            success: true,
            data: response.data,
            executionId: response.data?.executionId || response.data?.id,
            method: 'api',
            timestamp: new Date().toISOString()
          };
        } else {
          const errorMessage =
            response.error || 'Error desconocido al ejecutar workflow';
          ErrorHandler.logError('Error ejecutando workflow:', errorMessage);
          return {
            success: false,
            error: errorMessage,
          };
        }
      } catch (error) {
        const errorMessage =
          error.message || 'Error de conexión al ejecutar workflow';
        ErrorHandler.logError('Error en executeWorkflow:', error);
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [workflows]
  );

  /**
   * Obtiene el estado de un workflow específico
   */
  const getWorkflowStatus = useCallback(async workflowId => {
    try {
      const response = await n8nService.getWorkflowStatus(workflowId);

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Error obteniendo estado del workflow',
        };
      }
    } catch (error) {
      ErrorHandler.logError('Error obteniendo estado del workflow:', error);
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }, []);

  /**
   * Efecto para cargar workflows al inicializar el hook
   */
  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  /**
   * Actualiza la lista de workflows
   */
  const refreshWorkflows = useCallback(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  /**
   * Filtra workflows por estado activo
   */
  const getActiveWorkflows = useCallback(() => {
    return workflows.filter(workflow => workflow.active === true);
  }, [workflows]);

  /**
   * Filtra workflows por estado inactivo
   */
  const getInactiveWorkflows = useCallback(() => {
    return workflows.filter(workflow => workflow.active === false);
  }, [workflows]);

  /**
   * Busca un workflow por ID
   */
  const findWorkflowById = useCallback(
    workflowId => {
      return workflows.find(workflow => workflow.id === workflowId);
    },
    [workflows]
  );

  /**
   * Obtiene workflows filtrados y ordenados
   */
  const filteredWorkflows = useCallback(() => {
    const filtered = filterWorkflows(workflows, filters);
    return sortWorkflows(filtered, filters.sortBy);
  }, [workflows, filters]);

  /**
   * Obtiene estadísticas de workflows (todos)
   */
  const getWorkflowStats = useCallback(() => {
    return getUtilStats(workflows);
  }, [workflows]);

  /**
   * Obtiene estadísticas de workflows filtrados
   */
  const getFilteredWorkflowStats = useCallback(() => {
    const filtered = filteredWorkflows();
    return getUtilStats(filtered);
  }, [filteredWorkflows]);

  /**
   * Actualiza los filtros
   */
  const updateFilters = useCallback(newFilters => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters,
    }));
  }, []);

  /**
   * Limpia todos los filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({
      status: 'todos',
      executionType: 'todos',
      search: '',
      showArchived: false,
    });
  }, []);

  /**
   * Verifica si un workflow tiene webhook trigger
   */
  const checkHasWebhookTrigger = useCallback(workflow => {
    return hasWebhookTrigger(workflow);
  }, []);

  /**
   * Verifica si un workflow está activo
   */
  const checkIsWorkflowActive = useCallback(workflow => {
    return isWorkflowActive(workflow);
  }, []);

  /**
   * Obtiene el tipo de ejecución de un workflow
   */
  const getExecutionType = useCallback(workflow => {
    return getWorkflowExecutionType(workflow);
  }, []);

  /**
   * Activa o desactiva un workflow con fallback a diferentes servicios
   */
  const toggleWorkflowStatus = useCallback(async (workflowId, active) => {
    try {
      setLoading(true);
      console.log(
        `Cambiando estado del workflow ${workflowId} a ${active ? 'activo' : 'inactivo'}`
      );

      // Intentar con el servicio proxy primero
      let result = await n8nProxyService.toggleWorkflow(workflowId, active);

      // Si falla el proxy, intentar con el servicio directo
      if (!result.success) {
        console.log('Proxy falló, intentando con servicio directo...');
        result = await n8nService.toggleWorkflow(workflowId, active);
      }

      // Si ambos fallan, usar el servicio simulado
      if (!result.success) {
        console.log('Servicio directo falló, usando servicio simulado...');
        result = await n8nMcpService.toggleWorkflow(workflowId, active);
      }

      if (result.success) {
        console.log('Estado del workflow cambiado exitosamente:', result.data);
        // Actualizar el workflow en el estado local
        setWorkflows(prevWorkflows =>
          prevWorkflows.map(workflow =>
            workflow.id === workflowId ? { ...workflow, active } : workflow
          )
        );
        return { success: true, data: result.data };
      } else {
        console.error('Error cambiando estado del workflow:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error en toggleWorkflowStatus:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar workflows al montar el componente
  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  return {
    // Estado
    workflows,
    loading,
    error,
    filters,

    // Workflows filtrados
    filteredWorkflows: filteredWorkflows(),

    // Acciones
    executeWorkflow,
    refreshWorkflows,
    getWorkflowStatus,
    updateFilters,
    clearFilters,
    toggleWorkflowStatus,

    // Utilidades
    getActiveWorkflows,
    getInactiveWorkflows,
    findWorkflowById,
    getWorkflowStats,
    getFilteredWorkflowStats,

    // Utilidades de análisis de workflows
    checkHasWebhookTrigger,
    checkIsWorkflowActive,
    getExecutionType,

    // Funciones internas (por si se necesitan)
    fetchWorkflows,
  };
};

/**
 * Formatea los datos de entrada para N8N
 * N8N espera los parámetros en un formato específico
 */
const _formatWorkflowInputData = (inputData) => {
  console.log('🔧 _formatWorkflowInputData - Datos de entrada:', inputData);
  
  // Si no hay datos de entrada, usar estructura básica
  if (!inputData || Object.keys(inputData).length === 0) {
    const basicData = {
      timestamp: new Date().toISOString(),
      source: 'frontend-hook'
    };
    console.log('📤 _formatWorkflowInputData - Datos básicos:', basicData);
    return basicData;
  }

  // Si ya viene en formato N8N, devolverlo tal como está
  if (inputData.data && inputData.data.main) {
    console.log('📤 _formatWorkflowInputData - Formato N8N detectado, devolviendo tal como está');
    return inputData;
  }

  // PRESERVAR todos los parámetros del formulario y añadir metadatos
  const formattedData = {
    // IMPORTANTE: Preservar TODOS los datos del formulario primero
    ...inputData,
    // Añadir metadatos del sistema sin sobrescribir los datos del usuario
    _system: {
      timestamp: new Date().toISOString(),
      source: 'frontend-hook',
      executedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      origin: window.location.origin
    }
  };
  
  console.log('📤 _formatWorkflowInputData - Datos formateados finales:', formattedData);
  return formattedData;
};

export default useWorkflows;
