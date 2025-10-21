import { useState, useMemo, useCallback } from 'react';
import { N8N_CONFIG } from '../config/constants';
import { useWorkflows } from '../hooks/useWorkflows';
import { useToast } from '../contexts/ToastContext';
import { hasWebhookTrigger } from '../utils/workflowUtils';
import { extractMetadata } from '../utils/metadataExtractor';
import N8nTestConnection from '../components/N8nTestConnection';
import WorkflowFilters from '../components/WorkflowFilters';
import WorkflowInlineForm from '../components/forms/WorkflowInlineForm';

const WorkflowsPage = () => {
  const { 
    workflows, 
    loading, 
    error, 
    executeWorkflow, 
    refreshWorkflows,
    filteredWorkflows,
    filters,
    updateFilters,
    getWorkflowStats,
    getFilteredWorkflowStats,
    checkHasWebhookTrigger,
    getExecutionType,
    toggleWorkflowStatus
  } = useWorkflows();
  const { showToast } = useToast();
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [executingWorkflows, setExecutingWorkflows] = useState(new Set());
  const [completedWorkflows, setCompletedWorkflows] = useState(new Set());
  const [executionTimeouts, setExecutionTimeouts] = useState(new Map());
  
  // Estado para validación de formularios
  const [workflowValidationStates, setWorkflowValidationStates] = useState({});
  const [workflowFormValidation, setWorkflowFormValidation] = useState({});
  
  // Estado para datos de formularios dinámicos
  const [workflowFormData, setWorkflowFormData] = useState({});

  // Obtener estadísticas
  const allStats = getWorkflowStats();
  const filteredStats = getFilteredWorkflowStats();

  // Función para obtener información adicional del workflow
  const getWorkflowInfo = (workflow) => {
    const hasWebhook = checkHasWebhookTrigger(workflow);
    const executionType = getExecutionType(workflow);
    return {
      hasWebhook,
      executionType,
      isExecutable: executionType === 'webhook' || executionType === 'manual'
    };
  };

  const handleExecuteWorkflow = async (workflowId, workflowName) => {
    if (executingWorkflows.has(workflowId)) return;

    setExecutingWorkflows(prev => new Set(prev).add(workflowId));
    setCompletedWorkflows(prev => {
      const newSet = new Set(prev);
      newSet.delete(workflowId);
      return newSet;
    });
    
    // Configurar timeout de 15 minutos para mostrar notificación de completado
    const timeoutId = setTimeout(() => {
      setCompletedWorkflows(prev => new Set(prev).add(workflowId));
      setExecutionTimeouts(prev => {
        const newMap = new Map(prev);
        newMap.delete(workflowId);
        return newMap;
      });
      showToast(`Workflow "${workflowName}" completado`, 'success');
    }, 15 * 60 * 1000); // 15 minutos
    
    setExecutionTimeouts(prev => new Map(prev).set(workflowId, timeoutId));
    
    try {
      // Obtener los datos del formulario dinámico para este workflow
      const formData = workflowFormData[workflowId] || {};
      console.log(`📤 WorkflowsPage - Ejecutando workflow ${workflowId} con datos del formulario:`, formData);
      console.log(`📊 WorkflowsPage - Estado actual de workflowFormData:`, workflowFormData);
      
      const result = await executeWorkflow(workflowId, formData);
      if (result.success) {
        // Limpiar timeout si se completa antes de 15 minutos
        const timeoutId = executionTimeouts.get(workflowId);
        if (timeoutId) {
          clearTimeout(timeoutId);
          setExecutionTimeouts(prev => {
            const newMap = new Map(prev);
            newMap.delete(workflowId);
            return newMap;
          });
        }
        setCompletedWorkflows(prev => new Set(prev).add(workflowId));
        showToast(`Workflow "${workflowName}" ejecutado exitosamente`, 'success');
      } else {
        showToast(`Error ejecutando workflow "${workflowName}": ${result.error}`, 'error');
      }
    } catch (error) {
      showToast(`Error ejecutando workflow "${workflowName}": ${error.message}`, 'error');
    } finally {
      setExecutingWorkflows(prev => {
        const newSet = new Set(prev);
        newSet.delete(workflowId);
        return newSet;
      });
    }
  };

  const handleCancelExecution = (workflowId) => {
    const timeoutId = executionTimeouts.get(workflowId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setExecutionTimeouts(prev => {
        const newMap = new Map(prev);
        newMap.delete(workflowId);
        return newMap;
      });
    }
    setExecutingWorkflows(prev => {
      const newSet = new Set(prev);
      newSet.delete(workflowId);
      return newSet;
    });
    showToast('Ejecución cancelada', 'info');
  };



  // Función para manejar cambios en los datos del formulario dinámico (optimizada)
  const handleFormDataChange = useMemo(() => {
    const handlers = {};
    return (workflowId) => {
      if (!handlers[workflowId]) {
        handlers[workflowId] = (formData) => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`📝 WorkflowsPage - Actualizando datos del formulario para workflow ${workflowId}:`, formData);
          }
          setWorkflowFormData(prev => {
            // Solo actualizar si hay cambios reales
            const currentData = prev[workflowId];
            const hasChanges = JSON.stringify(currentData) !== JSON.stringify(formData);
            
            if (!hasChanges) {
              return prev; // No hay cambios, devolver el estado anterior
            }
            
            const newData = {
              ...prev,
              [workflowId]: formData
            };
            
            if (process.env.NODE_ENV === 'development') {
              console.log(`📊 WorkflowsPage - Estado completo de workflowFormData:`, newData);
            }
            
            return newData;
          });
        };
      }
      return handlers[workflowId];
    };
  }, []);

  // Función para manejar cambios en la validación del formulario (optimizada)
  const handleFormValidationChange = useMemo(() => {
    const handlers = {};
    return (workflowId) => {
      if (!handlers[workflowId]) {
        handlers[workflowId] = (isValid) => {
          setWorkflowFormValidation(prev => {
            // Solo actualizar si hay cambios reales
            if (prev[workflowId] === isValid) {
              return prev; // No hay cambios, devolver el estado anterior
            }
            
            return {
              ...prev,
              [workflowId]: isValid
            };
          });
        };
      }
      return handlers[workflowId];
    };
  }, []);

  // Función para determinar si un workflow puede ejecutarse
  const canExecuteWorkflow = (workflow) => {
    const hasWebhook = hasWebhookTrigger(workflow);
    const isActive = workflow.active;
    const isExecuting = executingWorkflows.has(workflow.id);
    
    // Si está ejecutándose, mostrar estado de ejecución
    if (isExecuting) {
      return { canExecute: false, reason: 'executing', buttonState: 'executing' };
    }
    
    // Si no tiene webhook, no es ejecutable
    if (!hasWebhook) {
      return { canExecute: false, reason: 'no_webhook', buttonState: 'not_executable' };
    }
    
    // Verificar si tiene metadatos de parámetros
    const metadata = extractMetadata(workflow);
    const hasParameters = metadata && metadata.success && metadata.parameters && metadata.parameters.length > 0;
    const validationState = workflowFormValidation[workflow.id];
    
    // Determinar si los parámetros están completos y válidos
    let parametersValid = true;
    if (hasParameters) {
      // Si hay parámetros definidos, verificar validación
      if (validationState === undefined || validationState === false) {
        parametersValid = false;
      }
    }
    // Si no hay parámetros definidos, considerar válido (webhook sin parámetros)
    
    // Lógica principal según los requisitos:
    
    // 1. Botón activo cuando workflow está activo Y se cumple alguna condición
    if (isActive && parametersValid) {
      return { canExecute: true, reason: 'valid', buttonState: 'active' };
    }
    
    // 2. Si cumple condiciones pero workflow está inactivo
    if (!isActive && parametersValid) {
      return { canExecute: false, reason: 'inactive', buttonState: 'inactive' };
    }
    
    // 3. Parámetros faltantes o inválidos
    if (hasParameters && !parametersValid) {
      return { canExecute: false, reason: 'missing_params', buttonState: 'missing_params' };
    }
    
    // Fallback
    return { canExecute: false, reason: 'unknown', buttonState: 'disabled' };
  };

  const handleToggleWorkflow = async (workflowId, currentActive, workflowName) => {
    try {
      const result = await toggleWorkflowStatus(workflowId, !currentActive);
      if (result.success) {
        showToast(
          `Workflow "${workflowName}" ${!currentActive ? 'activado' : 'desactivado'} exitosamente`, 
          'success'
        );
      } else {
        showToast(
          `Error ${!currentActive ? 'activando' : 'desactivando'} workflow "${workflowName}": ${result.error}`, 
          'error'
        );
      }
    } catch (error) {
      showToast(
        `Error ${!currentActive ? 'activando' : 'desactivando'} workflow "${workflowName}": ${error.message}`, 
        'error'
      );
    }
  };



  const getWorkflowStatusColor = (workflow) => {
    if (workflow.isArchived) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    return workflow.active 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getWorkflowStatusText = (workflow) => {
    if (workflow.isArchived) {
      return 'Archivado';
    }
    return workflow.active ? 'Activo' : 'Inactivo';
  };

  const getWorkflowCardStyle = (workflow) => {
    if (workflow.isArchived) {
      return 'bg-orange-50 border-orange-200';
    }
    return workflow.active 
      ? 'bg-green-50 border-green-200' 
      : 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Workflows de N8N
          </h1>
          <button
            onClick={refreshWorkflows}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '🔄 Actualizando...' : '🔄 Actualizar'}
          </button>
        </div>
        <p className="text-gray-600">
          Gestiona y ejecuta workflows disponibles en tu instancia de N8N
        </p>
      </div>

      {/* Componente de Prueba N8N */}
      <div className="mb-8">
        <N8nTestConnection />
      </div>

      {/* Componente de Filtros */}
      <div className="mb-8">
        <WorkflowFilters
          filters={filters}
          onFiltersChange={updateFilters}
          stats={allStats}
        />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-3xl">⚙️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Workflows
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {allStats.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-3xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {allStats.active || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <span className="text-3xl">🔗</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Webhooks</p>
              <p className="text-2xl font-semibold text-gray-900">
                {allStats.webhook || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-3xl">🔍</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Filtrados</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredStats.total || 0}
              </p>
            </div>
          </div>
        </div>
      </div>



      {/* Estado de carga y error */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-4xl animate-spin">🔄</div>
          <p className="mt-4 text-gray-600">
            Cargando workflows, por favor espere...
          </p>
        </div>
      )}

      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8"
          role="alert"
        >
          <p className="font-bold">Error de Carga</p>
          <p>
            {typeof error === 'string'
              ? error
              : error?.message || 'Error desconocido'}
          </p>
        </div>
      )}

      {/* Lista de workflows */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Workflows Disponibles</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredWorkflows.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🤷</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron workflows
                  </h3>
                  <p className="text-gray-600">
                    {(filters.status !== 'todos' || filters.executionType !== 'todos' || filters.search)
                  ? 'Intenta ajustar los filtros para ver más resultados.'
                  : 'No hay workflows disponibles en tu instancia de N8N.'}
                  </p>
                </div>
              </div>
            ) : (
              filteredWorkflows.map(workflow => (
                <div
                  key={workflow.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors border-l-4 ${getWorkflowCardStyle(workflow)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900 mr-3">
                          {workflow.name || `Workflow ${workflow.id}`}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getWorkflowStatusColor(workflow)}`}
                        >
                          {getWorkflowStatusText(workflow)}
                        </span>
                        
                        {/* Toggle Switch */}
                        <div className="ml-4 flex items-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={workflow.active}
                              onChange={() => handleToggleWorkflow(workflow.id, workflow.active, workflow.name)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">
                              {workflow.active ? 'Activo' : 'Inactivo'}
                            </span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500 mb-3">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-mono">
                          ID: {workflow.id}
                        </span>
                        
                        {(() => {
                          const info = getWorkflowInfo(workflow);
                          return (
                            <>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                info.executionType === 'webhook' ? 'bg-orange-100 text-orange-800' :
                                info.executionType === 'manual' ? 'bg-purple-100 text-purple-800' :
                                info.executionType === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {info.executionType === 'webhook' ? '🔗 Webhook' :
                                 info.executionType === 'manual' ? '👆 Manual' :
                                 info.executionType === 'scheduled' ? '⏰ Programado' :
                                 '❓ Desconocido'}
                              </span>
                              
                              {info.isExecutable && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  ✅ Ejecutable
                                </span>
                              )}
                            </>
                          );
                        })()}
                        
                        {workflow.tags && workflow.tags.length > 0 && (
                          workflow.tags.map(tag => (
                            <span key={tag.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {tag.name}
                            </span>
                          ))
                        )}
                      </div>

                      {workflow.updatedAt && (
                        <p className="text-xs text-gray-500">
                          Última actualización: {new Date(workflow.updatedAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
                      {/* Botón de cancelar ejecución (solo visible durante ejecución) */}
                      {executingWorkflows.has(workflow.id) && (
                        <button
                          onClick={() => handleCancelExecution(workflow.id)}
                          className="px-3 py-2 rounded-lg font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                        >
                          <span className="mr-1">❌</span>
                          Cancelar
                        </button>
                      )}
                      
                      {/* Indicador de completado */}
                      {completedWorkflows.has(workflow.id) && (
                        <div className="flex items-center text-green-600">
                          <span className="mr-1">✅</span>
                          <span className="text-sm font-medium">Completado</span>
                        </div>
                      )}
                      


                      {/* Botón de ejecución */}
                      <button
                        onClick={() => handleExecuteWorkflow(workflow.id, workflow.name)}
                        disabled={!canExecuteWorkflow(workflow).canExecute}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          (() => {
                            const { buttonState } = canExecuteWorkflow(workflow);
                            switch (buttonState) {
                              case 'active':
                                return 'bg-green-600 text-white hover:bg-green-700';
                              case 'inactive':
                                return 'bg-yellow-500 text-white hover:bg-yellow-600';
                              case 'executing':
                                return 'bg-blue-500 text-white cursor-not-allowed';
                              case 'missing_params':
                                return 'bg-orange-400 text-white cursor-not-allowed';
                              case 'not_executable':
                                return 'bg-red-400 text-white cursor-not-allowed';
                              default:
                                return 'bg-gray-100 text-gray-400 cursor-not-allowed';
                            }
                          })()
                        }`}
                        title={
                          (() => {
                            const { reason, buttonState } = canExecuteWorkflow(workflow);
                            switch (buttonState) {
                              case 'active':
                                return 'Ejecutar workflow';
                              case 'inactive':
                                return 'El workflow debe estar activo para ejecutarse';
                              case 'executing':
                                return 'Ejecutando workflow...';
                              case 'missing_params':
                                return 'Completa todos los campos obligatorios del formulario antes de ejecutar';
                              case 'not_executable':
                                return 'El workflow debe tener al menos un nodo webhook para ejecutarse desde la interfaz';
                              default:
                                return 'No se puede ejecutar este workflow';
                            }
                          })()
                        }
                      >
                        {(() => {
                          const { buttonState } = canExecuteWorkflow(workflow);
                          switch (buttonState) {
                            case 'executing':
                              return (
                                <>
                                  <span className="animate-spin mr-2">⏳</span>
                                  Ejecutando...
                                </>
                              );
                            case 'inactive':
                              return (
                                <>
                                  <span className="mr-2">⏸️</span>
                                  Inactivo
                                </>
                              );
                            case 'missing_params':
                              return (
                                <>
                                  <span className="mr-2">⚠️</span>
                                  Parámetros faltantes
                                </>
                              );
                            case 'not_executable':
                              return (
                                <>
                                  <span className="mr-2">🚫</span>
                                  No Ejecutable
                                </>
                              );
                            case 'active':
                            default:
                              return (
                                <>
                                  <span className="mr-2">▶️</span>
                                  Ejecutar
                                </>
                              );
                          }
                        })()}
                      </button>
                    </div>
                  </div>
                  
                  {/* Formulario dinámico integrado */}
                  <WorkflowInlineForm 
                    workflow={workflow} 
                    n8nConfig={{ baseUrl: N8N_CONFIG.BASE_URL }}
                    onValidationChange={handleFormValidationChange(workflow.id)}
                    onFormDataChange={handleFormDataChange(workflow.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}


    </div>
  );
};

export default WorkflowsPage;