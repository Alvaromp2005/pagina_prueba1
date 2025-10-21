/**
 * Utilidades para analizar y filtrar workflows de N8N
 */

/**
 * Detecta si un workflow tiene nodos webhook como trigger
 * @param {Object} workflow - El objeto workflow de N8N
 * @returns {boolean} - true si tiene nodos webhook, false en caso contrario
 */
export const hasWebhookTrigger = workflow => {
  if (!workflow || !workflow.nodes || !Array.isArray(workflow.nodes)) {
    return false;
  }

  // Tipos exactos de nodos webhook según la documentación oficial de N8N
  const webhookNodeTypes = [
    'n8n-nodes-base.webhook',
    'n8n-nodes-base.formTrigger',
    'n8n-nodes-base.chatTrigger',
  ];

  return workflow.nodes.some(
    node => node.type && webhookNodeTypes.includes(node.type)
  );
};

/**
 * Verifica si un workflow está activo
 * @param {Object} workflow - El objeto workflow de N8N
 * @returns {boolean} - true si está activo, false en caso contrario
 */
export const isWorkflowActive = workflow => {
  return workflow && workflow.active === true;
};

/**
 * Determina si un workflow está archivado (inactivo)
 * En N8N, los workflows archivados son aquellos con active: false
 * @param {Object} workflow - El objeto workflow de N8N
 * @returns {boolean} - true si el workflow está archivado (inactivo)
 */
export const isWorkflowArchived = workflow => {
  if (!workflow) {
    return false;
  }

  // En N8N, un workflow archivado tiene la propiedad isArchived
  return workflow.isArchived === true;
};

/**
 * Obtiene el estado de un workflow como texto
 * @param {Object} workflow - El objeto workflow de N8N
 * @returns {string} - 'activo' o 'inactivo'
 */
export const getWorkflowStatus = workflow => {
  return isWorkflowActive(workflow) ? 'activo' : 'inactivo';
};

/**
 * Obtiene el tipo de ejecutabilidad de un workflow
 * @param {Object} workflow - El objeto workflow de N8N
 * @returns {string} - 'webhook', 'manual', 'scheduled' o 'unknown'
 */
export const getWorkflowExecutionType = workflow => {
  if (!workflow || !workflow.nodes || !Array.isArray(workflow.nodes)) {
    return 'unknown';
  }

  // Primero verificar si tiene webhook usando la función específica
  if (hasWebhookTrigger(workflow)) {
    return 'webhook';
  }

  // Buscar el nodo trigger principal
  const triggerNode =
    workflow.nodes.find(node => {
      // Verificar si es un nodo en la posición inicial (trigger)
      return (
        node.position && Array.isArray(node.position) && node.position[0] === 0
      );
    }) || workflow.nodes[0]; // Fallback al primer nodo

  if (!triggerNode || !triggerNode.type) {
    return 'unknown';
  }

  const nodeType = triggerNode.type.toLowerCase();

  // Detectar triggers programados
  if (
    nodeType.includes('cron') ||
    nodeType.includes('schedule') ||
    nodeType.includes('interval')
  ) {
    return 'scheduled';
  }

  // Detectar triggers manuales
  if (nodeType.includes('manual') || nodeType.includes('start')) {
    return 'manual';
  }

  return 'unknown';
};

/**
 * Extrae la URL del webhook de un workflow
 * @param {Object} workflow - El objeto workflow de N8N
 * @param {string} baseUrl - URL base de la instancia N8N
 * @returns {string|null} - URL del webhook o null si no tiene webhook
 */
export const getWorkflowWebhookUrl = (workflow, baseUrl) => {
  if (
    !workflow ||
    !workflow.nodes ||
    !Array.isArray(workflow.nodes) ||
    !baseUrl
  ) {
    console.log(
      'getWorkflowWebhookUrl: No se proporcionaron los argumentos necesarios'
    );
    return null;
  }

  // Buscar nodos webhook usando tipos exactos
  const webhookNodeTypes = [
    'n8n-nodes-base.webhook',
    'n8n-nodes-base.formTrigger',
    'n8n-nodes-base.chatTrigger',
  ];

  const webhookNode = workflow.nodes.find(
    node => node.type && webhookNodeTypes.includes(node.type)
  );

  if (!webhookNode) {
    return null;
  }

  // Extraer el path del webhook desde los parámetros del nodo
  // Según la documentación oficial, la propiedad se llama 'path'
  let webhookPath = webhookNode.parameters?.path;

  // Si no hay path específico, generar uno basado en el ID del workflow
  if (!webhookPath) {
    webhookPath = workflow.id;
  }

  // Limpiar y construir la URL completa
  const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Remover slash final si existe
  let cleanPath = webhookPath;

  // Remover slash inicial si existe
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  console.log('getWorkflowWebhookUrl: cleanPath', cleanPath);
  // Construir URL final - N8N usa el formato /webhook/path
  return `${cleanBaseUrl}/webhook/${cleanPath}`;
};

/**
 * Ordena workflows según el criterio especificado
 * @param {Array} workflows - Array de workflows a ordenar
 * @param {string} sortBy - Criterio de ordenamiento
 * @returns {Array} - Array de workflows ordenados
 */
export const sortWorkflows = (workflows, sortBy = 'name') => {
  if (!workflows || !Array.isArray(workflows)) {
    return [];
  }

  const workflowsCopy = [...workflows];

  switch (sortBy) {
    case 'name':
      return workflowsCopy.sort((a, b) =>
        (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
      );

    case 'name-desc':
      return workflowsCopy.sort((a, b) =>
        (b.name || '').toLowerCase().localeCompare((a.name || '').toLowerCase())
      );

    case 'created':
      return workflowsCopy.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB - dateA; // Más reciente primero
      });

    case 'created-desc':
      return workflowsCopy.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateA - dateB; // Más antigua primero
      });

    case 'updated':
      return workflowsCopy.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.updated_at || 0);
        const dateB = new Date(b.updatedAt || b.updated_at || 0);
        return dateB - dateA; // Más reciente primero
      });

    case 'updated-desc':
      return workflowsCopy.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.updated_at || 0);
        const dateB = new Date(b.updatedAt || b.updated_at || 0);
        return dateA - dateB; // Más antigua primero
      });

    case 'id':
      return workflowsCopy.sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idA - idB; // Menor a mayor
      });

    case 'id-desc':
      return workflowsCopy.sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idB - idA; // Mayor a menor
      });

    case 'status':
      return workflowsCopy.sort((a, b) => {
        // Activos primero, luego inactivos, luego archivados
        const statusA = isWorkflowArchived(a) ? 2 : isWorkflowActive(a) ? 0 : 1;
        const statusB = isWorkflowArchived(b) ? 2 : isWorkflowActive(b) ? 0 : 1;
        return statusA - statusB;
      });

    case 'status-desc':
      return workflowsCopy.sort((a, b) => {
        // Archivados primero, luego inactivos, luego activos
        const statusA = isWorkflowArchived(a) ? 0 : isWorkflowActive(a) ? 2 : 1;
        const statusB = isWorkflowArchived(b) ? 0 : isWorkflowActive(b) ? 2 : 1;
        return statusA - statusB;
      });

    case 'execution-type':
      return workflowsCopy.sort((a, b) => {
        const typeA = getWorkflowExecutionType(a);
        const typeB = getWorkflowExecutionType(b);

        // Orden: webhook, manual, scheduled
        const order = { webhook: 0, manual: 1, scheduled: 2 };
        return (order[typeA] || 3) - (order[typeB] || 3);
      });

    default:
      return workflowsCopy;
  }
};

/**
 * Filtra workflows según múltiples criterios
 * @param {Array} workflows - Array de workflows
 * @param {Object} filters - Objeto con filtros a aplicar
 * @param {string} filters.status - 'todos', 'activos', 'inactivos'
 * @param {string} filters.executionType - 'todos', 'webhook', 'manual', 'scheduled'
 * @param {string} filters.search - Término de búsqueda
 * @param {boolean} filters.showArchived - Si mostrar workflows archivados
 * @returns {Array} - Array de workflows filtrados
 */
export const filterWorkflows = (workflows, filters = {}) => {
  if (!Array.isArray(workflows)) {
    return [];
  }

  let filtered = [...workflows];

  // Filtrar workflows archivados (por defecto no se muestran)
  if (filters.showArchived !== true) {
    filtered = filtered.filter(workflow => !isWorkflowArchived(workflow));
  }

  // Filtrar por estado (activo/inactivo)
  if (filters.status && filters.status !== 'todos') {
    filtered = filtered.filter(workflow => {
      if (filters.status === 'activos') {
        return isWorkflowActive(workflow);
      } else if (filters.status === 'inactivos') {
        return !isWorkflowActive(workflow);
      }
      return true;
    });
  }

  // Filtrar por tipo de ejecución
  if (filters.executionType && filters.executionType !== 'todos') {
    filtered = filtered.filter(workflow => {
      const executionType = getWorkflowExecutionType(workflow);

      if (filters.executionType === 'webhook') {
        return executionType === 'webhook';
      } else if (filters.executionType === 'manual') {
        return executionType === 'manual';
      } else if (filters.executionType === 'scheduled') {
        return executionType === 'scheduled';
      } else if (filters.executionType === 'ejecutables') {
        // Ejecutables son aquellos que tienen webhook o son manuales
        return executionType === 'webhook' || executionType === 'manual';
      } else if (filters.executionType === 'no-ejecutables') {
        // No ejecutables son los programados o desconocidos
        return executionType === 'scheduled' || executionType === 'unknown';
      }
      return true;
    });
  }

  // Filtrar por búsqueda de texto
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase().trim();
    filtered = filtered.filter(workflow => {
      return (
        (workflow.name && workflow.name.toLowerCase().includes(searchTerm)) ||
        (workflow.id && workflow.id.toString().includes(searchTerm)) ||
        (workflow.tags &&
          workflow.tags.some(
            tag => tag.name && tag.name.toLowerCase().includes(searchTerm)
          ))
      );
    });
  }

  return filtered;
};

/**
 * Obtiene estadísticas de los workflows
 * @param {Array} workflows - Array de workflows
 * @returns {Object} - Objeto con estadísticas
 */
export const getWorkflowStats = workflows => {
  if (!Array.isArray(workflows)) {
    return {
      total: 0,
      active: 0,
      inactive: 0,
      webhook: 0,
      manual: 0,
      scheduled: 0,
    };
  }

  const stats = {
    total: workflows.length,
    active: 0,
    inactive: 0,
    webhook: 0,
    manual: 0,
    scheduled: 0,
  };

  workflows.forEach(workflow => {
    // Contar por estado
    if (isWorkflowActive(workflow)) {
      stats.active++;
    } else {
      stats.inactive++;
    }

    // Contar por tipo de ejecución
    const executionType = getWorkflowExecutionType(workflow);
    if (stats[executionType] !== undefined) {
      stats[executionType]++;
    }
  });

  return stats;
};
