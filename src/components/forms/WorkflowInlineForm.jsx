import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { DynamicForm } from './DynamicForm';
import { extractMetadata } from '../../utils/metadataExtractor';
import { useWorkflows } from '../../hooks/useWorkflows';
import { useToast } from '../../contexts/ToastContext';

/**
 * Componente que renderiza un formulario dinámico integrado para un workflow específico
 */
const WorkflowInlineForm = memo(({ workflow, n8nConfig, onValidationChange, onFormDataChange }) => {
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isExecuteButtonEnabled, setIsExecuteButtonEnabled] = useState(false);
  const { showSuccess, showError } = useToast();
  const { executeWorkflow } = useWorkflows();

  // Memoizar el ID del workflow para evitar re-ejecuciones innecesarias
  const workflowId = useMemo(() => workflow?.id, [workflow?.id]);
  const workflowName = useMemo(() => workflow?.name, [workflow?.name]);

  // Memoizar la extracción de metadatos para evitar recálculos innecesarios
  const extractedMetadata = useMemo(() => {
    if (!workflow || !workflowId) return null;
    
    const result = extractMetadata(workflow);
    
    // Solo loggear cuando hay cambios significativos o en casos específicos
    if (process.env.NODE_ENV === 'development') {
      // Solo loggear si es la primera vez o si hay un cambio en el resultado
      const shouldLog = !metadata || 
        (metadata?.success !== result?.success) ||
        (metadata?.parameters?.length !== result?.parameters?.length);
      
      if (shouldLog) {
        console.log('🔍 WorkflowInlineForm - Procesando workflow:', workflowName);
        console.log('📊 WorkflowInlineForm - Resultado extractMetadata:', result);
      }
    }
    
    return result;
  }, [workflow, workflowId, workflowName, metadata]);

  // Actualizar metadata solo cuando extractedMetadata cambie
  useEffect(() => {
    if (extractedMetadata !== metadata) {
      setMetadata(extractedMetadata);
    }
  }, [extractedMetadata, metadata]);

  // Verificar si hay metadatos válidos (memoizado y con logging optimizado)
  const hasMetadata = useMemo(() => {
    const hasValidMetadata =
      metadata &&
      metadata.success &&
      metadata.parameters &&
      metadata.parameters.length > 0;
    
    // Solo loggear cambios significativos en hasMetadata
    if (process.env.NODE_ENV === 'development') {
      // Crear una referencia estática para evitar logs repetitivos
      const currentState = `${workflowId}-${hasValidMetadata}`;
      if (!WorkflowInlineForm._loggedStates) {
        WorkflowInlineForm._loggedStates = new Set();
      }
      
      if (!WorkflowInlineForm._loggedStates.has(currentState)) {
        WorkflowInlineForm._loggedStates.add(currentState);
        console.log('✅ WorkflowInlineForm - hasMetadata:', hasValidMetadata, 'for:', workflowName);
      }
    }
    
    return hasValidMetadata;
  }, [metadata, workflowId, workflowName]);

  // Manejar cambios en la validación del formulario
  const handleValidationChange = useCallback(
    (isValid, fieldErrors) => {
      setIsFormValid(isValid);
      // Notificar al componente padre sobre el cambio de validación
      if (onValidationChange) {
        onValidationChange(isValid);
      }
    },
    [onValidationChange]
  );

  const handleToggleForm = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Función para manejar cuando el formulario es validado (después de guardar)
  const handleFormValidated = useCallback((isValid) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ WorkflowInlineForm - Formulario validado:`, isValid);
    }
    setIsExecuteButtonEnabled(isValid);
  }, []);

  // Función para manejar cambios en los datos del formulario (optimizada)
  const handleFormDataChange = useCallback((newFormData) => {
    // Solo loggear si hay cambios reales en los datos
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(newFormData);
    
    if (process.env.NODE_ENV === 'development' && hasChanges) {
      console.log(`📝 WorkflowInlineForm - Datos del formulario actualizados:`, newFormData);
    }
    
    if (hasChanges) {
      setFormData(newFormData);
      
      // Notificar al componente padre si existe la función
      if (onFormDataChange) {
        onFormDataChange(newFormData);
      }
    }
  }, [formData, onFormDataChange]);

  // Función para guardar los datos del formulario (sin ejecutar)
  const handleFormSave = useCallback(
    async data => {
      console.log('💾 WorkflowInlineForm - Guardando datos del formulario:', data);
      
      // Solo actualizar los datos del formulario, no ejecutar
      setFormData(data);
      
      // Notificar al componente padre si existe la función
      if (onFormDataChange) {
        onFormDataChange(data);
      }
      
      showSuccess('Parámetros guardados exitosamente');
    },
    [onFormDataChange, showSuccess]
  );

  // Función para ejecutar el workflow con los datos guardados
  const handleWorkflowExecution = useCallback(
    async () => {
      if (!workflow) {
        showError('Error: Workflow no disponible');
        return;
      }

      if (!formData || Object.keys(formData).length === 0) {
        showError('Error: No hay datos guardados para ejecutar');
        return;
      }

      setIsLoading(true);
      try {
        console.log('🚀 WorkflowInlineForm - Ejecutando workflow con datos:', formData);
        
        // Usar executeWorkflow del hook useWorkflows con los datos del formulario
        const result = await executeWorkflow(workflow.id, formData);

        if (result.success) {
          showSuccess('Workflow ejecutado exitosamente');
        } else {
          showError(`Error al ejecutar workflow: ${result.error}`);
        }
      } catch (error) {
        console.error('Error ejecutando workflow:', error);
        showError('Error de conexión al ejecutar workflow');
      } finally {
        setIsLoading(false);
      }
    },
    [workflow, formData, executeWorkflow, showSuccess, showError]
  );

  // No mostrar nada si no hay metadatos (con logging optimizado)
  if (!hasMetadata) {
    if (process.env.NODE_ENV === 'development') {
      // Solo loggear una vez por workflow que no tiene metadatos
      const logKey = `no-metadata-${workflowId}`;
      if (!WorkflowInlineForm._noMetadataLogged) {
        WorkflowInlineForm._noMetadataLogged = new Set();
      }
      
      if (!WorkflowInlineForm._noMetadataLogged.has(logKey)) {
        WorkflowInlineForm._noMetadataLogged.add(logKey);
        console.log(
          '❌ WorkflowInlineForm - No se muestra formulario. hasMetadata:',
          hasMetadata,
          'metadata:',
          metadata,
          'for:',
          workflowName
        );
      }
    }
    return null;
  }

  // Solo loggear cuando se muestra el formulario por primera vez
  if (process.env.NODE_ENV === 'development') {
    const showLogKey = `show-form-${workflowId}`;
    if (!WorkflowInlineForm._showFormLogged) {
      WorkflowInlineForm._showFormLogged = new Set();
    }
    
    if (!WorkflowInlineForm._showFormLogged.has(showLogKey)) {
      WorkflowInlineForm._showFormLogged.add(showLogKey);
      console.log(
        '✅ WorkflowInlineForm - Mostrando formulario para:',
        workflow?.name
      );
    }
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      {/* Botón para expandir/colapsar el formulario */}
      <button
        onClick={handleToggleForm}
        className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-blue-100 transition-all duration-200"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📝</span>
          <div className="text-left">
            <h4 className="font-semibold text-gray-900">
              {metadata?.ui?.title || 'Formulario Dinámico'}
            </h4>
            <p className="text-sm text-gray-600">
              {metadata?.ui?.description ||
                `${metadata?.parameters?.length || 0} campos disponibles`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
            {metadata?.parameters?.length || 0} campos
          </span>
          <span
            className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          >
            ⬇️
          </span>
        </div>
      </button>

      {/* Formulario expandible */}
      {isExpanded && (
        <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            {/* Encabezado del formulario */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {metadata?.ui?.title || 'Formulario Dinámico'}
              </h3>
              {metadata?.ui?.description && (
                <p className="text-gray-600 text-sm">
                  {metadata.ui.description}
                </p>
              )}
            </div>

            {/* Información del workflow */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                📋 Información del Workflow
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Nombre:</span>
                  <span className="ml-2 text-blue-700">{workflow.name}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">ID:</span>
                  <span className="ml-2 text-blue-700 font-mono">
                    {workflow.id}
                  </span>
                </div>
                {metadata?.groups && metadata.groups.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-blue-800">Grupos:</span>
                    <span className="ml-2 text-blue-700">
                      {metadata.groups.map(g => g.title).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Formulario dinámico */}
            <DynamicForm
              parameters={metadata?.parameters || []}
              groups={metadata?.groups || []}
              ui={metadata?.ui || {}}
              onSubmit={handleFormSave}
              onValidationChange={handleValidationChange}
              onDataChange={handleFormDataChange}
              onFormValidated={handleFormValidated}
              submitButtonText="Guardar Parámetros"
              isLoading={false}
              className="mt-4"
            />

            {/* Botón de ejecutar separado */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleWorkflowExecution}
                disabled={!isExecuteButtonEnabled || isLoading}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isExecuteButtonEnabled && !isLoading
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Ejecutando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>▶️</span>
                    <span>Ejecutar Workflow</span>
                  </div>
                )}
              </button>
            </div>

            {/* Botón para colapsar */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleToggleForm}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <span>⬆️</span>
                <span>Colapsar formulario</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Función de comparación personalizada para React.memo
const arePropsEqual = (prevProps, nextProps) => {
  // Comparar workflow ID (más importante)
  if (prevProps.workflow?.id !== nextProps.workflow?.id) {
    return false;
  }
  
  // Comparar workflow name
  if (prevProps.workflow?.name !== nextProps.workflow?.name) {
    return false;
  }
  
  // Comparar workflow active status
  if (prevProps.workflow?.active !== nextProps.workflow?.active) {
    return false;
  }
  
  // Comparar n8nConfig (shallow comparison)
  if (prevProps.n8nConfig?.baseUrl !== nextProps.n8nConfig?.baseUrl) {
    return false;
  }
  
  // Comparar funciones de callback (por referencia)
  if (prevProps.onValidationChange !== nextProps.onValidationChange) {
    return false;
  }
  
  if (prevProps.onFormDataChange !== nextProps.onFormDataChange) {
    return false;
  }
  
  // Si llegamos aquí, las props son iguales
  return true;
};

// Aplicar React.memo con comparación personalizada
const MemoizedWorkflowInlineForm = memo(WorkflowInlineForm, arePropsEqual);

// Agregar displayName para debugging
MemoizedWorkflowInlineForm.displayName = 'WorkflowInlineForm';

export default MemoizedWorkflowInlineForm;
